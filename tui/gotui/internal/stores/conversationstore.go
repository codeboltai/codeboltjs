package stores

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sort"
	"strings"
	"sync"
	"time"

	"gotui/internal/components/chattemplates"
	"gotui/internal/logging"
)

// ConversationOptions captures configurable per-conversation settings such as the selected model or agent.
type ConversationOptions struct {
	SelectedModel *ModelOption
	SelectedAgent *AgentSelection
}

// Clone creates a deep copy of the options.
func (o ConversationOptions) Clone() ConversationOptions {
	copy := ConversationOptions{}
	if o.SelectedModel != nil {
		modelCopy := *o.SelectedModel
		copy.SelectedModel = &modelCopy
	}
	if o.SelectedAgent != nil {
		agentCopy := *o.SelectedAgent
		copy.SelectedAgent = &agentCopy
	}
	return copy
}

// Conversation represents a single chat history entry stored in the central conversation store.
type Conversation struct {
	ID        string
	Title     string
	Messages  []chattemplates.MessageTemplateData
	CreatedAt time.Time
	UpdatedAt time.Time
	Options   ConversationOptions
}

// Clone returns a defensive copy of the conversation and all of its fields.
func (c *Conversation) Clone() *Conversation {
	if c == nil {
		return nil
	}
	copy := *c
	copy.Messages = cloneMessages(c.Messages)
	copy.Options = c.Options.Clone()
	return &copy
}

// ConversationStore maintains the list of conversations and tracks the active conversation.
type ConversationStore struct {
	mu             sync.RWMutex
	conversations  []*Conversation
	activeID       string
	sequenceNumber int
	httpClient     *http.Client
	remoteConfig   remoteSyncConfig
	syncStatus     map[string]bool
}

var (
	sharedConversationStore     *ConversationStore
	sharedConversationStoreOnce sync.Once
)

// SharedConversationStore returns a singleton store instance used across the TUI.
func SharedConversationStore() *ConversationStore {
	sharedConversationStoreOnce.Do(func() {
		sharedConversationStore = NewConversationStore()
	})
	return sharedConversationStore
}

// NewConversationStore constructs an empty conversation store.
func NewConversationStore() *ConversationStore {
	return &ConversationStore{
		syncStatus: make(map[string]bool),
	}
}

// ConfigureRemoteSync enables remote persistence of conversations via the agent server API.
func (s *ConversationStore) ConfigureRemoteSync(protocol, host string, port int, projectPath string) {
	if s == nil {
		return
	}
	scheme := "http"
	protocol = strings.ToLower(strings.TrimSpace(protocol))
	if protocol == "https" || protocol == "wss" {
		scheme = "https"
	}

	host = strings.TrimSpace(host)
	if host == "" {
		host = "localhost"
	}

	enabled := port > 0

	s.mu.Lock()
	s.remoteConfig = remoteSyncConfig{
		enabled:     enabled,
		scheme:      scheme,
		host:        host,
		port:        port,
		projectPath: strings.TrimSpace(projectPath),
	}
	if enabled && s.httpClient == nil {
		s.httpClient = &http.Client{Timeout: 5 * time.Second}
	}
	s.mu.Unlock()
}

// SyncConversation pushes the specified conversation to the remote server.
func (s *ConversationStore) SyncConversation(id string) {
	if s == nil || strings.TrimSpace(id) == "" {
		return
	}

	cfg, client := s.remoteConfigSnapshot()
	if !cfg.enabled || client == nil {
		return
	}

	conv := s.Conversation(id)
	if conv == nil {
		return
	}

	s.setSyncing(id, true)

	go func(copy *Conversation) {
		defer s.setSyncing(copy.ID, false)
		if err := s.postConversation(cfg, client, copy); err != nil {
			logging.Printf("conversation sync failed: %v", err)
		}
	}(conv)
}

// IsSyncing reports whether the conversation is currently being persisted remotely.
func (s *ConversationStore) IsSyncing(id string) bool {
	if s == nil || strings.TrimSpace(id) == "" {
		return false
	}
	s.mu.RLock()
	syncing := s.syncStatus[id]
	s.mu.RUnlock()
	return syncing
}

type remoteSyncConfig struct {
	enabled     bool
	scheme      string
	host        string
	port        int
	projectPath string
}

func (c remoteSyncConfig) endpoint() string {
	if !c.enabled {
		return ""
	}
	return fmt.Sprintf("%s://%s:%d/conversations", c.scheme, c.host, c.port)
}

// Count returns the number of stored conversations.

func (s *ConversationStore) Count() int {
	if s == nil {
		return 0
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	return len(s.conversations)
}

// Conversations returns a defensive copy of the stored conversations sorted according to recency.
func (s *ConversationStore) Conversations() []*Conversation {
	if s == nil {
		return nil
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	return cloneConversations(s.conversations)
}

// ActiveID returns the identifier of the active conversation, if any.
func (s *ConversationStore) ActiveID() string {
	if s == nil {
		return ""
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.activeID
}

// ActiveConversation returns the active conversation as a defensive copy.
func (s *ConversationStore) ActiveConversation() *Conversation {
	if s == nil {
		return nil
	}
	s.mu.RLock()
	conv := s.findByIDLocked(s.activeID)
	defer s.mu.RUnlock()
	return conv.Clone()
}

// Conversation retrieves a conversation by its identifier as a defensive copy.
func (s *ConversationStore) Conversation(id string) *Conversation {
	if s == nil {
		return nil
	}
	s.mu.RLock()
	conv := s.findByIDLocked(id)
	defer s.mu.RUnlock()
	return conv.Clone()
}

// SetActive switches the active conversation to the supplied identifier.
func (s *ConversationStore) SetActive(id string) bool {
	if s == nil || strings.TrimSpace(id) == "" {
		return false
	}
	s.mu.Lock()
	if s.findByIDLocked(id) == nil {
		s.mu.Unlock()
		return false
	}
	s.activeID = id
	s.mu.Unlock()
	return true
}

// CreateConversation appends a brand-new conversation to the store and returns it as a copy.
func (s *ConversationStore) CreateConversation(title string, opts ConversationOptions) *Conversation {
	if s == nil {
		return nil
	}
	s.mu.Lock()
	s.sequenceNumber++
	if strings.TrimSpace(title) == "" {
		title = fmt.Sprintf("Conversation %d", s.sequenceNumber)
	}
	conv := &Conversation{
		ID:        fmt.Sprintf("conversation-%d", s.sequenceNumber),
		Title:     title,
		Messages:  make([]chattemplates.MessageTemplateData, 0, 16),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		Options:   opts.Clone(),
	}
	s.conversations = append(s.conversations, conv)
	s.activeID = conv.ID
	s.sortLocked()
	clone := conv.Clone()
	s.mu.Unlock()
	return clone
}

// AppendMessage adds a message to the specified conversation. A copy of the updated
// conversation is returned alongside a flag describing success.
func (s *ConversationStore) AppendMessage(id string, message chattemplates.MessageTemplateData) (*Conversation, bool) {
	if s == nil {
		return nil, false
	}
	s.mu.Lock()
	conv := s.findByIDLocked(id)
	if conv == nil {
		s.mu.Unlock()
		return nil, false
	}
	conv.Messages = append(conv.Messages, message)
	conv.UpdatedAt = time.Now()
	s.sortLocked()
	clone := conv.Clone()
	s.mu.Unlock()
	return clone, true
}

// UpdateOptions replaces the options of the specified conversation.
func (s *ConversationStore) UpdateOptions(id string, opts ConversationOptions) bool {
	if s == nil {
		return false
	}
	s.mu.Lock()
	conv := s.findByIDLocked(id)
	if conv == nil {
		s.mu.Unlock()
		return false
	}
	conv.Options = opts.Clone()
	conv.UpdatedAt = time.Now()
	s.sortLocked()
	s.mu.Unlock()
	return true
}

// SetSelectedModel sets the model selection on a conversation using the provided option.
func (s *ConversationStore) SetSelectedModel(id string, model *ModelOption) bool {
	if s == nil {
		return false
	}
	s.mu.Lock()
	conv := s.findByIDLocked(id)
	if conv == nil {
		s.mu.Unlock()
		return false
	}
	if model != nil {
		modelCopy := *model
		conv.Options.SelectedModel = &modelCopy
	} else {
		conv.Options.SelectedModel = nil
	}
	conv.UpdatedAt = time.Now()
	s.sortLocked()
	s.mu.Unlock()
	return true
}

// SetSelectedAgent stores the selected agent information for the conversation.
func (s *ConversationStore) SetSelectedAgent(id string, agent *AgentSelection) bool {
	if s == nil {
		return false
	}
	s.mu.Lock()
	conv := s.findByIDLocked(id)
	if conv == nil {
		s.mu.Unlock()
		return false
	}
	if agent != nil {
		agentCopy := *agent
		conv.Options.SelectedAgent = &agentCopy
	} else {
		conv.Options.SelectedAgent = nil
	}
	conv.UpdatedAt = time.Now()
	s.sortLocked()
	s.mu.Unlock()
	return true
}

func (s *ConversationStore) sortLocked() {
	sort.SliceStable(s.conversations, func(i, j int) bool {
		if s.conversations[i].UpdatedAt.Equal(s.conversations[j].UpdatedAt) {
			return s.conversations[i].CreatedAt.After(s.conversations[j].CreatedAt)
		}
		return s.conversations[i].UpdatedAt.After(s.conversations[j].UpdatedAt)
	})
}

func (s *ConversationStore) findByIDLocked(id string) *Conversation {
	for _, conv := range s.conversations {
		if conv.ID == id {
			return conv
		}
	}
	return nil
}

func cloneConversations(convs []*Conversation) []*Conversation {
	if len(convs) == 0 {
		return nil
	}
	copies := make([]*Conversation, len(convs))
	for i, conv := range convs {
		copies[i] = conv.Clone()
	}
	return copies
}

func cloneMessages(messages []chattemplates.MessageTemplateData) []chattemplates.MessageTemplateData {
	if len(messages) == 0 {
		return nil
	}
	copyMessages := make([]chattemplates.MessageTemplateData, len(messages))
	for i, msg := range messages {
		clone := msg
		if msg.Metadata != nil {
			metaCopy := make(map[string]interface{}, len(msg.Metadata))
			for k, v := range msg.Metadata {
				metaCopy[k] = v
			}
			clone.Metadata = metaCopy
		}
		if len(msg.Buttons) > 0 {
			buttons := make([]chattemplates.MessageButton, len(msg.Buttons))
			copy(buttons, msg.Buttons)
			clone.Buttons = buttons
		}
		copyMessages[i] = clone
	}
	return copyMessages
}

func (s *ConversationStore) remoteConfigSnapshot() (remoteSyncConfig, *http.Client) {
	s.mu.RLock()
	cfg := s.remoteConfig
	client := s.httpClient
	s.mu.RUnlock()
	return cfg, client
}

func (s *ConversationStore) setSyncing(id string, syncing bool) {
	s.mu.Lock()
	if s.syncStatus == nil {
		s.syncStatus = make(map[string]bool)
	}
	if !syncing {
		delete(s.syncStatus, id)
	} else {
		s.syncStatus[id] = true
	}
	s.mu.Unlock()
}

func (s *ConversationStore) postConversation(cfg remoteSyncConfig, client *http.Client, conv *Conversation) error {
	endpoint := cfg.endpoint()
	if endpoint == "" {
		return nil
	}

	payload := remoteConversationPayload{
		ProjectPath:  cfg.projectPath,
		Conversation: buildRemoteConversation(conv),
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		snippet := ""
		if data, readErr := io.ReadAll(io.LimitReader(resp.Body, 2048)); readErr == nil {
			snippet = strings.TrimSpace(string(data))
		}
		if snippet != "" {
			return fmt.Errorf("conversation sync failed: %d %s", resp.StatusCode, snippet)
		}
		return fmt.Errorf("conversation sync failed with status %d", resp.StatusCode)
	}

	return nil
}

type remoteConversationPayload struct {
	ProjectPath  string             `json:"projectPath,omitempty"`
	Conversation remoteConversation `json:"conversation"`
}

type remoteConversation struct {
	ID        string                      `json:"id"`
	Title     string                      `json:"title"`
	CreatedAt string                      `json:"createdAt"`
	UpdatedAt string                      `json:"updatedAt"`
	Messages  []remoteConversationMessage `json:"messages"`
	Options   *remoteConversationOptions  `json:"options,omitempty"`
}

type remoteConversationOptions struct {
	SelectedModel *ModelOption          `json:"selectedModel,omitempty"`
	SelectedAgent *remoteAgentSelection `json:"selectedAgent,omitempty"`
}

type remoteAgentSelection struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	AgentType    string `json:"agentType,omitempty"`
	AgentDetails string `json:"agentDetails,omitempty"`
}

type remoteConversationMessage struct {
	Type      string                 `json:"type"`
	Content   string                 `json:"content"`
	Timestamp string                 `json:"timestamp,omitempty"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
}

func buildRemoteConversation(conv *Conversation) remoteConversation {
	createdAt := conv.CreatedAt.UTC().Format(time.RFC3339)
	updatedAt := conv.UpdatedAt.UTC().Format(time.RFC3339)

	options := conv.Options.Clone()
	remoteOpts := remoteConversationOptions{}
	if options.SelectedModel != nil {
		remoteOpts.SelectedModel = convertModelOption(options.SelectedModel)
	}
	if options.SelectedAgent != nil {
		remoteOpts.SelectedAgent = convertAgentSelection(options.SelectedAgent)
	}

	var optsPtr *remoteConversationOptions
	if remoteOpts.SelectedModel != nil || remoteOpts.SelectedAgent != nil {
		optsPtr = &remoteOpts
	}

	return remoteConversation{
		ID:        conv.ID,
		Title:     conv.Title,
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
		Messages:  convertMessages(conv.Messages),
		Options:   optsPtr,
	}
}

func convertModelOption(model *ModelOption) *ModelOption {
	if model == nil {
		return nil
	}
	copy := *model
	return &copy
}

func convertAgentSelection(agent *AgentSelection) *remoteAgentSelection {
	if agent == nil {
		return nil
	}
	return &remoteAgentSelection{
		ID:           agent.ID,
		Name:         agent.Name,
		AgentType:    agent.AgentType,
		AgentDetails: agent.AgentDetails,
	}
}

func convertMessages(messages []chattemplates.MessageTemplateData) []remoteConversationMessage {
	if len(messages) == 0 {
		return []remoteConversationMessage{}
	}

	out := make([]remoteConversationMessage, 0, len(messages))
	for _, msg := range messages {
		entry := remoteConversationMessage{
			Type:    msg.Type,
			Content: msg.Content,
		}
		if !msg.Timestamp.IsZero() {
			entry.Timestamp = msg.Timestamp.UTC().Format(time.RFC3339)
		}
		if len(msg.Metadata) > 0 {
			entry.Metadata = copyMetadata(msg.Metadata)
		}
		out = append(out, entry)
	}
	return out
}

func copyMetadata(input map[string]interface{}) map[string]interface{} {
	if len(input) == 0 {
		return nil
	}
	out := make(map[string]interface{}, len(input))
	for k, v := range input {
		out[k] = v
	}
	return out
}

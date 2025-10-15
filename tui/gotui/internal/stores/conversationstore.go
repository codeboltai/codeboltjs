package stores

import (
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"

	"gotui/internal/components/chattemplates"
	"gotui/internal/wsclient"
)

// ConversationOptions captures configurable per-conversation settings such as the selected model or agent.
type ConversationOptions struct {
	SelectedModel *ModelOption
	SelectedAgent *wsclient.AgentSelection
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
	return &ConversationStore{}
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
func (s *ConversationStore) SetSelectedAgent(id string, agent *wsclient.AgentSelection) bool {
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
	copy(copyMessages, messages)
	return copyMessages
}

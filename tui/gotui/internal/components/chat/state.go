package chat

import (
	"strings"
	"time"

	"gotui/internal/components/chatcomponents"
	"gotui/internal/components/chattemplates"
	"gotui/internal/components/uicomponents/diffview"
	"gotui/internal/stores"
	"gotui/internal/styles"

	tea "github.com/charmbracelet/bubbletea/v2"
)

// Conversation mirrors the shared conversation model stored in the central store.
type Conversation = stores.Conversation

// conversationRegion tracks screen coordinates for hover & click handling.
type conversationRegion struct {
	conversationID string
	yStart         int
	yEnd           int
}

// verticalRegion tracks a clickable area by vertical bounds.
type verticalRegion struct {
	yStart int
	yEnd   int
}

func (c *Chat) ensureConversationStore() *stores.ConversationStore {
	if c == nil {
		return nil
	}
	if c.conversationStore == nil {
		c.conversationStore = stores.SharedConversationStore()
	}
	return c.conversationStore
}

func (c *Chat) ensureApplicationStateStore() *stores.ApplicationStateStore {
	if c == nil {
		return nil
	}
	if c.applicationState == nil {
		c.applicationState = stores.SharedApplicationStateStore()
	}
	return c.applicationState
}

func (c *Chat) syncApplicationState() {
	store := c.ensureApplicationStateStore()
	if store == nil {
		return
	}
	state := store.State()
	state.SelectedConversationID = c.activeConversationID
	if c.selectedModel != nil {
		modelCopy := stores.ModelOption(*c.selectedModel)
		state.SelectedModel = &modelCopy
	} else {
		state.SelectedModel = nil
	}
	if c.selectedAgent != nil {
		agentCopy := *c.selectedAgent
		state.SelectedAgent = &agentCopy
	} else {
		state.SelectedAgent = nil
	}
	store.Update(state)
}

func (c *Chat) syncActiveConversationWithServer() {
	store := c.ensureConversationStore()
	if store == nil {
		return
	}
	activeID := store.ActiveID()
	if activeID == "" {
		return
	}
	store.SyncConversation(activeID)
	c.syncConversationPanelItems()
}

func (c *Chat) defaultModelOption() *stores.ModelOption {
	if c == nil {
		return nil
	}
	if c.selectedModel != nil {
		copy := stores.ModelOption(*c.selectedModel)
		return &copy
	}
	if c.preferredModel != nil {
		copy := stores.ModelOption(*c.preferredModel)
		return &copy
	}
	if settings := stores.SharedApplicationSettingsStore().Settings(); settings.DefaultModel != nil {
		modelCopy := *settings.DefaultModel
		return &modelCopy
	}
	if c.modelStore != nil {
		if models := c.modelStore.Models(); len(models) > 0 {
			copy := models[0]
			return &copy
		}
	}
	if len(c.modelOptions) > 0 {
		copy := stores.ModelOption(c.modelOptions[0])
		return &copy
	}
	return nil
}

func (c *Chat) applyDefaultModelIfMissing(conversationID string) {
	store := c.ensureConversationStore()
	if store == nil || conversationID == "" {
		return
	}
	conv := store.Conversation(conversationID)
	if conv == nil || conv.Options.SelectedModel != nil {
		return
	}
	if model := c.defaultModelOption(); model != nil {
		copy := *model
		store.SetSelectedModel(conversationID, &copy)
		stores.SharedConversationStateStore().SetSelectedModel(conversationID, &copy)
		if stateStore := c.ensureApplicationStateStore(); stateStore != nil && conversationID == c.activeConversationID {
			stateStore.SetSelectedModel(&copy)
		}
	}
}

func (c *Chat) applyDefaultModelToAllConversations() {
	store := c.ensureConversationStore()
	if store == nil {
		return
	}
	convs := store.Conversations()
	for _, conv := range convs {
		if conv.Options.SelectedModel == nil {
			if model := c.defaultModelOption(); model != nil {
				copy := *model
				store.SetSelectedModel(conv.ID, &copy)
				stores.SharedConversationStateStore().SetSelectedModel(conv.ID, &copy)
			}
		}
	}
}

func (c *Chat) defaultAgentSelection() *stores.AgentSelection {
	if c == nil {
		return nil
	}
	if c.selectedAgent != nil {
		copy := *c.selectedAgent
		return &copy
	}
	if c.preferredAgent != nil && strings.TrimSpace(c.preferredAgent.ID) != "" {
		copy := *c.preferredAgent
		return &copy
	}
	if settings := stores.SharedApplicationSettingsStore().Settings(); settings.DefaultAgent != nil {
		agentCopy := *settings.DefaultAgent
		return &agentCopy
	}
	if c.agentStore != nil {
		if agents := c.agentStore.Agents(); len(agents) > 0 {
			return &stores.AgentSelection{
				ID:           agents[0].ID,
				Name:         agents[0].Name,
				AgentType:    "",
				AgentDetails: agents[0].Description,
			}
		}
	}
	return nil
}

func (c *Chat) applyDefaultAgentIfMissing(conversationID string) {
	store := c.ensureConversationStore()
	if store == nil || conversationID == "" {
		return
	}
	conv := store.Conversation(conversationID)
	if conv == nil || conv.Options.SelectedAgent != nil {
		return
	}
	if agent := c.defaultAgentSelection(); agent != nil {
		agentCopy := *agent
		store.SetSelectedAgent(conversationID, &agentCopy)
		stores.SharedConversationStateStore().SetSelectedAgent(conversationID, &agentCopy)
		if stateStore := c.ensureApplicationStateStore(); stateStore != nil && conversationID == c.activeConversationID {
			stateStore.SetSelectedAgent(&agentCopy)
		}
	}
}

func (c *Chat) applyDefaultAgentToAllConversations() {
	store := c.ensureConversationStore()
	if store == nil {
		return
	}
	convs := store.Conversations()
	for _, conv := range convs {
		if conv.Options.SelectedAgent == nil {
			if agent := c.defaultAgentSelection(); agent != nil {
				agentCopy := *agent
				store.SetSelectedAgent(conv.ID, &agentCopy)
				stores.SharedConversationStateStore().SetSelectedAgent(conv.ID, &agentCopy)
			}
		}
	}
}

func (c *Chat) refreshConversationsFromStore(syncPanels bool) {
	if c == nil {
		return
	}
	store := c.ensureConversationStore()
	if store == nil {
		c.conversations = nil
		c.activeConversationID = ""
		c.selectedModel = nil
		c.selectedAgent = nil
		c.syncApplicationState()
		if syncPanels {
			c.syncConversationPanelItems()
		}
		return
	}
	activeID := store.ActiveID()
	if activeID != "" {
		c.applyDefaultModelIfMissing(activeID)
		c.applyDefaultAgentIfMissing(activeID)
	}

	c.conversations = store.Conversations()
	c.activeConversationID = activeID

	c.selectedModel = nil
	c.selectedAgent = nil
	if activeID != "" {
		for _, conv := range c.conversations {
			if conv != nil && conv.ID == activeID {
				if conv.Options.SelectedModel != nil {
					copy := chatcomponents.ModelOption(*conv.Options.SelectedModel)
					c.selectedModel = &copy
				}
				if conv.Options.SelectedAgent != nil {
					agentCopy := *conv.Options.SelectedAgent
					c.selectedAgent = &agentCopy
				}
				break
			}
		}
	}
	if stateStore := c.ensureApplicationStateStore(); stateStore != nil {
		stateStore.SetSelectedConversation(activeID)
		if c.selectedModel != nil {
			modelCopy := stores.ModelOption(*c.selectedModel)
			stateStore.SetSelectedModel(&modelCopy)
		} else {
			stateStore.SetSelectedModel(nil)
		}
		if c.selectedAgent != nil {
			agentCopy := *c.selectedAgent
			stateStore.SetSelectedAgent(&agentCopy)
		} else {
			stateStore.SetSelectedAgent(nil)
		}
	}
	c.syncApplicationState()

	if syncPanels {
		c.syncConversationPanelItems()
	}
}

func (c *Chat) createInitialConversation() {
	store := c.ensureConversationStore()
	if store.Count() > 0 {
		c.refreshConversationsFromStore(true)
		c.syncActiveConversationWithServer()
		return
	}

	conv := store.CreateConversation("Conversation 1", stores.ConversationOptions{})
	if conv == nil {
		return
	}

	store.AppendMessage(conv.ID, c.newMessageData("system", "🚀 Welcome to Codebolt! Type 'help' to see available commands.", nil, nil))

	sampleReadContent := strings.Join([]string{
		"// Preview of the read file template",
		"package demo",
		"",
		"func Hello() string {",
		"\treturn \"Hello from the read file template!\"",
		"}",
	}, "\n")
	store.AppendMessage(conv.ID, c.newMessageData("read_file", sampleReadContent, map[string]interface{}{"file_path": "demo/hello.go"}, nil))

	if unifiedPreview, splitPreview := sampleDiffPreviews(); unifiedPreview != "" || splitPreview != "" {
		if unifiedPreview != "" {
			store.AppendMessage(conv.ID, c.newMessageData("system", unifiedPreview, nil, nil))
		}
		if splitPreview != "" {
			store.AppendMessage(conv.ID, c.newMessageData("system", splitPreview, nil, nil))
		}
	}

	c.applyDefaultModelIfMissing(conv.ID)
	c.applyDefaultAgentIfMissing(conv.ID)
	c.refreshConversationsFromStore(true)
	c.syncActiveConversationWithServer()
}

func sampleDiffPreviews() (string, string) {
	theme := styles.CurrentTheme()
	lines := sampleDiffLines()
	unified := diffview.RenderUnified(lines, 72, diffview.UnifiedOptions{ShowLineNumbers: true}, theme)
	split := diffview.RenderSplit(lines, 72, diffview.SplitOptions{ShowHeaders: true, ShowLineNumbers: true, Divider: "│"}, theme)

	unifiedLines := append([]string{"🧪 Unified diff preview:"}, unified.Lines...)
	splitLines := append([]string{"🧪 Split diff preview:"}, split.Lines...)

	return strings.Join(unifiedLines, "\n"), strings.Join(splitLines, "\n")
}

func sampleDiffLines() []diffview.DiffLine {
	return []diffview.DiffLine{
		{Kind: diffview.DiffLineHeader, Header: "@@ -14,5 +14,8 @@"},
		{Kind: diffview.DiffLineUnchanged, OldLine: "14", NewLine: "14", OldText: "func greet(name string) error {", NewText: "func greet(name string) error {"},
		{Kind: diffview.DiffLineRemoved, OldLine: "15", OldText: "\treturn errors.New(\"missing name\")"},
		{Kind: diffview.DiffLineAdded, NewLine: "15", NewText: "\tif name == \"\" {"},
		{Kind: diffview.DiffLineAdded, NewLine: "16", NewText: "\t\treturn errors.New(\"missing name\")"},
		{Kind: diffview.DiffLineAdded, NewLine: "17", NewText: "\t}"},
		{Kind: diffview.DiffLineAdded, NewLine: "18", NewText: "\tfmt.Printf(\"Hello, %s!\\n\", name)"},
		{Kind: diffview.DiffLineUnchanged, OldLine: "19", NewLine: "19", OldText: "\treturn nil", NewText: "\treturn nil"},
		{Kind: diffview.DiffLineUnchanged, OldLine: "20", NewLine: "20", OldText: "}", NewText: "}"},
	}
}

func (c *Chat) createNewConversation() tea.Cmd {
	store := c.ensureConversationStore()
	conv := store.CreateConversation("", stores.ConversationOptions{})
	if conv == nil {
		return nil
	}

	settings := stores.SharedApplicationSettingsStore().Settings()
	if stateStore := c.ensureApplicationStateStore(); stateStore != nil {
		stateStore.SetSelectedConversation(conv.ID)
	}
	if settings.DefaultModel != nil {
		modelCopy := *settings.DefaultModel
		stores.SharedConversationStateStore().SetSelectedModel(conv.ID, &modelCopy)
		store.SetSelectedModel(conv.ID, &modelCopy)
		if stateStore := c.ensureApplicationStateStore(); stateStore != nil {
			stateStore.SetSelectedModel(&modelCopy)
		}
	}
	if settings.DefaultAgent != nil {
		agentCopy := *settings.DefaultAgent
		stores.SharedConversationStateStore().SetSelectedAgent(conv.ID, &agentCopy)
		store.SetSelectedAgent(conv.ID, &agentCopy)
		if stateStore := c.ensureApplicationStateStore(); stateStore != nil {
			stateStore.SetSelectedAgent(&agentCopy)
		}
	}

	store.AppendMessage(conv.ID, c.newMessageData("system", "✨ Started a new conversation. Ask a question or type 'help' to see available commands.", nil, nil))

	c.applyDefaultModelIfMissing(conv.ID)
	c.applyDefaultAgentIfMissing(conv.ID)
	c.refreshConversationsFromStore(true)
	c.refreshActiveConversationView()
	c.hoverButton = false
	c.hoverConversationID = conv.ID

	c.syncActiveConversationWithServer()

	return c.Focus()
}

func (c *Chat) loadActiveConversation() {
	c.refreshConversationsFromStore(true)
	c.refreshActiveConversationView()
}

func (c *Chat) refreshActiveConversationView() {
	conv := c.getActiveConversation()
	if conv == nil {
		c.viewport.Clear()
		return
	}

	messages := c.cloneMessagesWithWidth(conv.Messages)
	c.viewport.SetMessages(messages)
}

func (c *Chat) appendMessageToActiveConversation(msgType, content string, metadata map[string]interface{}, buttons []chattemplates.MessageButton) {
	store := c.ensureConversationStore()
	conv := store.ActiveConversation()
	if conv == nil {
		c.createNewConversation()
		conv = store.ActiveConversation()
	}
	if conv == nil {
		return
	}

	store.AppendMessage(conv.ID, c.newMessageData(msgType, content, metadata, buttons))
	c.applyDefaultModelIfMissing(conv.ID)
	c.applyDefaultAgentIfMissing(conv.ID)
	c.refreshConversationsFromStore(true)
	c.refreshActiveConversationView()
	c.ensureHoverSelection()
}

func (c *Chat) switchConversation(conversationID string) bool {
	if conversationID == "" || conversationID == c.activeConversationID {
		return false
	}
	store := c.ensureConversationStore()
	if !store.SetActive(conversationID) {
		return false
	}

	c.refreshConversationsFromStore(true)
	c.refreshActiveConversationView()
	c.hoverButton = false
	c.hoverConversationID = conversationID
	c.syncConversationPanelHover(conversationID)
	c.syncActiveConversationWithServer()
	return true
}

func (c *Chat) getActiveConversation() *Conversation {
	store := c.ensureConversationStore()
	conv := store.ActiveConversation()
	if conv != nil {
		c.activeConversationID = conv.ID
	} else {
		c.activeConversationID = ""
	}
	return conv
}

func (c *Chat) getConversationByID(id string) *Conversation {
	store := c.ensureConversationStore()
	return store.Conversation(id)
}

func (c *Chat) newMessageData(msgType, content string, metadata map[string]interface{}, buttons []chattemplates.MessageButton) chattemplates.MessageTemplateData {
	width := c.messageWidth()
	if metadata == nil {
		metadata = make(map[string]interface{})
	}
	return chattemplates.MessageTemplateData{
		Type:      msgType,
		Content:   content,
		Timestamp: time.Now(),
		Raw:       false,
		Width:     width,
		Metadata:  metadata,
		Buttons:   buttons,
	}
}

func (c *Chat) cloneMessagesWithWidth(messages []chattemplates.MessageTemplateData) []chattemplates.MessageTemplateData {
	if len(messages) == 0 {
		return nil
	}
	width := c.messageWidth()
	cloned := make([]chattemplates.MessageTemplateData, len(messages))
	for i, msg := range messages {
		msg.Width = width
		cloned[i] = msg
	}
	return cloned
}

func (c *Chat) messageWidth() int {
	if c.contentWidth > 0 {
		return c.contentWidth
	}
	return c.viewportWidth()
}

func (c *Chat) viewportWidth() int {
	width := c.viewport.Width()
	if width > 0 {
		return width
	}
	if c.contentWidth > 0 {
		return c.contentWidth
	}
	return 80
}

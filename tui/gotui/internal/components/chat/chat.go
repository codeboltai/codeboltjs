package chat

import (
	"strings"

	"gotui/internal/components/chatcomponents"
	"gotui/internal/components/chattemplates"
	"gotui/internal/components/dialogs"
	"gotui/internal/components/widgets"
	"gotui/internal/layout/panels"
	"gotui/internal/stores"
	"gotui/internal/styles"
	"gotui/internal/wsclient"

	"github.com/charmbracelet/bubbles/v2/viewport"
	"github.com/charmbracelet/lipgloss/v2"
	zone "github.com/lrstanley/bubblezone"
)

// Chat represents the main chat interface.
type Chat struct {
	input             *chatcomponents.ChatInput
	viewport          *chatcomponents.ChatViewport
	templateManager   *chattemplates.TemplateManager
	slashMenu         *chatcomponents.SlashMenu
	modelPicker       *chatcomponents.ModelPicker
	agentPicker       *chatcomponents.AgentPicker
	themePicker       *dialogs.ThemePicker
	commandPalette    *chatcomponents.CommandPalette
	selectedModel     *chatcomponents.ModelOption
	modelOptions      []chatcomponents.ModelOption
	selectedAgent     *wsclient.AgentSelection
	conversationPanel *panels.ConversationListPanel
	width             int
	height            int
	focused           bool

	conversations        []*Conversation
	activeConversationID string

	conversationListWidth int
	buttonRegion          verticalRegion
	conversationRegions   []conversationRegion
	hoverConversationID   string
	hoverButton           bool

	chatHeight        int
	textHeight        int
	rightSidebarWidth int
	contentWidth      int

	rightPanels       []*panels.InfoPanel
	helpBar           *widgets.HelpBar
	modelStatusWidget *widgets.ModelStatusWidget
	modelStore        *stores.AIModelStore
	agentStore        *stores.AgentStore
	preferredAgent    *wsclient.AgentSelection
	conversationStore *stores.ConversationStore
	applicationState  *stores.ApplicationStateStore

	contextViewport      viewport.Model
	contextDrawerVisible bool
	singleColumn         bool
	conversationHeight   int
	contextHeight        int
	zonePrefix           string
	chatZoneID           string
	contextZoneID        string
}

func defaultSlashCommands() []chatcomponents.SlashCommand {
	return []chatcomponents.SlashCommand{
		{Name: "models", Description: "Switch active AI model", Usage: "/models"},
		{Name: "agents", Description: "Switch active agent", Usage: "/agents"},
		{Name: "theme", Description: "Switch TUI color theme", Usage: "/theme"},
		{Name: "help", Description: "Show available commands", Usage: "/help"},
	}
}

// New creates a new chat component.
func New() *Chat {
	templateManager := chattemplates.NewTemplateManager()
	input := chatcomponents.NewChatInput()
	viewport := chatcomponents.NewChatViewport(templateManager)

	zonePrefix := zone.NewPrefix()

	chat := &Chat{
		input:                 input,
		viewport:              viewport,
		templateManager:       templateManager,
		slashMenu:             chatcomponents.NewSlashMenu(defaultSlashCommands()),
		modelPicker:           chatcomponents.NewModelPicker(nil),
		agentPicker:           chatcomponents.NewAgentPicker(nil),
		themePicker:           dialogs.NewThemePicker(styles.PresetThemes()),
		commandPalette:        chatcomponents.NewCommandPalette(defaultSlashCommands()),
		conversationPanel:     panels.NewConversationListPanel(),
		focused:               true,
		rightSidebarWidth:     0,
		textHeight:            3,
		conversationListWidth: 28,
		contextDrawerVisible:  true,
		contextViewport:       newContextViewport(1, 1),
		conversationStore:     stores.SharedConversationStore(),
		applicationState:      stores.SharedApplicationStateStore(),
		zonePrefix:            zonePrefix,
		chatZoneID:            zonePrefix + "chat_area",
		contextZoneID:         zonePrefix + "context_drawer",
	}
	chat.modelStatusWidget = widgets.NewModelStatusWidget(nil, nil)
	chat.modelStatusWidget.SetStateStore(chat.applicationState)
	chat.commandPalette.UpdateCommands(chat.slashMenu.Commands())
	chat.createInitialConversation()
	chat.loadActiveConversation()

	return chat
}

// SetModelStore binds the chat component to the centralized AI model store.
func (c *Chat) SetModelStore(store *stores.AIModelStore) {
	if c == nil {
		return
	}
	c.modelStore = store
	if c.modelPicker != nil {
		c.modelPicker.BindStore(store)
	}
	if c.modelStatusWidget != nil {
		c.modelStatusWidget.SetModelStore(store)
	}
	if store != nil {
		c.SetModelOptions(nil)
	} else {
		c.SetModelOptions([]chatcomponents.ModelOption{})
	}
}

// SetAgentStore binds the chat component to the centralized agent store.
func (c *Chat) SetAgentStore(store *stores.AgentStore) {
	if c == nil {
		return
	}
	c.agentStore = store
	if c.agentPicker != nil {
		c.agentPicker.BindStore(store)
	}
	if c.modelStatusWidget != nil {
		c.modelStatusWidget.SetAgentStore(store)
	}
	c.applyDefaultAgentToAllConversations()
	c.refreshConversationsFromStore(true)
}

// SetPreferredAgent records the agent provided via configuration to seed new conversations.
func (c *Chat) SetPreferredAgent(agent wsclient.AgentSelection) {
	if c == nil {
		return
	}
	if strings.TrimSpace(agent.ID) == "" {
		c.preferredAgent = nil
		c.applyDefaultAgentToAllConversations()
		c.refreshConversationsFromStore(true)
		return
	}
	copy := agent
	c.preferredAgent = &copy
	c.applyDefaultAgentToAllConversations()
	c.refreshConversationsFromStore(true)
}

// SetHelpBar attaches a help bar to be rendered beneath the input.
func (c *Chat) SetHelpBar(bar *widgets.HelpBar) {
	if c == nil {
		return
	}
	c.helpBar = bar
}

// SetRightSidebarPanels assigns the info panels rendered in the context drawer.
func (c *Chat) SetRightSidebarPanels(infos ...*panels.InfoPanel) {
	if c == nil {
		return
	}

	if len(infos) == 0 {
		c.rightPanels = nil
		c.contextDrawerVisible = false
		return
	}

	c.rightPanels = append([]*panels.InfoPanel(nil), infos...)
	c.contextDrawerVisible = true
}

// AddMessage adds a message to the chat.
func (c *Chat) AddMessage(msgType, content string) {
	c.appendMessageToActiveConversation(msgType, content, nil)
}

// SetModelOptions updates the available model selections sourced from the server.
func (c *Chat) SetModelOptions(options []chatcomponents.ModelOption) {
	if c == nil {
		return
	}

	if c.modelStore != nil {
		storeModels := c.modelStore.Models()
		options = make([]chatcomponents.ModelOption, len(storeModels))
		for i, opt := range storeModels {
			options[i] = chatcomponents.ModelOption(opt)
		}
	}

	if options == nil {
		options = []chatcomponents.ModelOption{}
	}

	c.modelOptions = make([]chatcomponents.ModelOption, len(options))
	copy(c.modelOptions, options)

	if c.modelPicker != nil {
		pickerOptions := make([]stores.ModelOption, len(c.modelOptions))
		for i, opt := range c.modelOptions {
			pickerOptions[i] = stores.ModelOption(opt)
		}
		c.modelPicker.SetOptions(pickerOptions)
	}

	c.applyDefaultModelToAllConversations()
	c.refreshConversationsFromStore(true)
}

// SubmitMsg is sent when a message is submitted.
type SubmitMsg struct {
	Content string
}

// ModelSelectedMsg is sent when the user selects a model from the picker.
type ModelSelectedMsg struct {
	Option chatcomponents.ModelOption
}

// AgentSelectedMsg is sent when the user selects an agent.
type AgentSelectedMsg struct {
	Option chatcomponents.AgentOption
}

// ThemeSelectedMsg is emitted when a theme preset is chosen.
type ThemeSelectedMsg struct {
	Preset styles.ThemePreset
}

// View renders the chat component.
func (c *Chat) View() string {
	if c.width < 50 || c.height < 10 {
		return lipgloss.NewStyle().
			Width(c.width).
			Height(c.height).
			Align(lipgloss.Center, lipgloss.Center).
			Render("Chat area too small")
	}

	theme := styles.CurrentTheme()

	if c.conversationPanel != nil {
		c.conversationPanel.SetHorizontalLayout(c.singleColumn)
		c.conversationPanel.SetSize(c.conversationListWidth, c.conversationHeight)
	}

	chatArea, chatAreaHeight := c.renderChatArea(c.contentWidth)

	var layout string
	if c.singleColumn {
		layout = c.renderSingleColumnLayout(theme, chatArea, chatAreaHeight)
	} else {
		layout = c.renderTwoColumnLayout(theme, chatArea, chatAreaHeight)
	}

	if c.themePicker.IsVisible() {
		return c.themePicker.View(c.width, c.height)
	}

	var overlayLayers []*lipgloss.Layer
	if c.commandPalette.IsVisible() {
		if layer := c.commandPalette.Layer(c.width, c.height); layer != nil {
			overlayLayers = append(overlayLayers, layer.Z(30))
		}
	}

	if c.modelPicker.IsVisible() {
		if layer := c.modelPicker.Layer(c.width, c.height); layer != nil {
			overlayLayers = append(overlayLayers, layer.Z(20))
		}
	}

	if c.agentPicker != nil && c.agentPicker.IsVisible() {
		if layer := c.agentPicker.Layer(c.width, c.height); layer != nil {
			overlayLayers = append(overlayLayers, layer.Z(25))
		}
	}

	if c.slashMenu.IsVisible() {
		maxMenuItems := c.chatHeight / 3
		if maxMenuItems < 3 {
			maxMenuItems = 3
		}
		c.slashMenu.SetMaxItems(maxMenuItems)
		if layer := c.slashMenu.Layer(c.width, c.height); layer != nil {
			overlayLayers = append(overlayLayers, layer.Z(10))
		}
	}

	if len(overlayLayers) > 0 {
		canvas := lipgloss.NewCanvas(lipgloss.NewLayer(layout))
		canvas.AddLayers(overlayLayers...)
		return canvas.Render()
	}

	return layout
}

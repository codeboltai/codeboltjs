package chat

import (
	"gotui/internal/components/chatcomponents"
	"gotui/internal/components/chattemplates"
	"gotui/internal/components/dialogs"
	"gotui/internal/components/helpbar"
	"gotui/internal/layout/panels"
	"gotui/internal/styles"

	"github.com/charmbracelet/bubbles/v2/viewport"
	"github.com/charmbracelet/lipgloss/v2"
)

// Chat represents the main chat interface.
type Chat struct {
	input             *chatcomponents.ChatInput
	viewport          *chatcomponents.ChatViewport
	templateManager   *chattemplates.TemplateManager
	slashMenu         *chatcomponents.SlashMenu
	modelPicker       *chatcomponents.ModelPicker
	themePicker       *dialogs.ThemePicker
	commandPalette    *chatcomponents.CommandPalette
	selectedModel     *chatcomponents.ModelOption
	modelOptions      []chatcomponents.ModelOption
	conversationPanel *panels.ConversationListPanel
	width             int
	height            int
	focused           bool

	conversations        []*Conversation
	activeConversationID string
	conversationCounter  int

	conversationListWidth int
	buttonRegion          verticalRegion
	conversationRegions   []conversationRegion
	hoverConversationID   string
	hoverButton           bool

	chatHeight        int
	textHeight        int
	rightSidebarWidth int
	contentWidth      int

	rightPanels []*panels.InfoPanel
	helpBar     *helpbar.HelpBar

	contextViewport      viewport.Model
	contextDrawerVisible bool
	singleColumn         bool
	conversationHeight   int
	contextHeight        int
}

func defaultSlashCommands() []chatcomponents.SlashCommand {
	return []chatcomponents.SlashCommand{
		{Name: "models", Description: "Switch active AI model", Usage: "/models"},
		{Name: "theme", Description: "Switch TUI color theme", Usage: "/theme"},
		{Name: "help", Description: "Show available commands", Usage: "/help"},
	}
}

// New creates a new chat component.
func New() *Chat {
	templateManager := chattemplates.NewTemplateManager()
	input := chatcomponents.NewChatInput()
	viewport := chatcomponents.NewChatViewport(templateManager)

	chat := &Chat{
		input:                 input,
		viewport:              viewport,
		templateManager:       templateManager,
		slashMenu:             chatcomponents.NewSlashMenu(defaultSlashCommands()),
		modelPicker:           chatcomponents.NewModelPicker(nil),
		themePicker:           dialogs.NewThemePicker(styles.PresetThemes()),
		commandPalette:        chatcomponents.NewCommandPalette(defaultSlashCommands()),
		conversationPanel:     panels.NewConversationListPanel(),
		focused:               true,
		rightSidebarWidth:     0,
		textHeight:            3,
		conversationListWidth: 28,
		contextDrawerVisible:  true,
		contextViewport:       newContextViewport(1, 1),
	}
	chat.commandPalette.UpdateCommands(chat.slashMenu.Commands())
	chat.createInitialConversation()
	chat.loadActiveConversation()

	return chat
}

// SetHelpBar attaches a help bar to be rendered beneath the input.
func (c *Chat) SetHelpBar(bar *helpbar.HelpBar) {
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

	if options == nil {
		options = []chatcomponents.ModelOption{}
	}

	c.modelOptions = make([]chatcomponents.ModelOption, len(options))
	copy(c.modelOptions, options)

	if c.modelPicker != nil {
		c.modelPicker.SetOptions(c.modelOptions)
	}

	if c.selectedModel != nil {
		found := false
		for _, option := range c.modelOptions {
			if option.Name == c.selectedModel.Name && option.Provider == c.selectedModel.Provider {
				found = true
				break
			}
		}
		if !found {
			c.selectedModel = nil
		}
	}
}

// SubmitMsg is sent when a message is submitted.
type SubmitMsg struct {
	Content string
}

// ModelSelectedMsg is sent when the user selects a model from the picker.
type ModelSelectedMsg struct {
	Option chatcomponents.ModelOption
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

	chatArea := c.renderChatArea(c.contentWidth)

	var layout string
	if c.singleColumn {
		layout = c.renderSingleColumnLayout(theme, chatArea)
	} else {
		layout = c.renderTwoColumnLayout(theme, chatArea)
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

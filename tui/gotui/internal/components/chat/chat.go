package chat

import (
	"fmt"
	"sort"
	"strings"
	"time"
	"unicode"

	"gotui/internal/components/chatcomponents"
	"gotui/internal/components/chattemplates"
	"gotui/internal/layout/panels"
	"gotui/internal/styles"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"
	zone "github.com/lrstanley/bubblezone"
)

// Chat represents the main chat interface
type Chat struct {
	input             *chatcomponents.ChatInput
	viewport          *chatcomponents.ChatViewport
	templateManager   *chattemplates.TemplateManager
	slashMenu         *chatcomponents.SlashMenu
	modelPicker       *chatcomponents.ModelPicker
	commandPalette    *chatcomponents.CommandPalette
	selectedModel     *chatcomponents.ModelOption
	conversationPanel *panels.ConversationListPanel
	width             int
	height            int
	focused           bool

	// Conversations state
	conversations        []*Conversation
	activeConversationID string
	conversationCounter  int

	// Conversation list layout & interaction state
	conversationListWidth int
	buttonRegion          verticalRegion
	conversationRegions   []conversationRegion
	hoverConversationID   string
	hoverButton           bool

	// Chat area dimensions
	chatHeight        int
	textHeight        int
	rightSidebarWidth int
	contentWidth      int // effective content width for padding/fill
	rightPanels       []infoPanel
}

// Conversation represents a single chat history thread.
type Conversation struct {
	ID        string
	Title     string
	Messages  []chattemplates.MessageTemplateData
	CreatedAt time.Time
	UpdatedAt time.Time
}

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

type infoPanel struct {
	title string
	lines []string
}

func defaultSlashCommands() []chatcomponents.SlashCommand {
	return []chatcomponents.SlashCommand{
		{Name: "models", Description: "Switch active AI model", Usage: "/models"},
		{Name: "ask", Description: "Ask the AI assistant", Usage: "/ask <prompt>"},
		{Name: "read", Description: "Read a file from the project", Usage: "/read <filepath>"},
		{Name: "write", Description: "Write content to a file", Usage: "/write <filepath> <content>"},
		{Name: "test", Description: "Send a test message to the server", Usage: "/test"},
		{Name: "help", Description: "Show available commands", Usage: "/help"},
		{Name: "clear", Description: "Show a tip for managing panels", Usage: "/clear"},
	}
}

// New creates a new chat component
func New() *Chat {
	// Initialize template manager
	templateManager := chattemplates.NewTemplateManager()

	// Initialize chat input
	input := chatcomponents.NewChatInput()

	// Initialize viewport
	viewport := chatcomponents.NewChatViewport(templateManager)

	chat := &Chat{
		input:                 input,
		viewport:              viewport,
		templateManager:       templateManager,
		slashMenu:             chatcomponents.NewSlashMenu(defaultSlashCommands()),
		modelPicker:           chatcomponents.NewModelPicker(defaultModelOptions()),
		commandPalette:        chatcomponents.NewCommandPalette(defaultSlashCommands()),
		conversationPanel:     panels.NewConversationListPanel(),
		focused:               true,
		rightSidebarWidth:     28,
		textHeight:            3, // Match input height exactly
		conversationListWidth: 28,
		rightPanels: []infoPanel{
			{title: "Subagents", lines: []string{"• No subagents running"}},
			{title: "Todo", lines: []string{"[ ] Draft plan", "[ ] Implement feature", "[ ] Review changes"}},
			{title: "MCP", lines: []string{"weather: connected", "puppeteer: disconnected"}},
			{title: "Modified Files", lines: []string{"(none)"}},
			{title: "Next Scheduled Tasks", lines: []string{"No upcoming tasks"}},
			{title: "Context", lines: []string{"Tokens: 0 / 128K", "Uptime: 0m"}},
		},
	}
	chat.commandPalette.UpdateCommands(chat.slashMenu.Commands())

	// Bootstrap conversations with an initial thread
	chat.createInitialConversation()
	chat.loadActiveConversation()

	return chat
}

// AddMessage adds a message to the chat
func (c *Chat) AddMessage(msgType, content string) {
	c.appendMessageToActiveConversation(msgType, content, nil)
}

// AddFileReadMessage adds a file read message with metadata
func (c *Chat) AddFileReadMessage(filePath, content string) {
	c.appendMessageToActiveConversation("read_file", content, map[string]interface{}{
		"file_path": filePath,
	})
}

// AddFileWriteMessage adds a file write message with metadata
func (c *Chat) AddFileWriteMessage(filePath, content, operation string) {
	c.appendMessageToActiveConversation("write_file", content, map[string]interface{}{
		"file_path": filePath,
		"operation": operation,
	})
}

// AddFileOperationMessage adds a general file operation message with metadata
func (c *Chat) AddFileOperationMessage(operation, filePath, content string, success bool, targetPath string) {
	metadata := map[string]interface{}{
		"operation": operation,
		"file_path": filePath,
		"success":   success,
	}
	if targetPath != "" {
		metadata["target_path"] = targetPath
	}
	c.appendMessageToActiveConversation("file_operation", content, metadata)
}

// AddToolExecutionMessage adds a tool execution message with metadata
func (c *Chat) AddToolExecutionMessage(toolName, command, status, output, content string) {
	metadata := map[string]interface{}{
		"tool_name": toolName,
		"command":   command,
		"status":    status,
		"output":    output,
	}
	c.appendMessageToActiveConversation("tool_execution", content, metadata)
}

// SetSize sets the chat component dimensions
func (c *Chat) SetSize(width, height int) {
	c.width = width
	c.height = height
	c.chatHeight = height - c.textHeight // Let parent handle help bar spacing

	const (
		minConversationWidth     = 22
		maxConversationWidth     = 36
		defaultConversationWidth = 28
		minMainWidth             = 40
		minRightWidth            = 18
		maxRightWidth            = 32
		defaultRightWidth        = 26
	)

	// Decide whether we have enough space to render the conversation list
	minimumWidthForList := minMainWidth + minConversationWidth + 1 // include separator between list and chat
	if width < minimumWidthForList {
		c.conversationListWidth = 0
	} else {
		if c.conversationListWidth == 0 {
			c.conversationListWidth = defaultConversationWidth
		}
		maxListWidth := width - minMainWidth - 1
		if maxListWidth < minConversationWidth {
			c.conversationListWidth = 0
		} else {
			upperBound := maxConversationWidth
			if maxListWidth < upperBound {
				upperBound = maxListWidth
			}
			c.conversationListWidth = clampInt(c.conversationListWidth, minConversationWidth, upperBound)
		}
	}

	leftSeparator := 0
	if c.conversationListWidth > 0 {
		leftSeparator = 1
	}

	availableAfterLeft := width - c.conversationListWidth - leftSeparator
	if availableAfterLeft < 0 {
		availableAfterLeft = 0
	}

	maxAllowedRight := availableAfterLeft - minMainWidth - 1
	rightWidth := 0
	if maxAllowedRight >= minRightWidth {
		desired := c.rightSidebarWidth
		if desired == 0 {
			desired = defaultRightWidth
		}
		upper := maxAllowedRight
		if upper > maxRightWidth {
			upper = maxRightWidth
		}
		if upper < minRightWidth {
			upper = minRightWidth
		}
		rightWidth = clampInt(desired, minRightWidth, upper)
	}

	rightSeparator := 0
	if rightWidth > 0 {
		rightSeparator = 1
	}

	availableForMain := availableAfterLeft - rightWidth - rightSeparator
	if availableForMain < 0 {
		availableForMain = 0
	}

	c.rightSidebarWidth = rightWidth
	c.contentWidth = availableForMain

	// Update input (exact size, no internal padding)
	c.input.SetSize(c.contentWidth, c.textHeight)

	// Update viewport
	c.viewport.SetSize(c.contentWidth, c.chatHeight)

	// Update conversation panel dimensions
	if c.conversationPanel != nil {
		c.conversationPanel.SetSize(c.conversationListWidth, c.chatHeight)
	}
	c.refreshActiveConversationView()
}

// Focus focuses the chat input
func (c *Chat) Focus() tea.Cmd {
	c.focused = true
	c.hoverConversationID = ""
	c.hoverButton = false
	return c.input.Focus()
}

// FocusSidebar moves focus to the conversation list.
func (c *Chat) FocusSidebar() {
	c.focused = false
	c.hoverButton = false
	c.ensureHoverSelection()
	c.input.Blur()
}

// Blur blurs the chat input
func (c *Chat) Blur() {
	c.focused = false
	c.input.Blur()
	c.slashMenu.Close()
}

// IsFocused returns whether the chat is focused
func (c *Chat) IsFocused() bool {
	return c.focused
}

// GetInput returns the current input text
func (c *Chat) GetInput() string {
	return c.input.GetValue()
}

// ClearInput clears the input
func (c *Chat) ClearInput() {
	c.input.Clear()
	c.slashMenu.Close()
}

func (c *Chat) refreshSlashMenu() {
	if !c.focused || c.modelPicker.IsVisible() || c.commandPalette.IsVisible() {
		c.slashMenu.Close()
		return
	}

	raw := c.input.RawValue()
	trimmed := strings.TrimLeftFunc(raw, unicode.IsSpace)
	if trimmed == "" || !strings.HasPrefix(trimmed, "/") {
		c.slashMenu.Close()
		return
	}

	fragment, remainder := parseCommandFragment(trimmed)
	if remainder != "" {
		c.slashMenu.Close()
		return
	}

	c.slashMenu.Open()
	c.slashMenu.SetFilter(fragment)
}

func (c *Chat) applySlashCommand(cmd chatcomponents.SlashCommand) tea.Cmd {
	raw := c.input.RawValue()
	trimmed := strings.TrimLeftFunc(raw, unicode.IsSpace)
	leading := raw[:len(raw)-len(trimmed)]
	rest := trimmed
	if strings.HasPrefix(rest, "/") {
		rest = rest[1:]
	}
	fragment, remainder := splitCommand(rest)
	remainder = strings.TrimLeftFunc(remainder, unicode.IsSpace)
	if remainder != "" {
		remainder = " " + remainder
	} else {
		remainder = " "
	}

	if cmd.Name == "models" {
		c.input.SetValueAndCursor("", 0)
		c.slashMenu.Close()
		c.commandPalette.Close()
		c.modelPicker.Open()
		return nil
	}

	newValue := leading + "/" + cmd.Name + remainder
	cursor := runeLen(leading) + runeLen("/"+cmd.Name) + 1
	c.input.SetValueAndCursor(newValue, cursor)
	c.slashMenu.Close()
	_ = fragment
	return nil
}

func parseCommandFragment(trimmed string) (fragment string, remainder string) {
	if !strings.HasPrefix(trimmed, "/") {
		return "", ""
	}
	rest := trimmed[1:]
	return splitCommand(rest)
}

func splitCommand(rest string) (fragment string, remainder string) {
	for i, r := range rest {
		if unicode.IsSpace(r) {
			return rest[:i], rest[i:]
		}
	}
	return rest, ""
}

func runeLen(s string) int {
	return len([]rune(s))
}

// FocusChat returns focus to the main chat input.
func (c *Chat) FocusChat() {
	c.focused = true
	c.hoverButton = false
	c.hoverConversationID = ""
	_ = c.input.Focus()
}

func (c *Chat) ensureHoverSelection() {
	if c.conversationListWidth == 0 {
		c.hoverConversationID = ""
		c.hoverButton = false
		c.syncConversationPanelHover("")
		return
	}

	if len(c.conversations) == 0 {
		c.hoverConversationID = ""
		c.hoverButton = true
		c.syncConversationPanelHover("")
		return
	}

	if c.hoverButton {
		c.syncConversationPanelHover("")
		return
	}

	if c.hoverConversationID != "" {
		c.syncConversationPanelHover(c.hoverConversationID)
		return
	}

	if c.activeConversationID != "" {
		c.hoverConversationID = c.activeConversationID
		c.syncConversationPanelHover(c.hoverConversationID)
		return
	}

	c.hoverConversationID = c.conversations[0].ID
}

func (c *Chat) indexOfConversation(id string) int {
	for i, conv := range c.conversations {
		if conv.ID == id {
			return i
		}
	}
	return -1
}

func (c *Chat) moveHover(delta int) {
	if c.conversationListWidth == 0 {
		return
	}

	total := len(c.conversations)
	if total == 0 {
		c.hoverConversationID = ""
		c.hoverButton = true
		return
	}

	index := total
	if !c.hoverButton {
		index = c.indexOfConversation(c.hoverConversationID)
		if index < 0 {
			index = c.indexOfConversation(c.activeConversationID)
		}
		if index < 0 {
			index = 0
		}
	}

	if c.hoverButton {
		index = total
	}

	index += delta
	if index < 0 {
		index = 0
	}
	if index > total {
		index = total
	}

	if index == total {
		c.hoverButton = true
		c.hoverConversationID = ""
		c.syncConversationPanelHover("")
		return
	}

	c.hoverButton = false
	c.hoverConversationID = c.conversations[index].ID
	c.syncConversationPanelHover(c.hoverConversationID)
}

func (c *Chat) moveHoverToStart() {
	if len(c.conversations) == 0 {
		c.hoverConversationID = ""
		c.hoverButton = true
		c.syncConversationPanelHover("")
		return
	}

	c.hoverButton = false
	c.hoverConversationID = c.conversations[0].ID
	c.syncConversationPanelHover(c.hoverConversationID)
}

func (c *Chat) moveHoverToEnd() {
	c.hoverConversationID = ""
	c.hoverButton = true
	c.syncConversationPanelHover("")
}

func (c *Chat) renderConversationList() string {
	if c.conversationPanel == nil {
		return ""
	}

	c.syncConversationPanelItems()
	c.ensureHoverSelection()
	return c.conversationPanel.View()
}

func (c *Chat) syncConversationPanelItems() {
	if c.conversationPanel == nil {
		return
	}

	items := make([]panels.ConversationListItem, len(c.conversations))
	activeID := c.activeConversationID
	for i, conv := range c.conversations {
		items[i] = panels.ConversationListItem{
			ID:        conv.ID,
			Title:     conv.Title,
			UpdatedAt: conv.UpdatedAt,
			IsActive:  conv.ID == activeID,
		}
	}

	c.conversationPanel.SetItems(items)
	c.syncConversationPanelHover(c.hoverConversationID)
}

func (c *Chat) syncConversationPanelHover(conversationID string) {
	if c.conversationPanel == nil {
		return
	}

	hoverNew := c.hoverButton && conversationID == ""
	c.conversationPanel.SetNewButtonState(true, hoverNew)

	// Update hover flag on items
	items := make([]panels.ConversationListItem, len(c.conversations))
	for i, conv := range c.conversations {
		items[i] = panels.ConversationListItem{
			ID:        conv.ID,
			Title:     conv.Title,
			UpdatedAt: conv.UpdatedAt,
			IsActive:  conv.ID == c.activeConversationID,
			IsHovered: conv.ID == conversationID && !c.hoverButton,
		}
	}
	// Replay items so hover state is refreshed
	c.conversationPanel.SetItems(items)
}

func (c *Chat) handleSidebarKeys(msg tea.KeyPressMsg) bool {
	if c.conversationListWidth == 0 {
		return false
	}

	switch msg.String() {
	case "up", "k":
		c.moveHover(-1)
	case "down", "j":
		c.moveHover(1)
	case "pgup":
		c.moveHover(-3)
	case "pgdown":
		c.moveHover(3)
	case "home", "g":
		c.moveHoverToStart()
	case "end", "G":
		c.moveHoverToEnd()
	case "enter":
		if c.hoverButton {
			c.createNewConversation()
			return true
		}
		if c.hoverConversationID != "" {
			c.switchConversation(c.hoverConversationID)
			return true
		}
	case "esc":
		c.FocusChat()
	default:
		return false
	}
	return true
}

// Update handles messages for the chat component
func (c *Chat) Update(msg tea.Msg) (*Chat, tea.Cmd) {
	var cmd tea.Cmd
	var cmds []tea.Cmd
	refreshMenu := false

	switch msg := msg.(type) {
	case tea.MouseClickMsg:
		if clickCmd, handled := c.handleMouseClick(msg); handled {
			return c, clickCmd
		}

	case tea.KeyPressMsg:
		if msg.String() == "tab" {
			if c.focused {
				c.FocusSidebar()
			} else {
				c.FocusChat()
			}
			return c, nil
		}

		if !c.focused {
			if c.handleSidebarKeys(msg) {
				return c, nil
			}

			// Allow scrolling chat viewport while sidebar focused with shift modifier
			switch msg.String() {
			case "shift+up":
				c.viewport.ScrollUp(1)
				return c, nil
			case "shift+down":
				c.viewport.ScrollDown(1)
				return c, nil
			case "shift+pgup":
				c.viewport.ScrollHalfPageUp()
				return c, nil
			case "shift+pgdown":
				c.viewport.ScrollHalfPageDown()
				return c, nil
			case "shift+home":
				c.viewport.GotoTop()
				return c, nil
			case "shift+end":
				c.viewport.GotoBottom()
				return c, nil
			}
		}
		if msg.String() == "ctrl+p" {
			if c.commandPalette.IsVisible() {
				c.commandPalette.Close()
			} else {
				c.commandPalette.Open()
			}
			return c, nil
		}

		if c.commandPalette.IsVisible() {
			handled, command, ok := c.commandPalette.HandleKey(msg)
			if handled {
				if ok {
					if cmd := c.applySlashCommand(command); cmd != nil {
						return c, cmd
					}
				}
				return c, nil
			}
		}

		if c.modelPicker.IsVisible() {
			handled, selection, ok := c.modelPicker.HandleKey(msg)
			if handled {
				if ok {
					return c, c.handleModelSelection(selection)
				}
				return c, nil
			}
		}

		refreshMenu = true
		if c.focused {
			if handled, selection, ok := c.slashMenu.HandleKey(msg); handled {
				if ok {
					if cmd := c.applySlashCommand(selection); cmd != nil {
						return c, cmd
					}
				}
				c.refreshSlashMenu()
				return c, nil
			}
		}
		if c.focused {
			// Handle input when focused
			switch msg.String() {
			case "ctrl+j":
				// Add newline
				c.input.InsertRune('\n')
				return c, nil
			case "enter":
				// Submit message
				input := c.GetInput()
				if input != "" {
					c.AddMessage("user", input)
					c.ClearInput()
					return c, tea.Cmd(func() tea.Msg {
						return SubmitMsg{Content: input}
					})
				}
				return c, nil
			}
		}
	}

	// Update input
	if !(c.modelPicker.IsVisible() && isKeyPress(msg)) {
		c.input, cmd = c.input.Update(msg)
		cmds = append(cmds, cmd)
	}

	if refreshMenu {
		c.refreshSlashMenu()
	}

	return c, tea.Batch(cmds...)
}

func isKeyPress(msg tea.Msg) bool {
	_, ok := msg.(tea.KeyPressMsg)
	return ok
}

// SubmitMsg is sent when a message is submitted
type SubmitMsg struct {
	Content string
}

// ModelSelectedMsg is sent when the user selects a model from the picker
type ModelSelectedMsg struct {
	Option chatcomponents.ModelOption
}

// View renders the chat component
func (c *Chat) View() string {
	if c.width < 50 || c.height < 10 {
		theme := styles.CurrentTheme()
		return lipgloss.NewStyle().
			Width(c.width).
			Height(c.height).
			Background(theme.Background).
			Align(lipgloss.Center, lipgloss.Center).
			Render("Chat area too small")
	}

	theme := styles.CurrentTheme()

	mainWidth := c.width

	convoWidth := c.conversationListWidth
	if c.conversationPanel != nil {
		c.conversationPanel.SetSize(convoWidth, c.chatHeight)
	}

	separatorCount := 0
	if convoWidth > 0 {
		separatorCount++
	}
	rightSidebar := ""
	rightWidth := c.rightSidebarWidth
	if rightWidth > 0 {
		separatorCount++
		rightSidebar = c.renderRightSidebar(theme)
	}
	chatWidth := c.contentWidth
	if chatWidth <= 0 {
		chatWidth = mainWidth - convoWidth - rightWidth - separatorCount
	}
	if chatWidth < 0 {
		chatWidth = 0
	}
	chatArea := c.renderChatArea(chatWidth)
	leftSidebar := ""
	if convoWidth > 0 {
		leftSidebar = c.renderConversationList()
	}

	layout := c.composeLayout(theme, leftSidebar, chatArea, rightSidebar)

	if c.commandPalette.IsVisible() {
		return c.commandPalette.View(mainWidth, c.height)
	}

	if c.modelPicker.IsVisible() {
		return c.modelPicker.View(mainWidth, c.height)
	}

	return layout
}

// GetMainWidth returns the width available for the main chat area
func (c *Chat) GetMainWidth() int {
	if c.width <= 0 {
		return 80
	}
	return c.width
}

// GetSidebarWidth returns the sidebar width
func (c *Chat) GetSidebarWidth() int {
	width := c.rightSidebarWidth
	if width <= 0 {
		return 0
	}
	totalWidth := c.width + width + 1
	if totalWidth < 60 {
		return 0
	}
	return width
}

func (c *Chat) handleModelSelection(option chatcomponents.ModelOption) tea.Cmd {
	c.modelPicker.Close()
	c.commandPalette.Close()
	c.input.SetValueAndCursor("", 0)
	c.slashMenu.Close()
	opt := option
	c.selectedModel = &opt
	c.AddMessage("system", fmt.Sprintf("🤖 Model set to %s (%s)", option.Name, option.Provider))
	return tea.Cmd(func() tea.Msg {
		return ModelSelectedMsg{Option: option}
	})
}

// ToggleCommandPalette toggles the global command picker overlay
func (c *Chat) ToggleCommandPalette() {
	if c.commandPalette == nil {
		return
	}
	if c.commandPalette.IsVisible() {
		c.commandPalette.Close()
		return
	}
	c.modelPicker.Close()
	c.slashMenu.Close()
	c.commandPalette.UpdateCommands(c.slashMenu.Commands())
	c.commandPalette.Open()
}

func (c *Chat) renderModelStatus() string {
	if c.selectedModel == nil {
		return ""
	}
	theme := styles.CurrentTheme()
	model := fmt.Sprintf("Model: %s", c.selectedModel.Name)
	provider := c.selectedModel.Provider
	if provider != "" {
		model += fmt.Sprintf("  •  %s", provider)
	}
	if c.selectedModel.Context != "" {
		model += fmt.Sprintf("  •  %s context", c.selectedModel.Context)
	}
	return lipgloss.NewStyle().
		Foreground(theme.Primary).
		Border(lipgloss.NormalBorder()).
		BorderForeground(theme.Primary).
		Padding(0, 1).
		Render(model)
}

func defaultModelOptions() []chatcomponents.ModelOption {
	return []chatcomponents.ModelOption{
		{Name: "gpt-4.1-mini", Provider: "OpenAI", Description: "Fast GPT-4.1 family model ideal for iterative coding and chats", Capabilities: []string{"Text", "Code"}, Context: "128K"},
		{Name: "gpt-4o", Provider: "OpenAI", Description: "High-quality reasoning with strong coding abilities", Capabilities: []string{"Text", "Code", "Vision"}, Context: "128K"},
		{Name: "claude-3.5-sonnet", Provider: "Anthropic", Description: "Balanced reasoning with low hallucination rates", Capabilities: []string{"Text", "Analysis"}, Context: "200K"},
		{Name: "claude-3.5-haiku", Provider: "Anthropic", Description: "Fast lightweight Claude model great for agent workflows", Capabilities: []string{"Text"}, Context: "200K"},
		{Name: "gemini-1.5-pro", Provider: "Google", Description: "Long-context multimodal model for complex tasks", Capabilities: []string{"Text", "Vision", "Audio"}, Context: "1M"},
		{Name: "mistral-large-latest", Provider: "Mistral", Description: "European-hosted model optimized for structured coding", Capabilities: []string{"Text", "Code"}, Context: "64K"},
	}
}

func (c *Chat) renderChatArea(mainWidth int) string {
	theme := styles.CurrentTheme()

	if mainWidth <= 0 {
		separatorCount := 0
		if c.conversationListWidth > 0 {
			separatorCount++
		}
		if c.rightSidebarWidth > 0 {
			separatorCount++
		}
		mainWidth = c.width - c.conversationListWidth - c.rightSidebarWidth - separatorCount
	}

	chatWidth := mainWidth
	if chatWidth <= 0 {
		if c.width > 0 {
			chatWidth = c.width
		} else {
			chatWidth = 40
		}
	}

	chatHistory := c.viewport.View()
	inputArea := c.input.View()
	if c.selectedModel != nil {
		inputArea = lipgloss.JoinVertical(
			lipgloss.Left,
			c.renderModelStatus(),
			inputArea,
		)
	}
	if c.slashMenu.IsVisible() {
		menu := c.slashMenu.View(chatWidth)
		inputArea = lipgloss.JoinVertical(lipgloss.Left, menu, inputArea)
	}

	return lipgloss.NewStyle().
		Width(chatWidth).
		Background(theme.Background).
		Render(lipgloss.JoinVertical(lipgloss.Left, chatHistory, inputArea))
}

func (c *Chat) renderRightSidebar(theme styles.Theme) string {
	if c.rightSidebarWidth <= 0 || len(c.rightPanels) == 0 {
		return ""
	}

	panelWidth := c.rightSidebarWidth
	base := lipgloss.NewStyle().
		Width(panelWidth).
		Border(lipgloss.NormalBorder()).
		BorderForeground(theme.Border).
		Background(theme.Surface).
		Padding(0, 1)

	titleStyle := lipgloss.NewStyle().
		Foreground(theme.Primary).
		Bold(true)

	contentStyle := lipgloss.NewStyle().
		Foreground(theme.Foreground)

	mutedStyle := lipgloss.NewStyle().
		Foreground(theme.Muted)

	successStyle := lipgloss.NewStyle().
		Foreground(theme.Success)

	errorStyle := lipgloss.NewStyle().
		Foreground(theme.Error)

	var sections []string
	for _, panel := range c.rightPanels {
		lines := make([]string, 0, len(panel.lines)+1)
		lines = append(lines, titleStyle.Render(panel.title))
		for _, line := range panel.lines {
			trimmed := strings.TrimSpace(line)
			lower := strings.ToLower(trimmed)
			styled := contentStyle.Render(line)
			switch {
			case trimmed == "":
				styled = mutedStyle.Render(line)
			case strings.Contains(lower, "disconnected") || strings.Contains(lower, "missing") || strings.Contains(lower, "error"):
				styled = errorStyle.Render(line)
			case strings.Contains(lower, "connected"):
				styled = successStyle.Render(line)
			}
			lines = append(lines, styled)
		}
		sectionView := base.Render(lipgloss.JoinVertical(lipgloss.Left, lines...))
		sections = append(sections, sectionView)
	}

	sidebar := lipgloss.JoinVertical(lipgloss.Left, sections...)

	return lipgloss.NewStyle().
		Width(panelWidth).
		Height(c.chatHeight).
		Background(theme.Background).
		Render(sidebar)
}

func (c *Chat) composeLayout(theme styles.Theme, leftSidebar, chatArea, rightSidebar string) string {
	segments := make([]string, 0, 5)

	if leftSidebar != "" {
		segments = append(segments, leftSidebar)
		segments = append(segments, layoutSeparator(theme))
	}

	segments = append(segments, chatArea)

	if rightSidebar != "" {
		segments = append(segments, layoutSeparator(theme))
		segments = append(segments, rightSidebar)
	}

	return lipgloss.NewStyle().
		Width(c.width).
		Height(c.height).
		Background(theme.Background).
		Render(lipgloss.JoinHorizontal(lipgloss.Top, segments...))
}

func layoutSeparator(theme styles.Theme) string {
	return lipgloss.NewStyle().
		Width(1).
		Background(theme.Background).
		Foreground(theme.Border).
		Render("│")
}

func (c *Chat) handleMouseClick(msg tea.MouseClickMsg) (tea.Cmd, bool) {
	if c.conversationPanel == nil || c.conversationListWidth == 0 {
		return nil, false
	}

	mouse := msg.Mouse()
	if mouse.Button != tea.MouseLeft {
		return nil, false
	}

	if zoneID := c.conversationPanel.NewConversationZoneID(); zoneID != "" {
		if mouseInZone(mouse, zone.Get(zoneID)) {
			return c.createNewConversation(), true
		}
	}

	for _, conv := range c.conversations {
		zoneID := c.conversationPanel.ConversationZoneID(conv.ID)
		if zoneID == "" {
			continue
		}
		if mouseInZone(mouse, zone.Get(zoneID)) {
			c.switchConversation(conv.ID)
			return nil, true
		}
	}

	return nil, false
}

func mouseInZone(mouse tea.Mouse, info *zone.ZoneInfo) bool {
	if info == nil || info.IsZero() {
		return false
	}

	if mouse.X < info.StartX || mouse.X > info.EndX {
		return false
	}
	if mouse.Y < info.StartY || mouse.Y > info.EndY {
		return false
	}
	return true
}

func clampInt(value, min, max int) int {
	if value < min {
		return min
	}
	if value > max {
		return max
	}
	return value
}

func (c *Chat) createInitialConversation() {
	if len(c.conversations) > 0 {
		return
	}

	conv := c.newConversation("Conversation 1")
	conv.Messages = append(conv.Messages, c.newMessageData("system", "🚀 Welcome to Codebolt! Type 'help' to see available commands.", nil))

	sampleReadContent := strings.Join([]string{
		"// Preview of the read file template",
		"package demo",
		"",
		"func Hello() string {",
		"\treturn \"Hello from the read file template!\"",
		"}",
	}, "\n")
	conv.Messages = append(conv.Messages, c.newMessageData("read_file", sampleReadContent, map[string]interface{}{"file_path": "demo/hello.go"}))

	c.conversations = []*Conversation{conv}
	c.activeConversationID = conv.ID
}

func (c *Chat) newConversation(title string) *Conversation {
	c.conversationCounter++
	now := time.Now()
	return &Conversation{
		ID:        fmt.Sprintf("conversation-%d", c.conversationCounter),
		Title:     title,
		Messages:  make([]chattemplates.MessageTemplateData, 0, 16),
		CreatedAt: now,
		UpdatedAt: now,
	}
}

func (c *Chat) createNewConversation() tea.Cmd {
	title := fmt.Sprintf("Conversation %d", c.conversationCounter+1)
	conv := c.newConversation(title)
	conv.Messages = append(conv.Messages, c.newMessageData("system", "✨ Started a new conversation. Ask a question or type 'help' to see available commands.", nil))

	c.conversations = append(c.conversations, conv)
	c.activeConversationID = conv.ID
	c.resortConversations()
	c.refreshActiveConversationView()
	c.hoverButton = false
	c.hoverConversationID = conv.ID

	return c.Focus()
}

func (c *Chat) loadActiveConversation() {
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

func (c *Chat) appendMessageToActiveConversation(msgType, content string, metadata map[string]interface{}) {
	conv := c.getActiveConversation()
	if conv == nil {
		// Create a default conversation if none exist yet
		c.createNewConversation()
		conv = c.getActiveConversation()
	}
	if conv == nil {
		return
	}

	conv.Messages = append(conv.Messages, c.newMessageData(msgType, content, metadata))
	conv.UpdatedAt = time.Now()
	c.resortConversations()
	c.refreshActiveConversationView()
	c.ensureHoverSelection()
}

func (c *Chat) switchConversation(conversationID string) {
	if conversationID == "" || conversationID == c.activeConversationID {
		return
	}
	if c.getConversationByID(conversationID) == nil {
		return
	}

	c.activeConversationID = conversationID
	c.refreshActiveConversationView()
	c.hoverButton = false
	c.hoverConversationID = conversationID
	c.syncConversationPanelHover(conversationID)
}

func (c *Chat) getActiveConversation() *Conversation {
	return c.getConversationByID(c.activeConversationID)
}

func (c *Chat) getConversationByID(id string) *Conversation {
	for _, conv := range c.conversations {
		if conv.ID == id {
			return conv
		}
	}
	return nil
}

func (c *Chat) resortConversations() {
	sort.SliceStable(c.conversations, func(i, j int) bool {
		if c.conversations[i].UpdatedAt.Equal(c.conversations[j].UpdatedAt) {
			return c.conversations[i].CreatedAt.After(c.conversations[j].CreatedAt)
		}
		return c.conversations[i].UpdatedAt.After(c.conversations[j].UpdatedAt)
	})
	c.syncConversationPanelItems()
}

func (c *Chat) newMessageData(msgType, content string, metadata map[string]interface{}) chattemplates.MessageTemplateData {
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
	// Align message width with the viewport width so templates wrap correctly
	if c.contentWidth > 0 {
		return c.contentWidth
	}
	return c.viewportWidth()
}

func (c *Chat) viewportWidth() int {
	// Fallback to a sensible default if viewport width is not yet initialized
	width := c.viewport.Width()
	if width > 0 {
		return width
	}
	if c.contentWidth > 0 {
		return c.contentWidth
	}
	return 80
}

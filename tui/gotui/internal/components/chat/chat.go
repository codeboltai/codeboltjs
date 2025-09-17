package chat

import (
	"gotui/internal/components/chatcomponents"
	"gotui/internal/components/chattemplates"
	"gotui/internal/styles"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"
)

// Chat represents the main chat interface
type Chat struct {
	input           *chatcomponents.ChatInput
	viewport        *chatcomponents.ChatViewport
	templateManager *chattemplates.TemplateManager
	width           int
	height          int
	focused         bool

	// Chat area dimensions
	chatHeight   int
	textHeight   int
	sidebarWidth int
	contentWidth int // effective content width for padding/fill
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
		input:           input,
		viewport:        viewport,
		templateManager: templateManager,
		focused:         true,
		sidebarWidth:    30, // Right sidebar width
		textHeight:      3,  // Match input height exactly
	}

	// Add welcome message
	chat.AddMessage("system", "🚀 Welcome to Codebolt! Type 'help' to see available commands.")

	return chat
}

// AddMessage adds a message to the chat
func (c *Chat) AddMessage(msgType, content string) {
	c.viewport.AddMessage(msgType, content)
}

// SetSize sets the chat component dimensions
func (c *Chat) SetSize(width, height int) {
	c.width = width
	c.height = height
	c.chatHeight = height - c.textHeight // Let parent handle help bar spacing

	// Calculate main chat area (excluding sidebar)
	mainWidth := width - c.sidebarWidth - 2
	if mainWidth < 40 {
		mainWidth = 40
	}
	c.contentWidth = mainWidth

	// Update input (exact size, no internal padding)
	c.input.SetSize(mainWidth, c.textHeight)

	// Update viewport
	c.viewport.SetSize(mainWidth, c.chatHeight)
}

// Focus focuses the chat input
func (c *Chat) Focus() tea.Cmd {
	c.focused = true
	return c.input.Focus()
}

// Blur blurs the chat input
func (c *Chat) Blur() {
	c.focused = false
	c.input.Blur()
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
}

// Update handles messages for the chat component
func (c *Chat) Update(msg tea.Msg) (*Chat, tea.Cmd) {
	var cmd tea.Cmd
	var cmds []tea.Cmd

	switch msg := msg.(type) {
	case tea.KeyPressMsg:
		if !c.focused {
			// Handle viewport scrolling when not focused
			switch msg.String() {
			case "up", "k":
				c.viewport.ScrollUp(1)
			case "down", "j":
				c.viewport.ScrollDown(1)
			case "pgup":
				c.viewport.ScrollHalfPageUp()
			case "pgdown":
				c.viewport.ScrollHalfPageDown()
			case "home", "g":
				c.viewport.GotoTop()
			case "end", "G":
				c.viewport.GotoBottom()
			}
			return c, nil
		}

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

	// Update input
	c.input, cmd = c.input.Update(msg)
	cmds = append(cmds, cmd)

	return c, tea.Batch(cmds...)
}

// SubmitMsg is sent when a message is submitted
type SubmitMsg struct {
	Content string
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

	// Calculate main chat area width
	mainWidth := c.GetMainWidth()

	// Chat history viewport
	chatHistory := c.viewport.View()

	// Input area - use the dedicated ChatInput component
	inputArea := c.input.View()

	// Combine chat history and input
	chatArea := lipgloss.JoinVertical(
		lipgloss.Left,
		chatHistory,
		inputArea,
	)

	// Main container for the entire chat view
	// Wrap with exact full-size container using app-provided height/width
	return lipgloss.NewStyle().
		Width(mainWidth).
		Height(c.height).
		Background(theme.Background).
		Render(chatArea)
}

// GetMainWidth returns the width available for the main chat area
func (c *Chat) GetMainWidth() int {
	// Ensure minimum width
	if c.width <= 0 {
		return 80 // Default fallback width
	}

	mainWidth := c.width - c.sidebarWidth - 2
	if mainWidth < 40 {
		if c.width < 40 {
			return c.width
		}
		return 40 // Minimum main width
	}
	return mainWidth
}

// GetSidebarWidth returns the sidebar width
func (c *Chat) GetSidebarWidth() int {
	if c.width < 60 {
		return 0 // Hide sidebar on very small screens
	}
	// Always show sidebar if screen is reasonably sized
	return c.sidebarWidth
}

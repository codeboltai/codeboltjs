package chatcomponents

import (
	"gotui/internal/components/chattemplates"
	"gotui/internal/styles"
	"strings"
	"time"

	"github.com/charmbracelet/bubbles/v2/viewport"
	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"
)

// Message represents a chat message
type Message struct {
	Type      string // "user", "ai", "system", "error"
	Content   string
	Timestamp time.Time
	Raw       bool // If true, don't render as markdown
}

// ChatViewport represents the chat viewport component
type ChatViewport struct {
	viewport        viewport.Model
	messages        []chattemplates.MessageTemplateData
	width           int
	height          int
	templateManager *chattemplates.TemplateManager
}

// NewChatViewport creates a new ChatViewport component
func NewChatViewport(templateManager *chattemplates.TemplateManager) *ChatViewport {
	// Initialize viewport
	vp := viewport.New(viewport.WithWidth(80), viewport.WithHeight(20))

	cv := &ChatViewport{
		viewport:        vp,
		messages:        make([]chattemplates.MessageTemplateData, 0),
		templateManager: templateManager,
	}

	cv.configureViewport()

	return cv
}

// SetSize sets the viewport component dimensions
func (cv *ChatViewport) SetSize(width, height int) {
	cv.width = width
	cv.height = height

	// Update viewport - create new one with updated size
	cv.viewport = viewport.New(viewport.WithWidth(width), viewport.WithHeight(height))

	cv.configureViewport()

	cv.updateContent()
}

func (cv *ChatViewport) configureViewport() {
	theme := styles.CurrentTheme()

	// Ensure styling stays consistent when the viewport is recreated.
	cv.viewport.Style = lipgloss.NewStyle().
		// Background(theme.Background).
		Foreground(theme.Foreground)

	// Prefer explicit key bindings that won't conflict with text input.
	cv.viewport.KeyMap.PageDown.SetKeys("pgdown")
	cv.viewport.KeyMap.PageDown.SetHelp("pgdn", "page down")
	cv.viewport.KeyMap.PageUp.SetKeys("pgup")
	cv.viewport.KeyMap.PageUp.SetHelp("pgup", "page up")
	cv.viewport.KeyMap.HalfPageDown.SetKeys("ctrl+d")
	cv.viewport.KeyMap.HalfPageDown.SetHelp("ctrl+d", "½ page down")
	cv.viewport.KeyMap.HalfPageUp.SetKeys("ctrl+u")
	cv.viewport.KeyMap.HalfPageUp.SetHelp("ctrl+u", "½ page up")
	cv.viewport.KeyMap.Down.SetEnabled(false)
	cv.viewport.KeyMap.Up.SetEnabled(false)
	cv.viewport.KeyMap.Left.SetEnabled(false)
	cv.viewport.KeyMap.Right.SetEnabled(false)

	// Always allow mouse wheel scrolling.
	cv.viewport.MouseWheelEnabled = true
}

// Width returns the current viewport width.
func (cv *ChatViewport) Width() int {
	return cv.width
}

// Height returns the current viewport height.
func (cv *ChatViewport) Height() int {
	return cv.height
}

// AddMessage adds a message to the viewport.
// The message type determines which template will be used for rendering.
// Template resolution is handled automatically by the template manager.
func (cv *ChatViewport) AddMessage(msgType, content string) {
	cv.messages = append(cv.messages, chattemplates.MessageTemplateData{
		Type:      msgType,
		Content:   content,
		Timestamp: time.Now(),
		Raw:       false,
		Width:     cv.width,
		Metadata:  nil,
	})
	cv.updateContent()
}

// AddMessageWithMetadata adds a message with metadata to the viewport.
// The message type determines which template will be used for rendering.
// Template resolution is handled automatically by the template manager.
func (cv *ChatViewport) AddMessageWithMetadata(msgType, content string, metadata map[string]interface{}, buttons []chattemplates.MessageButton) {
	cv.messages = append(cv.messages, chattemplates.MessageTemplateData{
		Type:      msgType,
		Content:   content,
		Timestamp: time.Now(),
		Raw:       false,
		Width:     cv.width,
		Metadata:  metadata,
		Buttons:   buttons,
	})
	cv.updateContent()
}

// SetMessages replaces the entire message collection shown in the viewport.
// The provided slice is copied to avoid accidental external modification.
func (cv *ChatViewport) SetMessages(messages []chattemplates.MessageTemplateData) {
	if messages == nil {
		cv.messages = nil
	} else {
		cv.messages = make([]chattemplates.MessageTemplateData, len(messages))
		copy(cv.messages, messages)
	}
	cv.updateContent()
}

// Messages returns a copy of the currently rendered messages.
func (cv *ChatViewport) Messages() []chattemplates.MessageTemplateData {
	if len(cv.messages) == 0 {
		return nil
	}
	result := make([]chattemplates.MessageTemplateData, len(cv.messages))
	copy(result, cv.messages)
	return result
}

// Clear removes all messages from the viewport.
func (cv *ChatViewport) Clear() {
	cv.messages = nil
	cv.updateContent()
}

// ScrollUp scrolls the viewport up
func (cv *ChatViewport) ScrollUp(lines int) {
	cv.viewport.LineUp(lines)
}

// ScrollDown scrolls the viewport down
func (cv *ChatViewport) ScrollDown(lines int) {
	cv.viewport.LineDown(lines)
}

// ScrollHalfPageUp scrolls half page up
func (cv *ChatViewport) ScrollHalfPageUp() {
	cv.viewport.HalfViewUp()
}

// ScrollHalfPageDown scrolls half page down
func (cv *ChatViewport) ScrollHalfPageDown() {
	cv.viewport.HalfViewDown()
}

// GotoTop scrolls to the top
func (cv *ChatViewport) GotoTop() {
	cv.viewport.GotoTop()
}

// GotoBottom scrolls to the bottom
func (cv *ChatViewport) GotoBottom() {
	cv.viewport.GotoBottom()
}

// Update handles messages for the viewport component
func (cv *ChatViewport) Update(msg tea.Msg) (*ChatViewport, tea.Cmd) {
	var cmd tea.Cmd
	cv.viewport, cmd = cv.viewport.Update(msg)
	return cv, cmd
}

// View renders the viewport component
func (cv *ChatViewport) View() string {
	if cv.width <= 0 || cv.height <= 0 {
		return ""
	}

	// theme := styles.CurrentTheme()

	return lipgloss.NewStyle().
		Width(cv.width).
		Height(cv.height).
		// Background(theme.Background).
		Render(cv.viewport.View())
}

// updateContent updates the viewport content with formatted messages
func (cv *ChatViewport) updateContent() {
	if cv.templateManager == nil {
		return
	}

	if len(cv.messages) == 0 {
		// Ensure background fills even when no content
		// theme := styles.CurrentTheme()
		pad := lipgloss.NewStyle().
			// Background(theme.Background).
			Width(maxInt(1, cv.width)).
			Render(" ")
		cv.viewport.SetContent(pad)
		return
	}

	theme := styles.CurrentTheme()
	var allLines []string

	// Calculate viewport width
	viewportWidth := cv.width
	if viewportWidth <= 0 {
		viewportWidth = 80
	}

	// Render each message using the template system
	for _, msg := range cv.messages {
		// Update width for current viewport
		msg.Width = viewportWidth
		rendered := cv.templateManager.RenderMessage(msg, theme)
		allLines = append(allLines, rendered.Lines...)
	}

	cv.viewport.SetContent(strings.Join(allLines, "\n"))
	cv.viewport.GotoBottom()
}

// Helper function
func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

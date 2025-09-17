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
	theme := styles.CurrentTheme()

	// Initialize viewport
	vp := viewport.New(viewport.WithWidth(80), viewport.WithHeight(20))
	vp.Style = lipgloss.NewStyle().
		Background(theme.Background).
		Foreground(theme.Foreground)

	return &ChatViewport{
		viewport:        vp,
		messages:        make([]chattemplates.MessageTemplateData, 0),
		templateManager: templateManager,
	}
}

// SetSize sets the viewport component dimensions
func (cv *ChatViewport) SetSize(width, height int) {
	cv.width = width
	cv.height = height

	// Update viewport - create new one with updated size
	cv.viewport = viewport.New(viewport.WithWidth(width), viewport.WithHeight(height))
	// Re-apply styling after recreating viewport to avoid background gaps
	theme := styles.CurrentTheme()
	cv.viewport.Style = lipgloss.NewStyle().
		Background(theme.Background).
		Foreground(theme.Foreground)

	cv.updateContent()
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
	})
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

	theme := styles.CurrentTheme()

	// Render the viewport with proper background
	return lipgloss.NewStyle().
		Width(cv.width).
		Height(cv.height).
		Background(theme.Background).
		Render(lipgloss.NewStyle().
			Width(cv.width).
			Background(theme.Background).
			Render(cv.viewport.View()))
}

// updateContent updates the viewport content with formatted messages
func (cv *ChatViewport) updateContent() {
	if cv.templateManager == nil {
		return
	}

	if len(cv.messages) == 0 {
		// Ensure background fills even when no content
		theme := styles.CurrentTheme()
		pad := lipgloss.NewStyle().
			Background(theme.Background).
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

package chatcomponents

import (
	"gotui/internal/styles"
	"strings"

	"github.com/charmbracelet/bubbles/v2/textarea"
	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"
)

// ChatInput represents the chat input component
type ChatInput struct {
	textarea textarea.Model
	width    int
	height   int
	focused  bool
}

// NewChatInput creates a new ChatInput component
func NewChatInput() *ChatInput {
	theme := styles.CurrentTheme()

	// Initialize textarea
	ta := textarea.New()
	ta.Placeholder = "Type your message here... (e.g., read package.json, ask \"What is Go?\")"
	ta.Focus()
	ta.CharLimit = 0
	ta.SetHeight(3)
	ta.ShowLineNumbers = false

	ta.Styles.Blurred.Base = lipgloss.NewStyle().Background(theme.Background)
	ta.Styles.Focused.Base = lipgloss.NewStyle().Background(theme.Background)
	ta.Styles.Focused.CursorLine = lipgloss.NewStyle().Background(theme.Background)

	// // Style textarea - clean, consistent with theme
	// ta.Styles.Focused.Base = lipgloss.NewStyle().
	// 	Background(theme.Background).
	// 	Foreground(theme.Foreground)

	// ta.Styles.Focused.CursorLine = lipgloss.NewStyle().
	// 	Background(theme.Background)
	// ta.Styles.Blurred.CursorLine = lipgloss.NewStyle().
	// 	Background(theme.Background)
	// ta.Styles.Focused.EndOfBuffer = lipgloss.NewStyle().
	// 	Background(theme.Background)
	// ta.Styles.Blurred.EndOfBuffer = lipgloss.NewStyle().
	// 	Background(theme.Background)

	// ta.Styles.Focused.Prompt = lipgloss.NewStyle().
	// 	Foreground(theme.Primary).
	// 	Bold(true)
	// ta.Styles.Focused.Text = lipgloss.NewStyle().
	// 	Foreground(theme.Foreground)
	// ta.Styles.Focused.Placeholder = lipgloss.NewStyle().
	// 	Foreground(theme.Muted)

	// ta.Styles.Blurred.Base = lipgloss.NewStyle().
	// 	Background(theme.Background).
	// 	Foreground(theme.Muted)
	// ta.Styles.Blurred.Prompt = lipgloss.NewStyle().
	// 	Foreground(theme.Muted)
	// ta.Styles.Blurred.Text = lipgloss.NewStyle().
	// 	Foreground(theme.Muted)
	// ta.Styles.Blurred.Placeholder = lipgloss.NewStyle().
	// 	Foreground(theme.Muted)

	return &ChatInput{
		textarea: ta,
		focused:  true,
		height:   3,
	}
}

// SetSize sets the input component dimensions
func (ci *ChatInput) SetSize(width, height int) {
	ci.width = width
	ci.height = height
	ci.textarea.SetWidth(width)
	ci.textarea.SetHeight(height)
}

// Focus focuses the input
func (ci *ChatInput) Focus() tea.Cmd {
	ci.focused = true
	return ci.textarea.Focus()
}

// Blur blurs the input
func (ci *ChatInput) Blur() {
	ci.focused = false
	ci.textarea.Blur()
}

// IsFocused returns whether the input is focused
func (ci *ChatInput) IsFocused() bool {
	return ci.focused
}

// GetValue returns the current input value
func (ci *ChatInput) GetValue() string {
	return strings.TrimSpace(ci.textarea.Value())
}

// RawValue returns the raw textarea content without trimming.
func (ci *ChatInput) RawValue() string {
	return ci.textarea.Value()
}

// SetValue replaces the current textarea content.
func (ci *ChatInput) SetValue(value string) {
	ci.textarea.SetValue(value)
}

// SetValueAndCursor sets the textarea value and moves the cursor to the given column.
func (ci *ChatInput) SetValueAndCursor(value string, cursor int) {
	ci.textarea.SetValue(value)
	if cursor < 0 {
		cursor = len([]rune(value))
	}
	ci.textarea.SetCursorColumn(cursor)
}

// Clear clears the input
func (ci *ChatInput) Clear() {
	ci.textarea.Reset()
}

// InsertRune inserts a rune at the cursor position
func (ci *ChatInput) InsertRune(r rune) {
	ci.textarea.InsertRune(r)
}

// Update handles messages for the input component
func (ci *ChatInput) Update(msg tea.Msg) (*ChatInput, tea.Cmd) {
	var cmd tea.Cmd
	ci.textarea, cmd = ci.textarea.Update(msg)
	return ci, cmd
}

// View renders the input component
func (ci *ChatInput) View() string {
	if ci.width <= 0 || ci.height <= 0 {
		return ""
	}

	// theme := styles.CurrentTheme()

	// // Simply render the textarea with proper background
	// return lipgloss.NewStyle().
	// 	Width(ci.width).
	// 	Height(ci.height).
	// 	Background(theme.Background).
	// 	Render(ci.textarea.View())
	return ci.textarea.View()
}

package chatcomponents

import (
	"strings"

	"github.com/charmbracelet/bubbles/v2/textarea"
	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"
)

// ChatInput represents the chat input component used for composing messages.
type ChatInput struct {
	textarea textarea.Model
	width    int
	height   int
	focused  bool
}

// NewChatInput creates a new ChatInput component with default styling and behavior.
func NewChatInput() *ChatInput {
	ta := textarea.New()
	ta.Placeholder = "Type your message here... (e.g., ask \"What is Go?\")"
	ta.Focus()
	ta.CharLimit = 0
	ta.SetHeight(3)
	ta.ShowLineNumbers = false

	ta.Styles = textarea.Styles{
		Focused: textarea.StyleState{
			Base:             lipgloss.NewStyle(),
			CursorLine:       lipgloss.NewStyle(),
			CursorLineNumber: lipgloss.NewStyle(),
			EndOfBuffer:      lipgloss.NewStyle(),
			LineNumber:       lipgloss.NewStyle(),
			Placeholder:      lipgloss.NewStyle(),
			Prompt:           lipgloss.NewStyle(),
			Text:             lipgloss.NewStyle(),
		},
		Blurred: textarea.StyleState{
			Base:             lipgloss.NewStyle(),
			CursorLine:       lipgloss.NewStyle(),
			CursorLineNumber: lipgloss.NewStyle(),
			EndOfBuffer:      lipgloss.NewStyle(),
			LineNumber:       lipgloss.NewStyle(),
			Placeholder:      lipgloss.NewStyle(),
			Prompt:           lipgloss.NewStyle(),
			Text:             lipgloss.NewStyle(),
		},
		Cursor: textarea.CursorStyle{
			Color: lipgloss.Color("7"),
			Shape: tea.CursorBar,
			Blink: true,
		},
	}

	return &ChatInput{
		textarea: ta,
		focused:  true,
		height:   3,
	}
}

// SetSize updates the component dimensions.
func (ci *ChatInput) SetSize(width, height int) {
	ci.width = width
	ci.height = height
	ci.textarea.SetWidth(width)
	ci.textarea.SetHeight(height)
}

// Focus sets focus on the textarea and returns any command emitted by Bubble Tea.
func (ci *ChatInput) Focus() tea.Cmd {
	ci.focused = true
	return ci.textarea.Focus()
}

// Blur removes focus from the textarea.
func (ci *ChatInput) Blur() {
	ci.focused = false
	ci.textarea.Blur()
}

// IsFocused reports whether the textarea currently has focus.
func (ci *ChatInput) IsFocused() bool {
	return ci.focused
}

// GetValue returns the trimmed input value.
func (ci *ChatInput) GetValue() string {
	return strings.TrimSpace(ci.textarea.Value())
}

// RawValue returns the untrimmed textarea content.
func (ci *ChatInput) RawValue() string {
	return ci.textarea.Value()
}

// SetValue replaces the current textarea content.
func (ci *ChatInput) SetValue(value string) {
	ci.textarea.SetValue(value)
}

// SetValueAndCursor replaces the content and positions the cursor.
func (ci *ChatInput) SetValueAndCursor(value string, cursor int) {
	ci.textarea.SetValue(value)
	if cursor < 0 {
		cursor = len([]rune(value))
	}
	ci.textarea.SetCursorColumn(cursor)
}

// Clear removes all content from the textarea.
func (ci *ChatInput) Clear() {
	ci.textarea.Reset()
}

// InsertRune inserts a rune at the current cursor position.
func (ci *ChatInput) InsertRune(r rune) {
	ci.textarea.InsertRune(r)
}

// Update processes incoming Bubble Tea messages.
func (ci *ChatInput) Update(msg tea.Msg) (*ChatInput, tea.Cmd) {
	if isMouseMsg(msg) {
		return ci, nil
	}
	var cmd tea.Cmd
	ci.textarea, cmd = ci.textarea.Update(msg)
	return ci, cmd
}

// View renders the textarea.
func (ci *ChatInput) View() string {
	if ci.width <= 0 || ci.height <= 0 {
		return ""
	}
	return ci.textarea.View()
}

func isMouseMsg(msg tea.Msg) bool {
	if msg == nil {
		return false
	}
	if _, ok := msg.(tea.MouseMsg); ok {
		return true
	}
	switch msg.(type) {
	case tea.MouseClickMsg, tea.MouseWheelMsg, tea.MouseMotionMsg, tea.MouseReleaseMsg:
		return true
	default:
		return false
	}
}

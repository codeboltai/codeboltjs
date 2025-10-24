package windows

import (
	"fmt"
	"strings"
	"time"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"

	"gotui/internal/components/chatcomponents"
	"gotui/internal/components/chattemplates"
	"gotui/internal/stores"
	"gotui/internal/styles"
)

type ConversationWindow struct {
	ID        string
	Title     string
	UpdatedAt time.Time

	X      int
	Y      int
	Width  int
	Height int

	viewport        *chatcomponents.ChatViewport
	templateManager *chattemplates.TemplateManager
}

func NewConversationWindow(conv *stores.Conversation, tm *chattemplates.TemplateManager) *ConversationWindow {
	vp := chatcomponents.NewChatViewport(tm)
	w := &ConversationWindow{
		ID:              conv.ID,
		Title:           conv.Title,
		UpdatedAt:       conv.UpdatedAt,
		viewport:        vp,
		templateManager: tm,
		Width:           defaultWindowWidth,
		Height:          defaultWindowHeight,
	}
	w.SyncConversation(conv)
	return w
}

func (w *ConversationWindow) SyncConversation(conv *stores.Conversation) {
	if conv == nil {
		return
	}
	w.ID = conv.ID
	w.Title = conv.Title
	w.UpdatedAt = conv.UpdatedAt
	if w.viewport == nil {
		w.viewport = chatcomponents.NewChatViewport(w.templateManager)
	}
	w.viewport.SetMessages(conv.Messages)
}

func (w *ConversationWindow) SetBounds(x, y, width, height int) {
	w.X = x
	w.Y = y
	w.Width = width
	w.Height = height
	w.ensureViewportSize()
}

func (w *ConversationWindow) SetPosition(x, y int) {
	w.X = x
	w.Y = y
}

func (w *ConversationWindow) ConstrainTo(maxWidth, maxHeight int) {
	if maxWidth <= 0 || maxHeight <= 0 {
		return
	}

	if w.Width < minWindowWidth {
		w.Width = minWindowWidth
	}
	if w.Height < minWindowHeight {
		w.Height = minWindowHeight
	}

	if w.Width > maxWidth {
		w.Width = maxWidth
	}
	if w.Height > maxHeight {
		w.Height = maxHeight
	}

	if w.X < 0 {
		w.X = 0
	}
	if w.Y < 0 {
		w.Y = 0
	}

	if w.X+w.Width > maxWidth {
		w.X = maxWidth - w.Width
	}
	if w.Y+w.Height > maxHeight {
		w.Y = maxHeight - w.Height
	}

	if w.X < 0 {
		w.X = 0
	}
	if w.Y < 0 {
		w.Y = 0
	}

	w.ensureViewportSize()
}

func (w *ConversationWindow) ensureViewportSize() {
	if w.viewport == nil {
		return
	}
	innerWidth := w.innerWidth()
	innerHeight := w.innerHeight()
	if innerWidth <= 0 {
		innerWidth = minWindowWidth - 2
	}
	if innerHeight <= 0 {
		innerHeight = minWindowHeight - headerHeight - 1
	}
	w.viewport.SetSize(innerWidth, innerHeight)
}

func (w *ConversationWindow) innerWidth() int {
	width := w.Width - 2
	if width < 1 {
		width = 1
	}
	return width
}

func (w *ConversationWindow) innerHeight() int {
	height := w.Height - headerHeight - 1
	if height < 1 {
		height = 1
	}
	return height
}

func (w *ConversationWindow) HandleViewportMsg(msg tea.Msg) tea.Cmd {
	if w.viewport == nil {
		return nil
	}
	var cmd tea.Cmd
	w.viewport, cmd = w.viewport.Update(msg)
	return cmd
}

func (w *ConversationWindow) Render(focused, active bool) string {
	if w.viewport == nil {
		return ""
	}

	theme := styles.CurrentTheme()

	borderColor := theme.Border
	headerBackground := theme.SurfaceHigh
	headerForeground := theme.Muted

	if active {
		borderColor = theme.Primary
		headerForeground = theme.Foreground
	} else if focused {
		borderColor = theme.Secondary
		headerForeground = theme.Foreground
	}

	if focused {
		headerBackground = theme.Primary
		headerForeground = theme.Background
	}

	innerWidth := w.innerWidth()
	innerHeight := w.innerHeight()

	title := w.Title
	if strings.TrimSpace(title) == "" {
		title = "(untitled conversation)"
	}
	if len(title) > innerWidth-4 && innerWidth > 8 {
		title = title[:innerWidth-7] + "..."
	}

	subtitle := ""
	if !w.UpdatedAt.IsZero() {
		subtitle = w.UpdatedAt.Format("15:04")
	}

	headerText := title
	if subtitle != "" {
		headerText = fmt.Sprintf("%s  %s", title, subtitle)
	}

	header := lipgloss.NewStyle().
		Width(innerWidth).
		Background(lipgloss.Color(headerBackground.Hex())).
		Foreground(lipgloss.Color(headerForeground.Hex())).
		Bold(true).
		Padding(0, 1).
		Render(headerText)

	body := lipgloss.NewStyle().
		Width(innerWidth).
		Height(innerHeight).
		Render(w.viewport.View())

	content := lipgloss.JoinVertical(lipgloss.Left, header, body)

	frame := lipgloss.NewStyle().
		Width(w.Width).
		Height(w.Height).
		Border(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color(borderColor.Hex())).
		Render(content)

	return frame
}

func (w *ConversationWindow) ContainsPoint(x, y int) bool {
	if w.Width <= 0 || w.Height <= 0 {
		return false
	}
	if x < w.X || x >= w.X+w.Width {
		return false
	}
	if y < w.Y || y >= w.Y+w.Height {
		return false
	}
	return true
}

const (
	minWindowWidth  = 36
	minWindowHeight = 12
	headerHeight    = 2
)

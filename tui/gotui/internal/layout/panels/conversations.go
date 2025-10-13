package panels

import (
	"fmt"
	"time"

	"gotui/internal/styles"

	"github.com/charmbracelet/lipgloss/v2"
	zone "github.com/lrstanley/bubblezone"
)

// ConversationListItem describes a single conversation entry within the sidebar list.
type ConversationListItem struct {
	ID        string
	Title     string
	UpdatedAt time.Time
	IsActive  bool
	IsHovered bool
}

// ConversationListPanel renders the collection of conversations and a new button.
type ConversationListPanel struct {
	width        int
	height       int
	items        []ConversationListItem
	showNew      bool
	showHoverNew bool
	hoverNew     bool
	zonePrefix   string
}

// NewConversationListPanel constructs a new conversation list panel.
func NewConversationListPanel() *ConversationListPanel {
	return &ConversationListPanel{zonePrefix: zone.NewPrefix()}
}

// SetSize configures the panel dimensions.
func (p *ConversationListPanel) SetSize(width, height int) {
	p.width = width
	p.height = height
}

// SetItems updates the conversation entries that will be displayed.
func (p *ConversationListPanel) SetItems(items []ConversationListItem) {
	p.items = items
}

// SetNewButtonState toggles the appearance of the "new conversation" button.
func (p *ConversationListPanel) SetNewButtonState(show bool, hover bool) {
	p.showNew = show
	p.hoverNew = hover
}

// View renders the panel.
func (p *ConversationListPanel) View() string {
	if p.width <= 0 || p.height <= 0 {
		return ""
	}

	if p.zonePrefix == "" {
		p.zonePrefix = zone.NewPrefix()
	}

	theme := styles.CurrentTheme()

	headStyle := lipgloss.NewStyle().
		Width(p.width).
		Foreground(theme.Primary).
		// Background(theme.SurfaceHigh).
		Bold(true).
		Padding(0, 1)

	itemBase := lipgloss.NewStyle().
		Width(p.width).
		Padding(0, 1)

	muted := lipgloss.NewStyle().
		Foreground(theme.Muted)

	rows := []string{headStyle.Render("Conversations")}

	for _, item := range p.items {
		title := item.Title
		if title == "" {
			title = "(untitled)"
		}

		timestamp := muted.Render(item.UpdatedAt.Format("15:04"))
		meta := lipgloss.JoinHorizontal(lipgloss.Left, title, lipgloss.NewStyle().Render("  "), timestamp)

		style := itemBase
		switch {
		case item.IsActive:
			style = style.
				// Background(theme.Primary).
				Foreground(theme.Background)
		case item.IsHovered:
			style = style.
				// Background(theme.SurfaceHigh).
				Foreground(theme.Foreground)
		default:
			style = style.Foreground(theme.Foreground)
		}

		zoneID := p.conversationZoneID(item.ID)
		rows = append(rows, zone.Mark(zoneID, style.Render(meta)))
	}

	if p.showNew {
		button := itemBase
		title := "➕ New conversation"
		if p.hoverNew {
			button = button.
				// Background(theme.Secondary).
				Foreground(theme.Background)
		} else {
			button = button.Foreground(theme.Secondary)
		}
		rows = append(rows, zone.Mark(p.newConversationZoneID(), button.Render(title)))
	}

	panel := lipgloss.JoinVertical(lipgloss.Left, rows...)
	return lipgloss.NewStyle().
		Width(p.width).
		Height(p.height).
		// Background(theme.Background).
		Render(panel)
}

func (p *ConversationListPanel) conversationZoneID(id string) string {
	return fmt.Sprintf("%sconversation_%s", p.zonePrefix, id)
}

// ConversationZoneID returns the zone identifier for a conversation entry.
func (p *ConversationListPanel) ConversationZoneID(id string) string {
	if p.zonePrefix == "" {
		p.zonePrefix = zone.NewPrefix()
	}
	return p.conversationZoneID(id)
}

func (p *ConversationListPanel) newConversationZoneID() string {
	return fmt.Sprintf("%snew_conversation", p.zonePrefix)
}

// NewConversationZoneID returns the zone identifier for the new conversation button.
func (p *ConversationListPanel) NewConversationZoneID() string {
	if p.zonePrefix == "" {
		p.zonePrefix = zone.NewPrefix()
	}
	return p.newConversationZoneID()
}

// DebugString returns a textual representation of the panel state (useful for logging).
func (p *ConversationListPanel) DebugString() string {
	return fmt.Sprintf("ConversationListPanel(width=%d,height=%d,items=%d)", p.width, p.height, len(p.items))
}

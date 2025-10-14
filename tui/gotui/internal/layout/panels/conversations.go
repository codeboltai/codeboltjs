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
	horizontal   bool
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

// SetHorizontalLayout toggles horizontal rendering mode.
func (p *ConversationListPanel) SetHorizontalLayout(horizontal bool) {
	p.horizontal = horizontal
}

// View renders the panel.
func (p *ConversationListPanel) View() string {
	if p.width <= 0 || p.height <= 0 {
		return ""
	}

	if p.zonePrefix == "" {
		p.zonePrefix = zone.NewPrefix()
	}

	if p.horizontal {
		return p.viewHorizontal()
	}
	return p.viewVertical()
}

func (p *ConversationListPanel) viewVertical() string {
	theme := styles.CurrentTheme()

	headStyle := lipgloss.NewStyle().
		Width(p.width).
		Foreground(theme.Primary).
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

		style := itemBase.Foreground(theme.Foreground)
		switch {
		case item.IsActive:
			style = style.
				Foreground(theme.Background).
				Background(theme.Primary)
		case item.IsHovered:
			style = style.Foreground(theme.Primary)
		}

		zoneID := p.conversationZoneID(item.ID)
		rows = append(rows, zone.Mark(zoneID, style.Render(meta)))
	}

	if p.showNew {
		button := itemBase.Foreground(theme.Secondary)
		title := "➕ New conversation"
		if p.hoverNew {
			button = button.
				Foreground(theme.Background).
				Background(theme.Secondary)
		}
		rows = append(rows, zone.Mark(p.newConversationZoneID(), button.Render(title)))
	}

	panel := lipgloss.JoinVertical(lipgloss.Left, rows...)
	return lipgloss.NewStyle().
		Width(p.width).
		Height(p.height).
		Render(panel)
}

func (p *ConversationListPanel) viewHorizontal() string {
	theme := styles.CurrentTheme()

	headStyle := lipgloss.NewStyle().
		Width(p.width).
		Foreground(theme.Primary).
		Bold(true).
		Padding(0, 1)

	chipBase := lipgloss.NewStyle().
		Padding(0, 1).
		MarginRight(1)

	var chips []string
	for _, item := range p.items {
		title := item.Title
		if title == "" {
			title = "(untitled)"
		}

		style := chipBase.Foreground(theme.Foreground)
		switch {
		case item.IsActive:
			style = style.
				Foreground(theme.Background).
				Background(theme.Primary)
		case item.IsHovered:
			style = style.Foreground(theme.Primary)
		default:
			style = style.Foreground(theme.Foreground)
		}

		chips = append(chips, zone.Mark(p.conversationZoneID(item.ID), style.Render(title)))
	}

	if p.showNew {
		label := "➕ New"
		style := chipBase.Foreground(theme.Secondary)
		if p.hoverNew {
			style = style.
				Foreground(theme.Background).
				Background(theme.Secondary)
		}
		chips = append(chips, zone.Mark(p.newConversationZoneID(), style.Render(label)))
	}

	bodyLines := p.wrapChips(chips)

	rows := []string{headStyle.Render("Conversations")}
	rows = append(rows, bodyLines...)

	if len(rows) < p.height {
		muted := lipgloss.NewStyle().Foreground(theme.Muted).Padding(0, 1)
		rows = append(rows, muted.Render("(use ←/→ to navigate)"))
	}

	panel := lipgloss.JoinVertical(lipgloss.Left, rows...)
	return lipgloss.NewStyle().
		Width(p.width).
		Height(p.height).
		Render(panel)
}

func (p *ConversationListPanel) wrapChips(chips []string) []string {
	if len(chips) == 0 {
		return []string{lipgloss.NewStyle().Width(p.width).Render("(none)")}
	}

	var rows []string
	var current []string
	currentWidth := 0

	for _, chip := range chips {
		chipWidth := lipgloss.Width(chip)
		if currentWidth > 0 && currentWidth+chipWidth > p.width {
			rows = append(rows, lipgloss.NewStyle().Width(p.width).Render(lipgloss.JoinHorizontal(lipgloss.Left, current...)))
			current = nil
			currentWidth = 0
		}

		current = append(current, chip)
		currentWidth += chipWidth
	}

	if len(current) > 0 {
		rows = append(rows, lipgloss.NewStyle().Width(p.width).Render(lipgloss.JoinHorizontal(lipgloss.Left, current...)))
	}

	return rows
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

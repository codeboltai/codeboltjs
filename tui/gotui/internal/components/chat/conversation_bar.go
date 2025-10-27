package chat

import "gotui/internal/layout/panels"

// ConversationBar wraps the conversation list panel and ensures horizontal layout.
type ConversationBar struct {
	panel  *panels.ConversationListPanel
	width  int
	height int
}

// NewConversationBar constructs a conversation bar with horizontal layout enabled.
func NewConversationBar() *ConversationBar {
	panel := panels.NewConversationListPanel()
	panel.SetHorizontalLayout(true)
	return &ConversationBar{panel: panel}
}

// SetSize configures the bar dimensions.
func (b *ConversationBar) SetSize(width, height int) {
	if b == nil {
		return
	}
	b.width = width
	b.height = height
	b.panel.SetHorizontalLayout(true)
	b.panel.SetSize(width, height)
}

// SetItems forwards conversation entries to the underlying panel.
func (b *ConversationBar) SetItems(items []panels.ConversationListItem) {
	if b == nil {
		return
	}
	b.panel.SetItems(items)
}

// SetNewButtonState toggles the new conversation button appearance.
func (b *ConversationBar) SetNewButtonState(show, hover bool) {
	if b == nil {
		return
	}
	b.panel.SetNewButtonState(show, hover)
}

// View renders the bar.
func (b *ConversationBar) View() string {
	if b == nil {
		return ""
	}
	b.panel.SetHorizontalLayout(true)
	b.panel.SetSize(b.width, b.height)
	return b.panel.View()
}

// ConversationZoneID exposes the zone identifier for a conversation.
func (b *ConversationBar) ConversationZoneID(id string) string {
	if b == nil {
		return ""
	}
	return b.panel.ConversationZoneID(id)
}

// NewConversationZoneID returns the zone identifier for the new conversation button.
func (b *ConversationBar) NewConversationZoneID() string {
	if b == nil {
		return ""
	}
	return b.panel.NewConversationZoneID()
}

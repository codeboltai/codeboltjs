package chat

import (
	"fmt"
	"strings"
	"time"

	"gotui/internal/components/chattemplates"
	"gotui/internal/styles"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"
	zone "github.com/lrstanley/bubblezone"
)

const subAgentSlotCount = 3

func (c *Chat) ensureSubAgentEntry(conversationID string) {
	if c == nil || conversationID == "" {
		return
	}
	if c.subAgentSelections == nil {
		c.subAgentSelections = make(map[string]int)
	}
	if c.subAgentMessages == nil {
		c.subAgentMessages = make(map[string]map[int][]chattemplates.MessageTemplateData)
	}
	if _, ok := c.subAgentSelections[conversationID]; !ok {
		c.subAgentSelections[conversationID] = 0
	}
	if _, ok := c.subAgentMessages[conversationID]; !ok {
		c.subAgentMessages[conversationID] = make(map[int][]chattemplates.MessageTemplateData)
	}
}

func (c *Chat) currentSubAgentIndex(conversationID string) int {
	if c == nil {
		return 0
	}
	idx, ok := c.subAgentSelections[conversationID]
	if !ok || idx < 0 || idx >= subAgentSlotCount {
		return 0
	}
	return idx
}

func (c *Chat) setCurrentSubAgentIndex(conversationID string, index int) {
	if c == nil || conversationID == "" {
		return
	}
	if index < 0 {
		index = 0
	}
	if index >= subAgentSlotCount {
		index = subAgentSlotCount - 1
	}
	c.ensureSubAgentEntry(conversationID)
	c.subAgentSelections[conversationID] = index
}

func (c *Chat) renderSubAgentBubbles(conversationID string, selected int) string {
	if c == nil {
		return ""
	}
	theme := styles.CurrentTheme()
	var segments []string
	for i := 0; i < subAgentSlotCount; i++ {
		style := lipgloss.NewStyle().Foreground(lipgloss.Color(theme.Muted.Hex()))
		if i == selected {
			style = style.Foreground(lipgloss.Color(theme.Primary.Hex())).Bold(true)
		} else {
			style = style.Faint(true)
		}
		zoneID := c.subAgentZoneID(conversationID, i)
		bubble := style.Render(fmt.Sprintf("%d", i))
		segments = append(segments, zone.Mark(zoneID, bubble))
	}

	joined := lipgloss.JoinHorizontal(lipgloss.Top, segments...)
	return lipgloss.NewStyle().Align(lipgloss.Right).Render(joined)
}

func (c *Chat) subAgentZoneID(conversationID string, index int) string {
	safeID := sanitizeZoneID(conversationID)
	return fmt.Sprintf("%swin_%s_agent_%d", c.zonePrefix, safeID, index)
}

func sanitizeZoneID(id string) string {
	if id == "" {
		return "empty"
	}
	return strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') {
			return r
		}
		return '_'
	}, id)
}

func (c *Chat) windowMessagesForAgent(conversationID string, agentIndex int, width int) []chattemplates.MessageTemplateData {
	if c == nil {
		return nil
	}
	if agentIndex == 0 {
		conv := c.getConversationByID(conversationID)
		if conv == nil {
			return nil
		}
		return cloneMessagesForWidth(conv.Messages, width)
	}
	c.ensureSubAgentEntry(conversationID)
	entries := c.subAgentMessages[conversationID]
	msgs := entries[agentIndex]
	if len(msgs) == 0 {
		placeholder := chattemplates.MessageTemplateData{
			Type:      "system",
			Content:   fmt.Sprintf("Subagent %d ready. Start chatting!", agentIndex),
			Timestamp: time.Now(),
			Raw:       false,
			Width:     width,
		}
		msgs = []chattemplates.MessageTemplateData{placeholder}
		entries[agentIndex] = msgs
	}
	return cloneMessagesForWidth(msgs, width)
}

func cloneMessagesForWidth(messages []chattemplates.MessageTemplateData, width int) []chattemplates.MessageTemplateData {
	if len(messages) == 0 {
		return nil
	}
	cloned := make([]chattemplates.MessageTemplateData, len(messages))
	for i, msg := range messages {
		clone := msg
		clone.Width = width
		if msg.Metadata != nil {
			dup := make(map[string]interface{}, len(msg.Metadata))
			for k, v := range msg.Metadata {
				dup[k] = v
			}
			clone.Metadata = dup
		}
		if len(msg.Buttons) > 0 {
			buttons := make([]chattemplates.MessageButton, len(msg.Buttons))
			copy(buttons, msg.Buttons)
			clone.Buttons = buttons
		}
		cloned[i] = clone
	}
	return cloned
}

func (c *Chat) syncSubAgentState() {
	if c == nil {
		return
	}
	existing := make(map[string]struct{}, len(c.conversations))
	for _, conv := range c.conversations {
		if conv == nil {
			continue
		}
		existing[conv.ID] = struct{}{}
		c.ensureSubAgentEntry(conv.ID)
	}
	for id := range c.subAgentSelections {
		if _, ok := existing[id]; !ok {
			delete(c.subAgentSelections, id)
			delete(c.subAgentMessages, id)
		}
	}
}

func (c *Chat) handleSubAgentBubbleClick(mouse tea.Mouse) bool {
	if c == nil {
		return false
	}
	if mouse.Button != tea.MouseLeft {
		return false
	}
	for _, conv := range c.conversations {
		if conv == nil {
			continue
		}
		for i := 0; i < subAgentSlotCount; i++ {
			zoneID := c.subAgentZoneID(conv.ID, i)
			if mouseInZone(mouse, zone.Get(zoneID)) {
				c.setCurrentSubAgentIndex(conv.ID, i)
				if c.windowManager != nil {
					c.windowManager.Focus(conv.ID)
				}
				return true
			}
		}
	}
	return false
}

func (c *Chat) activeSubAgentSelection() int {
	return c.currentSubAgentIndex(c.activeConversationID)
}

func (c *Chat) appendSubAgentMessage(conversationID string, agentIndex int, message chattemplates.MessageTemplateData) {
	c.ensureSubAgentEntry(conversationID)
	entries := c.subAgentMessages[conversationID]
	entries[agentIndex] = append(entries[agentIndex], message)
}

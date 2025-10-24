package chat

import (
	"strings"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"

	"gotui/internal/components/chat/windows"
	"gotui/internal/styles"
)

func (c *Chat) ToggleLayoutMode() bool {
	if c.windowManager == nil {
		return false
	}
	c.windowManager.SetSize(c.width, c.height)
	mode := c.windowManager.ToggleMode()
	if mode == windows.ModeWindow && c.windowManager.AutoTileEnabled() {
		if cmd := c.windowManager.RefreshAutoTile(true); cmd != nil {
			c.enqueueCmd(cmd)
		}
	}
	return mode == windows.ModeWindow
}

func (c *Chat) WindowModeActive() bool {
	return c.isWindowModeActive()
}

func (c *Chat) ToggleAutoTile() (bool, tea.Cmd) {
	if c.windowManager == nil || !c.isWindowModeActive() {
		if c.windowManager == nil {
			return false, nil
		}
		return c.windowManager.AutoTileEnabled(), nil
	}
	return c.windowManager.ToggleAutoTile()
}

func (c *Chat) isWindowModeActive() bool {
	return c.windowManager != nil && c.windowManager.IsWindowMode()
}

func (c *Chat) renderWindowMode() string {
	if c.windowManager == nil {
		return ""
	}

	sections := []string{}
	availableHeight := c.height

	if c.conversationBar != nil && c.conversationHeight > 0 {
		c.conversationBar.SetSize(c.width, c.conversationHeight)
		convo := c.renderConversationList()
		if strings.TrimSpace(convo) != "" {
			rendered := lipgloss.NewStyle().
				Width(c.width).
				Height(c.conversationHeight).
				Render(convo)
			sections = append(sections, rendered)
			availableHeight -= c.conversationHeight
			if availableHeight < 1 {
				availableHeight = 1
			}
			theme := styles.CurrentTheme()
			if availableHeight > 1 {
				sections = append(sections, horizontalSeparator(theme, c.width))
				availableHeight--
				if availableHeight < 1 {
					availableHeight = 1
				}
			}
		}
	}

	c.windowManager.SetSize(c.width, availableHeight)
	windowView := lipgloss.NewStyle().
		Width(c.width).
		Height(availableHeight).
		Render(c.windowManager.View())
	sections = append(sections, windowView)

	return lipgloss.JoinVertical(lipgloss.Left, sections...)
}

func (c *Chat) handleWindowModeMsg(msg tea.Msg) (tea.Cmd, bool) {
	if c.windowManager == nil || !c.windowManager.IsWindowMode() {
		return nil, false
	}

	switch ev := msg.(type) {
	case tea.MouseClickMsg:
		if c.handleSubAgentBubbleClick(ev.Mouse()) {
			return nil, true
		}
	}

	if cmd, handled := c.windowManager.HandleMessage(msg); handled {
		return cmd, true
	}

	switch ev := msg.(type) {
	case windows.ActivateConversationMsg:
		if ev.ConversationID != "" {
			_ = c.switchConversation(ev.ConversationID)
		}
		return nil, true
	}

	return nil, false
}

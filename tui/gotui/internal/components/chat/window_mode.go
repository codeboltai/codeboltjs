package chat

import (
	tea "github.com/charmbracelet/bubbletea/v2"

	"gotui/internal/components/chat/windows"
)

func (c *Chat) ToggleLayoutMode() bool {
	if c.windowManager == nil {
		return false
	}
	c.windowManager.SetSize(c.width, c.height)
	mode := c.windowManager.ToggleMode()
	return mode == windows.ModeWindow
}

func (c *Chat) isWindowModeActive() bool {
	return c.windowManager != nil && c.windowManager.IsWindowMode()
}

func (c *Chat) renderWindowMode() string {
	if c.windowManager == nil {
		return ""
	}
	return c.windowManager.View()
}

func (c *Chat) handleWindowModeMsg(msg tea.Msg) (tea.Cmd, bool) {
	if c.windowManager == nil || !c.windowManager.IsWindowMode() {
		return nil, false
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

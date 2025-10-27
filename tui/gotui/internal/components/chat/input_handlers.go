package chat

import (
	"strings"
	"unicode"

	"gotui/internal/components/chatcomponents"
	"gotui/internal/layout/panels"
	"gotui/internal/styles"

	tea "github.com/charmbracelet/bubbletea/v2"
	zone "github.com/lrstanley/bubblezone"
)

// Focus focuses the chat input.
func (c *Chat) Focus() tea.Cmd {
	c.focused = true
	c.hoverConversationID = ""
	c.hoverButton = false
	return c.input.Focus()
}

// FocusSidebar moves focus to the conversation list.
func (c *Chat) FocusSidebar() {
	c.focused = false
	c.hoverButton = false
	c.ensureHoverSelection()
	c.input.Blur()
}

// Blur blurs the chat input.
func (c *Chat) Blur() {
	c.focused = false
	c.input.Blur()
	c.slashMenu.Close()
}

// IsFocused reports whether the chat input is focused.
func (c *Chat) IsFocused() bool {
	return c.focused
}

// GetInput returns the current input value.
func (c *Chat) GetInput() string {
	return c.input.GetValue()
}

// ClearInput clears the current input value and closes the slash menu.
func (c *Chat) ClearInput() {
	c.input.Clear()
	c.slashMenu.Close()
}

func (c *Chat) refreshSlashMenu() {
	if !c.focused || c.modelPicker.IsVisible() || (c.agentPicker != nil && c.agentPicker.IsVisible()) || c.themePicker.IsVisible() || c.commandPalette.IsVisible() {
		c.slashMenu.Close()
		return
	}

	raw := c.input.RawValue()
	trimmed := strings.TrimLeftFunc(raw, unicode.IsSpace)
	if trimmed == "" || !strings.HasPrefix(trimmed, "/") {
		c.slashMenu.Close()
		return
	}

	fragment, remainder := parseCommandFragment(trimmed)
	if remainder != "" {
		c.slashMenu.Close()
		return
	}

	c.slashMenu.Open()
	c.slashMenu.SetFilter(fragment)
}

func (c *Chat) applySlashCommand(cmd chatcomponents.SlashCommand) tea.Cmd {
	raw := c.input.RawValue()
	trimmed := strings.TrimLeftFunc(raw, unicode.IsSpace)
	leading := raw[:len(raw)-len(trimmed)]
	rest := trimmed
	if strings.HasPrefix(rest, "/") {
		rest = rest[1:]
	}
	fragment, remainder := splitCommand(rest)
	remainder = strings.TrimLeftFunc(remainder, unicode.IsSpace)
	if remainder != "" {
		remainder = " " + remainder
	} else {
		remainder = " "
	}

	if cmd.Name == "models" {
		c.input.SetValueAndCursor("", 0)
		c.slashMenu.Close()
		c.commandPalette.Close()
		c.modelPicker.Open()
		return nil
	}

	if cmd.Name == "agents" {
		c.input.SetValueAndCursor("", 0)
		c.slashMenu.Close()
		c.commandPalette.Close()
		c.modelPicker.Close()
		if c.agentPicker != nil {
			c.agentPicker.Open()
		}
		return nil
	}

	if cmd.Name == "theme" {
		c.input.SetValueAndCursor("", 0)
		c.slashMenu.Close()
		c.commandPalette.Close()
		c.modelPicker.Close()
		if c.agentPicker != nil {
			c.agentPicker.Close()
		}
		c.themePicker.SetOptions(styles.PresetThemes())
		c.themePicker.Open(styles.CurrentThemeName())
		return nil
	}

	if cmd.Name == "settings" {
		c.input.SetValueAndCursor("", 0)
		c.slashMenu.Close()
		c.commandPalette.Close()
		c.modelPicker.Close()
		if c.agentPicker != nil {
			c.agentPicker.Close()
		}
		c.settingsDialog.Open()
		return nil
	}

	newValue := leading + "/" + cmd.Name + remainder
	cursor := runeLen(leading) + runeLen("/"+cmd.Name) + 1
	c.input.SetValueAndCursor(newValue, cursor)
	c.slashMenu.Close()
	_ = fragment
	return nil
}

// FocusChat returns focus to the main chat input.
func (c *Chat) FocusChat() {
	c.focused = true
	c.hoverButton = false
	c.hoverConversationID = ""
	_ = c.input.Focus()
}

func (c *Chat) ensureHoverSelection() {
	if c.conversationListWidth == 0 {
		c.hoverConversationID = ""
		c.hoverButton = false
		c.syncConversationPanelHover("")
		return
	}

	if len(c.conversations) == 0 {
		c.hoverConversationID = ""
		c.hoverButton = true
		c.syncConversationPanelHover("")
		return
	}

	if c.hoverButton {
		c.syncConversationPanelHover("")
		return
	}

	if c.hoverConversationID != "" {
		c.syncConversationPanelHover(c.hoverConversationID)
		return
	}

	if c.activeConversationID != "" {
		c.hoverConversationID = c.activeConversationID
		c.syncConversationPanelHover(c.hoverConversationID)
		return
	}

	c.hoverConversationID = c.conversations[0].ID
}

func (c *Chat) indexOfConversation(id string) int {
	for i, conv := range c.conversations {
		if conv.ID == id {
			return i
		}
	}
	return -1
}

func (c *Chat) moveHover(delta int) {
	if c.conversationListWidth == 0 {
		return
	}

	total := len(c.conversations)
	if total == 0 {
		c.hoverConversationID = ""
		c.hoverButton = true
		return
	}

	index := total
	if !c.hoverButton {
		index = c.indexOfConversation(c.hoverConversationID)
		if index < 0 {
			index = c.indexOfConversation(c.activeConversationID)
		}
		if index < 0 {
			index = 0
		}
	}

	if c.hoverButton {
		index = total
	}

	index += delta
	if index < 0 {
		index = 0
	}
	if index > total {
		index = total
	}

	if index == total {
		c.hoverButton = true
		c.hoverConversationID = ""
		c.syncConversationPanelHover("")
		return
	}

	c.hoverButton = false
	c.hoverConversationID = c.conversations[index].ID
	c.syncConversationPanelHover(c.hoverConversationID)
}

func (c *Chat) moveHoverToStart() {
	if len(c.conversations) == 0 {
		c.hoverConversationID = ""
		c.hoverButton = true
		c.syncConversationPanelHover("")
		return
	}

	c.hoverButton = false
	c.hoverConversationID = c.conversations[0].ID
	c.syncConversationPanelHover(c.hoverConversationID)
}

func (c *Chat) moveHoverToEnd() {
	c.hoverConversationID = ""
	c.hoverButton = true
	c.syncConversationPanelHover("")
}

func (c *Chat) renderConversationList() string {
	if c.conversationBar == nil {
		return ""
	}

	c.syncConversationPanelItems()
	c.ensureHoverSelection()
	return c.conversationBar.View()
}

func (c *Chat) syncConversationPanelItems() {
	if c.conversationBar == nil {
		return
	}

	store := c.ensureConversationStore()

	items := make([]panels.ConversationListItem, len(c.conversations))
	activeID := c.activeConversationID
	for i, conv := range c.conversations {
		items[i] = panels.ConversationListItem{
			ID:        conv.ID,
			Title:     conv.Title,
			UpdatedAt: conv.UpdatedAt,
			IsActive:  conv.ID == activeID,
			IsSyncing: store != nil && store.IsSyncing(conv.ID),
		}
	}

	c.conversationBar.SetItems(items)
	c.syncConversationPanelHover(c.hoverConversationID)
}

func (c *Chat) syncConversationPanelHover(conversationID string) {
	if c.conversationBar == nil {
		return
	}

	store := c.ensureConversationStore()

	hoverNew := c.hoverButton && conversationID == ""
	c.conversationBar.SetNewButtonState(true, hoverNew)

	items := make([]panels.ConversationListItem, len(c.conversations))
	for i, conv := range c.conversations {
		items[i] = panels.ConversationListItem{
			ID:        conv.ID,
			Title:     conv.Title,
			UpdatedAt: conv.UpdatedAt,
			IsActive:  conv.ID == c.activeConversationID,
			IsHovered: conv.ID == conversationID && !c.hoverButton,
			IsSyncing: store != nil && store.IsSyncing(conv.ID),
		}
	}
	c.conversationBar.SetItems(items)
}

func (c *Chat) handleSidebarKeys(msg tea.KeyPressMsg) bool {
	if c.conversationListWidth == 0 {
		return false
	}

	switch msg.String() {
	case "up", "k":
		c.moveHover(-1)
	case "down", "j":
		c.moveHover(1)
	case "pgup":
		c.moveHover(-3)
	case "pgdown":
		c.moveHover(3)
	case "home", "g":
		c.moveHoverToStart()
	case "end", "G":
		c.moveHoverToEnd()
	case "enter":
		if c.hoverButton {
			c.createNewConversation()
			return true
		}
		if c.hoverConversationID != "" {
			_ = c.switchConversation(c.hoverConversationID)
			return true
		}
	case "esc":
		c.FocusChat()
	default:
		return false
	}
	return true
}

// Update handles messages for the chat component.
func (c *Chat) Update(msg tea.Msg) (*Chat, tea.Cmd) {
	var cmd tea.Cmd
	var cmds []tea.Cmd
	refreshMenu := false
	skipChatViewport := false
	skipContextViewport := false

	if c.isWindowModeActive() {
		if windowCmd, handled := c.handleWindowModeMsg(msg); handled {
			return c, windowCmd
		}
	}

	switch msg := msg.(type) {
	case tea.MouseClickMsg:
		if clickCmd, handled := c.handleMouseClick(msg); handled {
			return c, clickCmd
		}
		if c.handleContextPanelClick(msg) {
			return c, nil
		}

	case tea.MouseWheelMsg:
		mouse := msg.Mouse()
		handled := false

		if c.contextDrawerVisible && c.contextHeight > 0 {
			if info := zone.Get(c.contextZoneID); mouseInZone(mouse, info) {
				var contextCmd tea.Cmd
				c.contextViewport, contextCmd = c.contextViewport.Update(msg)
				if contextCmd != nil {
					cmds = append(cmds, contextCmd)
				}
				skipContextViewport = true
				skipChatViewport = true
				handled = true
			}
		}

		if !handled {
			if info := zone.Get(c.chatZoneID); mouseInZone(mouse, info) {
				var viewportCmd tea.Cmd
				c.viewport, viewportCmd = c.viewport.Update(msg)
				if viewportCmd != nil {
					cmds = append(cmds, viewportCmd)
				}
				skipChatViewport = true
				skipContextViewport = true
				handled = true
			}
		}

		if !handled {
			var viewportCmd tea.Cmd
			c.viewport, viewportCmd = c.viewport.Update(msg)
			if viewportCmd != nil {
				cmds = append(cmds, viewportCmd)
			}
			skipChatViewport = true
			skipContextViewport = true
		}

	case tea.KeyPressMsg:
		if msg.String() == "tab" {
			if c.focused {
				c.FocusSidebar()
			} else {
				c.FocusChat()
			}
			return c, nil
		}

		if !c.focused {
			if c.handleSidebarKeys(msg) {
				return c, nil
			}

			switch msg.String() {
			case "shift+up":
				c.viewport.ScrollUp(1)
				return c, nil
			case "shift+down":
				c.viewport.ScrollDown(1)
				return c, nil
			case "shift+pgup":
				c.viewport.ScrollHalfPageUp()
				return c, nil
			case "shift+pgdown":
				c.viewport.ScrollHalfPageDown()
				return c, nil
			case "shift+home":
				c.viewport.GotoTop()
				return c, nil
			case "shift+end":
				c.viewport.GotoBottom()
				return c, nil
			}
		}
		if msg.String() == "ctrl+p" {
			if c.commandPalette.IsVisible() {
				c.commandPalette.Close()
			} else {
				c.commandPalette.Open()
			}
			return c, nil
		}

		if c.commandPalette.IsVisible() {
			handled, command, ok := c.commandPalette.HandleKey(msg)
			if handled {
				if ok {
					if cmd := c.applySlashCommand(command); cmd != nil {
						return c, cmd
					}
				}
				return c, nil
			}
		}

		if c.themePicker.IsVisible() {
			handled, preset, ok := c.themePicker.HandleKey(msg)
			if handled {
				if ok {
					return c, c.handleThemeSelection(preset)
				}
				return c, nil
			}
		}

		if c.settingsDialog.IsVisible() {
			handled, option, ok := c.settingsDialog.HandleKey(msg)
			if handled {
				if ok {
					switch option.Key {
					case "default_model":
						c.pendingPreference = preferenceTargetDefaultModel
						c.modelPicker.Open()
					case "default_agent":
						c.pendingPreference = preferenceTargetDefaultAgent
						if c.agentPicker != nil {
							c.agentPicker.Open()
						}
					}
				}
				if !ok {
					c.pendingPreference = preferenceTargetNone
				}
				return c, nil
			}
		}

		if c.agentPicker != nil && c.agentPicker.IsVisible() {
			handled, selection, applyDefault, ok := c.agentPicker.HandleKey(msg)
			if handled {
				if ok {
					if applyDefault || c.pendingPreference == preferenceTargetDefaultAgent {
						applyDefault = true
					}
					cmd := c.handleAgentSelection(selection, applyDefault)
					c.pendingPreference = preferenceTargetNone
					return c, cmd
				}
				return c, nil
			}
		}

		if c.modelPicker.IsVisible() {
			handled, selection, applyDefault, ok := c.modelPicker.HandleKey(msg)
			if handled {
				if ok {
					if applyDefault || c.pendingPreference == preferenceTargetDefaultModel {
						applyDefault = true
					}
					cmd := c.handleModelSelection(selection, applyDefault)
					c.pendingPreference = preferenceTargetNone
					return c, cmd
				}
				return c, nil
			}
		}

		refreshMenu = true
		if c.focused {
			if handled, selection, ok := c.slashMenu.HandleKey(msg); handled {
				if ok {
					if cmd := c.applySlashCommand(selection); cmd != nil {
						return c, cmd
					}
				}
				c.refreshSlashMenu()
				return c, nil
			}
		}
		if c.focused {
			switch msg.String() {
			case "ctrl+j":
				c.input.InsertRune('\n')
				return c, nil
			case "enter":
				input := c.GetInput()
				trimmed := strings.TrimSpace(input)
				if trimmed == "" {
					c.ClearInput()
					return c, nil
				}

				if strings.EqualFold(trimmed, "/models") {
					c.ClearInput()
					c.slashMenu.Close()
					c.commandPalette.Close()
					c.themePicker.Close()
					c.modelPicker.Open()
					return c, nil
				}

				if strings.EqualFold(trimmed, "/agents") {
					c.ClearInput()
					c.slashMenu.Close()
					c.commandPalette.Close()
					c.modelPicker.Close()
					c.themePicker.Close()
					if c.agentPicker != nil {
						c.agentPicker.Open()
					}
					return c, nil
				}

				if strings.EqualFold(trimmed, "/theme") {
					c.ClearInput()
					c.slashMenu.Close()
					c.commandPalette.Close()
					c.modelPicker.Close()
					c.themePicker.SetOptions(styles.PresetThemes())
					c.themePicker.Open(styles.CurrentThemeName())
					return c, nil
				}

				c.AddMessage("user", input)
				c.ClearInput()
				return c, tea.Cmd(func() tea.Msg {
					return SubmitMsg{Content: input}
				})
			}
		}
	}

	if !c.shouldSkipInputUpdate(msg) {
		c.input, cmd = c.input.Update(msg)
		cmds = append(cmds, cmd)
	}

	if refreshMenu {
		c.refreshSlashMenu()
	}

	for _, panel := range c.rightPanels {
		if panel == nil {
			continue
		}
		if panelCmd := panel.Update(msg); panelCmd != nil {
			cmds = append(cmds, panelCmd)
		}
	}

	if c.viewport != nil && !skipChatViewport {
		var viewportCmd tea.Cmd
		c.viewport, viewportCmd = c.viewport.Update(msg)
		if viewportCmd != nil {
			cmds = append(cmds, viewportCmd)
		}
	}

	if c.contextDrawerVisible && c.contextHeight > 0 && !skipContextViewport {
		var contextCmd tea.Cmd
		c.contextViewport, contextCmd = c.contextViewport.Update(msg)
		if contextCmd != nil {
			cmds = append(cmds, contextCmd)
		}
	}

	if pending := c.drainPendingCmds(); len(pending) > 0 {
		cmds = append(cmds, pending...)
	}
	return c, tea.Batch(cmds...)
}

func isKeyPress(msg tea.Msg) bool {
	_, ok := msg.(tea.KeyPressMsg)
	return ok
}

func (c *Chat) shouldSkipInputUpdate(msg tea.Msg) bool {
	if isKeyPress(msg) {
		if c.modelPicker.IsVisible() {
			return true
		}
		if c.agentPicker != nil && c.agentPicker.IsVisible() {
			return true
		}
	}
	if c.themePicker.IsVisible() && isKeyPress(msg) {
		return true
	}
	return isMouseEvent(msg)
}

func isMouseEvent(msg tea.Msg) bool {
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

func (c *Chat) handleMouseClick(msg tea.MouseClickMsg) (tea.Cmd, bool) {
	if c.conversationBar == nil || c.conversationHeight == 0 {
		return nil, false
	}

	mouse := msg.Mouse()
	if mouse.Button != tea.MouseLeft {
		return nil, false
	}

	if zoneID := c.conversationBar.NewConversationZoneID(); zoneID != "" {
		if mouseInZone(mouse, zone.Get(zoneID)) {
			return c.createNewConversation(), true
		}
	}

	for _, conv := range c.conversations {
		zoneID := c.conversationBar.ConversationZoneID(conv.ID)
		if zoneID == "" {
			continue
		}
		if mouseInZone(mouse, zone.Get(zoneID)) {
			_ = c.switchConversation(conv.ID)
			return nil, true
		}
	}

	return nil, false
}

func (c *Chat) handleContextPanelClick(msg tea.MouseClickMsg) bool {
	if !c.contextDrawerVisible || c.contextHeight <= 0 || len(c.rightPanels) == 0 {
		return false
	}

	m := msg.Mouse()
	if m.Button != tea.MouseLeft {
		return false
	}

	for _, panel := range c.rightPanels {
		if panel == nil {
			continue
		}
		zoneID := panel.TitleZoneID()
		if zoneID == "" {
			continue
		}
		if mouseInZone(m, zone.Get(zoneID)) {
			panel.ToggleCollapsed()
			c.SetSize(c.width, c.height)
			return true
		}
	}

	return false
}

func mouseInZone(mouse tea.Mouse, info *zone.ZoneInfo) bool {
	if info == nil || info.IsZero() {
		return false
	}

	if mouse.X < info.StartX || mouse.X > info.EndX {
		return false
	}
	if mouse.Y < info.StartY || mouse.Y > info.EndY {
		return false
	}
	return true
}

func parseCommandFragment(trimmed string) (fragment string, remainder string) {
	if !strings.HasPrefix(trimmed, "/") {
		return "", ""
	}
	rest := trimmed[1:]
	return splitCommand(rest)
}

func splitCommand(rest string) (fragment string, remainder string) {
	for i, r := range rest {
		if unicode.IsSpace(r) {
			return rest[:i], rest[i:]
		}
	}
	return rest, ""
}

func runeLen(s string) int {
	return len([]rune(s))
}

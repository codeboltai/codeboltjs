package chat

import (
	"fmt"

	"gotui/internal/components/chatcomponents"
	"gotui/internal/stores"
	"gotui/internal/styles"

	tea "github.com/charmbracelet/bubbletea/v2"
)

func (c *Chat) handleModelSelection(option chatcomponents.ModelOption, applyDefault bool) tea.Cmd {
	c.modelPicker.Close()
	c.commandPalette.Close()
	c.settingsDialog.Close()
	c.input.SetValueAndCursor("", 0)
	c.slashMenu.Close()
	opt := option
	c.selectedModel = &opt
	if store := c.ensureConversationStore(); store != nil {
		activeID := store.ActiveID()
		if activeID != "" {
			copy := stores.ModelOption(option)
			store.SetSelectedModel(activeID, &copy)
			stores.SharedConversationStateStore().SetSelectedModel(activeID, &copy)
		}
	}
	c.refreshConversationsFromStore(true)
	c.AddMessage("system", fmt.Sprintf("🤖 Model set to %s (%s)", option.Name, option.Provider))
	if applyDefault {
		copy := stores.ModelOption(option)
		stores.SharedApplicationSettingsStore().SetDefaultModel(&copy)
		c.AddMessage("system", fmt.Sprintf("📌 Default model updated to %s", option.Name))
	}
	c.pendingPreference = preferenceTargetNone
	return tea.Cmd(func() tea.Msg {
		return ModelSelectedMsg{Option: option}
	})
}

func (c *Chat) handleAgentSelection(option chatcomponents.AgentOption, applyDefault bool) tea.Cmd {
	if c.agentPicker != nil {
		c.agentPicker.Close()
	}
	c.commandPalette.Close()
	c.settingsDialog.Close()
	c.input.SetValueAndCursor("", 0)
	c.slashMenu.Close()
	selection := stores.AgentSelection{
		ID:           option.ID,
		Name:         option.Name,
		AgentType:    "",
		AgentDetails: option.Description,
	}
	c.selectedAgent = &selection
	if store := c.ensureConversationStore(); store != nil {
		activeID := store.ActiveID()
		if activeID != "" {
			copy := selection
			store.SetSelectedAgent(activeID, &copy)
			stores.SharedConversationStateStore().SetSelectedAgent(activeID, &copy)
		}
	}
	c.refreshConversationsFromStore(true)
	c.AddMessage("system", fmt.Sprintf("🧭 Agent set to %s", option.Name))
	if applyDefault {
		copy := selection
		stores.SharedApplicationSettingsStore().SetDefaultAgent(&copy)
		c.AddMessage("system", fmt.Sprintf("📌 Default agent updated to %s", option.Name))
	}
	c.pendingPreference = preferenceTargetNone
	return tea.Cmd(func() tea.Msg {
		return AgentSelectedMsg{Option: option}
	})
}

func (c *Chat) handleThemeSelection(preset styles.ThemePreset) tea.Cmd {
	c.themePicker.Close()
	c.commandPalette.Close()
	c.modelPicker.Close()
	c.slashMenu.Close()
	if !styles.SetThemeByName(preset.Name) {
		styles.SetTheme(preset.Theme)
	}
	c.AddMessage("system", fmt.Sprintf("🎨 Theme set to %s", preset.Name))
	return tea.Cmd(func() tea.Msg {
		return ThemeSelectedMsg{Preset: preset}
	})
}

// ToggleCommandPalette toggles the global command picker overlay.
func (c *Chat) ToggleCommandPalette() {
	if c.commandPalette == nil {
		return
	}
	if c.commandPalette.IsVisible() {
		c.commandPalette.Close()
		return
	}
	c.modelPicker.Close()
	if c.agentPicker != nil {
		c.agentPicker.Close()
	}
	c.slashMenu.Close()
	c.commandPalette.UpdateCommands(c.slashMenu.Commands())
	c.commandPalette.Open()
}

package help

import (
	"gotui/internal/styles"

	"github.com/charmbracelet/bubbles/v2/key"
)

// Help represents the help component
type Help struct {
	width   int
	height  int
	keyMap  KeyMap
	visible bool
}

// KeyMap defines the global key bindings
type KeyMap struct {
	Quit         key.Binding
	Retry        key.Binding
	ToggleStatus key.Binding
	ToggleLogs   key.Binding
	ToggleServer key.Binding
	ToggleAgent  key.Binding
	ToggleNotifs key.Binding
	ClearPanel   key.Binding
	NextPanel    key.Binding
	Help         key.Binding
}

// DefaultKeyMap returns the default key mappings
func DefaultKeyMap() KeyMap {
	return KeyMap{
		Quit: key.NewBinding(
			key.WithKeys("ctrl+q"),
			key.WithHelp("ctrl+q", "quit"),
		),
		Retry: key.NewBinding(
			key.WithKeys("ctrl+r"),
			key.WithHelp("ctrl+r", "retry connection"),
		),
		ToggleStatus: key.NewBinding(
			key.WithKeys("ctrl+s"),
			key.WithHelp("ctrl+s", "toggle status panel"),
		),
		ToggleLogs: key.NewBinding(
			key.WithKeys("ctrl+l"),
			key.WithHelp("ctrl+l", "toggle logs panel"),
		),
		ToggleServer: key.NewBinding(
			key.WithKeys("ctrl+v"),
			key.WithHelp("ctrl+v", "toggle server logs"),
		),
		ToggleAgent: key.NewBinding(
			key.WithKeys("ctrl+a"),
			key.WithHelp("ctrl+a", "toggle agent logs"),
		),
		ToggleNotifs: key.NewBinding(
			key.WithKeys("ctrl+n"),
			key.WithHelp("ctrl+n", "toggle notifications"),
		),
		ClearPanel: key.NewBinding(
			key.WithKeys("ctrl+c"),
			key.WithHelp("ctrl+c", "clear active panel"),
		),
		NextPanel: key.NewBinding(
			key.WithKeys("tab"),
			key.WithHelp("tab", "next panel"),
		),
		Help: key.NewBinding(
			key.WithKeys("?", "ctrl+h"),
			key.WithHelp("?", "toggle help"),
		),
	}
}

// New creates a new help component
func New() *Help {
	return &Help{
		keyMap:  DefaultKeyMap(),
		visible: true,
	}
}

// SetSize sets the help component dimensions
func (h *Help) SetSize(width, height int) {
	h.width = width
	h.height = height
}

// SetVisible sets the help visibility
func (h *Help) SetVisible(visible bool) {
	h.visible = visible
}

// IsVisible returns whether the help is visible
func (h *Help) IsVisible() bool {
	return h.visible
}

// KeyBindings returns all key bindings for help display
func (h *Help) KeyBindings() []key.Binding {
	return []key.Binding{
		h.keyMap.NextPanel,
		h.keyMap.Quit,
		h.keyMap.Retry,
		h.keyMap.ToggleStatus,
		h.keyMap.ToggleLogs,
		h.keyMap.ToggleServer,
		h.keyMap.ToggleAgent,
		h.keyMap.ToggleNotifs,
		h.keyMap.ClearPanel,
		h.keyMap.Help,
	}
}

// View renders the help component
func (h *Help) View() string {
	if !h.visible {
		return ""
	}

	s := styles.CurrentStyles()

	// Create help text
	helpItems := []string{
		"Tab: Switch panels",
		"Ctrl+Q: Quit",
		"Ctrl+R: Retry connection",
		"Ctrl+S: Toggle status",
		"Ctrl+L: Toggle logs",
		"Ctrl+V: Toggle server logs",
		"Ctrl+A: Toggle agent logs",
		"Ctrl+N: Toggle notifications",
		"Ctrl+C: Clear active panel",
		"?: Toggle help",
	}

	content := ""
	for i, item := range helpItems {
		if i > 0 {
			content += " | "
		}
		content += item
	}

	return s.Help.
		Width(h.width).
		Render(content)
}

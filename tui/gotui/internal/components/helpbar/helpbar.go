package helpbar

import (
	"regexp"
	"strings"

	"gotui/internal/styles"

	"github.com/charmbracelet/bubbles/v2/key"
	"github.com/charmbracelet/lipgloss/v2"
)

// HelpBar represents the help bar at the bottom of the screen
type HelpBar struct {
	width   int
	height  int
	keyMap  KeyMap
	visible bool
}

// KeyMap defines the key bindings for the application
type KeyMap struct {
	Submit       key.Binding
	Newline      key.Binding
	Quit         key.Binding
	Retry        key.Binding
	FocusChat    key.Binding
	ShowCommands key.Binding
	ScrollUp     key.Binding
	ScrollDown   key.Binding
	NextTab      key.Binding
	PrevTab      key.Binding
	TabChat      key.Binding
	TabLogs      key.Binding
	TabGit       key.Binding
	ToggleStatus key.Binding
	ToggleLogs   key.Binding
	ToggleServer key.Binding
	ToggleAgent  key.Binding
	ToggleNotifs key.Binding
	Help         key.Binding
}

// DefaultKeyMap returns the default key mappings
func DefaultKeyMap() KeyMap {
	return KeyMap{
		Submit: key.NewBinding(
			key.WithKeys("enter"),
			key.WithHelp("enter", "send message"),
		),
		Newline: key.NewBinding(
			key.WithKeys("ctrl+j"),
			key.WithHelp("ctrl+j", "new line"),
		),
		Quit: key.NewBinding(
			key.WithKeys("ctrl+c", "ctrl+q"),
			key.WithHelp("ctrl+c", "quit"),
		),
		Retry: key.NewBinding(
			key.WithKeys("ctrl+r"),
			key.WithHelp("ctrl+r", "retry connection"),
		),
		FocusChat: key.NewBinding(
			key.WithKeys("tab"),
			key.WithHelp("tab", "focus chat/scroll"),
		),
		ShowCommands: key.NewBinding(
			key.WithKeys("ctrl+k"),
			key.WithHelp("ctrl+k", "commands"),
		),
		NextTab: key.NewBinding(
			key.WithKeys("ctrl+]"),
			key.WithHelp("ctrl+]", "next tab"),
		),
		PrevTab: key.NewBinding(
			key.WithKeys("ctrl+["),
			key.WithHelp("ctrl+[", "prev tab"),
		),
		TabChat: key.NewBinding(
			key.WithKeys("ctrl+1", "shift+1"),
			key.WithHelp("ctrl+1/shift+1", "chat tab"),
		),
		TabLogs: key.NewBinding(
			key.WithKeys("ctrl+2", "shift+2"),
			key.WithHelp("ctrl+2/shift+2", "logs tab"),
		),
		TabGit: key.NewBinding(
			key.WithKeys("ctrl+3", "shift+3"),
			key.WithHelp("ctrl+3/shift+3", "git tab"),
		),
		ScrollUp: key.NewBinding(
			key.WithKeys("up", "k"),
			key.WithHelp("↑/k", "scroll up"),
		),
		ScrollDown: key.NewBinding(
			key.WithKeys("down", "j"),
			key.WithHelp("↓/j", "scroll down"),
		),
		ToggleStatus: key.NewBinding(
			key.WithKeys("ctrl+s"),
			key.WithHelp("ctrl+s", "toggle connection"),
		),
		ToggleLogs: key.NewBinding(
			key.WithKeys("ctrl+l"),
			key.WithHelp("ctrl+l", "toggle logs"),
		),
		ToggleServer: key.NewBinding(
			key.WithKeys("ctrl+v"),
			key.WithHelp("ctrl+v", "toggle server"),
		),
		ToggleAgent: key.NewBinding(
			key.WithKeys("ctrl+a"),
			key.WithHelp("ctrl+a", "toggle agent"),
		),
		ToggleNotifs: key.NewBinding(
			key.WithKeys("ctrl+n"),
			key.WithHelp("ctrl+n", "toggle notifications"),
		),
		Help: key.NewBinding(
			key.WithKeys("?", "ctrl+h"),
			key.WithHelp("?", "toggle help"),
		),
	}
}

// New creates a new help bar
func New() *HelpBar {
	return &HelpBar{
		keyMap:  DefaultKeyMap(),
		visible: true,
		height:  3,
	}
}

// SetSize sets the help bar dimensions
func (h *HelpBar) SetSize(width, height int) {
	h.width = width
	h.height = height
}

// SetVisible sets the help bar visibility
func (h *HelpBar) SetVisible(visible bool) {
	h.visible = visible
}

// IsVisible returns whether the help bar is visible
func (h *HelpBar) IsVisible() bool {
	return h.visible
}

// Toggle toggles the help bar visibility
func (h *HelpBar) Toggle() {
	h.visible = !h.visible
}

// KeyBindings returns all key bindings for help display
func (h *HelpBar) KeyBindings() []key.Binding {
	return []key.Binding{
		h.keyMap.Submit,
		h.keyMap.Newline,
		h.keyMap.FocusChat,
		h.keyMap.ShowCommands,
		h.keyMap.NextTab,
		h.keyMap.PrevTab,
		h.keyMap.TabChat,
		h.keyMap.TabLogs,
		h.keyMap.TabGit,
		h.keyMap.ScrollUp,
		h.keyMap.ScrollDown,
		h.keyMap.Retry,
		h.keyMap.ToggleStatus,
		h.keyMap.ToggleLogs,
		h.keyMap.ToggleServer,
		h.keyMap.ToggleAgent,
		h.keyMap.ToggleNotifs,
		h.keyMap.Help,
		h.keyMap.Quit,
	}
}

// View renders the help bar
func (h *HelpBar) View() string {
	if !h.visible {
		return ""
	}

	theme := styles.CurrentTheme()

	helpSections := [][]key.Binding{
		{h.keyMap.Submit, h.keyMap.Newline, h.keyMap.FocusChat, h.keyMap.ShowCommands},
		{h.keyMap.ScrollUp, h.keyMap.ScrollDown},
		{h.keyMap.NextTab, h.keyMap.PrevTab, h.keyMap.TabChat, h.keyMap.TabLogs, h.keyMap.TabGit},
		{h.keyMap.ToggleStatus, h.keyMap.ToggleLogs, h.keyMap.ToggleServer},
		{h.keyMap.ToggleAgent, h.keyMap.ToggleNotifs},
		{h.keyMap.Retry, h.keyMap.Help, h.keyMap.Quit},
	}

	var helpItems []string
	for _, section := range helpSections {
		var sectionItems []string
		for _, binding := range section {
			help := binding.Help()
			if help.Key == "" || help.Desc == "" {
				continue
			}
			item := lipgloss.JoinHorizontal(
				lipgloss.Center,
				lipgloss.NewStyle().Foreground(theme.Primary).Bold(true).Render(help.Key),
				lipgloss.NewStyle().Foreground(theme.Muted).Render(" "+help.Desc),
			)
			sectionItems = append(sectionItems, item)
		}
		if len(sectionItems) > 0 {
			helpItems = append(helpItems, lipgloss.JoinHorizontal(lipgloss.Center, sectionItems...))
		}
	}

	var finalItems []string
	for i, item := range helpItems {
		finalItems = append(finalItems, item)
		if i < len(helpItems)-1 {
			finalItems = append(finalItems, lipgloss.NewStyle().Foreground(theme.Border).Render(" • "))
		}
	}

	helpContent := lipgloss.JoinHorizontal(lipgloss.Center, finalItems...)

	if strings.TrimSpace(stripANSI(helpContent)) == "" {
		helpContent = defaultHelpContent(theme)
	}

	if lipgloss.Width(helpContent) > h.width-4 {
		helpContent = defaultHelpContent(theme)
	}

	width := h.width
	height := h.height
	if width <= 0 {
		width = 80
	}
	if height <= 0 {
		height = 3
	}

	return lipgloss.NewStyle().
		Width(width).
		Height(height).
		Foreground(theme.Foreground).
		Align(lipgloss.Center).
		Padding(0, 1).
		Render(helpContent)
}

var ansiEscapeCodes = regexp.MustCompile(`\x1b\[[0-9;]*m`)

func stripANSI(s string) string {
	return ansiEscapeCodes.ReplaceAllString(s, "")
}

func defaultHelpContent(theme styles.Theme) string {
	entries := []struct {
		key  string
		desc string
	}{
		{"enter", "send"},
		{"tab", "focus"},
		{"ctrl+c", "quit"},
		{"?", "help"},
	}

	var parts []string
	for i, entry := range entries {
		part := lipgloss.JoinHorizontal(lipgloss.Center,
			lipgloss.NewStyle().Foreground(theme.Primary).Bold(true).Render(entry.key),
			lipgloss.NewStyle().Foreground(theme.Muted).Render(" "+entry.desc),
		)
		parts = append(parts, part)
		if i < len(entries)-1 {
			parts = append(parts, lipgloss.NewStyle().Foreground(theme.Border).Render(" • "))
		}
	}

	return lipgloss.JoinHorizontal(lipgloss.Center, parts...)
}

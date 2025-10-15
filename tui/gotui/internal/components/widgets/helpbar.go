package widgets

import (
	"regexp"
	"strings"

	"gotui/internal/keybindings"
	"gotui/internal/styles"

	"github.com/charmbracelet/bubbles/v2/key"
	"github.com/charmbracelet/lipgloss/v2"
)

// HelpBar is a minimal footer that can be toggled on/off while retaining key bindings.
type HelpBar struct {
	width   int
	height  int
	keyMap  keybindings.KeyMap
	visible bool
}

// New creates a help bar with the default key map visible by default.
func New() *HelpBar {
	return &HelpBar{
		keyMap:  keybindings.DefaultKeyMap(),
		visible: true,
		height:  3,
	}
}

// SetSize records the desired width and height.
func (h *HelpBar) SetSize(width, height int) {
	h.width = width
	h.height = height
}

// SetVisible adjusts visibility.
func (h *HelpBar) SetVisible(visible bool) { h.visible = visible }

// IsVisible reports whether the bar is shown.
func (h *HelpBar) IsVisible() bool { return h.visible }

// Toggle flips visibility.
func (h *HelpBar) Toggle() { h.visible = !h.visible }

// KeyBindings exposes the stored key bindings for other components.
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

// VisibleHeight reports the current rendered height when the bar is visible.
func (h *HelpBar) VisibleHeight() int {
	if h == nil || !h.visible {
		return 0
	}
	if h.height <= 0 {
		return 3
	}
	return h.height
}

// View renders the help bar with a condensed list of key bindings.
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
		sectionView := renderBindingSection(section, theme)
		if strings.TrimSpace(sectionView) != "" {
			helpItems = append(helpItems, sectionView)
		}
	}

	helpContent := lipgloss.JoinHorizontal(lipgloss.Center, interleaveSeparator(helpItems, lipgloss.NewStyle().Foreground(theme.Border).Render(" • "))...)

	if strings.TrimSpace(stripANSI(helpContent)) == "" {
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

	if lipgloss.Width(helpContent) > width-4 {
		helpContent = defaultHelpContent(theme)
	}

	return lipgloss.NewStyle().
		Width(width).
		Height(height).
		Foreground(theme.Foreground).
		Align(lipgloss.Center).
		Padding(0, 1).
		Render(helpContent)
}

func renderBindingSection(bindings []key.Binding, theme styles.Theme) string {
	var sectionItems []string
	for _, binding := range bindings {
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
	return lipgloss.JoinHorizontal(lipgloss.Center, sectionItems...)
}

func interleaveSeparator(items []string, separator string) []string {
	if len(items) == 0 {
		return nil
	}
	result := make([]string, 0, len(items)*2-1)
	for i, item := range items {
		result = append(result, item)
		if i < len(items)-1 {
			result = append(result, separator)
		}
	}
	return result
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

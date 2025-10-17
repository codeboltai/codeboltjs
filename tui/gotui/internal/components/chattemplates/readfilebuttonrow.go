package chattemplates

import (
	"strings"

	"gotui/internal/styles"

	"github.com/charmbracelet/lipgloss/v2"
)

// renderButtonRow renders a row of buttons with consistent styling.
func renderButtonRow(width int, theme styles.Theme, buttons []MessageButton) []string {
	if len(buttons) == 0 {
		return nil
	}

	buttonStyle := lipgloss.NewStyle().Padding(0, 2).Border(lipgloss.RoundedBorder())
	descriptionStyle := lipgloss.NewStyle().Foreground(theme.Muted)
	gap := lipgloss.NewStyle().Render("  ")

	segments := make([]string, len(buttons))
	for i, btn := range buttons {
		style := buttonStyle
		label := btn.Label

		switch strings.ToLower(btn.ID) {
		case "approve", "allow":
			style = style.BorderForeground(theme.Success).Foreground(theme.Success)
		case "reject", "deny":
			style = style.BorderForeground(theme.Error).Foreground(theme.Error)
		case "always_allow", "always":
			style = style.BorderForeground(theme.Info).Foreground(theme.Info)
		default:
			style = style.BorderForeground(theme.Primary).Foreground(theme.Primary)
		}

		rendered := style.Bold(true).Render(label)
		if btn.Description != "" {
			desc := descriptionStyle.Render(btn.Description)
			rendered = lipgloss.JoinVertical(lipgloss.Left, rendered, desc)
		}

		segments[i] = rendered
	}

	rowSegments := make([]string, 0, len(segments)*2)
	for i, segment := range segments {
		if i > 0 {
			rowSegments = append(rowSegments, gap)
		}
		rowSegments = append(rowSegments, segment)
	}

	joined := lipgloss.JoinHorizontal(lipgloss.Left, rowSegments...)
	return []string{lipgloss.NewStyle().Width(width).Render(joined)}
}

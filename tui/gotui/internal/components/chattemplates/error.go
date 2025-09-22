package chattemplates

import (
	"gotui/internal/styles"

	"github.com/charmbracelet/lipgloss/v2"
)

// ErrorTemplate handles rendering of error messages
type ErrorTemplate struct {
	BaseTemplate
}

// NewErrorTemplate creates a new error message template
func NewErrorTemplate() *ErrorTemplate {
	return &ErrorTemplate{
		BaseTemplate: BaseTemplate{messageType: "error"},
	}
}

// Render renders an error message
func (et *ErrorTemplate) Render(data MessageTemplateData, theme styles.Theme) RenderedMessage {
	var lines []string

	// Create error-specific prefix
	prefixText := lipgloss.NewStyle().
		Foreground(theme.Error).
		Bold(true).
		Render("❌ Error")

	// Render header
	header := et.RenderHeader(prefixText, data.Timestamp, data.Width, theme)
	lines = append(lines, header)

	// Create error message style
	style := lipgloss.NewStyle().Foreground(theme.Error)

	// Render content
	contentLines := et.RenderContent(data.Content, style, data.Width, theme)
	lines = append(lines, contentLines...)

	// Add spacer
	spacer := et.AddSpacer(data.Width, theme)
	lines = append(lines, spacer)

	return RenderedMessage{Lines: lines}
}

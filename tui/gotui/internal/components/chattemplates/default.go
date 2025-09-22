package chattemplates

import (
	"gotui/internal/styles"

	"github.com/charmbracelet/lipgloss/v2"
)

// DefaultTemplate handles rendering of unknown/default message types
type DefaultTemplate struct {
	BaseTemplate
}

// NewDefaultTemplate creates a new default message template
func NewDefaultTemplate() *DefaultTemplate {
	return &DefaultTemplate{
		BaseTemplate: BaseTemplate{messageType: "default"},
	}
}

// Render renders a default message
func (dt *DefaultTemplate) Render(data MessageTemplateData, theme styles.Theme) RenderedMessage {
	var lines []string

	// Create default prefix
	prefixText := lipgloss.NewStyle().
		Foreground(theme.Muted).
		Render("•")

	// Render header
	header := dt.RenderHeader(prefixText, data.Timestamp, data.Width, theme)
	lines = append(lines, header)

	// Create default message style
	style := lipgloss.NewStyle().Foreground(theme.Foreground)

	// Render content
	contentLines := dt.RenderContent(data.Content, style, data.Width, theme)
	lines = append(lines, contentLines...)

	// Add spacer
	spacer := dt.AddSpacer(data.Width, theme)
	lines = append(lines, spacer)

	return RenderedMessage{Lines: lines}
}

package chattemplates

import (
	"gotui/internal/styles"

	"github.com/charmbracelet/lipgloss/v2"
)

// SystemTemplate handles rendering of system messages
type SystemTemplate struct {
	BaseTemplate
}

// NewSystemTemplate creates a new system message template
func NewSystemTemplate() *SystemTemplate {
	return &SystemTemplate{
		BaseTemplate: BaseTemplate{messageType: "system"},
	}
}

// Render renders a system message
func (st *SystemTemplate) Render(data MessageTemplateData, theme styles.Theme) RenderedMessage {
	var lines []string

	// Create system-specific prefix
	prefixText := lipgloss.NewStyle().
		Foreground(theme.Info).
		Bold(true).
		Render("ℹ System")

	// Render header
	header := st.RenderHeader(prefixText, data.Timestamp, data.Width, theme)
	lines = append(lines, header)

	// Create system message style
	style := lipgloss.NewStyle().Foreground(theme.Info)

	// Render content
	contentLines := st.RenderContent(data.Content, style, data.Width, theme)
	lines = append(lines, contentLines...)

	// Add spacer
	spacer := st.AddSpacer(data.Width, theme)
	lines = append(lines, spacer)

	return RenderedMessage{Lines: lines}
}

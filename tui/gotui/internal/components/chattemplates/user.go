package chattemplates

import (
	"gotui/internal/styles"

	"github.com/charmbracelet/lipgloss/v2"
)

// UserTemplate handles rendering of user messages
type UserTemplate struct {
	BaseTemplate
}

// NewUserTemplate creates a new user message template
func NewUserTemplate() *UserTemplate {
	return &UserTemplate{
		BaseTemplate: BaseTemplate{messageType: "user"},
	}
}

// Render renders a user message
func (ut *UserTemplate) Render(data MessageTemplateData, theme styles.Theme) RenderedMessage {
	var lines []string

	// Create user-specific prefix
	prefixText := lipgloss.NewStyle().
		Foreground(theme.Primary).
		Bold(true).
		Render("▶ You")

	// Render header
	header := ut.RenderHeader(prefixText, data.Timestamp, data.Width, theme)
	lines = append(lines, header)

	// Create user message style
	style := lipgloss.NewStyle().Foreground(theme.Foreground)

	// Render content
	contentLines := ut.RenderContent(data.Content, style, data.Width, theme)
	lines = append(lines, contentLines...)

	// Add spacer
	spacer := ut.AddSpacer(data.Width, theme)
	lines = append(lines, spacer)

	return RenderedMessage{Lines: lines}
}

package chattemplates

import (
	"gotui/internal/markdown"
	"gotui/internal/styles"

	"github.com/charmbracelet/lipgloss/v2"
)

// AITemplate handles rendering of AI messages
type AITemplate struct {
	BaseTemplate
}

// NewAITemplate creates a new AI message template
func NewAITemplate() *AITemplate {
	return &AITemplate{
		BaseTemplate: BaseTemplate{messageType: "ai"},
	}
}

// Render renders an AI message
func (at *AITemplate) Render(data MessageTemplateData, theme styles.Theme) RenderedMessage {
	var lines []string

	// Create AI-specific prefix
	prefixText := lipgloss.NewStyle().
		Foreground(theme.Secondary).
		Bold(true).
		Render("🤖 AI")

	// Render header
	header := at.RenderHeader(prefixText, data.Timestamp, data.Width, theme)
	lines = append(lines, header)

	// Process content - try to render as markdown for AI responses
	content := data.Content
	if !data.Raw && markdown.IsMarkdown(content) {
		if renderer, err := markdown.New(data.Width - 4); err == nil {
			if rendered, err := renderer.Render(content); err == nil {
				content = rendered
			}
		}
	}

	// Create AI message style
	style := lipgloss.NewStyle().Foreground(theme.Foreground)

	// Render content
	contentLines := at.RenderContent(content, style, data.Width, theme)
	lines = append(lines, contentLines...)

	// Add spacer
	spacer := at.AddSpacer(data.Width, theme)
	lines = append(lines, spacer)

	return RenderedMessage{Lines: lines}
}

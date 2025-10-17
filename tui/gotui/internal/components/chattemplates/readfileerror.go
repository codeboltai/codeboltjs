package chattemplates

import (
	"fmt"

	"gotui/internal/styles"

	"github.com/charmbracelet/lipgloss/v2"
)

// ReadFileErrorTemplate renders error states for file read operations.
type ReadFileErrorTemplate struct {
	BaseTemplate
}

// NewReadFileErrorTemplate creates the template instance.
func NewReadFileErrorTemplate() *ReadFileErrorTemplate {
	return &ReadFileErrorTemplate{
		BaseTemplate: BaseTemplate{messageType: "read_file_error"},
	}
}

// Render outputs the error view for a failed file read.
func (rfet *ReadFileErrorTemplate) Render(data MessageTemplateData, theme styles.Theme) RenderedMessage {
	width := maxInt(40, data.Width)
	filePath := "unknown file"
	errorText := data.Content

	if data.Metadata != nil {
		if path, ok := stringFromAny(data.Metadata["file_path"]); ok {
			filePath = path
		}
	}

	prefix := lipgloss.NewStyle().Foreground(theme.Error).Bold(true).Render("❌ File Read Failed")
	header := rfet.RenderHeader(prefix, data.Timestamp, width, theme)

	infoStyle := lipgloss.NewStyle().Foreground(theme.Muted).Italic(true)
	fileLine := lipgloss.NewStyle().Width(width).Render(infoStyle.Render(fmt.Sprintf("  📁 %s", filePath)))

	spacer := rfet.AddSpacer(width, theme)
	body := []string{header, fileLine, spacer}

	if errorText != "" {
		contentStyle := lipgloss.NewStyle().Foreground(theme.Error)
		body = append(body, rfet.RenderContent(errorText, contentStyle, width, theme)...)
	}

	body = append(body, rfet.AddSpacer(width, theme))

	return RenderedMessage{Lines: body}
}

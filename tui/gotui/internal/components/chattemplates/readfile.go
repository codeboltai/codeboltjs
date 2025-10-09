package chattemplates

import (
	"fmt"
	"gotui/internal/styles"
	"strings"

	"github.com/charmbracelet/lipgloss/v2"
)

// ReadFileTemplate handles rendering of file read operations
type ReadFileTemplate struct {
	BaseTemplate
}

// NewReadFileTemplate creates a new read file message template
func NewReadFileTemplate() *ReadFileTemplate {
	return &ReadFileTemplate{
		BaseTemplate: BaseTemplate{messageType: "read_file"},
	}
}

// Render renders a file read message
func (rft *ReadFileTemplate) Render(data MessageTemplateData, theme styles.Theme) RenderedMessage {
	var lines []string

	// Extract file path from metadata
	filePath := "unknown file"
	if data.Metadata != nil {
		if path, ok := data.Metadata["file_path"].(string); ok {
			filePath = path
		}
	}

	// Create read file-specific prefix
	prefixText := lipgloss.NewStyle().
		Foreground(theme.Info).
		Bold(true).
		Render("📖 Read")

	// Render header
	header := rft.RenderHeader(prefixText, data.Timestamp, data.Width, theme)
	lines = append(lines, header)

	// Add file info line
	fileInfoStyle := lipgloss.NewStyle().
		Foreground(theme.Muted).
		Italic(true)

	fileInfo := fileInfoStyle.Render(fmt.Sprintf("  📁 %s", filePath))
	fileInfoFilled := lipgloss.NewStyle().
		Background(theme.Background).
		Width(data.Width).
		Render(fileInfo)
	lines = append(lines, fileInfoFilled)

	// Add spacer
	spacer := lipgloss.NewStyle().
		Background(theme.Background).
		Width(data.Width).
		Render(" ")
	lines = append(lines, spacer)

	// Render file content as code block
	if strings.TrimSpace(data.Content) != "" {
		contentLines := rft.RenderCodeBlock(data.Content, "", data.Width, theme)
		lines = append(lines, contentLines...)
	} else {
		// Empty file message
		emptyStyle := lipgloss.NewStyle().
			Foreground(theme.Muted).
			Italic(true)
		emptyMsg := emptyStyle.Render("  (empty file)")
		emptyFilled := lipgloss.NewStyle().
			Background(theme.Background).
			Width(data.Width).
			Render(emptyMsg)
		lines = append(lines, emptyFilled)
	}

	// Add final spacer
	finalSpacer := rft.AddSpacer(data.Width, theme)
	lines = append(lines, finalSpacer)

	return RenderedMessage{Lines: lines}
}

package chattemplates

import (
	"fmt"
	"gotui/internal/styles"
	"strings"

	"github.com/charmbracelet/lipgloss/v2"
)

// WriteFileTemplate handles rendering of file write operations
type WriteFileTemplate struct {
	BaseTemplate
}

// NewWriteFileTemplate creates a new write file message template
func NewWriteFileTemplate() *WriteFileTemplate {
	return &WriteFileTemplate{
		BaseTemplate: BaseTemplate{messageType: "write_file"},
	}
}

// Render renders a file write message
func (wft *WriteFileTemplate) Render(data MessageTemplateData, theme styles.Theme) RenderedMessage {
	var lines []string

	// Extract file path and operation type from metadata
	filePath := "unknown file"
	operation := "write"
	if data.Metadata != nil {
		if path, ok := data.Metadata["file_path"].(string); ok {
			filePath = path
		}
		if op, ok := data.Metadata["operation"].(string); ok {
			operation = op
		}
	}

	// Create write file-specific prefix with operation-specific icon
	var icon string
	switch operation {
	case "create":
		icon = "📝 Create"
	case "append":
		icon = "➕ Append"
	case "overwrite":
		icon = "✏️ Overwrite"
	default:
		icon = "📝 Write"
	}

	prefixText := lipgloss.NewStyle().
		Foreground(theme.Success).
		Bold(true).
		Render(icon)

	// Render header
	header := wft.RenderHeader(prefixText, data.Timestamp, data.Width, theme)
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

	// Render file content as code block if present
	if strings.TrimSpace(data.Content) != "" {
		contentLines := wft.RenderCodeBlock(data.Content, "", data.Width, theme)
		lines = append(lines, contentLines...)
	} else {
		// Empty content message
		emptyStyle := lipgloss.NewStyle().
			Foreground(theme.Muted).
			Italic(true)
		emptyMsg := emptyStyle.Render("  (no content written)")
		emptyFilled := lipgloss.NewStyle().
			Background(theme.Background).
			Width(data.Width).
			Render(emptyMsg)
		lines = append(lines, emptyFilled)
	}

	// Add final spacer
	finalSpacer := wft.AddSpacer(data.Width, theme)
	lines = append(lines, finalSpacer)

	return RenderedMessage{Lines: lines}
}

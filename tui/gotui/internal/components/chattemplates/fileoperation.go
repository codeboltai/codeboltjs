package chattemplates

import (
	"fmt"
	"gotui/internal/styles"

	"github.com/lucasb-eyer/go-colorful"

	"github.com/charmbracelet/lipgloss/v2"
)

// FileOperationTemplate handles rendering of general file operations (delete, move, etc.)
type FileOperationTemplate struct {
	BaseTemplate
}

// NewFileOperationTemplate creates a new file operation message template
func NewFileOperationTemplate() *FileOperationTemplate {
	return &FileOperationTemplate{
		BaseTemplate: BaseTemplate{messageType: "file_operation"},
	}
}

// Render renders a file operation message
func (fot *FileOperationTemplate) Render(data MessageTemplateData, theme styles.Theme) RenderedMessage {
	var lines []string

	// Extract operation details from metadata
	operation := "operation"
	filePath := "unknown file"
	targetPath := ""
	success := true

	if data.Metadata != nil {
		if op, ok := data.Metadata["operation"].(string); ok {
			operation = op
		}
		if path, ok := data.Metadata["file_path"].(string); ok {
			filePath = path
		}
		if target, ok := data.Metadata["target_path"].(string); ok {
			targetPath = target
		}
		if succ, ok := data.Metadata["success"].(bool); ok {
			success = succ
		}
	}

	// Create operation-specific prefix and styling
	var icon string
	var color colorful.Color
	switch operation {
	case "delete":
		icon = "🗑️ Delete"
		color = theme.Error
	case "move":
		icon = "📦 Move"
		color = theme.Warning
	case "copy":
		icon = "📋 Copy"
		color = theme.Info
	case "rename":
		icon = "✏️ Rename"
		color = theme.Warning
	case "mkdir":
		icon = "📁 Create Dir"
		color = theme.Success
	default:
		icon = "🔧 File Op"
		color = theme.Info
	}

	if !success {
		icon = "❌ " + icon
		color = theme.Error
	}

	prefixText := lipgloss.NewStyle().
		Foreground(color).
		Bold(true).
		Render(icon)

	// Render header
	header := fot.RenderHeader(prefixText, data.Timestamp, data.Width, theme)
	lines = append(lines, header)

	// Add file info line
	fileInfoStyle := lipgloss.NewStyle().
		Foreground(theme.Muted).
		Italic(true)

	var fileInfo string
	if targetPath != "" {
		fileInfo = fmt.Sprintf("  📁 %s → %s", filePath, targetPath)
	} else {
		fileInfo = fmt.Sprintf("  📁 %s", filePath)
	}

	fileInfoStyled := fileInfoStyle.Render(fileInfo)
	fileInfoFilled := lipgloss.NewStyle().
		// Background(theme.Background).
		Width(data.Width).
		Render(fileInfoStyled)
	lines = append(lines, fileInfoFilled)

	// Add content if present (usually for error messages or additional info)
	if data.Content != "" {
		// Add spacer
		spacer := lipgloss.NewStyle().
			// Background(theme.Background).
			Width(data.Width).
			Render(" ")
		lines = append(lines, spacer)

		// Render content with appropriate styling
		var contentStyle lipgloss.Style
		if !success {
			contentStyle = lipgloss.NewStyle().Foreground(theme.Error)
		} else {
			contentStyle = lipgloss.NewStyle().Foreground(theme.Foreground)
		}

		contentLines := fot.RenderContent(data.Content, contentStyle, data.Width, theme)
		lines = append(lines, contentLines...)
	}

	// Add final spacer
	finalSpacer := fot.AddSpacer(data.Width, theme)
	lines = append(lines, finalSpacer)

	return RenderedMessage{Lines: lines}
}

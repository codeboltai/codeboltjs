package chattemplates

import (
	"fmt"
	"gotui/internal/styles"
	"strings"

	"github.com/lucasb-eyer/go-colorful"

	"github.com/charmbracelet/lipgloss/v2"
)

// ToolExecutionTemplate handles rendering of tool execution messages
type ToolExecutionTemplate struct {
	BaseTemplate
}

// NewToolExecutionTemplate creates a new tool execution message template
func NewToolExecutionTemplate() *ToolExecutionTemplate {
	return &ToolExecutionTemplate{
		BaseTemplate: BaseTemplate{messageType: "tool_execution"},
	}
}

// Render renders a tool execution message
func (tet *ToolExecutionTemplate) Render(data MessageTemplateData, theme styles.Theme) RenderedMessage {
	var lines []string

	// Extract tool details from metadata
	toolName := "tool"
	command := ""
	status := "running" // running, success, error
	output := ""

	if data.Metadata != nil {
		if name, ok := data.Metadata["tool_name"].(string); ok {
			toolName = name
		}
		if cmd, ok := data.Metadata["command"].(string); ok {
			command = cmd
		}
		if st, ok := data.Metadata["status"].(string); ok {
			status = st
		}
		if out, ok := data.Metadata["output"].(string); ok {
			output = out
		}
	}

	// Create tool-specific prefix and styling
	var icon string
	var color colorful.Color
	switch status {
	case "success":
		icon = "✅"
		color = theme.Success
	case "error":
		icon = "❌"
		color = theme.Error
	case "running":
		icon = "⚡"
		color = theme.Info
	default:
		icon = "🔧"
		color = theme.Muted
	}

	prefixText := lipgloss.NewStyle().
		Foreground(color).
		Bold(true).
		Render(fmt.Sprintf("%s %s", icon, toolName))

	// Render header
	header := tet.RenderHeader(prefixText, data.Timestamp, data.Width, theme)
	lines = append(lines, header)

	// Add command if present
	if command != "" {
		commandStyle := lipgloss.NewStyle().
			Foreground(theme.Muted).
			Italic(true)

		commandLine := commandStyle.Render(fmt.Sprintf("  $ %s", command))
		commandFilled := lipgloss.NewStyle().
			// Background(theme.Background).
			Width(data.Width).
			Render(commandLine)
		lines = append(lines, commandFilled)

		// Add spacer
		spacer := lipgloss.NewStyle().
			// Background(theme.Background).
			Width(data.Width).
			Render(" ")
		lines = append(lines, spacer)
	}

	// Add output if present
	if output != "" {
		// Render output as code block if it looks like command output
		if strings.Contains(output, "\n") || len(output) > 80 {
			outputLines := tet.RenderCodeBlock(output, "", data.Width, theme)
			lines = append(lines, outputLines...)
		} else {
			// Render as regular content for short output
			var outputStyle lipgloss.Style
			if status == "error" {
				outputStyle = lipgloss.NewStyle().Foreground(theme.Error)
			} else {
				outputStyle = lipgloss.NewStyle().Foreground(theme.Foreground)
			}

			outputLines := tet.RenderContent(output, outputStyle, data.Width, theme)
			lines = append(lines, outputLines...)
		}
	}

	// Add content if present (additional context)
	if data.Content != "" {
		// Add spacer if we already have output
		if output != "" {
			spacer := lipgloss.NewStyle().
				Background(theme.Background).
				Width(data.Width).
				Render(" ")
			lines = append(lines, spacer)
		}

		contentStyle := lipgloss.NewStyle().Foreground(theme.Foreground)
		contentLines := tet.RenderContent(data.Content, contentStyle, data.Width, theme)
		lines = append(lines, contentLines...)
	}

	// Add final spacer
	finalSpacer := tet.AddSpacer(data.Width, theme)
	lines = append(lines, finalSpacer)

	return RenderedMessage{Lines: lines}
}

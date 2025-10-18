package chattemplates

import (
	"fmt"
	"strings"

	"gotui/internal/styles"

	"github.com/charmbracelet/lipgloss/v2"
)

// ReadFileConfirmationTemplate renders confirmation prompts for file read operations.
type ReadFileConfirmationTemplate struct {
	BaseTemplate
}

// NewReadFileConfirmationTemplate creates the template instance.
func NewReadFileConfirmationTemplate() *ReadFileConfirmationTemplate {
	return &ReadFileConfirmationTemplate{
		BaseTemplate: BaseTemplate{messageType: "read_file_confirmation"},
	}
}

// Render outputs the confirmation view with available actions.
func (rfct *ReadFileConfirmationTemplate) Render(data MessageTemplateData, theme styles.Theme) RenderedMessage {
	width := maxInt(40, data.Width)
	filePath := "unknown file"
    content := data.Content
    stateEvent := "ASK_FOR_CONFIRMATION"
    buttons := data.Buttons

	if data.Metadata != nil {
		if path, ok := stringFromAny(data.Metadata["file_path"]); ok {
			filePath = path
		}
		if state, ok := stringFromAny(data.Metadata["state_event"]); ok {
			stateEvent = state
		}
        if strings.TrimSpace(content) == "" {
            if preview, ok := stringFromAny(data.Metadata["content"]); ok {
                content = preview
            }
        }
	}

	prefix := lipgloss.NewStyle().Foreground(theme.Warning).Bold(true).Render("📝 Read File Request")
	header := rfct.RenderHeader(prefix, data.Timestamp, width, theme)

	infoStyle := lipgloss.NewStyle().Foreground(theme.Muted).Italic(true)
	fileLine := lipgloss.NewStyle().Width(width).Render(infoStyle.Render(fmt.Sprintf("  📁 %s", filePath)))
	stateLine := lipgloss.NewStyle().Width(width).Render(infoStyle.Render(fmt.Sprintf("  State: %s", stateEvent)))

	spacer := rfct.AddSpacer(width, theme)

	body := []string{header, fileLine, stateLine}

    if len(buttons) == 0 {
        buttons = []MessageButton{
            {ID: "approve", Label: "Approve", Description: "Allow this read"},
            {ID: "always_allow", Label: "Always allow", Description: "Skip future prompts"},
            {ID: "reject", Label: "Reject", Description: "Deny this request"},
        }
    }

    if strings.TrimSpace(content) != "" {
		body = append(body, spacer)
		previewHeader := lipgloss.NewStyle().Foreground(theme.Info).Bold(true).Render("  Preview")
		body = append(body, lipgloss.NewStyle().Width(width).Render(previewHeader))
		body = append(body, rfct.RenderCodeBlock(content, "", width, theme)...)
	}

    if len(buttons) > 0 {
		body = append(body, spacer)
        body = append(body, renderButtonRow(width, theme, buttons)...)
	}

	body = append(body, rfct.AddSpacer(width, theme))
	return RenderedMessage{Lines: body}
}

func renderButtonRow(width int, theme styles.Theme, buttons []MessageButton) []string {
	if len(buttons) == 0 {
		return nil
	}

	buttonStyle := lipgloss.NewStyle().Padding(0, 2).Border(lipgloss.RoundedBorder()).Bold(true)
	descriptionStyle := lipgloss.NewStyle().Foreground(theme.Muted)
	gap := lipgloss.NewStyle().Render("  ")

	segments := make([]string, len(buttons))
	for i, btn := range buttons {
		style := buttonStyle
		switch strings.ToLower(btn.ID) {
		case "approve", "allow":
			style = style.BorderForeground(theme.Success).Foreground(theme.Success)
		case "reject", "deny":
			style = style.BorderForeground(theme.Error).Foreground(theme.Error)
		case "always_allow", "always":
			style = style.BorderForeground(theme.Info).Foreground(theme.Info)
		default:
			style = style.BorderForeground(theme.Primary).Foreground(theme.Primary)
		}

		label := style.Render(btn.Label)
		if btn.Description != "" {
			desc := descriptionStyle.Render(btn.Description)
			label = lipgloss.JoinVertical(lipgloss.Left, label, desc)
		}
		segments[i] = label
	}

	rowSegments := make([]string, 0, len(segments)*2)
	for i, segment := range segments {
		if i > 0 {
			rowSegments = append(rowSegments, gap)
		}
		rowSegments = append(rowSegments, segment)
	}

	joined := lipgloss.JoinHorizontal(lipgloss.Left, rowSegments...)
	return []string{lipgloss.NewStyle().Width(width).Render(joined)}
}

func stringFromAny(value interface{}) (string, bool) {
	switch v := value.(type) {
	case string:
		return v, true
	case fmt.Stringer:
		return v.String(), true
	default:
		return "", false
	}
}

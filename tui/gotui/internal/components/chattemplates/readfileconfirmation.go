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

	if data.Metadata != nil {
		if path, ok := stringFromAny(data.Metadata["file_path"]); ok {
			filePath = path
		}
		if state, ok := stringFromAny(data.Metadata["state_event"]); ok {
			stateEvent = state
		}
	}

	prefix := lipgloss.NewStyle().Foreground(theme.Warning).Bold(true).Render("📝 Read File Request")
	header := rfct.RenderHeader(prefix, data.Timestamp, width, theme)

	infoStyle := lipgloss.NewStyle().Foreground(theme.Muted).Italic(true)
	fileLine := lipgloss.NewStyle().Width(width).Render(infoStyle.Render(fmt.Sprintf("  📁 %s", filePath)))
	stateLine := lipgloss.NewStyle().Width(width).Render(infoStyle.Render(fmt.Sprintf("  State: %s", stateEvent)))

	spacer := rfct.AddSpacer(width, theme)

	var body []string
	body = append(body, header, fileLine, stateLine)

	if content != "" {
		body = append(body, spacer)
		previewHeader := lipgloss.NewStyle().Foreground(theme.Info).Bold(true).Render("  Preview")
		body = append(body, lipgloss.NewStyle().Width(width).Render(previewHeader))
		body = append(body, rfct.RenderCodeBlock(content, "", width, theme)...)
	}

if len(data.Buttons) > 0 {
	body = append(body, spacer)
	body = append(body, renderButtonRow(width, theme, data.Buttons)...)
}

body = append(body, rfct.AddSpacer(width, theme))
return RenderedMessage{Lines: body}
}

func (rfct *ReadFileConfirmationTemplate) renderButtons(buttons []MessageButton, width int, theme styles.Theme) []string {
	if len(buttons) == 0 {
		return nil
	}

	buttonStyle := lipgloss.NewStyle().Bold(true).Padding(0, 2).Border(lipgloss.RoundedBorder())
	descriptionStyle := lipgloss.NewStyle().Foreground(theme.Muted)
	gap := lipgloss.NewStyle().Render("  ")
	rowWidth := width

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

    row := make([]string, 0, len(segments)*2)
    for i, segment := range segments {
        if i > 0 {
            row = append(row, gap)
        }
        row = append(row, segment)
    }

    joined := lipgloss.JoinHorizontal(lipgloss.Left, row...)

    return []string{lipgloss.NewStyle().Width(rowWidth).Render(joined)}
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

package chattemplates

import (
	"fmt"
	"strings"

	"gotui/internal/styles"

	"github.com/charmbracelet/lipgloss/v2"
)

// ReadFileTemplate handles rendering of file read operations across states.
type ReadFileTemplate struct {
	BaseTemplate
	confirmation  *ReadFileConfirmationTemplate
	errorTemplate *ReadFileErrorTemplate
}

// NewReadFileTemplate creates a new read file message template.
func NewReadFileTemplate() *ReadFileTemplate {
	return &ReadFileTemplate{
		BaseTemplate: BaseTemplate{messageType: "read_file"},
	}
}

// Render renders a file read message based on its state.
func (rft *ReadFileTemplate) Render(data MessageTemplateData, theme styles.Theme) RenderedMessage {
	state := "FILE_READ"
	if val, ok := data.Metadata["state_event"].(string); ok && val != "" {
		state = val
	}

	switch strings.ToUpper(state) {
	case "ASK_FOR_CONFIRMATION":
		return rft.confirmationTemplate().Render(data, theme)
	case "FILE_READ_ERROR":
		return rft.errorTemplate().Render(data, theme)
	}

	return rft.renderSuccess(data, theme)
}

func (rft *ReadFileTemplate) renderSuccess(data MessageTemplateData, theme styles.Theme) RenderedMessage {
	var lines []string

	filePath := "unknown file"
	if data.Metadata != nil {
		if path, ok := data.Metadata["file_path"].(string); ok {
			filePath = path
		}
	}

	prefixText := lipgloss.NewStyle().
		Foreground(theme.Info).
		Bold(true).
		Render("📖 Read")

	header := rft.RenderHeader(prefixText, data.Timestamp, data.Width, theme)
	lines = append(lines, header)

	fileInfoStyle := lipgloss.NewStyle().
		Foreground(theme.Muted).
		Italic(true)

	fileInfo := fileInfoStyle.Render(fmt.Sprintf("  📁 %s", filePath))
	fileInfoFilled := lipgloss.NewStyle().
		Width(data.Width).
		Render(fileInfo)
	lines = append(lines, fileInfoFilled)

	spacer := lipgloss.NewStyle().
		Width(data.Width).
		Render(" ")
	lines = append(lines, spacer)

	if strings.TrimSpace(data.Content) != "" {
		contentLines := rft.RenderCodeBlock(data.Content, "", data.Width, theme)
		lines = append(lines, contentLines...)
	} else {
		emptyStyle := lipgloss.NewStyle().
			Foreground(theme.Muted).
			Italic(true)
		emptyMsg := emptyStyle.Render("  (empty file)")
		emptyFilled := lipgloss.NewStyle().
			Width(data.Width).
			Render(emptyMsg)
		lines = append(lines, emptyFilled)
	}

	lines = append(lines, rft.AddSpacer(data.Width, theme))
	return RenderedMessage{Lines: lines}
}

func (rft *ReadFileTemplate) confirmationTemplate() *ReadFileConfirmationTemplate {
	if rft.confirmation == nil {
		rft.confirmation = NewReadFileConfirmationTemplate()
	}
	return rft.confirmation
}

func (rft *ReadFileTemplate) errorTemplate() *ReadFileErrorTemplate {
	if rft.errorTemplate == nil {
		rft.errorTemplate = NewReadFileErrorTemplate()
	}
	return rft.errorTemplate
}

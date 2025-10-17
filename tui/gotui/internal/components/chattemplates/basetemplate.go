package chattemplates

import (
	"strings"
	"time"

	"gotui/internal/styles"

	"github.com/charmbracelet/lipgloss/v2"
)

// MessageTemplateData contains the data needed to render a message
type MessageTemplateData struct {
Type      string
Content   string
Timestamp time.Time
Raw       bool
Width     int                    // Available width for the message
Metadata  map[string]interface{} // Additional metadata for specific template types
Buttons   []MessageButton        // Optional buttons for interactive templates
}

// MessageButton represents a single interactive button rendered by a template.
type MessageButton struct {
    ID          string
    Label       string
    Description string
}

// RenderedMessage represents a fully rendered message
type RenderedMessage struct {
	Lines []string // Each line is a fully styled string ready for display
}

// MessageTemplate defines the interface for message templates
type MessageTemplate interface {
	// Render renders the message and returns the styled lines
	Render(data MessageTemplateData, theme styles.Theme) RenderedMessage
	// GetMessageType returns the message type this template handles
	GetMessageType() string
}

// BaseTemplate provides common functionality for all message templates
type BaseTemplate struct {
	messageType string
}

// GetMessageType returns the message type
func (bt *BaseTemplate) GetMessageType() string {
	return bt.messageType
}

// RenderHeader creates a common header for messages
func (bt *BaseTemplate) RenderHeader(prefix string, timestamp time.Time, width int, theme styles.Theme) string {
	timestampStr := timestamp.Format("15:04:05")

	header := lipgloss.JoinHorizontal(
		lipgloss.Center,
		prefix,
		lipgloss.NewStyle().
			Foreground(theme.Muted).
			// Background(theme.Background).
			Render(" • "+timestampStr),
	)

	// Pad header to full width with background to avoid black gaps
	return lipgloss.NewStyle().
		// Background(theme.Background).
		Width(maxInt(1, width)).
		Render(header)
}

// RenderContent processes and styles message content with proper line wrapping
func (bt *BaseTemplate) RenderContent(content string, style lipgloss.Style, width int, theme styles.Theme) []string {
	return bt.RenderContentWithIndent(content, style, width, theme, "  ")
}

// RenderContentWithIndent processes and styles message content with custom indentation
func (bt *BaseTemplate) RenderContentWithIndent(content string, style lipgloss.Style, width int, theme styles.Theme, indent string) []string {
	var lines []string

	// Split content into lines and apply styling
	contentLines := strings.Split(content, "\n")
	maxLineWidth := width - len(indent)

	for _, line := range contentLines {
		if line == "" {
			// Add a fully-background blank line
			blank := lipgloss.NewStyle().
				// Background(theme.Background).
				Width(width).
				Render(" ")
			lines = append(lines, blank)
			continue
		}

		// Wrap long lines
		if len(line) > maxLineWidth {
			words := strings.Fields(line)
			var currentLine string
			for _, word := range words {
				if len(currentLine)+len(word)+1 > maxLineWidth {
					if currentLine != "" {
						styled := style.Render(indent + currentLine)
						filled := lipgloss.NewStyle().
							// Background(theme.Background).
							Width(width).Render(styled)
						lines = append(lines, filled)
						currentLine = word
					} else {
						styled := style.Render(indent + word)
						filled := lipgloss.NewStyle().
							// Background(theme.Background).
							Width(width).Render(styled)
						lines = append(lines, filled)
					}
				} else {
					if currentLine == "" {
						currentLine = word
					} else {
						currentLine += " " + word
					}
				}
			}
			if currentLine != "" {
				styled := style.Render(indent + currentLine)
				filled := lipgloss.NewStyle().
					// Background(theme.Background).
					Width(width).Render(styled)
				lines = append(lines, filled)
			}
		} else {
			styled := style.Render(indent + line)
			filled := lipgloss.NewStyle().
				// Background(theme.Background).
				Width(width).Render(styled)
			lines = append(lines, filled)
		}
	}

	return lines
}

// RenderCodeBlock renders content as a code block with syntax highlighting appearance
func (bt *BaseTemplate) RenderCodeBlock(content string, language string, width int, theme styles.Theme) []string {
	var lines []string

	if width <= 0 {
		width = 40
	}

	outerPadding := 1
	innerWidth := width - (outerPadding * 2) - 2 // account for borders
	if innerWidth < 10 {
		innerWidth = maxInt(10, width-2)
	}

	contentLines := strings.Split(content, "\n")
	if len(contentLines) == 0 {
		contentLines = []string{""}
	}

	var wrappedLines []string
	for _, line := range contentLines {
		clean := strings.ReplaceAll(line, "\t", "    ")
		wrapped := wrapCodeLine(clean, innerWidth)
		if len(wrapped) == 0 {
			wrapped = []string{""}
		}
		for _, segment := range wrapped {
			padded := padRight(segment, innerWidth)
			wrappedLines = append(wrappedLines, " "+padded+" ")
		}
	}

	codeBodyLines := make([]string, 0, len(wrappedLines))
	lineStyle := lipgloss.NewStyle().
		Foreground(theme.Foreground)
		// Background(theme.Surface)

	for _, entry := range wrappedLines {
		codeBodyLines = append(codeBodyLines, lineStyle.Render(entry))
	}

	body := lipgloss.JoinVertical(lipgloss.Left, codeBodyLines...)

	if language != "" {
		label := strings.ToUpper(strings.TrimSpace(language))
		headerContent := " " + label + " "
		header := lipgloss.NewStyle().
			Foreground(theme.Muted).
			// Background(theme.SurfaceHigh.BlendLab(theme.Surface, 0.2)).
			Width(innerWidth + 2).
			Render(padRight(headerContent, innerWidth+2))
		body = lipgloss.JoinVertical(lipgloss.Left, header, body)
	}

	codeBlock := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(theme.Border).
		// Background(theme.SurfaceHigh).
		Padding(0, outerPadding).
		Render(body)

	filled := lipgloss.NewStyle().
		Width(width).
		Render(codeBlock)

	lines = append(lines, filled)
	return lines
}

// AddSpacer adds a spacer line between messages
func (bt *BaseTemplate) AddSpacer(width int, theme styles.Theme) string {
	return lipgloss.NewStyle().
		// Background(theme.Background).
		Width(width).
		Render(" ")
}

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func wrapCodeLine(line string, width int) []string {
	if width <= 0 {
		return []string{line}
	}
	runes := []rune(line)
	if len(runes) == 0 {
		return []string{""}
	}
	var result []string
	for len(runes) > width {
		result = append(result, string(runes[:width]))
		runes = runes[width:]
	}
	result = append(result, string(runes))
	return result
}

func padRight(s string, width int) string {
	delta := width - lipgloss.Width(s)
	if delta <= 0 {
		return s
	}
	return s + strings.Repeat(" ", delta)
}

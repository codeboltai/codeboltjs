package chattemplates

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/charmbracelet/lipgloss/v2"

	diffview "gotui/internal/components/uicomponents/diffview"
	"gotui/internal/styles"
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
		// Background(theme.Background).
		Width(data.Width).
		Render(fileInfo)
	lines = append(lines, fileInfoFilled)

	if diffLines := wft.extractDiffLines(data.Metadata); len(diffLines) > 0 {
		lines = append(lines, lipgloss.NewStyle().Width(data.Width).Render(" "))

		diffHeader := lipgloss.NewStyle().
			Foreground(theme.Info).
			Bold(true).
			Render("  Diff Preview")
		lines = append(lines, lipgloss.NewStyle().Width(data.Width).Render(diffHeader))

		diffWidth := data.Width - 4
		if diffWidth <= 0 {
			diffWidth = data.Width
		}
		if diffWidth <= 0 {
			diffWidth = 72
		}

		rendered := diffview.RenderUnified(diffLines, diffWidth, diffview.UnifiedOptions{ShowLineNumbers: true}, theme)
		diffLineStyle := lipgloss.NewStyle().Width(data.Width)
		for _, diffLine := range rendered.Lines {
			lines = append(lines, diffLineStyle.Render("  "+diffLine))
		}

		lines = append(lines, lipgloss.NewStyle().Width(data.Width).Render(" "))
	}

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
			// Background(theme.Background).
			Width(data.Width).
			Render(emptyMsg)
		lines = append(lines, emptyFilled)
	}

	// Add final spacer
	finalSpacer := wft.AddSpacer(data.Width, theme)
	lines = append(lines, finalSpacer)

	return RenderedMessage{Lines: lines}
}

func (wft *WriteFileTemplate) extractDiffLines(metadata map[string]interface{}) []diffview.DiffLine {
	if metadata == nil {
		return nil
	}

	if raw, ok := metadata["diff_lines"]; ok {
		if lines := parseDiffLineSlice(raw); len(lines) > 0 {
			return lines
		}
	}

	if raw, ok := metadata["diff"]; ok {
		if diffStr, ok := raw.(string); ok {
			if lines := parseUnifiedDiff(diffStr); len(lines) > 0 {
				return lines
			}
		}
	}

	return nil
}

func parseDiffLineSlice(raw interface{}) []diffview.DiffLine {
	list, ok := raw.([]interface{})
	if !ok {
		return nil
	}

	var lines []diffview.DiffLine
	for _, item := range list {
		entry, ok := item.(map[string]interface{})
		if !ok {
			continue
		}

		line := diffview.DiffLine{}
		if kind, ok := parseKind(entry["kind"]); ok {
			line.Kind = kind
		} else {
			continue
		}

		if oldLine, ok := asString(entry["old_line"]); ok {
			line.OldLine = oldLine
		}
		if newLine, ok := asString(entry["new_line"]); ok {
			line.NewLine = newLine
		}
		if oldText, ok := asString(entry["old_text"]); ok {
			line.OldText = oldText
		}
		if newText, ok := asString(entry["new_text"]); ok {
			line.NewText = newText
		}
		if header, ok := asString(entry["header"]); ok {
			line.Header = header
		}

		lines = append(lines, line)
	}

	return lines
}

func parseKind(value interface{}) (diffview.DiffLineKind, bool) {
	switch v := value.(type) {
	case float64:
		return diffview.DiffLineKind(int(v)), true
	case int:
		return diffview.DiffLineKind(v), true
	case string:
		switch strings.ToLower(v) {
		case "added", "+":
			return diffview.DiffLineAdded, true
		case "removed", "-":
			return diffview.DiffLineRemoved, true
		case "header", "@@":
			return diffview.DiffLineHeader, true
		case "unchanged", " ":
			fallthrough
		default:
			return diffview.DiffLineUnchanged, true
		}
	default:
		return 0, false
	}
}

func asString(value interface{}) (string, bool) {
	switch v := value.(type) {
	case string:
		return v, true
	case fmt.Stringer:
		return v.String(), true
	case float64:
		return strconv.Itoa(int(v)), true
	case int:
		return strconv.Itoa(v), true
	case int64:
		return strconv.FormatInt(v, 10), true
	case uint64:
		return strconv.FormatUint(v, 10), true
	default:
		return "", false
	}
}

func parseUnifiedDiff(diff string) []diffview.DiffLine {
	if strings.TrimSpace(diff) == "" {
		return nil
	}

	var (
		lines            []diffview.DiffLine
		oldLine, newLine int
	)

	for _, raw := range strings.Split(diff, "\n") {
		if raw == "\\ No newline at end of file" {
			continue
		}

		switch {
		case strings.HasPrefix(raw, "@@"):
			oldLine, newLine = parseHunkHeader(raw)
			lines = append(lines, diffview.DiffLine{Kind: diffview.DiffLineHeader, Header: raw})
		case strings.HasPrefix(raw, "+"):
			lines = append(lines, diffview.DiffLine{
				Kind:    diffview.DiffLineAdded,
				NewLine: strconv.Itoa(max(newLine, 1)),
				NewText: raw[1:],
			})
			newLine++
		case strings.HasPrefix(raw, "-"):
			lines = append(lines, diffview.DiffLine{
				Kind:    diffview.DiffLineRemoved,
				OldLine: strconv.Itoa(max(oldLine, 1)),
				OldText: raw[1:],
			})
			oldLine++
		case strings.HasPrefix(raw, " "):
			lines = append(lines, diffview.DiffLine{
				Kind:    diffview.DiffLineUnchanged,
				OldLine: strconv.Itoa(max(oldLine, 1)),
				NewLine: strconv.Itoa(max(newLine, 1)),
				OldText: raw[1:],
				NewText: raw[1:],
			})
			oldLine++
			newLine++
		default:
			if strings.TrimSpace(raw) != "" {
				lines = append(lines, diffview.DiffLine{Kind: diffview.DiffLineHeader, Header: raw})
			}
		}
	}

	return lines
}

func parseHunkHeader(header string) (int, int) {
	parts := strings.Fields(header)
	var oldStart, newStart int
	for _, part := range parts {
		if strings.HasPrefix(part, "-") {
			oldStart = parseRangeStart(part[1:])
		}
		if strings.HasPrefix(part, "+") {
			newStart = parseRangeStart(part[1:])
		}
	}
	return oldStart, newStart
}

func parseRangeStart(part string) int {
	if idx := strings.Index(part, ","); idx >= 0 {
		part = part[:idx]
	}
	if n, err := strconv.Atoi(part); err == nil {
		return n
	}
	return 1
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

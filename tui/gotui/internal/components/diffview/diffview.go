package diffview

import (
	"strings"

	"github.com/charmbracelet/lipgloss/v2"
	"github.com/charmbracelet/x/ansi"

	"gotui/internal/styles"
)

// DiffLine represents a single line within a diff result.
type DiffLine struct {
	Kind    DiffLineKind
	OldLine string
	NewLine string
	OldText string
	NewText string
	Header  string
}

// DiffLineKind identifies the type of diff line.
type DiffLineKind int

const (
	DiffLineUnchanged DiffLineKind = iota
	DiffLineAdded
	DiffLineRemoved
	DiffLineHeader
)

// DiffView represents a rendered diff as lipgloss formatted lines.
type DiffView struct {
	Lines []string
}

// UnifiedOptions configures unified diff rendering.
type UnifiedOptions struct {
	ShowLineNumbers bool
}

// SplitOptions configures split diff rendering.
type SplitOptions struct {
	ShowLineNumbers bool
	ShowHeaders     bool
	Divider         string
}

// RenderUnified renders diff lines in a single column.
func RenderUnified(lines []DiffLine, width int, opts UnifiedOptions, theme styles.Theme) DiffView {
	if width <= 0 {
		width = 80
	}

	padWidth := 0
	if opts.ShowLineNumbers {
		for _, line := range lines {
			if l := len(line.OldLine); l > padWidth {
				padWidth = l
			}
			if l := len(line.NewLine); l > padWidth {
				padWidth = l
			}
		}
	}

	base := lipgloss.NewStyle().Foreground(theme.Foreground)
	added := base.Foreground(theme.Success)
	removed := base.Foreground(theme.Error)
	header := lipgloss.NewStyle().Foreground(theme.Muted).Bold(true)

	var rendered []string
	for _, line := range lines {
		switch line.Kind {
		case DiffLineHeader:
			text := line.Header
			if text == "" {
				text = line.NewText
			}
			rendered = append(rendered, header.Render(trimWidth(text, width)))
		case DiffLineAdded:
			number := ""
			if opts.ShowLineNumbers {
				number = pad(line.NewLine, padWidth)
			}
			content := trimCode(line.NewText, width-padWidth-2)
			rendered = append(rendered, added.Render(joinUnified("+", number, content)))
		case DiffLineRemoved:
			number := ""
			if opts.ShowLineNumbers {
				number = pad(line.OldLine, padWidth)
			}
			content := trimCode(line.OldText, width-padWidth-2)
			rendered = append(rendered, removed.Render(joinUnified("-", number, content)))
		default:
			number := ""
			if opts.ShowLineNumbers {
				number = pad(defaultLine(line), padWidth)
			}
			content := trimCode(lineDisplayText(line), width-padWidth-2)
			rendered = append(rendered, base.Render(joinUnified(" ", number, content)))
		}
	}

	return DiffView{Lines: rendered}
}

// RenderSplit renders diff lines in a side-by-side column layout.
func RenderSplit(lines []DiffLine, width int, opts SplitOptions, theme styles.Theme) DiffView {
	if opts.Divider == "" {
		opts.Divider = "│"
	}

	if width <= 0 {
		width = 80
	}

	dividerWidth := lipgloss.Width(opts.Divider)
	colWidth := (width - dividerWidth - 2) / 2
	if colWidth < 20 {
		colWidth = 20
	}

	oldPad := 0
	newPad := 0
	if opts.ShowLineNumbers {
		for _, line := range lines {
			if l := len(line.OldLine); l > oldPad {
				oldPad = l
			}
			if l := len(line.NewLine); l > newPad {
				newPad = l
			}
		}
	}

	leftStyle := lipgloss.NewStyle().Foreground(theme.Foreground)
	leftRemove := leftStyle.Foreground(theme.Error)
	rightStyle := lipgloss.NewStyle().Foreground(theme.Foreground)
	rightAdd := rightStyle.Foreground(theme.Success)
	headerStyle := lipgloss.NewStyle().Foreground(theme.Muted).Bold(true)

	var rendered []string
	for _, line := range lines {
		switch line.Kind {
		case DiffLineHeader:
			if opts.ShowHeaders {
				text := line.Header
				if text == "" {
					text = line.NewText
				}
				rendered = append(rendered, headerStyle.Render(trimWidth(text, width)))
			}
		case DiffLineAdded:
			left := leftStyle.Render(padRight("", colWidth))
			right := rightAdd.Render(buildColumn(line.NewLine, line.NewText, newPad, colWidth, opts.ShowLineNumbers))
			row := lipgloss.JoinHorizontal(lipgloss.Top, left, " ", opts.Divider, " ", right)
			rendered = append(rendered, row)
		case DiffLineRemoved:
			left := leftRemove.Render(buildColumn(line.OldLine, line.OldText, oldPad, colWidth, opts.ShowLineNumbers))
			right := rightStyle.Render(padRight("", colWidth))
			row := lipgloss.JoinHorizontal(lipgloss.Top, left, " ", opts.Divider, " ", right)
			rendered = append(rendered, row)
		default:
			left := leftStyle.Render(buildColumn(line.OldLine, line.OldText, oldPad, colWidth, opts.ShowLineNumbers))
			right := rightStyle.Render(buildColumn(line.NewLine, line.NewText, newPad, colWidth, opts.ShowLineNumbers))
			row := lipgloss.JoinHorizontal(lipgloss.Top, left, " ", opts.Divider, " ", right)
			rendered = append(rendered, row)
		}
	}

	return DiffView{Lines: rendered}
}

func trimWidth(s string, width int) string {
	if width <= 0 {
		return s
	}
	if lipgloss.Width(s) <= width {
		return s
	}
	r := []rune(s)
	if len(r) <= width {
		return string(r)
	}
	return string(r[:width])
}

func trimCode(text string, width int) string {
	if width <= 0 {
		return text
	}
	if ansi.StringWidth(text) <= width {
		return text
	}
	if width <= 3 {
		return strings.Repeat(".", width)
	}
	r := []rune(text)
	limit := width - 3
	if limit > len(r) {
		limit = len(r)
	}
	return string(r[:limit]) + "..."
}

func joinUnified(prefix, lineNumber, text string) string {
	parts := []string{prefix}
	if lineNumber != "" {
		parts = append(parts, lineNumber)
	}
	if text != "" {
		parts = append(parts, text)
	}
	return strings.Join(parts, " ")
}

func buildColumn(lineNumber, text string, padWidth, colWidth int, showNumbers bool) string {
	if colWidth <= 0 {
		return ""
	}
	var components []string
	available := colWidth
	if showNumbers && padWidth > 0 && lineNumber != "" {
		num := pad(lineNumber, padWidth)
		components = append(components, num)
		available -= ansi.StringWidth(num)
		if available > 0 {
			components = append(components, "")
			available--
		}
	}
	if available < 0 {
		available = 0
	}
	trimmed := trimCode(text, available)
	if trimmed != "" {
		if len(components) > 0 && components[len(components)-1] == "" {
			components[len(components)-1] = trimmed
		} else {
			components = append(components, trimmed)
		}
	}
	joined := strings.Join(components, " ")
	return padRight(joined, colWidth)
}

func defaultLine(line DiffLine) string {
	if line.NewLine != "" {
		return line.NewLine
	}
	return line.OldLine
}

func lineDisplayText(line DiffLine) string {
	if line.NewText != "" {
		return line.NewText
	}
	return line.OldText
}

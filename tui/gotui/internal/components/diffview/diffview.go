package diffview

import (
	"strings"

	"github.com/charmbracelet/lipgloss/v2"
	"github.com/charmbracelet/x/ansi"

	"gotui/internal/styles"
)

// DiffLine represents a single line within a diff result.
type DiffLine struct {
	Kind DiffLineKind
	A    string
	B    string
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
	ContextPadding  int
}

// SplitOptions configures split diff rendering.
type SplitOptions struct {
	ShowLineNumbers bool
	ShowHeaders     bool
	Divider         string
}

// RenderUnified renders diff lines in a single column.
func RenderUnified(lines []DiffLine, width int, opts UnifiedOptions, theme styles.Theme) DiffView {
	if opts.ContextPadding < 0 {
		opts.ContextPadding = 0
	}

	leftPad := 0
	if opts.ShowLineNumbers {
		leftPad = 4
	}

	lineWidth := width
	if lineWidth <= 0 {
		lineWidth = 80
	}

	styleBase := lipgloss.NewStyle().Foreground(theme.Foreground)
	styleAdd := lipgloss.NewStyle().Foreground(theme.Success)
	styleRemove := lipgloss.NewStyle().Foreground(theme.Error)
	styleHeader := lipgloss.NewStyle().Foreground(theme.Muted).Bold(true)

	var rendered []string

	for _, line := range lines {
		var styled string
		switch line.Kind {
		case DiffLineAdded:
			left := ""
			if opts.ShowLineNumbers {
				left = pad(line.A, leftPad)
			}
			text := trimCode(line.B, lineWidth-leftPad-2)
			styled = styleAdd.Render(joinUnified("+", left, text))
		case DiffLineRemoved:
			left := ""
			if opts.ShowLineNumbers {
				left = pad(line.A, leftPad)
			}
			text := trimCode(line.B, lineWidth-leftPad-2)
			styled = styleRemove.Render(joinUnified("-", left, text))
		case DiffLineHeader:
			styled = styleHeader.Render(trimWidth(line.A, lineWidth))
		default:
			left := ""
			if opts.ShowLineNumbers {
				left = pad(line.A, leftPad)
			}
			text := trimCode(line.B, lineWidth-leftPad-2)
			styled = styleBase.Render(joinUnified(" ", left, text))
		}
		rendered = append(rendered, styled)
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
	colWidth := (width - dividerWidth - 1) / 2
	if colWidth < 20 {
		colWidth = 20
	}

	leftStyle := lipgloss.NewStyle().Foreground(theme.Foreground)
	leftRemove := leftStyle.Copy().Foreground(theme.Error)
	rightStyle := lipgloss.NewStyle().Foreground(theme.Foreground)
	rightAdd := rightStyle.Copy().Foreground(theme.Success)
	headerStyle := lipgloss.NewStyle().Foreground(theme.Muted).Bold(true)

	var rendered []string

	for _, line := range lines {
		switch line.Kind {
		case DiffLineHeader:
			if opts.ShowHeaders {
				rendered = append(rendered, headerStyle.Render(trimWidth(line.A, width)))
			}
		case DiffLineAdded:
			left := leftStyle.Render(pad("", colWidth))
			right := rightAdd.Render(trimWidth(line.B, colWidth))
			row := lipgloss.JoinHorizontal(lipgloss.Top, left, " ", opts.Divider, " ", right)
			rendered = append(rendered, row)
		case DiffLineRemoved:
			left := leftRemove.Render(trimWidth(line.A, colWidth))
			right := rightStyle.Render(pad("", colWidth))
			row := lipgloss.JoinHorizontal(lipgloss.Top, left, " ", opts.Divider, " ", right)
			rendered = append(rendered, row)
		default:
			left := leftStyle.Render(trimWidth(line.A, colWidth))
			right := rightStyle.Render(trimWidth(line.B, colWidth))
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

func joinUnified(prefix, left, text string) string {
	parts := []string{prefix}
	if left != "" {
		parts = append(parts, left)
	}
	if text != "" {
		parts = append(parts, text)
	}
	return strings.Join(parts, " ")
}

func abs(a int) int {
	if a < 0 {
		return -a
	}
	return a
}

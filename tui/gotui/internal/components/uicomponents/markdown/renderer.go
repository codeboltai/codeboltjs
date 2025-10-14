package markdown

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/glamour"
)

// Renderer handles markdown rendering with glamour
type Renderer struct {
	renderer *glamour.TermRenderer
	width    int
}

// New creates a new markdown renderer
func New(width int) (*Renderer, error) {
	renderer, err := glamour.NewTermRenderer(
		glamour.WithAutoStyle(),
		glamour.WithWordWrap(width),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create glamour renderer: %w", err)
	}

	return &Renderer{
		renderer: renderer,
		width:    width,
	}, nil
}

// SetWidth updates the renderer width
func (r *Renderer) SetWidth(width int) error {
	if width == r.width {
		return nil
	}

	r.width = width

	// Recreate renderer with new width
	renderer, err := glamour.NewTermRenderer(
		glamour.WithAutoStyle(),
		glamour.WithWordWrap(width),
	)
	if err != nil {
		return fmt.Errorf("failed to recreate glamour renderer: %w", err)
	}

	r.renderer = renderer
	return nil
}

// Render renders markdown text to a styled string
func (r *Renderer) Render(markdown string) (string, error) {
	if strings.TrimSpace(markdown) == "" {
		return "", nil
	}

	rendered, err := r.renderer.Render(markdown)
	if err != nil {
		return "", fmt.Errorf("failed to render markdown: %w", err)
	}

	// Clean up any trailing whitespace
	return strings.TrimRight(rendered, "\n\r \t"), nil
}

// RenderLines renders markdown and returns as lines
func (r *Renderer) RenderLines(markdown string) ([]string, error) {
	rendered, err := r.Render(markdown)
	if err != nil {
		return nil, err
	}

	if rendered == "" {
		return []string{}, nil
	}

	return strings.Split(rendered, "\n"), nil
}

// IsMarkdown checks if the content looks like markdown
func IsMarkdown(content string) bool {
	content = strings.TrimSpace(content)
	if content == "" {
		return false
	}

	// Check for common markdown patterns
	lines := strings.Split(content, "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		// Headers
		if strings.HasPrefix(line, "#") {
			return true
		}
		// Lists
		if strings.HasPrefix(line, "* ") || strings.HasPrefix(line, "- ") || strings.HasPrefix(line, "+ ") {
			return true
		}
		// Numbered lists
		if len(line) > 2 && line[1] == '.' && line[0] >= '0' && line[0] <= '9' {
			return true
		}
		// Code blocks
		if strings.HasPrefix(line, "```") {
			return true
		}
		// Emphasis
		if strings.Contains(line, "**") || strings.Contains(line, "*") || strings.Contains(line, "__") || strings.Contains(line, "_") {
			return true
		}
		// Links
		if strings.Contains(line, "[") && strings.Contains(line, "]") && strings.Contains(line, "(") && strings.Contains(line, ")") {
			return true
		}
		// Code spans
		if strings.Contains(line, "`") {
			return true
		}
	}

	return false
}

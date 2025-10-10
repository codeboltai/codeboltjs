package panels

import (
	"gotui/internal/components/panel"

	tea "github.com/charmbracelet/bubbletea/v2"
)

// InfoPanel is a simple wrapper around the shared panel component for displaying
// informational lists in the sidebar.
type InfoPanel struct {
	panel *panel.Panel
}

// NewInfoPanel creates a titled info panel.
func NewInfoPanel(title string) *InfoPanel {
	return &InfoPanel{panel: panel.New(title)}
}

// SetSize configures the rendered dimensions.
func (p *InfoPanel) SetSize(width, height int) {
	if p.panel == nil {
		return
	}
	p.panel.SetSize(width, height)
}

// SetVisible toggles visibility.
func (p *InfoPanel) SetVisible(visible bool) {
	if p.panel == nil {
		return
	}
	p.panel.SetVisible(visible)
}

// SetLines replaces the panel content with the provided lines.
func (p *InfoPanel) SetLines(lines []string) {
	if p.panel == nil {
		return
	}
	p.panel.Clear()
	for _, line := range lines {
		p.panel.AddLine(line)
	}
}

// Update forwards updates to the underlying panel.
func (p *InfoPanel) Update(msg tea.Msg) tea.Cmd {
	if p.panel == nil {
		return nil
	}
	return p.panel.Update(msg)
}

// View renders the panel.
func (p *InfoPanel) View() string {
	if p.panel == nil {
		return ""
	}
	return p.panel.View()
}

// Panel returns the underlying panel reference for advanced interactions.
func (p *InfoPanel) Panel() *panel.Panel {
	return p.panel
}

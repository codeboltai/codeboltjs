package panels

import (
	"gotui/internal/components/panel"

	tea "github.com/charmbracelet/bubbletea/v2"
)

// GitStatusPanel renders repository status information.
type GitStatusPanel struct {
	panel *panel.Panel
}

// NewGitStatusPanel creates a status panel with default content.
func NewGitStatusPanel() *GitStatusPanel {
	p := panel.New("Repository Status")
	p.AddLine("Git status not loaded yet.")
	return &GitStatusPanel{panel: p}
}

func (g *GitStatusPanel) SetSize(width, height int)  { g.panel.SetSize(width, height) }
func (g *GitStatusPanel) Update(msg tea.Msg) tea.Cmd { return g.panel.Update(msg) }
func (g *GitStatusPanel) View() string               { return g.panel.View() }

// SetLines replaces the panel content with the provided lines.
func (g *GitStatusPanel) SetLines(lines []string) {
	g.panel.Clear()
	if len(lines) == 0 {
		g.panel.AddLine("No git status available.")
		return
	}
	g.panel.AddLines(lines)
}

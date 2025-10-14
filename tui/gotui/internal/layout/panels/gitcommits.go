package panels

import (
	"gotui/internal/components/uicomponents/panel"

	tea "github.com/charmbracelet/bubbletea/v2"
)

// GitCommitsPanel renders recent commit information.
type GitCommitsPanel struct {
	panel *panel.Panel
}

// NewGitCommitsPanel creates a commits panel with default content.
func NewGitCommitsPanel() *GitCommitsPanel {
	p := panel.New("Recent Commits")
	p.AddLine("Git commit history not loaded yet.")
	return &GitCommitsPanel{panel: p}
}

func (g *GitCommitsPanel) SetSize(width, height int)  { g.panel.SetSize(width, height) }
func (g *GitCommitsPanel) Update(msg tea.Msg) tea.Cmd { return g.panel.Update(msg) }
func (g *GitCommitsPanel) View() string               { return g.panel.View() }

// SetLines replaces the panel content with the provided commit lines.
func (g *GitCommitsPanel) SetLines(lines []string) {
	g.panel.Clear()
	if len(lines) == 0 {
		g.panel.AddLine("No recent commits available.")
		return
	}
	g.panel.AddLines(lines)
}

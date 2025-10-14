package tabpages

import (
	"gotui/internal/layout/panels"

	tea "github.com/charmbracelet/bubbletea/v2"
)

// GitPage composes the git-related panels for the Git tab.
type GitPage struct {
	panels *panels.GitPanels
}

// NewGitPage constructs a git tab page with default content.
func NewGitPage() *GitPage {
	return &GitPage{panels: panels.NewGitPanels()}
}

// SetSize forwards sizing information to the underlying panels.
func (g *GitPage) SetSize(width, height int) {
	g.panels.SetSize(width, height)
}

// Update forwards messages to the git panels.
func (g *GitPage) Update(msg tea.Msg) tea.Cmd {
	return g.panels.Update(msg)
}

// View renders the git tab content.
func (g *GitPage) View() string {
	return g.panels.View()
}

// Refresh replaces the git status and commit information.
func (g *GitPage) Refresh(statusLines, commitLines []string) {
	g.panels.SetStatus(statusLines)
	g.panels.SetCommits(commitLines)
}

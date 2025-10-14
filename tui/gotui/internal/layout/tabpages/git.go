package tabpages

import (
	"gotui/internal/layout/panels"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"
)

// GitPage composes the git-related panels for the Git tab.
type GitPage struct {
	width  int
	height int

	status  *panels.GitStatusPanel
	commits *panels.GitCommitsPanel
}

// NewGitPage constructs a git tab page with default content.
func NewGitPage() *GitPage {
	return &GitPage{
		status:  panels.NewGitStatusPanel(),
		commits: panels.NewGitCommitsPanel(),
	}
}

// SetSize allocates space for each git sub-panel.
func (g *GitPage) SetSize(width, height int) {
	g.width = width
	g.height = height

	if height < 2 {
		height = 2
	}

	statusHeight := height / 2
	if statusHeight < 3 {
		statusHeight = 3
	}
	if statusHeight > height {
		statusHeight = height
	}

	commitsHeight := height - statusHeight
	if commitsHeight < 3 && height >= 6 {
		commitsHeight = 3
		statusHeight = height - commitsHeight
	}
	if commitsHeight < 0 {
		commitsHeight = 0
	}

	g.status.SetSize(width, statusHeight)
	g.commits.SetSize(width, commitsHeight)
}

// Update forwards messages to the git panels.
func (g *GitPage) Update(msg tea.Msg) tea.Cmd {
	var cmds []tea.Cmd
	if cmd := g.status.Update(msg); cmd != nil {
		cmds = append(cmds, cmd)
	}
	if cmd := g.commits.Update(msg); cmd != nil {
		cmds = append(cmds, cmd)
	}
	return tea.Batch(cmds...)
}

// View renders the git tab content.
func (g *GitPage) View() string {
	return lipgloss.NewStyle().
		Width(g.width).
		Height(g.height).
		Render(lipgloss.JoinVertical(
			lipgloss.Left,
			g.status.View(),
			g.commits.View(),
		))
}

// Refresh replaces the git status and commit information.
func (g *GitPage) Refresh(statusLines, commitLines []string) {
	g.status.SetLines(statusLines)
	g.commits.SetLines(commitLines)
}

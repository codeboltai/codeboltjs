package panels

import (
	"gotui/internal/components/panel"
	"gotui/internal/styles"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"
)

// GitPanels groups panels that display git information.
type GitPanels struct {
	width        int
	height       int
	statusPanel  *panel.Panel
	commitsPanel *panel.Panel
}

// NewGitPanels constructs git-related panels with sensible defaults.
func NewGitPanels() *GitPanels {
	status := panel.New("Repository Status")
	status.AddLine("Git status not loaded yet.")
	commits := panel.New("Recent Commits")
	commits.AddLine("Git commit history not loaded yet.")

	return &GitPanels{
		statusPanel:  status,
		commitsPanel: commits,
	}
}

// SetSize updates the layout dimensions for the git panels.
func (g *GitPanels) SetSize(width, height int) {
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

	g.statusPanel.SetSize(width, statusHeight)
	g.commitsPanel.SetSize(width, commitsHeight)
}

// SetStatus replaces the repository status content.
func (g *GitPanels) SetStatus(lines []string) {
	g.statusPanel.Clear()
	if len(lines) == 0 {
		g.statusPanel.AddLine("No git status available.")
		return
	}
	g.statusPanel.AddLines(lines)
}

// SetCommits replaces the recent commits content.
func (g *GitPanels) SetCommits(lines []string) {
	g.commitsPanel.Clear()
	if len(lines) == 0 {
		g.commitsPanel.AddLine("No recent commits available.")
		return
	}
	g.commitsPanel.AddLines(lines)
}

// Update passes messages to underlying panels.
func (g *GitPanels) Update(msg tea.Msg) tea.Cmd {
	var cmds []tea.Cmd
	if cmd := g.statusPanel.Update(msg); cmd != nil {
		cmds = append(cmds, cmd)
	}
	if cmd := g.commitsPanel.Update(msg); cmd != nil {
		cmds = append(cmds, cmd)
	}
	return tea.Batch(cmds...)
}

// View renders the git panels stacked vertically.
func (g *GitPanels) View() string {
	theme := styles.CurrentTheme()

	content := lipgloss.JoinVertical(
		lipgloss.Left,
		g.statusPanel.View(),
		g.commitsPanel.View(),
	)

	return lipgloss.NewStyle().
		Width(g.width).
		Height(g.height).
		Background(theme.Background).
		Render(content)
}

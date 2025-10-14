package app

import (
	"fmt"
	"os/exec"
	"strings"
)

func (m *Model) refreshGitPanels() {
	if m.gitPage == nil {
		return
	}

	status := m.runGitCommand("status", "--short", "--branch")
	commits := m.runGitCommand("log", "--oneline", "-n", "5")

	m.gitPage.Refresh(status, commits)
}

func (m *Model) runGitCommand(args ...string) []string {
	cmd := exec.Command("git", args...)
	output, err := cmd.CombinedOutput()
	trimmed := strings.TrimSpace(string(output))
	if err != nil {
		if trimmed == "" {
			return []string{fmt.Sprintf("Error: %v", err)}
		}
		lines := strings.Split(trimmed, "\n")
		lines = append(lines, fmt.Sprintf("Error: %v", err))
		return lines
	}
	if trimmed == "" {
		return []string{"(no output)"}
	}
	return strings.Split(trimmed, "\n")
}

package app

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/charmbracelet/lipgloss/v2"
	zone "github.com/lrstanley/bubblezone"
	"golang.org/x/term"

	"gotui/internal/styles"
)

func getTerminalSize() (int, int) {
	if width, height, err := term.GetSize(int(os.Stdout.Fd())); err == nil {
		log.Printf("Terminal size detected: %dx%d", width, height)
		return width, height
	}

	if cols := os.Getenv("COLUMNS"); cols != "" {
		if width, err := strconv.Atoi(cols); err == nil {
			if lines := os.Getenv("LINES"); lines != "" {
				if height, err := strconv.Atoi(lines); err == nil {
					log.Printf("Terminal size from env: %dx%d", width, height)
					return width, height
				}
			}
		}
	}

	log.Printf("Using fallback terminal size: 120x40")
	return 120, 40
}

func (m *Model) updateAllComponents() {
	log.Printf("updateAllComponents: Updating components with %dx%d", m.width, m.height)

	if m.width > 0 && m.height > 0 {
		contentHeight := m.height - tabBarHeight
		if contentHeight < 1 {
			contentHeight = 1
		}

		if chat := m.chatComponent(); chat != nil {
			chat.SetSize(m.width, contentHeight)
		}
		m.logsPage.SetSize(m.width, contentHeight)
		m.gitPage.SetSize(m.width, contentHeight)

		if m.helpBar != nil {
			m.helpBar.SetSize(m.width, m.helpBar.VisibleHeight())
		}

		log.Printf("updateAllComponents: contentHeight=%d tab=%d",
			contentHeight, tabBarHeight)
	}
}

func (m *Model) renderTabs() string {
	if len(m.tabs) == 0 {
		return ""
	}

	theme := styles.CurrentTheme()

	activeStyle := lipgloss.NewStyle().
		BorderStyle(lipgloss.NormalBorder()).
		BorderForeground(theme.Primary).
		BorderBottom(false).
		Padding(0, 2).
		Foreground(theme.Primary).
		Bold(true)

	inactiveStyle := lipgloss.NewStyle().
		BorderStyle(lipgloss.NormalBorder()).
		BorderForeground(theme.Border).
		BorderBottom(true).
		Padding(0, 2).
		Foreground(theme.Muted)

	var rendered []string
	m.tabRegions = m.tabRegions[:0]
	cursor := 0
	for idx, label := range m.tabs {
		style := inactiveStyle
		if idx == int(m.activeTab) {
			style = activeStyle
		}
		renderedTab := style.Render(label)
		tabWidth := lipgloss.Width(renderedTab)
		if tabWidth < 0 {
			tabWidth = 0
		}
		m.tabRegions = append(m.tabRegions, tabRegion{id: tabID(idx), start: cursor, end: cursor + tabWidth})
		rendered = append(rendered, renderedTab)
		cursor += tabWidth
	}

	row := lipgloss.JoinHorizontal(lipgloss.Top, rendered...)
	rowWidth := lipgloss.Width(row)
	if rowWidth < m.width {
		padding := lipgloss.NewStyle().
			Width(m.width - rowWidth).
			BorderStyle(lipgloss.NormalBorder()).
			BorderBottom(true).
			BorderForeground(theme.Border).
			Render("")
		row = lipgloss.JoinHorizontal(lipgloss.Top, row, padding)
	}

	separatorWidth := m.width
	if separatorWidth < 0 {
		separatorWidth = 0
	}
	separator := lipgloss.NewStyle().
		Width(separatorWidth).
		Foreground(theme.Border).
		Render(strings.Repeat("─", separatorWidth))

	bar := lipgloss.JoinVertical(lipgloss.Left, row, separator)

	return lipgloss.NewStyle().
		Width(m.width).
		Height(tabBarHeight).
		Render(bar)
}

func (m *Model) renderActiveTab(theme styles.Theme) string {
	contentHeight := m.height - tabBarHeight
	if contentHeight < 1 {
		contentHeight = 1
	}

	var view string
	switch m.activeTab {
	case tabChat:
		if chat := m.chatComponent(); chat != nil {
			view = chat.View()
		}
	case tabLogs:
		view = m.logsPage.View()
	case tabGit:
		view = m.gitPage.View()
	}

	if view == "" {
		placeholder := lipgloss.NewStyle().
			Width(m.width).
			Height(contentHeight).
			Align(lipgloss.Center, lipgloss.Center).
			Foreground(theme.Muted).
			Render("No content")
		view = placeholder
	}

	return lipgloss.NewStyle().
		Width(m.width).
		Height(contentHeight).
		Render(view)
}

func (m *Model) updateLayout() {
	if m.width <= 0 || m.height <= 0 {
		return
	}
	m.updateAllComponents()
}

func (m *Model) View() string {
	if m.width == 0 || m.height == 0 {
		return "Initializing..."
	}

	theme := styles.CurrentTheme()

	tabBar := m.renderTabs()
	content := m.renderActiveTab(theme)

	view := lipgloss.JoinVertical(
		lipgloss.Left,
		tabBar,
		content,
	)

	return zone.Scan(lipgloss.NewStyle().
		Width(m.width).
		Height(m.height).
		Render(view))
}

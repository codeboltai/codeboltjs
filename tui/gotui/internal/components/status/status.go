package status

import (
	"fmt"
	"time"

	"gotui/internal/styles"
	"gotui/internal/wsclient"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"
)

// Status represents the status bar component
type Status struct {
	wsClient   *wsclient.Client
	host       string
	port       int
	retryCount int
	isRetrying bool
	lastError  string
	width      int
	height     int
}

// New creates a new status bar
func New(wsClient *wsclient.Client, host string, port int) *Status {
	return &Status{
		wsClient: wsClient,
		host:     host,
		port:     port,
		width:    80,
		height:   1,
	}
}

// SetRetryInfo sets retry information
func (s *Status) SetRetryInfo(count int, retrying bool, lastError string) {
	s.retryCount = count
	s.isRetrying = retrying
	s.lastError = lastError
}

// SetSize sets the status bar dimensions
func (s *Status) SetSize(width, height int) {
	s.width = width
	s.height = height
}

// Update handles messages for the status bar
func (s *Status) Update(msg tea.Msg) tea.Cmd {
	// Status bar doesn't need to handle specific messages
	return nil
}

// View renders the status bar
func (s *Status) View() string {
	theme := styles.CurrentTheme()
	st := styles.CurrentStyles()

	// Connection status
	connStatus := "disconnected"
	connColor := theme.Error
	if s.wsClient.IsConnected() {
		connStatus = "connected"
		connColor = theme.Success
	}

	// Build status sections
	leftSection := lipgloss.JoinHorizontal(
		lipgloss.Center,
		st.Logo.Render("Codebolt"),
		lipgloss.NewStyle().
			Foreground(theme.Muted).
			Render(" | "),
		lipgloss.NewStyle().
			Foreground(connColor).
			Bold(true).
			Render(fmt.Sprintf("ws://%s:%d", s.host, s.port)),
		lipgloss.NewStyle().
			Foreground(theme.Muted).
			Render(" | "),
		lipgloss.NewStyle().
			Foreground(connColor).
			Render(connStatus),
	)

	// Right section with retry info and time
	rightParts := []string{}

	if s.isRetrying {
		rightParts = append(rightParts,
			lipgloss.NewStyle().
				Foreground(theme.Warning).
				Render(fmt.Sprintf("retrying %d/60", s.retryCount)),
		)
	} else if s.retryCount > 0 && !s.wsClient.IsConnected() {
		rightParts = append(rightParts,
			lipgloss.NewStyle().
				Foreground(theme.Error).
				Render(fmt.Sprintf("retry failed (%d/60)", s.retryCount)),
		)
	}

	if s.lastError != "" && !s.wsClient.IsConnected() {
		errorMsg := s.lastError
		if len(errorMsg) > 30 {
			errorMsg = errorMsg[:30] + "..."
		}
		rightParts = append(rightParts,
			lipgloss.NewStyle().
				Foreground(theme.Error).
				Render("error: "+errorMsg),
		)
	}

	rightParts = append(rightParts,
		lipgloss.NewStyle().
			Foreground(theme.Muted).
			Render(time.Now().Format("15:04:05")),
	)

	rightSection := lipgloss.JoinHorizontal(
		lipgloss.Center,
		rightParts...,
	)

	// Calculate spacing
	leftWidth := lipgloss.Width(leftSection)
	rightWidth := lipgloss.Width(rightSection)
	spacerWidth := s.width - leftWidth - rightWidth
	if spacerWidth < 0 {
		spacerWidth = 0
	}

	spacer := lipgloss.NewStyle().
		Width(spacerWidth).
		Render("")

	// Combine sections
	statusLine := lipgloss.JoinHorizontal(
		lipgloss.Center,
		leftSection,
		spacer,
		rightSection,
	)

	// Style the entire status bar
	return lipgloss.NewStyle().
		Width(s.width).
		Height(s.height).
		// Background(theme.Surface).
		Foreground(theme.Foreground).
		Padding(0, 1).
		Render(statusLine)
}

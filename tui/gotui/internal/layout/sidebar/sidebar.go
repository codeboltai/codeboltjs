package sidebar

import (
	"gotui/internal/layout/panels"
	"gotui/internal/styles"
	"gotui/internal/wsclient"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"
)

// Sidebar represents the right sidebar with multiple panels
type Sidebar struct {
	width    int
	height   int
	wsClient *wsclient.Client
	host     string
	port     int

	// Panels
	statusPanel *panels.ConnectionPanel
	logsPanel   *panels.LogsPanel
	serverPanel *panels.LogsPanel
	agentPanel  *panels.AgentPanel
	notifPanel  *panels.NotificationsPanel

	// Panel visibility
	showStatus bool
	showLogs   bool
	showServer bool
	showAgent  bool
	showNotifs bool

	// Connection state
	retryCount int
	isRetrying bool
	lastError  string
}

// New creates a new sidebar
func New(wsClient *wsclient.Client, host string, port int) *Sidebar {
	return &Sidebar{
		wsClient:    wsClient,
		host:        host,
		port:        port,
		statusPanel: panels.NewConnection(wsClient, host, port),
		logsPanel:   panels.NewLogs("General Logs"),
		serverPanel: panels.NewLogs("Server Logs"),
		agentPanel:  panels.NewAgent(),
		notifPanel:  panels.NewNotifications(),
		showStatus:  true,
		showLogs:    true,
		showServer:  true,
		showAgent:   true,
		showNotifs:  true,
	}
}

// SetSize sets the sidebar dimensions
func (s *Sidebar) SetSize(width, height int) {
	s.width = width
	s.height = height

	if width == 0 {
		// Hidden sidebar
		return
	}

	// Count visible panels
	visiblePanels := 0
	if s.showStatus {
		visiblePanels++
	}
	if s.showLogs {
		visiblePanels++
	}
	if s.showServer {
		visiblePanels++
	}
	if s.showAgent {
		visiblePanels++
	}
	if s.showNotifs {
		visiblePanels++
	}

	if visiblePanels == 0 {
		visiblePanels = 1
	}

	panelHeight := height / visiblePanels
	if panelHeight < 5 {
		panelHeight = 5
	}

	// Update panel sizes
	s.statusPanel.SetSize(width, panelHeight)
	s.logsPanel.SetSize(width, panelHeight)
	s.serverPanel.SetSize(width, panelHeight)
	s.agentPanel.SetSize(width, panelHeight)
	s.notifPanel.SetSize(width, panelHeight)
}

// SetRetryInfo sets connection retry information
func (s *Sidebar) SetRetryInfo(count int, retrying bool, lastError string) {
	s.retryCount = count
	s.isRetrying = retrying
	s.lastError = lastError
}

// Expose panel accessors so callers can interact with panels directly
func (s *Sidebar) ConnectionPanel() *panels.ConnectionPanel       { return s.statusPanel }
func (s *Sidebar) LogsPanel() *panels.LogsPanel                   { return s.logsPanel }
func (s *Sidebar) ServerLogsPanel() *panels.LogsPanel             { return s.serverPanel }
func (s *Sidebar) AgentPanel() *panels.AgentPanel                 { return s.agentPanel }
func (s *Sidebar) NotificationsPanel() *panels.NotificationsPanel { return s.notifPanel }

// ToggleStatus toggles the status panel visibility
func (s *Sidebar) ToggleStatus() {
	s.showStatus = !s.showStatus
	s.statusPanel.SetVisible(s.showStatus)
}

// ToggleLogs toggles the logs panel visibility
func (s *Sidebar) ToggleLogs() {
	s.showLogs = !s.showLogs
	s.logsPanel.SetVisible(s.showLogs)
}

// ToggleServer toggles the server logs panel visibility
func (s *Sidebar) ToggleServer() {
	s.showServer = !s.showServer
	s.serverPanel.SetVisible(s.showServer)
}

// ToggleAgent toggles the agent logs panel visibility
func (s *Sidebar) ToggleAgent() {
	s.showAgent = !s.showAgent
	s.agentPanel.SetVisible(s.showAgent)
}

// ToggleNotifications toggles the notifications panel visibility
func (s *Sidebar) ToggleNotifications() {
	s.showNotifs = !s.showNotifs
	s.notifPanel.SetVisible(s.showNotifs)
}

// Update handles messages for the sidebar
func (s *Sidebar) Update(msg tea.Msg) tea.Cmd {
	var cmds []tea.Cmd

	// Update panels
	cmds = append(cmds, s.statusPanel.Update(msg))
	cmds = append(cmds, s.logsPanel.Update(msg))
	cmds = append(cmds, s.serverPanel.Update(msg))
	cmds = append(cmds, s.agentPanel.Update(msg))
	cmds = append(cmds, s.notifPanel.Update(msg))

	return tea.Batch(cmds...)
}

// updateConnectionStatus updates the connection status panel
func (s *Sidebar) updateConnectionStatus() {
	// Propagate retry info to the connection panel
	s.statusPanel.SetRetryInfo(s.retryCount, s.isRetrying, s.lastError)
}

// View renders the sidebar
func (s *Sidebar) View() string {
	theme := styles.CurrentTheme()

	// Update connection status before rendering
	s.updateConnectionStatus()

	var panels []string

	// Calculate height per panel - leave space for borders
	visiblePanelCount := 0
	if s.showStatus {
		visiblePanelCount++
	}
	if s.showLogs {
		visiblePanelCount++
	}
	if s.showServer {
		visiblePanelCount++
	}
	if s.showAgent {
		visiblePanelCount++
	}
	if s.showNotifs {
		visiblePanelCount++
	}

	if visiblePanelCount == 0 {
		// No panels enabled
		return lipgloss.NewStyle().
			Width(s.width).
			Height(s.height).
			Background(theme.Background).
			Border(lipgloss.RoundedBorder()).
			BorderForeground(theme.Border).
			Align(lipgloss.Center, lipgloss.Center).
			Render(
				lipgloss.NewStyle().
					Foreground(theme.Muted).
					Render("Sidebar hidden\nPress Ctrl+S/L/V/A/N\nto show panels"),
			)
	}

	// Calculate panel height
	borderSpace := visiblePanelCount * 3 // Account for borders
	availableHeight := s.height - borderSpace
	if availableHeight < visiblePanelCount {
		availableHeight = visiblePanelCount * 3
	}
	panelHeight := availableHeight / visiblePanelCount
	if panelHeight < 3 {
		panelHeight = 3
	}

	// Add panels that are enabled (don't check IsVisible - panels are always visible if enabled)
	if s.showStatus {
		s.statusPanel.SetSize(s.width, panelHeight+3)
		panels = append(panels, s.statusPanel.View())
	}

	if s.showLogs {
		s.logsPanel.SetSize(s.width, panelHeight+3)
		panels = append(panels, s.logsPanel.View())
	}

	if s.showServer {
		s.serverPanel.SetSize(s.width, panelHeight+3)
		panels = append(panels, s.serverPanel.View())
	}

	if s.showAgent {
		s.agentPanel.SetSize(s.width, panelHeight+3)
		panels = append(panels, s.agentPanel.View())
	}

	if s.showNotifs {
		s.notifPanel.SetSize(s.width, panelHeight+3)
		panels = append(panels, s.notifPanel.View())
	}

	// Join panels and apply consistent background
	sidebarContent := lipgloss.JoinVertical(lipgloss.Left, panels...)

	return lipgloss.NewStyle().
		Width(s.width).
		Height(s.height).
		Background(theme.Background).
		Render(sidebarContent)
}

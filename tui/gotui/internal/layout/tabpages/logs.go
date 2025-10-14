package tabpages

import (
	"gotui/internal/layout/panels"
	"gotui/internal/styles"
	"gotui/internal/wsclient"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"
)

// LogsPage renders the logs tab by composing the various sidebar panels.
type LogsPage struct {
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

	// Panel visibility toggles
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

// NewLogsPage builds a new logs tab page backed by the shared panels.
func NewLogsPage(wsClient *wsclient.Client, host string, port int) *LogsPage {
	return &LogsPage{
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

// SetSize updates the layout dimensions for the logs page.
func (p *LogsPage) SetSize(width, height int) {
	p.width = width
	p.height = height

	if width == 0 {
		return
	}

	visible := 0
	if p.showStatus {
		visible++
	}
	if p.showLogs {
		visible++
	}
	if p.showServer {
		visible++
	}
	if p.showAgent {
		visible++
	}
	if p.showNotifs {
		visible++
	}
	if visible == 0 {
		visible = 1
	}

	panelHeight := height / visible
	if panelHeight < 5 {
		panelHeight = 5
	}

	p.statusPanel.SetSize(width, panelHeight)
	p.logsPanel.SetSize(width, panelHeight)
	p.serverPanel.SetSize(width, panelHeight)
	p.agentPanel.SetSize(width, panelHeight)
	p.notifPanel.SetSize(width, panelHeight)
}

// SetRetryInfo updates retry metadata for the connection panel.
func (p *LogsPage) SetRetryInfo(count int, retrying bool, lastError string) {
	p.retryCount = count
	p.isRetrying = retrying
	p.lastError = lastError
}

// ConnectionPanel exposes the underlying connection panel.
func (p *LogsPage) ConnectionPanel() *panels.ConnectionPanel { return p.statusPanel }

// LogsPanel exposes the general logs panel for external logging.
func (p *LogsPage) LogsPanel() *panels.LogsPanel { return p.logsPanel }

// ServerLogsPanel exposes the server log panel.
func (p *LogsPage) ServerLogsPanel() *panels.LogsPanel { return p.serverPanel }

// AgentPanel exposes the agent information panel.
func (p *LogsPage) AgentPanel() *panels.AgentPanel { return p.agentPanel }

// NotificationsPanel exposes the notifications panel.
func (p *LogsPage) NotificationsPanel() *panels.NotificationsPanel { return p.notifPanel }

// ToggleStatus toggles the connection panel visibility.
func (p *LogsPage) ToggleStatus() {
	p.showStatus = !p.showStatus
	p.statusPanel.SetVisible(p.showStatus)
}

// ToggleLogs toggles the general logs panel visibility.
func (p *LogsPage) ToggleLogs() {
	p.showLogs = !p.showLogs
	p.logsPanel.SetVisible(p.showLogs)
}

// ToggleServer toggles the server logs panel visibility.
func (p *LogsPage) ToggleServer() {
	p.showServer = !p.showServer
	p.serverPanel.SetVisible(p.showServer)
}

// ToggleAgent toggles the agent panel visibility.
func (p *LogsPage) ToggleAgent() {
	p.showAgent = !p.showAgent
	p.agentPanel.SetVisible(p.showAgent)
}

// ToggleNotifications toggles the notifications panel visibility.
func (p *LogsPage) ToggleNotifications() {
	p.showNotifs = !p.showNotifs
	p.notifPanel.SetVisible(p.showNotifs)
}

// Update forwards messages to the underlying panels.
func (p *LogsPage) Update(msg tea.Msg) tea.Cmd {
	var cmds []tea.Cmd
	cmds = append(cmds, p.statusPanel.Update(msg))
	cmds = append(cmds, p.logsPanel.Update(msg))
	cmds = append(cmds, p.serverPanel.Update(msg))
	cmds = append(cmds, p.agentPanel.Update(msg))
	cmds = append(cmds, p.notifPanel.Update(msg))
	return tea.Batch(cmds...)
}

// View renders the logs page content.
func (p *LogsPage) View() string {
	theme := styles.CurrentTheme()

	p.statusPanel.SetRetryInfo(p.retryCount, p.isRetrying, p.lastError)

	visiblePanels := 0
	if p.showStatus {
		visiblePanels++
	}
	if p.showLogs {
		visiblePanels++
	}
	if p.showServer {
		visiblePanels++
	}
	if p.showAgent {
		visiblePanels++
	}
	if p.showNotifs {
		visiblePanels++
	}

	if visiblePanels == 0 {
		return lipgloss.NewStyle().
			Width(p.width).
			Height(p.height).
			Border(lipgloss.RoundedBorder()).
			BorderForeground(theme.Border).
			Align(lipgloss.Center, lipgloss.Center).
			Render(lipgloss.NewStyle().
				Foreground(theme.Muted).
				Render("Sidebar hidden\nPress Ctrl+S/L/V/A/N\nto show panels"),
			)
	}

	borderSpace := visiblePanels * 3
	available := p.height - borderSpace
	if available < visiblePanels {
		available = visiblePanels * 3
	}
	panelHeight := available / visiblePanels
	if panelHeight < 3 {
		panelHeight = 3
	}

	var blocks []string

	if p.showStatus {
		p.statusPanel.SetSize(p.width, panelHeight+3)
		blocks = append(blocks, p.statusPanel.View())
	}
	if p.showLogs {
		p.logsPanel.SetSize(p.width, panelHeight+3)
		blocks = append(blocks, p.logsPanel.View())
	}
	if p.showServer {
		p.serverPanel.SetSize(p.width, panelHeight+3)
		blocks = append(blocks, p.serverPanel.View())
	}
	if p.showAgent {
		p.agentPanel.SetSize(p.width, panelHeight+3)
		blocks = append(blocks, p.agentPanel.View())
	}
	if p.showNotifs {
		p.notifPanel.SetSize(p.width, panelHeight+3)
		blocks = append(blocks, p.notifPanel.View())
	}

	content := lipgloss.JoinVertical(lipgloss.Left, blocks...)

	return lipgloss.NewStyle().
		Width(p.width).
		Height(p.height).
		Render(content)
}

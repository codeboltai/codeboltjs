package panels

import (
	"fmt"
	"strings"
	"time"

	"gotui/internal/components/panel"
	"gotui/internal/wsclient"

	tea "github.com/charmbracelet/bubbletea/v2"
)

// ConnectionPanel renders connection status and retry information
type ConnectionPanel struct {
	panel      *panel.Panel
	wsClient   *wsclient.Client
	host       string
	port       int
	retryCount int
	isRetrying bool
	lastError  string
}

func NewConnection(wsClient *wsclient.Client, host string, port int) *ConnectionPanel {
	return &ConnectionPanel{
		panel:    panel.New("Connection"),
		wsClient: wsClient,
		host:     host,
		port:     port,
	}
}

func (c *ConnectionPanel) SetSize(width, height int)  { c.panel.SetSize(width, height) }
func (c *ConnectionPanel) SetVisible(visible bool)    { c.panel.SetVisible(visible) }
func (c *ConnectionPanel) IsVisible() bool            { return c.panel.IsVisible() }
func (c *ConnectionPanel) SetActive(active bool)      { c.panel.SetActive(active) }
func (c *ConnectionPanel) Update(msg tea.Msg) tea.Cmd { return c.panel.Update(msg) }

func (c *ConnectionPanel) SetRetryInfo(count int, retrying bool, lastError string) {
	c.retryCount = count
	c.isRetrying = retrying
	c.lastError = lastError
}

func (c *ConnectionPanel) View() string {
	// Rebuild content dynamically on each render
	c.panel.Clear()

	// Header
	c.panel.AddLine("═══ CONNECTION ═══")
	c.panel.AddLine("")

	// Connection info
	c.panel.AddLine(fmt.Sprintf("🖥️  Host: %s", c.host))
	c.panel.AddLine(fmt.Sprintf("🔌 Port: %d", c.port))
	c.panel.AddLine("")

	// Connection status
	if c.wsClient != nil && c.wsClient.IsConnected() {
		c.panel.AddLine("🟢 Status: Connected")
		c.panel.AddLine("⚡ WebSocket: Active")
	} else {
		c.panel.AddLine("🔴 Status: Disconnected")
		c.panel.AddLine("💔 WebSocket: Inactive")
	}

	c.panel.AddLine("")

	// Retry information
	if c.isRetrying {
		c.panel.AddLine("🔄 Retrying connection...")
		c.panel.AddLine(fmt.Sprintf("🔁 Attempt: %d/60", c.retryCount))
	} else if c.retryCount > 0 && (c.wsClient == nil || !c.wsClient.IsConnected()) {
		c.panel.AddLine("❌ Connection failed")
		c.panel.AddLine(fmt.Sprintf("💔 Failed: %d/60 attempts", c.retryCount))
		c.panel.AddLine("🔄 Press Ctrl+R to retry")
	} else {
		c.panel.AddLine("⏳ Ready for commands")
	}

	// Last error
	if c.lastError != "" && (c.wsClient == nil || !c.wsClient.IsConnected()) {
		c.panel.AddLine("")
		c.panel.AddLine("Last Error:")
		for _, line := range strings.Split(c.lastError, "\n") {
			c.panel.AddLine(line)
		}
	}

	// Last update time
	c.panel.AddLine("")
	c.panel.AddLine(fmt.Sprintf("Updated: %s", time.Now().Format("15:04:05")))

	return c.panel.View()
}

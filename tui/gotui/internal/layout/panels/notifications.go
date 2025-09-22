package panels

import (
	"time"

	"gotui/internal/components/panel"

	tea "github.com/charmbracelet/bubbletea/v2"
)

// NotificationsPanel shows server notifications
type NotificationsPanel struct{ panel *panel.Panel }

func NewNotifications() *NotificationsPanel {
	return &NotificationsPanel{panel: panel.New("Notifications")}
}

func (p *NotificationsPanel) SetSize(w, h int)           { p.panel.SetSize(w, h) }
func (p *NotificationsPanel) SetVisible(v bool)          { p.panel.SetVisible(v) }
func (p *NotificationsPanel) IsVisible() bool            { return p.panel.IsVisible() }
func (p *NotificationsPanel) SetActive(a bool)           { p.panel.SetActive(a) }
func (p *NotificationsPanel) Update(msg tea.Msg) tea.Cmd { return p.panel.Update(msg) }
func (p *NotificationsPanel) AddLine(s string)           { p.panel.AddLine(s) }
func (p *NotificationsPanel) View() string               { return p.panel.View() }

// Helper to add timestamped lines if needed elsewhere
func (p *NotificationsPanel) AddTimestamped(s string) {
	p.panel.AddLine(time.Now().Format("15:04:05") + " " + s)
}

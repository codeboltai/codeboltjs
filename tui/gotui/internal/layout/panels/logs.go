package panels

import (
	"gotui/internal/components/panel"

	tea "github.com/charmbracelet/bubbletea/v2"
)

// LogsPanel wraps a generic panel for general logs
type LogsPanel struct{ panel *panel.Panel }

func NewLogs(title string) *LogsPanel { return &LogsPanel{panel: panel.New(title)} }

func (p *LogsPanel) SetSize(w, h int)           { p.panel.SetSize(w, h) }
func (p *LogsPanel) SetVisible(v bool)          { p.panel.SetVisible(v) }
func (p *LogsPanel) IsVisible() bool            { return p.panel.IsVisible() }
func (p *LogsPanel) SetActive(a bool)           { p.panel.SetActive(a) }
func (p *LogsPanel) Update(msg tea.Msg) tea.Cmd { return p.panel.Update(msg) }
func (p *LogsPanel) AddLine(s string)           { p.panel.AddLine(s) }
func (p *LogsPanel) View() string               { return p.panel.View() }

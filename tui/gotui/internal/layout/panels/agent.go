package panels

import (
	"gotui/internal/components/uicomponents/panel"

	tea "github.com/charmbracelet/bubbletea/v2"
)

// AgentPanel wraps a panel for agent-specific logs
type AgentPanel struct{ panel *panel.Panel }

func NewAgent() *AgentPanel { return &AgentPanel{panel: panel.New("Agent Logs")} }

func (p *AgentPanel) SetSize(w, h int)           { p.panel.SetSize(w, h) }
func (p *AgentPanel) SetVisible(v bool)          { p.panel.SetVisible(v) }
func (p *AgentPanel) IsVisible() bool            { return p.panel.IsVisible() }
func (p *AgentPanel) SetActive(a bool)           { p.panel.SetActive(a) }
func (p *AgentPanel) Update(msg tea.Msg) tea.Cmd { return p.panel.Update(msg) }
func (p *AgentPanel) AddLine(s string)           { p.panel.AddLine(s) }
func (p *AgentPanel) View() string               { return p.panel.View() }

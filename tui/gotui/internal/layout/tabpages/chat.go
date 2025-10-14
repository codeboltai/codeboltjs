package tabpages

import (
	"gotui/internal/components/chat"
	"gotui/internal/layout/panels"
	"gotui/internal/styles"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"
)

// ChatPage composes the chat component with its supporting sidebar panels.
type ChatPage struct {
	chat *chat.Chat

	subagentsPanel *panels.InfoPanel
	todoPanel      *panels.InfoPanel
	mcpPanel       *panels.InfoPanel
	modifiedPanel  *panels.InfoPanel
	nextTasksPanel *panels.InfoPanel
	contextPanel   *panels.InfoPanel
}

// NewChatPage constructs a chat page with default sidebar panels.
func NewChatPage() *ChatPage {
	chatComp := chat.New()

	p := &ChatPage{
		chat:           chatComp,
		subagentsPanel: panels.NewInfoPanel("Subagents"),
		todoPanel:      panels.NewInfoPanel("Todo"),
		mcpPanel:       panels.NewInfoPanel("MCP"),
		modifiedPanel:  panels.NewInfoPanel("Modified Files"),
		nextTasksPanel: panels.NewInfoPanel("Next Scheduled Tasks"),
		contextPanel:   panels.NewInfoPanel("Context"),
	}

	p.chat.SetRightSidebarPanels(
		p.subagentsPanel,
		p.todoPanel,
		p.mcpPanel,
		p.modifiedPanel,
		p.nextTasksPanel,
		p.contextPanel,
	)

	p.seedRightSidebarDefaults()

	return p
}

// Chat exposes the underlying chat component.
func (p *ChatPage) Chat() *chat.Chat {
	return p.chat
}

// SetSize forwards sizing to the chat component.
func (p *ChatPage) SetSize(width, height int) {
	if p.chat == nil {
		return
	}
	p.chat.SetSize(width, height)
}

// Update forwards messages to the chat component and retains the updated pointer.
func (p *ChatPage) Update(msg tea.Msg) tea.Cmd {
	if p.chat == nil {
		return nil
	}
	var cmd tea.Cmd
	p.chat, cmd = p.chat.Update(msg)
	return cmd
}

// View renders the chat page content.
func (p *ChatPage) View() string {
	if p.chat == nil {
		return ""
	}
	return p.chat.View()
}

// seedRightSidebarDefaults populates placeholder data for sidebar panels.
func (p *ChatPage) seedRightSidebarDefaults() {
	if p == nil {
		return
	}

	theme := styles.CurrentTheme()
	muted := lipgloss.NewStyle().Foreground(theme.Muted)
	success := lipgloss.NewStyle().Foreground(theme.Success)
	errorStyle := lipgloss.NewStyle().Foreground(theme.Error)

	if p.subagentsPanel != nil {
		p.subagentsPanel.SetLines([]string{muted.Render("• No subagents running")})
	}
	if p.todoPanel != nil {
		p.todoPanel.SetLines([]string{
			"[ ] Draft plan",
			"[ ] Implement feature",
			"[ ] Review changes",
		})
	}
	if p.mcpPanel != nil {
		p.mcpPanel.SetLines([]string{
			success.Render("weather: connected"),
			errorStyle.Render("puppeteer: disconnected"),
		})
	}
	if p.modifiedPanel != nil {
		p.modifiedPanel.SetLines([]string{muted.Render("(none)")})
	}
	if p.nextTasksPanel != nil {
		p.nextTasksPanel.SetLines([]string{muted.Render("No upcoming tasks")})
	}
	if p.contextPanel != nil {
		p.contextPanel.SetLines([]string{"Tokens: 0 / 128K", "Uptime: 0m"})
	}
}

// Focus requests focus for the chat input.
func (p *ChatPage) Focus() tea.Cmd {
	if p.chat == nil {
		return nil
	}
	return p.chat.Focus()
}

// Blur blurs the chat input.
func (p *ChatPage) Blur() {
	if p.chat == nil {
		return
	}
	p.chat.Blur()
}

// IsFocused returns whether the chat input is focused.
func (p *ChatPage) IsFocused() bool {
	if p.chat == nil {
		return false
	}
	return p.chat.IsFocused()
}

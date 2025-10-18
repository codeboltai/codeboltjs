package dialogs

import (
	"strings"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"

	"gotui/internal/stores"
	"gotui/internal/styles"
)

// AgentPicker renders a dialog for selecting agents provided by the AgentStore.
type AgentPicker struct {
	store       *stores.AgentStore
	unsubscribe func()
	agents      []stores.AgentOption
	visible     bool
	selected    int
}

// NewAgentPicker constructs a picker optionally bound to the supplied store.
func NewAgentPicker(store *stores.AgentStore) *AgentPicker {
	picker := &AgentPicker{}
	picker.BindStore(store)
	return picker
}

// BindStore attaches the picker to the shared agent store so it stays in sync.
func (p *AgentPicker) BindStore(store *stores.AgentStore) {
	if p == nil {
		return
	}
	if p.unsubscribe != nil {
		p.unsubscribe()
		p.unsubscribe = nil
	}
	p.store = store
	if store != nil {
		p.agents = store.Agents()
		p.unsubscribe = store.Subscribe(func(options []stores.AgentOption) {
			p.SetAgents(options)
		})
	} else {
		p.agents = nil
	}
	if p.selected >= len(p.agents) {
		p.selected = 0
	}
}

// SetAgents replaces the picker options and keeps the current selection valid.
func (p *AgentPicker) SetAgents(options []stores.AgentOption) {
	if p == nil {
		return
	}
	nextOptions := make([]stores.AgentOption, len(options))
	copy(nextOptions, options)
	p.agents = nextOptions
	if p.selected >= len(p.agents) {
		p.selected = 0
	}
}

// Open displays the picker.
func (p *AgentPicker) Open() {
	if p == nil {
		return
	}
	if !p.visible {
		p.selected = 0
	}
	p.visible = true
}

// Close hides the picker dialog.
func (p *AgentPicker) Close() {
	if p == nil {
		return
	}
	p.visible = false
}

// IsVisible reports whether the picker is currently displayed.
func (p *AgentPicker) IsVisible() bool {
	return p != nil && p.visible
}

// HandleKey processes key events while the picker is visible.
func (p *AgentPicker) HandleKey(msg tea.KeyPressMsg) (handled bool, option stores.AgentOption, applyDefault bool, ok bool) {
	if p == nil || !p.visible {
		return false, stores.AgentOption{}, false, false
	}

	switch msg.String() {
	case "esc":
		p.Close()
		return true, stores.AgentOption{}, false, false
	case "cmd+enter", "ctrl+enter":
		if len(p.agents) == 0 {
			p.Close()
			return true, stores.AgentOption{}, false, false
		}
		opt := p.agents[p.selected]
		p.Close()
		return true, opt, true, true
	case "enter":
		if len(p.agents) == 0 {
			p.Close()
			return true, stores.AgentOption{}, false, false
		}
		opt := p.agents[p.selected]
		p.Close()
		return true, opt, false, true
	case "down", "ctrl+n":
		p.move(1)
		return true, stores.AgentOption{}, false, false
	case "up", "ctrl+p":
		p.move(-1)
		return true, stores.AgentOption{}, false, false
	case "pgdown":
		p.move(3)
		return true, stores.AgentOption{}, false, false
	case "pgup":
		p.move(-3)
		return true, stores.AgentOption{}, false, false
	case "shift+tab":
		p.move(-1)
		return true, stores.AgentOption{}, false, false
	}

	return false, stores.AgentOption{}, false, false
}

func (p *AgentPicker) move(delta int) {
	if len(p.agents) == 0 {
		return
	}
	maxIndex := len(p.agents)
	p.selected = (p.selected + delta + maxIndex) % maxIndex
}

// View renders the picker dialog if visible.
func (p *AgentPicker) View(width, height int) string {
	panel, ok := p.dialogPanel(width)
	if !ok || height <= 0 {
		return ""
	}

	overlay := lipgloss.Place(width, height, lipgloss.Center, lipgloss.Center, panel,
		lipgloss.WithWhitespaceChars(" "))
	return lipgloss.NewStyle().
		Width(width).
		Height(height).
		Render(overlay)
}

// Layer renders as an overlay layer for the chat canvas.
func (p *AgentPicker) Layer(width, height int) *lipgloss.Layer {
	panel, ok := p.dialogPanel(width)
	if !ok || height <= 0 {
		return nil
	}
	return WrapLayer(panel, width, height)
}

func (p *AgentPicker) dialogPanel(width int) (string, bool) {
	if p == nil || !p.visible || width <= 0 {
		return "", false
	}

	theme := styles.CurrentTheme()

	minPanel := 44
	maxPanel := width - 6
	if maxPanel < minPanel {
		maxPanel = minPanel
	}
	desiredPanel := width - 12
	if desiredPanel < minPanel {
		desiredPanel = minPanel
	}
	panelWidth := clamp(desiredPanel, minPanel, maxPanel)
	if panelWidth >= width {
		panelWidth = width - 4
		if panelWidth < minPanel {
			panelWidth = minPanel
		}
	}
	if panelWidth <= 0 {
		panelWidth = width
	}

	paddingX := 4
	contentWidth := panelWidth - (paddingX * 2)
	if contentWidth < 32 {
		contentWidth = panelWidth - 2
	}

	headerTitle := lipgloss.NewStyle().
		Foreground(lipgloss.Color(theme.Primary.Hex())).
		Bold(true).
		Padding(0, 3).
		Render("Agent Palette")
	headerHint := lipgloss.NewStyle().
		Foreground(lipgloss.Color(theme.Muted.Hex())).
		Padding(0, 1).
		Render("Use ↑ ↓ to navigate • Enter to apply to chat • Cmd/Ctrl+Enter default • Esc to cancel")

	header := lipgloss.JoinVertical(lipgloss.Left, headerTitle, headerHint, "")

	rows := p.renderOptions(contentWidth)
	body := lipgloss.JoinVertical(lipgloss.Left, rows...)

	actions := p.renderActions(contentWidth)
	body = lipgloss.JoinVertical(lipgloss.Left, body, actions)

	panel := lipgloss.NewStyle().
		Width(panelWidth).
		BorderStyle(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color(theme.Border.Hex())).
		Padding(2, paddingX).
		Render(lipgloss.JoinVertical(lipgloss.Left, header, body))

	return panel, true
}

func (p *AgentPicker) renderOptions(width int) []string {
	if len(p.agents) == 0 {
		theme := styles.CurrentTheme()
		empty := lipgloss.NewStyle().
			Width(width).
			Foreground(lipgloss.Color(theme.Muted.Hex())).
			Padding(1, 2).
			Align(lipgloss.Center, lipgloss.Center).
			Render("No agents available")
		return []string{empty}
	}

	rows := make([]string, 0, len(p.agents)*2)
	for i, agent := range p.agents {
		rows = append(rows, p.renderAgent(agent, i == p.selected, width))
		if i < len(p.agents)-1 {
			divider := lipgloss.NewStyle().
				Foreground(lipgloss.Color(styles.CurrentTheme().Border.Hex())).
				Width(width).
				Render(strings.Repeat("─", max(12, width-2)))
			rows = append(rows, divider)
		}
	}
	return rows
}

func (p *AgentPicker) renderActions(width int) string {
	if width <= 0 {
		return ""
	}
	theme := styles.CurrentTheme()
	buttonStyle := lipgloss.NewStyle().
		Padding(0, 2).
		BorderStyle(lipgloss.NormalBorder()).
		BorderForeground(lipgloss.Color(theme.SurfaceHigh.Hex())).
		Foreground(lipgloss.Color(theme.Foreground.Hex()))

	primary := buttonStyle.Copy().
		BorderForeground(lipgloss.Color(theme.Primary.Hex())).
		Foreground(lipgloss.Color(theme.Primary.Hex())).
		Render("Apply to this chat ↵")
	secondary := buttonStyle.Render("Apply as default ⌘↵ / Ctrl+↵")

	row := lipgloss.JoinHorizontal(lipgloss.Left, primary, "  ", secondary)
	return lipgloss.NewStyle().
		Width(width).
		PaddingTop(1).
		Render(row)
}

func (p *AgentPicker) renderAgent(opt stores.AgentOption, selected bool, width int) string {
	theme := styles.CurrentTheme()
	nameStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color("#d7ffae")).
		Bold(true)
	metaStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color(theme.Muted.Hex()))

	head := nameStyle.Render(opt.Name)

	descText := strings.TrimSpace(opt.Description)
	if descText != "" {
		descText = metaStyle.Copy().Width(width - 8).Render(descText)
	}

	cardWidth := width - 4
	if cardWidth < 28 {
		cardWidth = width - 2
	}

	sections := []string{head}
	if descText != "" {
		sections = append(sections, descText)
	}

	cardStyle := lipgloss.NewStyle().
		Width(cardWidth).
		Padding(1, 2)

	indicator := lipgloss.NewStyle().Foreground(lipgloss.Color(theme.Muted.Hex())).Render("  ")
	container := lipgloss.NewStyle().Width(width).Padding(1, 1)

	if selected {
		indicator = lipgloss.NewStyle().Foreground(lipgloss.Color(theme.Accent.Hex())).Render("➤ ")
		cardStyle = cardStyle.
			BorderStyle(lipgloss.RoundedBorder()).
			BorderForeground(lipgloss.Color(theme.Primary.Hex())).
			Foreground(lipgloss.Color(theme.Foreground.Hex()))
	} else {
		cardStyle = cardStyle.
			BorderStyle(lipgloss.NormalBorder()).
			BorderForeground(lipgloss.Color(theme.SurfaceHigh.Hex()))
	}

	cardContent := lipgloss.JoinVertical(lipgloss.Left, sections...)
	card := cardStyle.Render(cardContent)
	row := lipgloss.JoinHorizontal(lipgloss.Top, indicator, card)
	return container.Render(row)
}

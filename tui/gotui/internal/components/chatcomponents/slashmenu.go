package chatcomponents

import (
	"strings"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"

	"gotui/internal/components/dialogs"
	"gotui/internal/styles"
)

type SlashMenu struct {
	commands []SlashCommand
	visible  bool
	filter   string
	selected int
	maxItems int
}

func NewSlashMenu(commands []SlashCommand) *SlashMenu {
	return &SlashMenu{
		commands: commands,
		maxItems: len(commands),
	}
}

func (m *SlashMenu) IsVisible() bool {
	return m.visible
}

func (m *SlashMenu) Open() {
	if !m.visible {
		m.selected = 0
	}
	m.visible = true
}

func (m *SlashMenu) Close() {
	m.visible = false
	m.filter = ""
	m.selected = 0
}

// SetMaxItems limits how many commands are rendered at once (0 means no limit).
func (m *SlashMenu) SetMaxItems(max int) {
	if max < 0 {
		max = 0
	}
	m.maxItems = max
}

func (m *SlashMenu) SetFilter(filter string) {
	filter = strings.ToLower(filter)
	if m.filter == filter {
		return
	}
	m.filter = filter
	if m.selected >= len(m.filtered()) {
		m.selected = 0
	}
}

func (m *SlashMenu) filtered() []SlashCommand {
	if m.filter == "" {
		return m.commands
	}
	var result []SlashCommand
	for _, cmd := range m.commands {
		name := strings.ToLower(cmd.Name)
		desc := strings.ToLower(cmd.Description)
		if strings.HasPrefix(name, m.filter) || strings.Contains(desc, m.filter) {
			result = append(result, cmd)
		}
	}
	return result
}

func (m *SlashMenu) moveSelection(delta int) {
	items := m.filtered()
	if len(items) == 0 {
		m.selected = 0
		return
	}
	m.selected = (m.selected + delta + len(items)) % len(items)
}

func (m *SlashMenu) selection() *SlashCommand {
	items := m.filtered()
	if len(items) == 0 {
		return nil
	}
	if m.selected < 0 || m.selected >= len(items) {
		m.selected = 0
	}
	return &items[m.selected]
}

func (m *SlashMenu) HandleKey(msg tea.KeyPressMsg) (handled bool, selected SlashCommand, ok bool) {
	if !m.visible {
		return false, SlashCommand{}, false
	}

	switch msg.String() {
	case "esc":
		m.Close()
		return true, SlashCommand{}, false
	case "enter", "tab":
		if sel := m.selection(); sel != nil {
			selected = *sel
			ok = true
		}
		m.Close()
		return true, selected, ok
	case "down", "ctrl+n":
		m.moveSelection(1)
		return true, SlashCommand{}, false
	case "up", "ctrl+p":
		m.moveSelection(-1)
		return true, SlashCommand{}, false
	case "pgdown":
		m.moveSelection(3)
		return true, SlashCommand{}, false
	case "pgup":
		m.moveSelection(-3)
		return true, SlashCommand{}, false
	case "shift+tab":
		m.moveSelection(-1)
		return true, SlashCommand{}, false
	}

	return false, SlashCommand{}, false
}

func (m *SlashMenu) View(width int) string {
	panel, ok := m.dialogPanel(width)
	if !ok {
		return ""
	}
	return panel
}

// Layer renders the slash menu as an overlay layer so the background remains visible.
func (m *SlashMenu) Layer(width, height int) *lipgloss.Layer {
	panel, ok := m.dialogPanel(width)
	if !ok || height <= 0 {
		return nil
	}
	return dialogs.WrapLayer(panel, width, height)
}

func (m *SlashMenu) dialogPanel(width int) (string, bool) {
	if !m.visible || width <= 0 {
		return "", false
	}

	panelWidth := width
	if panelWidth > 80 {
		panelWidth = 80
	}

	items := m.filtered()
	inner := innerWidth(panelWidth)

	if len(items) == 0 {
		panel := m.renderContainer(panelWidth, []string{m.renderMessage("No matching commands", inner)})
		return panel, true
	}

	limit := len(items)
	if m.maxItems > 0 && limit > m.maxItems {
		limit = m.maxItems
	}

	rows := make([]string, 0, limit)
	for i := 0; i < limit; i++ {
		rows = append(rows, m.renderItem(items[i], i == m.selected, inner))
	}

	return m.renderContainer(panelWidth, rows), true
}

func (m *SlashMenu) renderContainer(width int, rows []string) string {
	theme := styles.CurrentTheme()
	content := lipgloss.JoinVertical(lipgloss.Left, rows...)
	style := lipgloss.NewStyle().
		Padding(1, 1).
		Border(lipgloss.RoundedBorder()).
		BorderForeground(theme.Primary)
		// Background(theme.SurfaceHigh)
	if width > 0 {
		style = style.Width(width)
	}
	return style.Render(content)
}

func (m *SlashMenu) renderItem(cmd SlashCommand, selected bool, width int) string {
	theme := styles.CurrentTheme()
	nameStyle := lipgloss.NewStyle().Foreground(theme.Foreground).Bold(true)
	descStyle := lipgloss.NewStyle().Foreground(theme.Muted)
	headline := lipgloss.JoinHorizontal(lipgloss.Left,
		nameStyle.Render("/"+cmd.Name),
		lipgloss.NewStyle().Render("  "),
		descStyle.Render(cmd.Description),
	)
	usageLine := ""
	if cmd.Usage != "" {
		usageLine = lipgloss.NewStyle().
			Foreground(theme.Secondary).
			Italic(true).
			Render(cmd.Usage)
	}
	content := headline
	if usageLine != "" {
		content = lipgloss.JoinVertical(lipgloss.Left, headline, usageLine)
	}
	rowPadding := lipgloss.NewStyle().Padding(0, 2)
	if width > 0 {
		rowPadding = rowPadding.Width(width)
	}
	arrow := lipgloss.NewStyle().Foreground(theme.Muted).Render("  ")
	if selected {
		arrow = lipgloss.NewStyle().
			Foreground(theme.Background).
			// Background(theme.Accent).
			Padding(0, 1).
			Render("➤")
		rowPadding = rowPadding.
			Foreground(theme.Background)
		// Background(theme.Primary)
	} else {
		arrow = lipgloss.NewStyle().Foreground(theme.Muted).Render("  ")
		rowPadding = rowPadding.
			Foreground(theme.Foreground)
		// Background(theme.Surface)
	}
	row := lipgloss.JoinHorizontal(lipgloss.Left, arrow, content)
	return rowPadding.Render(row)
}

func (m *SlashMenu) renderMessage(msg string, width int) string {
	style := lipgloss.NewStyle().Padding(0, 1)
	if width > 0 {
		style = style.Width(width)
	}
	return style.Render(msg)
}

func innerWidth(width int) int {
	if width <= 0 {
		return 0
	}
	inner := width - 2
	if inner < 1 {
		inner = 1
	}
	return inner
}

// Commands returns a copy of the registered slash commands
func (m *SlashMenu) Commands() []SlashCommand {
	cmds := make([]SlashCommand, len(m.commands))
	copy(cmds, m.commands)
	return cmds
}

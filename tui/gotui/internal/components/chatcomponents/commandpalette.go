package chatcomponents

import (
	"strings"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"

	"gotui/internal/components/dialogs"
	"gotui/internal/styles"
)

type CommandPaletteItem struct {
	Command SlashCommand
}

type CommandPalette struct {
	items    []CommandPaletteItem
	visible  bool
	selected int
	filter   string
}

func NewCommandPalette(commands []SlashCommand) *CommandPalette {
	items := make([]CommandPaletteItem, len(commands))
	for i, cmd := range commands {
		items[i] = CommandPaletteItem{Command: cmd}
	}
	return &CommandPalette{items: items}
}

func (p *CommandPalette) UpdateCommands(commands []SlashCommand) {
	items := make([]CommandPaletteItem, len(commands))
	for i, cmd := range commands {
		items[i] = CommandPaletteItem{Command: cmd}
	}
	p.items = items
	if p.selected >= len(p.filtered()) {
		p.selected = 0
	}
}

func (p *CommandPalette) Open() {
	if !p.visible {
		p.selected = 0
		p.filter = ""
	}
	p.visible = true
}

func (p *CommandPalette) Close() {
	p.visible = false
	p.filter = ""
	p.selected = 0
}

func (p *CommandPalette) IsVisible() bool {
	return p.visible
}

func (p *CommandPalette) HandleKey(msg tea.KeyPressMsg) (handled bool, command SlashCommand, ok bool) {
	if !p.visible {
		return false, SlashCommand{}, false
	}

	switch msg.String() {
	case "esc":
		p.Close()
		return true, SlashCommand{}, false
	case "backspace":
		if len(p.filter) > 0 {
			p.filter = p.filter[:len(p.filter)-1]
			if p.selected >= len(p.filtered()) {
				p.selected = 0
			}
		}
		return true, SlashCommand{}, false
	case "enter":
		items := p.filtered()
		if len(items) == 0 {
			return true, SlashCommand{}, false
		}
		p.Close()
		return true, items[p.selected].Command, true
	case "tab", "shift+tab":
		return true, SlashCommand{}, false
	case "down", "ctrl+n":
		p.move(1)
		return true, SlashCommand{}, false
	case "up", "ctrl+p":
		p.move(-1)
		return true, SlashCommand{}, false
	case "pgdown":
		p.move(3)
		return true, SlashCommand{}, false
	case "pgup":
		p.move(-3)
		return true, SlashCommand{}, false
	}

	if s := msg.String(); s != "" {
		runes := []rune(s)
		if len(runes) == 1 && runes[0] >= ' ' {
			p.filter += s
			if p.selected >= len(p.filtered()) {
				p.selected = 0
			}
			return true, SlashCommand{}, false
		}
	}

	return false, SlashCommand{}, false
}

func (p *CommandPalette) move(delta int) {
	items := p.filtered()
	if len(items) == 0 {
		p.selected = 0
		return
	}
	p.selected = (p.selected + delta + len(items)) % len(items)
}

func (p *CommandPalette) filtered() []CommandPaletteItem {
	if p.filter == "" {
		return p.items
	}
	lower := strings.ToLower(p.filter)
	var filtered []CommandPaletteItem
	for _, item := range p.items {
		if strings.Contains(strings.ToLower("/"+item.Command.Name), lower) ||
			strings.Contains(strings.ToLower(item.Command.Description), lower) ||
			strings.Contains(strings.ToLower(item.Command.Usage), lower) {
			filtered = append(filtered, item)
		}
	}
	return filtered
}

func (p *CommandPalette) View(width, height int) string {
	panel, ok := p.dialogPanel(width)
	if !ok || height <= 0 {
		return ""
	}
	return dialogs.Wrap(panel, width, height)
}

// Layer returns the palette rendered as a dialog layer so the background remains visible.
func (p *CommandPalette) Layer(width, height int) *lipgloss.Layer {
	panel, ok := p.dialogPanel(width)
	if !ok || height <= 0 {
		return nil
	}
	return dialogs.WrapLayer(panel, width, height)
}

func (p *CommandPalette) dialogPanel(width int) (string, bool) {
	if !p.visible || width <= 0 {
		return "", false
	}

	theme := styles.CurrentTheme()

	panelWidth := clamp(width/2, 50, width-10)
	inputStyle := lipgloss.NewStyle().
		Foreground(theme.Foreground).
		Border(lipgloss.NormalBorder()).
		BorderForeground(theme.SurfaceHigh).
		Padding(0, 1).
		Width(panelWidth - 4)
	input := inputStyle.Render("/" + p.filter)

	items := p.filtered()
	var rows []string
	for i, item := range items {
		row := p.renderItem(item.Command, i == p.selected, panelWidth-4)
		rows = append(rows, row)
		if i >= 9 {
			break
		}
	}
	if len(rows) == 0 {
		rows = append(rows, lipgloss.NewStyle().Foreground(theme.Muted).Padding(1, 0).Render("No commands"))
	}

	content := lipgloss.JoinVertical(lipgloss.Left, input, lipgloss.JoinVertical(lipgloss.Left, rows...))
	panel := lipgloss.NewStyle().Width(panelWidth).Render(content)
	return panel, true
}

func (p *CommandPalette) renderItem(cmd SlashCommand, selected bool, width int) string {
	theme := styles.CurrentTheme()
	name := lipgloss.NewStyle().Foreground(theme.Foreground).Bold(true).Render("/" + cmd.Name)
	desc := lipgloss.NewStyle().Foreground(theme.Muted).Render(cmd.Description)
	usage := lipgloss.NewStyle().Foreground(theme.Secondary).Italic(true).Render(cmd.Usage)

	line := lipgloss.JoinVertical(lipgloss.Left, name, desc, usage)
	base := lipgloss.NewStyle().Padding(1, 1)
	if width > 0 {
		base = base.Width(width)
	}
	if selected {
		base = base.Foreground(theme.Background)
		// base = base.Background(theme.Primary).Foreground(theme.Background)
	}
	return base.Render(line)
}

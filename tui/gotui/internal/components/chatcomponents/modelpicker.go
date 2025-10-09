package chatcomponents

import (
	"math"
	"strings"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"

	"gotui/internal/styles"
)

type ModelOption struct {
	Name         string
	Provider     string
	Capabilities []string
	Description  string
	Context      string
}

type ModelPicker struct {
	options  []ModelOption
	visible  bool
	selected int
}

func NewModelPicker(options []ModelOption) *ModelPicker {
	return &ModelPicker{options: options}
}

func (p *ModelPicker) SetOptions(options []ModelOption) {
	p.options = options
	if p.selected >= len(p.options) {
		p.selected = 0
	}
}

func (p *ModelPicker) Open() {
	if !p.visible {
		p.selected = 0
	}
	p.visible = true
}

func (p *ModelPicker) Close() {
	p.visible = false
}

func (p *ModelPicker) IsVisible() bool {
	return p.visible
}

func (p *ModelPicker) HandleKey(msg tea.KeyPressMsg) (handled bool, option ModelOption, ok bool) {
	if !p.visible {
		return false, ModelOption{}, false
	}

	switch msg.String() {
	case "esc":
		p.Close()
		return true, ModelOption{}, false
	case "enter", "tab":
		if len(p.options) == 0 {
			p.Close()
			return true, ModelOption{}, false
		}
		opt := p.options[p.selected]
		p.Close()
		return true, opt, true
	case "down", "ctrl+n":
		p.move(1)
		return true, ModelOption{}, false
	case "up", "ctrl+p":
		p.move(-1)
		return true, ModelOption{}, false
	case "pgdown":
		p.move(3)
		return true, ModelOption{}, false
	case "pgup":
		p.move(-3)
		return true, ModelOption{}, false
	case "shift+tab":
		p.move(-1)
		return true, ModelOption{}, false
	}

	return false, ModelOption{}, false
}

func (p *ModelPicker) move(delta int) {
	if len(p.options) == 0 {
		return
	}
	maxIndex := len(p.options)
	p.selected = (p.selected + delta + maxIndex) % maxIndex
}

func (p *ModelPicker) View(width, height int) string {
	if !p.visible || width <= 0 || height <= 0 {
		return ""
	}

	theme := styles.CurrentTheme()
	panelWidth := clamp(width-10, 42, int(math.Min(82, float64(width-4))))
	if panelWidth <= 0 {
		panelWidth = width
	}

	paddingX := 3
	contentWidth := panelWidth - (paddingX * 2)
	if contentWidth < 36 {
		contentWidth = panelWidth - 4
	}

	headerTitle := lipgloss.NewStyle().
		Foreground(theme.Background).
		Background(theme.Primary).
		Bold(true).
		Padding(0, 3).
		Render("Model Palette")
	headerHint := lipgloss.NewStyle().
		Foreground(theme.Muted).
		Padding(0, 1).
		Render("Use ↑ ↓ to navigate • Enter to select • Esc to cancel")
	header := lipgloss.JoinVertical(lipgloss.Left, headerTitle, headerHint, "")

	rows := p.renderOptions(contentWidth)
	body := lipgloss.JoinVertical(lipgloss.Left, rows...)

	panel := lipgloss.NewStyle().
		Width(panelWidth).
		Border(lipgloss.RoundedBorder()).
		BorderForeground(theme.Primary).
		Background(theme.SurfaceHigh).
		Padding(1, paddingX).
		Render(lipgloss.JoinVertical(lipgloss.Left, header, body))

	overlay := lipgloss.Place(width, height, lipgloss.Center, lipgloss.Center, panel, lipgloss.WithWhitespaceChars(" "))
	return lipgloss.NewStyle().
		Width(width).
		Height(height).
		Background(theme.Surface.BlendLab(theme.Background, 0.45)).
		Render(overlay)
}

func (p *ModelPicker) renderOptions(width int) []string {
	theme := styles.CurrentTheme()
	if len(p.options) == 0 {
		empty := lipgloss.NewStyle().
			Width(width).
			Foreground(theme.Muted).
			Background(theme.Surface).
			Padding(1, 2).
			Align(lipgloss.Center, lipgloss.Center).
			Render("No models available")
		return []string{empty}
	}

	rows := make([]string, 0, len(p.options))
	for i, opt := range p.options {
		rows = append(rows, p.renderOption(opt, i == p.selected, width))
	}
	return rows
}

func (p *ModelPicker) renderOption(opt ModelOption, selected bool, width int) string {
	theme := styles.CurrentTheme()
	nameStyle := lipgloss.NewStyle().Foreground(theme.Primary).Bold(true)
	providerStyle := lipgloss.NewStyle().Foreground(theme.Secondary)
	metaStyle := lipgloss.NewStyle().Foreground(theme.Muted)
	headLine := lipgloss.JoinHorizontal(lipgloss.Left,
		nameStyle.Render(opt.Name),
		lipgloss.NewStyle().Render("  ·  "),
		providerStyle.Render(opt.Provider),
	)
	contextInfo := ""
	if opt.Context != "" {
		contextInfo = metaStyle.Render(opt.Context + " ctx")
	}
	firstRow := headLine
	if contextInfo != "" {
		firstRow = lipgloss.JoinHorizontal(lipgloss.Left,
			headLine,
			lipgloss.NewStyle().Render("  •  "),
			contextInfo,
		)
	}

	descParts := []string{opt.Description}
	if opt.Context != "" {
		descParts = append(descParts, "Context: "+opt.Context)
	}
	if len(opt.Capabilities) > 0 {
		descParts = append(descParts, "Capabilities: "+strings.Join(opt.Capabilities, ", "))
	}
	desc := metaStyle.Render(strings.Join(descParts, "  •  "))
	badges := p.renderCapabilityBadges(opt.Capabilities)

	body := lipgloss.JoinVertical(lipgloss.Left, firstRow, desc, badges)
	cardWidth := width - 3
	if cardWidth < 24 {
		cardWidth = width
	}
	card := lipgloss.NewStyle().Width(cardWidth).Render(body)
	indicator := lipgloss.NewStyle().Foreground(theme.Muted).Render("  ")
	rowStyle := lipgloss.NewStyle().Width(width).Padding(1, 1)
	if selected {
		indicator = lipgloss.NewStyle().Foreground(theme.Accent).Render("➤ ")
		rowStyle = rowStyle.
			Background(theme.SurfaceHighest).
			Foreground(theme.Foreground).
			Border(lipgloss.RoundedBorder()).
			BorderForeground(theme.Primary)
	} else {
		rowStyle = rowStyle.
			Background(theme.Surface).
			Border(lipgloss.NormalBorder()).
			BorderForeground(theme.SurfaceHigh)
	}
	row := lipgloss.JoinHorizontal(lipgloss.Left, indicator, card)
	return rowStyle.Render(row)
}

func (p *ModelPicker) renderCapabilityBadges(capabilities []string) string {
	if len(capabilities) == 0 {
		return ""
	}
	theme := styles.CurrentTheme()
	badgeStyle := lipgloss.NewStyle().
		Background(theme.SurfaceHighest).
		Foreground(theme.Muted).
		Padding(0, 1).
		MarginRight(1)
	badges := make([]string, 0, len(capabilities))
	for _, cap := range capabilities {
		badges = append(badges, badgeStyle.Render(strings.ToUpper(cap)))
	}
	return lipgloss.JoinHorizontal(lipgloss.Left, badges...)
}

func clamp(value, minValue, maxValue int) int {
	if value < minValue {
		return minValue
	}
	if value > maxValue {
		return maxValue
	}
	return value
}

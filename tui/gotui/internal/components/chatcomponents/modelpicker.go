package chatcomponents

import (
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
		Foreground(theme.Foreground).
		Background(theme.Primary.BlendLab(theme.SurfaceHigh, 0.2)).
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
		BorderStyle(lipgloss.RoundedBorder()).
		BorderForeground(theme.Border).
		Background(theme.SurfaceHigh.BlendLab(theme.Background, 0.08)).
		Padding(2, paddingX).
		Render(lipgloss.JoinVertical(lipgloss.Left, header, body))

	overlay := lipgloss.Place(width, height, lipgloss.Center, lipgloss.Center, panel,
		lipgloss.WithWhitespaceChars(" "))
	return lipgloss.NewStyle().
		Width(width).
		Height(height).
		Background(theme.Background.BlendLab(theme.Surface, 0.6)).
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

	rows := make([]string, 0, len(p.options)*2)
	for i, opt := range p.options {
		rows = append(rows, p.renderOption(opt, i == p.selected, width))
		if i < len(p.options)-1 {
			divider := lipgloss.NewStyle().
				Foreground(theme.Border).
				Width(width).
				Render(strings.Repeat("─", max(12, width-2)))
			rows = append(rows, divider)
		}
	}
	return rows
}

func (p *ModelPicker) renderOption(opt ModelOption, selected bool, width int) string {
	theme := styles.CurrentTheme()
	nameStyle := lipgloss.NewStyle().
		Foreground(theme.Primary).
		Bold(true).
		UnsetBackground()
	providerStyle := lipgloss.NewStyle().
		Foreground(theme.Secondary).
		UnsetBackground()
	metaStyle := lipgloss.NewStyle().
		Foreground(theme.Muted).
		UnsetBackground()

	segments := []string{nameStyle.Render(opt.Name)}
	if strings.TrimSpace(opt.Provider) != "" {
		segments = append(segments,
			lipgloss.NewStyle().Foreground(theme.Muted).UnsetBackground().Render(" · "),
			providerStyle.Render(opt.Provider),
		)
	}
	head := lipgloss.JoinHorizontal(lipgloss.Left, segments...)

	contextLine := ""
	if opt.Context != "" {
		contextLine = metaStyle.Render("Context: " + opt.Context)
	}

	descParts := []string{}
	if strings.TrimSpace(opt.Description) != "" {
		descParts = append(descParts, opt.Description)
	}
	if len(opt.Capabilities) > 0 {
		descParts = append(descParts, "Capabilities: "+strings.Join(opt.Capabilities, ", "))
	}

	cardWidth := width - 4
	if cardWidth < 28 {
		cardWidth = width - 2
	}
	wrapWidth := cardWidth - 6
	if wrapWidth < 20 {
		wrapWidth = max(20, width-10)
	}
	descText := metaStyle.Copy().Width(wrapWidth).Render(strings.Join(descParts, "\n"))

	badges := p.renderCapabilityBadges(opt.Capabilities)

	sections := []string{head}
	if contextLine != "" {
		sections = append(sections, contextLine)
	}
	if strings.TrimSpace(descText) != "" {
		sections = append(sections, descText)
	}
	if strings.TrimSpace(badges) != "" {
		sections = append(sections, badges)
	}

	cardStyle := lipgloss.NewStyle().
		Width(cardWidth).
		Padding(1, 2)

	indicator := lipgloss.NewStyle().Foreground(theme.Muted).Render("  ")
	container := lipgloss.NewStyle().Width(width).Padding(1, 1)

	if selected {
		indicator = lipgloss.NewStyle().Foreground(theme.Accent).Render("➤ ")
		cardStyle = cardStyle.
			Background(theme.SurfaceHighest.BlendLab(theme.SurfaceHigh, 0.35)).
			BorderStyle(lipgloss.RoundedBorder()).
			BorderForeground(theme.Primary).
			Foreground(theme.Foreground)
		container = container.Background(theme.SurfaceHigh.BlendLab(theme.Background, 0.12))
	} else {
		cardStyle = cardStyle.
			Background(theme.Surface).
			BorderStyle(lipgloss.NormalBorder()).
			BorderForeground(theme.SurfaceHigh)
		container = container.Background(theme.Surface.BlendLab(theme.Background, 0.08))
	}

	cardContent := lipgloss.JoinVertical(lipgloss.Left, sections...)
	card := cardStyle.Render(cardContent)
	row := lipgloss.JoinHorizontal(lipgloss.Top, indicator, card)
	return container.Render(row)
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

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

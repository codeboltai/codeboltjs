package chatcomponents

import (
	"strings"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"

	"gotui/internal/components/dialogs"
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

// Layer returns the picker rendered as a dialog layer so the background remains visible.
func (p *ModelPicker) Layer(width, height int) *lipgloss.Layer {
	panel, ok := p.dialogPanel(width)
	if !ok || height <= 0 {
		return nil
	}
	return dialogs.WrapLayer(panel, width, height)
}

func (p *ModelPicker) dialogPanel(width int) (string, bool) {
	if !p.visible || width <= 0 {
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
		Render("Model Palette")
	headerHint := lipgloss.NewStyle().
		Foreground(lipgloss.Color(theme.Muted.Hex())).
		Padding(0, 1).
		Render("Use ↑ ↓ to navigate • Enter to select • Esc to cancel")
	header := lipgloss.JoinVertical(lipgloss.Left, headerTitle, headerHint, "")

	rows := p.renderOptions(contentWidth)
	body := lipgloss.JoinVertical(lipgloss.Left, rows...)

	panel := lipgloss.NewStyle().
		Width(panelWidth).
		BorderStyle(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color(theme.Border.Hex())).
		Padding(2, paddingX).
		Render(lipgloss.JoinVertical(lipgloss.Left, header, body))

	return panel, true
}

func (p *ModelPicker) renderOptions(width int) []string {
	theme := styles.CurrentTheme()
	if len(p.options) == 0 {
		empty := lipgloss.NewStyle().
			Width(width).
			Foreground(lipgloss.Color(theme.Muted.Hex())).
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
				Foreground(lipgloss.Color(theme.Border.Hex())).
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
		Foreground(lipgloss.Color("#d7ffae")).
		Bold(true)
	// providerStyle := lipgloss.NewStyle().
	// 	Foreground(lipgloss.Color("#d7ffae")).
	// 	Bold(true)

	metaStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color(theme.Muted.Hex()))

	head := nameStyle.Render(opt.Name) + nameStyle.Render(opt.Provider)

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

	indicator := lipgloss.NewStyle().Foreground(lipgloss.Color(theme.Muted.Hex())).Render("  ")
	container := lipgloss.NewStyle().Width(width).Padding(1, 1)

	if selected {
		indicator = lipgloss.NewStyle().Foreground(lipgloss.Color(theme.Accent.Hex())).Render("➤ ")
		cardStyle = cardStyle.
			BorderStyle(lipgloss.RoundedBorder()).
			BorderForeground(lipgloss.Color(theme.Primary.Hex())).
			Foreground(lipgloss.Color(theme.Foreground.Hex()))
		// Removed background from cardStyle for selected state
		// Removed background from container for selected state
	} else {
		cardStyle = cardStyle.
			BorderStyle(lipgloss.NormalBorder()).
			BorderForeground(lipgloss.Color(theme.SurfaceHigh.Hex()))
		// Removed background from cardStyle for unselected state
		// Removed background from container for unselected state
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
		// Background(lipgloss.Color(theme.SurfaceHighest.Hex())).
		Foreground(lipgloss.Color(theme.Muted.Hex())).
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

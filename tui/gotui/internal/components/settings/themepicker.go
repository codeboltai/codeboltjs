package settings

import (
	"math"
	"strings"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"
	"github.com/lucasb-eyer/go-colorful"

	"gotui/internal/styles"
)

// ThemePicker renders an overlay for selecting a theme preset.
type ThemePicker struct {
	options  []styles.ThemePreset
	visible  bool
	selected int
}

// NewThemePicker constructs a new theme picker with the provided options.
func NewThemePicker(options []styles.ThemePreset) *ThemePicker {
	return &ThemePicker{options: options}
}

// SetOptions replaces the current list of selectable themes.
func (p *ThemePicker) SetOptions(options []styles.ThemePreset) {
	p.options = options
	if p.selected >= len(p.options) {
		p.selected = 0
	}
}

// Open makes the picker visible and aligns the selection with the current theme name.
func (p *ThemePicker) Open(currentName string) {
	if len(p.options) == 0 {
		p.selected = 0
	} else if idx := p.indexOf(currentName); idx >= 0 {
		p.selected = idx
	} else if p.selected >= len(p.options) {
		p.selected = 0
	}
	p.visible = true
}

// Close hides the picker.
func (p *ThemePicker) Close() {
	p.visible = false
}

// IsVisible reports whether the picker overlay is currently shown.
func (p *ThemePicker) IsVisible() bool {
	return p.visible
}

// HandleKey processes keyboard navigation and selection.
func (p *ThemePicker) HandleKey(msg tea.KeyPressMsg) (handled bool, preset styles.ThemePreset, ok bool) {
	if !p.visible {
		return false, styles.ThemePreset{}, false
	}

	switch msg.String() {
	case "esc":
		p.Close()
		return true, styles.ThemePreset{}, false
	case "enter", "tab":
		if len(p.options) == 0 {
			p.Close()
			return true, styles.ThemePreset{}, false
		}
		choice := p.options[p.selected]
		p.Close()
		return true, choice, true
	case "down", "ctrl+n":
		p.move(1)
		return true, styles.ThemePreset{}, false
	case "up", "ctrl+p":
		p.move(-1)
		return true, styles.ThemePreset{}, false
	case "pgdown":
		p.move(3)
		return true, styles.ThemePreset{}, false
	case "pgup":
		p.move(-3)
		return true, styles.ThemePreset{}, false
	case "shift+tab":
		p.move(-1)
		return true, styles.ThemePreset{}, false
	}

	return false, styles.ThemePreset{}, false
}

func (p *ThemePicker) move(delta int) {
	if len(p.options) == 0 {
		return
	}
	limit := len(p.options)
	p.selected = (p.selected + delta + limit) % limit
}

func (p *ThemePicker) indexOf(name string) int {
	for i, opt := range p.options {
		if strings.EqualFold(opt.Name, name) {
			return i
		}
	}
	return -1
}

// View renders the picker overlay.
func (p *ThemePicker) View(width, height int) string {
	if !p.visible || width <= 0 || height <= 0 {
		return ""
	}

	baseTheme := styles.CurrentTheme()
	panelWidth := clamp(width-10, 44, int(math.Min(84, float64(width-4))))
	if panelWidth <= 0 {
		panelWidth = width
	}

	paddingX := 3
	contentWidth := panelWidth - (paddingX * 2)
	if contentWidth < 36 {
		contentWidth = panelWidth - 4
	}

	headerTitle := lipgloss.NewStyle().
		Foreground(baseTheme.Background).
		// Background(baseTheme.Primary).
		Bold(true).
		Padding(0, 3).
		Render("Theme Selector")
	headerHint := lipgloss.NewStyle().
		Foreground(baseTheme.Muted).
		Padding(0, 1).
		Render("Use ↑ ↓ to navigate • Enter to apply • Esc to cancel")
	header := lipgloss.JoinVertical(lipgloss.Left, headerTitle, headerHint, "")

	body := lipgloss.JoinVertical(lipgloss.Left, p.renderOptions(contentWidth)...)

	panel := lipgloss.NewStyle().
		Width(panelWidth).
		Border(lipgloss.RoundedBorder()).
		BorderForeground(baseTheme.Primary).
		// Background(baseTheme.SurfaceHigh).
		Padding(1, paddingX).
		Render(lipgloss.JoinVertical(lipgloss.Left, header, body))

	overlay := lipgloss.Place(width, height, lipgloss.Center, lipgloss.Center, panel, lipgloss.WithWhitespaceChars(" "))
	return lipgloss.NewStyle().
		Width(width).
		Height(height).
		// Background(baseTheme.Surface.BlendLab(baseTheme.Background, 0.45)).
		Render(overlay)
}

func (p *ThemePicker) renderOptions(width int) []string {
	if len(p.options) == 0 {
		theme := styles.CurrentTheme()
		empty := lipgloss.NewStyle().
			Width(width).
			Foreground(theme.Muted).
			// Background(theme.Surface).
			Padding(1, 2).
			Align(lipgloss.Center, lipgloss.Center).
			Render("No themes available")
		return []string{empty}
	}

	rows := make([]string, 0, len(p.options))
	for i, opt := range p.options {
		rows = append(rows, p.renderOption(opt, i == p.selected, width))
	}
	return rows
}

func (p *ThemePicker) renderOption(opt styles.ThemePreset, selected bool, width int) string {
	theme := styles.CurrentTheme()
	optTheme := opt.Theme
	isActive := strings.EqualFold(opt.Name, styles.CurrentThemeName())

	nameStyle := lipgloss.NewStyle().Foreground(optTheme.Primary).Bold(true)
	descStyle := lipgloss.NewStyle().Foreground(theme.Muted)
	badgeStyle := lipgloss.NewStyle().Foreground(optTheme.Secondary).Bold(true)

	firstLine := nameStyle.Render(opt.Name)
	if isActive {
		badge := badgeStyle.Render("ACTIVE")
		firstLine = lipgloss.JoinHorizontal(lipgloss.Left, firstLine, lipgloss.NewStyle().Render("  •  "), badge)
	}

	description := descStyle.Render(opt.Description)
	palette := p.renderPalette(optTheme)
	body := lipgloss.JoinVertical(lipgloss.Left, firstLine, description, palette)

	cardWidth := width - 3
	if cardWidth < 24 {
		cardWidth = width
	}
	card := lipgloss.NewStyle().Width(cardWidth).Render(body)

	indicator := lipgloss.NewStyle().Foreground(theme.Muted).Render("  ")
	rowStyle := lipgloss.NewStyle().Width(width).Padding(1, 1)
	if selected {
		indicator = lipgloss.NewStyle().Foreground(optTheme.Accent).Render("➤ ")
		rowStyle = rowStyle.
			// Background(optTheme.SurfaceHigh).
			Foreground(optTheme.Foreground).
			Border(lipgloss.RoundedBorder()).
			BorderForeground(optTheme.Primary)
	} else {
		rowStyle = rowStyle.
			// Background(theme.Surface).
			Border(lipgloss.NormalBorder()).
			BorderForeground(theme.SurfaceHigh)
	}

	row := lipgloss.JoinHorizontal(lipgloss.Left, indicator, card)
	return rowStyle.Render(row)
}

func (p *ThemePicker) renderPalette(t styles.Theme) string {
	swatch := func(color colorful.Color) string {
		return lipgloss.NewStyle().
			Width(6).
			Height(1).
			MarginRight(1).
			// Background(color).
			Render("      ")
	}

	primary := swatch(t.Primary)
	accent := swatch(t.Accent)
	surface := swatch(t.SurfaceHigh)
	background := swatch(t.Background)

	labels := lipgloss.NewStyle().Foreground(t.Foreground).Padding(0, 1)
	text := labels.Render("Primary   Accent    Surface   Background")

	blocks := lipgloss.JoinHorizontal(lipgloss.Left, primary, accent, surface, background)
	return lipgloss.JoinVertical(lipgloss.Left, blocks, text)
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

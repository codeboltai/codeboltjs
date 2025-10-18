package dialogs

import (
	"strings"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"

	"gotui/internal/styles"
)

// ApplicationSettingOption represents a selectable application-level preference.
type ApplicationSettingOption struct {
	Key         string
	Title       string
	Description string
}

// ApplicationSettingsDialog renders a simple list for high-level application defaults.
type ApplicationSettingsDialog struct {
	items    []ApplicationSettingOption
	visible  bool
	selected int
}

// NewApplicationSettingsDialog constructs the dialog populated with default items.
func NewApplicationSettingsDialog() *ApplicationSettingsDialog {
	return &ApplicationSettingsDialog{
		items: []ApplicationSettingOption{
			{
				Key:         "default_model",
				Title:       "Application Default Model",
				Description: "Configure the default model applied to new chats",
			},
			{
				Key:         "default_agent",
				Title:       "Application Default Agent",
				Description: "Choose which agent is preselected for conversations",
			},
		},
	}
}

// Open shows the dialog and resets selection.
func (d *ApplicationSettingsDialog) Open() {
	if !d.visible {
		d.selected = 0
	}
	d.visible = true
}

// Close hides the dialog.
func (d *ApplicationSettingsDialog) Close() {
	d.visible = false
}

// IsVisible reports whether the dialog is currently displayed.
func (d *ApplicationSettingsDialog) IsVisible() bool {
	return d.visible
}

// HandleKey processes keyboard input while the dialog is visible.
func (d *ApplicationSettingsDialog) HandleKey(msg tea.KeyPressMsg) (handled bool, option ApplicationSettingOption, ok bool) {
	if !d.visible {
		return false, ApplicationSettingOption{}, false
	}

	switch msg.String() {
	case "esc":
		d.Close()
		return true, ApplicationSettingOption{}, false
	case "enter", "tab":
		if len(d.items) == 0 {
			d.Close()
			return true, ApplicationSettingOption{}, false
		}
		choice := d.items[d.selected]
		d.Close()
		return true, choice, true
	case "down", "ctrl+n":
		d.move(1)
		return true, ApplicationSettingOption{}, false
	case "up", "ctrl+p":
		d.move(-1)
		return true, ApplicationSettingOption{}, false
	case "pgdown":
		d.move(2)
		return true, ApplicationSettingOption{}, false
	case "pgup":
		d.move(-2)
		return true, ApplicationSettingOption{}, false
	case "shift+tab":
		d.move(-1)
		return true, ApplicationSettingOption{}, false
	}

	return false, ApplicationSettingOption{}, false
}

func (d *ApplicationSettingsDialog) move(delta int) {
	if len(d.items) == 0 {
		return
	}
	limit := len(d.items)
	d.selected = (d.selected + delta + limit) % limit
}

// View renders the dialog framed within the provided dimensions.
func (d *ApplicationSettingsDialog) View(width, height int) string {
	panel, ok := d.dialogPanel(width)
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

// Layer renders the dialog as an overlay layer for composition with other UI elements.
func (d *ApplicationSettingsDialog) Layer(width, height int) *lipgloss.Layer {
	panel, ok := d.dialogPanel(width)
	if !ok || height <= 0 {
		return nil
	}
	return WrapLayer(panel, width, height)
}

func (d *ApplicationSettingsDialog) dialogPanel(width int) (string, bool) {
	if !d.visible || width <= 0 {
		return "", false
	}

	theme := styles.CurrentTheme()
	panelWidth := clamp(width-12, 40, width-6)
	if panelWidth <= 0 {
		panelWidth = width
	}

	paddingX := 4
	contentWidth := panelWidth - (paddingX * 2)
	if contentWidth < 24 {
		contentWidth = panelWidth - 2
	}

	headerTitle := lipgloss.NewStyle().
		Foreground(lipgloss.Color(theme.Primary.Hex())).
		Bold(true).
		Padding(0, 2).
		Render("Application Settings")
	headerHint := lipgloss.NewStyle().
		Foreground(lipgloss.Color(theme.Muted.Hex())).
		Padding(0, 2).
		Render("Press Enter to configure • Esc to cancel")
	header := lipgloss.JoinVertical(lipgloss.Left, headerTitle, headerHint, "")

	rows := make([]string, 0, len(d.items))
	for i, item := range d.items {
		rows = append(rows, d.renderItem(item, i == d.selected, contentWidth))
	}
	body := lipgloss.JoinVertical(lipgloss.Left, rows...)

	panel := lipgloss.NewStyle().
		Width(panelWidth).
		BorderStyle(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color(theme.Border.Hex())).
		Padding(1, paddingX).
		Render(lipgloss.JoinVertical(lipgloss.Left, header, body))

	return panel, true
}

func (d *ApplicationSettingsDialog) renderItem(item ApplicationSettingOption, selected bool, width int) string {
	theme := styles.CurrentTheme()
	titleStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color(theme.Foreground.Hex())).
		Bold(true)
	descStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color(theme.Muted.Hex())).
		Width(width - 4)

	title := titleStyle.Render(item.Title)
	desc := strings.TrimSpace(item.Description)
	if desc != "" {
		desc = descStyle.Render(desc)
	}

	content := []string{title}
	if desc != "" {
		content = append(content, desc)
	}
	card := lipgloss.JoinVertical(lipgloss.Left, content...)

	indicator := lipgloss.NewStyle().Foreground(lipgloss.Color(theme.Muted.Hex())).Render("  ")
	cardStyle := lipgloss.NewStyle().Padding(1, 2).Width(width)

	if selected {
		indicator = lipgloss.NewStyle().Foreground(lipgloss.Color(theme.Accent.Hex())).Render("➤ ")
		cardStyle = cardStyle.
			BorderStyle(lipgloss.RoundedBorder()).
			BorderForeground(lipgloss.Color(theme.Primary.Hex()))
	} else {
		cardStyle = cardStyle.
			BorderStyle(lipgloss.NormalBorder()).
			BorderForeground(lipgloss.Color(theme.SurfaceHigh.Hex()))
	}

	row := lipgloss.JoinHorizontal(lipgloss.Top, indicator, cardStyle.Render(card))
	return lipgloss.NewStyle().Width(width + 4).Render(row)
}

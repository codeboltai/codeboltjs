package styles

import (
	"strings"

	"github.com/charmbracelet/lipgloss/v2"
	"github.com/lucasb-eyer/go-colorful"
)

// Theme defines the color scheme and styling for the application
type Theme struct {
	// Color definitions
	Primary    colorful.Color
	Secondary  colorful.Color
	Accent     colorful.Color
	Background colorful.Color
	Foreground colorful.Color
	Muted      colorful.Color
	Border     colorful.Color
	Success    colorful.Color
	Warning    colorful.Color
	Error      colorful.Color
	Info       colorful.Color

	// Surface colors
	Surface        colorful.Color
	SurfaceHigh    colorful.Color
	SurfaceHighest colorful.Color
}

// ThemePreset represents a selectable theme configuration.
type ThemePreset struct {
	Name        string
	Description string
	Theme       Theme
}

var themePresets = []ThemePreset{
	{
		Name:        "Midnight Amber",
		Description: "Warm amber highlights on obsidian backdrop",
		Theme: Theme{
			Primary:        mustParse("#d97706"),
			Secondary:      mustParse("#b45309"),
			Accent:         mustParse("#92400e"),
			Background:     mustParse("#0b0b0f"),
			Foreground:     mustParse("#f5f5f4"),
			Muted:          mustParse("#a1a1aa"),
			Border:         mustParse("#27272a"),
			Success:        mustParse("#4ade80"),
			Warning:        mustParse("#f97316"),
			Error:          mustParse("#f87171"),
			Info:           mustParse("#facc15"),
			Surface:        mustParse("#131316"),
			SurfaceHigh:    mustParse("#1c1c1f"),
			SurfaceHighest: mustParse("#27272a"),
		},
	},
	{
		Name:        "Ocean Night",
		Description: "Cool indigo gradients with crisp glacier accents",
		Theme: Theme{
			Primary:        mustParse("#818cf8"),
			Secondary:      mustParse("#38bdf8"),
			Accent:         mustParse("#f472b6"),
			Background:     mustParse("#0b1120"),
			Foreground:     mustParse("#e0f2fe"),
			Muted:          mustParse("#94a3b8"),
			Border:         mustParse("#1e293b"),
			Success:        mustParse("#34d399"),
			Warning:        mustParse("#fbbf24"),
			Error:          mustParse("#f87171"),
			Info:           mustParse("#60a5fa"),
			Surface:        mustParse("#111827"),
			SurfaceHigh:    mustParse("#15213a"),
			SurfaceHighest: mustParse("#1f2a44"),
		},
	},
	{
		Name:        "Moss Grove",
		Description: "Deep woodland greens with subtle bronze accents",
		Theme: Theme{
			Primary:        mustParse("#65a30d"),
			Secondary:      mustParse("#166534"),
			Accent:         mustParse("#a16207"),
			Background:     mustParse("#07130c"),
			Foreground:     mustParse("#ecfdf5"),
			Muted:          mustParse("#6b7280"),
			Border:         mustParse("#1c3d2b"),
			Success:        mustParse("#22c55e"),
			Warning:        mustParse("#f59e0b"),
			Error:          mustParse("#f87171"),
			Info:           mustParse("#2dd4bf"),
			Surface:        mustParse("#0c1f14"),
			SurfaceHigh:    mustParse("#122a1b"),
			SurfaceHighest: mustParse("#1b3a28"),
		},
	},
}

var currentThemeName = themePresets[0].Name

// DefaultTheme returns the initial preset theme.
func DefaultTheme() Theme {
	return themePresets[0].Theme
}

// PresetThemes returns all available theme presets.
func PresetThemes() []ThemePreset {
	out := make([]ThemePreset, len(themePresets))
	copy(out, themePresets)
	return out
}

// CurrentThemeName exposes the active theme preset name, if any.
func CurrentThemeName() string {
	return currentThemeName
}

// Styles contains pre-configured lipgloss styles for common UI elements
type Styles struct {
	// Base styles
	Base     lipgloss.Style
	Title    lipgloss.Style
	Subtitle lipgloss.Style
	Muted    lipgloss.Style

	// Interactive elements
	Button       lipgloss.Style
	ButtonActive lipgloss.Style
	Input        lipgloss.Style
	InputFocused lipgloss.Style

	// Layout elements
	Panel       lipgloss.Style
	PanelActive lipgloss.Style
	Border      lipgloss.Style

	// Status styles
	Success lipgloss.Style
	Warning lipgloss.Style
	Error   lipgloss.Style
	Info    lipgloss.Style

	// Special elements
	Logo lipgloss.Style
	Help lipgloss.Style
}

// NewStyles creates a new Styles instance with the given theme
func NewStyles(theme Theme) Styles {
	return Styles{
		Base: lipgloss.NewStyle().
			Foreground(theme.Foreground),
		// Background(theme.Background),

		Title: lipgloss.NewStyle().
			Foreground(theme.Primary).
			Bold(true).
			Padding(0, 1),

		Subtitle: lipgloss.NewStyle().
			Foreground(theme.Secondary).
			Italic(true),

		Muted: lipgloss.NewStyle().
			Foreground(theme.Muted),

		Button: lipgloss.NewStyle().
			Foreground(theme.Foreground).
			// Background(theme.Surface).
			Padding(0, 2).
			Border(lipgloss.RoundedBorder()).
			BorderForeground(theme.Border),

		ButtonActive: lipgloss.NewStyle().
			Foreground(theme.Background).
			// Background(theme.Primary).
			Padding(0, 2).
			Border(lipgloss.RoundedBorder()).
			BorderForeground(theme.Primary).
			Bold(true),

		Input: lipgloss.NewStyle().
			Foreground(theme.Foreground).
			// Background(theme.Surface).
			Padding(0, 1).
			Border(lipgloss.NormalBorder()).
			BorderForeground(theme.Border),

		InputFocused: lipgloss.NewStyle().
			Foreground(theme.Foreground).
			// Background(theme.Surface).
			Padding(0, 1).
			Border(lipgloss.NormalBorder()).
			BorderForeground(theme.Primary),

		Panel: lipgloss.NewStyle().
			Foreground(theme.Foreground).
			// Background(theme.Background).
			Padding(1),

		PanelActive: lipgloss.NewStyle().
			Foreground(theme.Foreground).
			// Background(theme.Background).
			Padding(1),

		Border: lipgloss.NewStyle().
			Border(lipgloss.NormalBorder()).
			BorderForeground(theme.Border),

		Success: lipgloss.NewStyle().
			Foreground(theme.Success).
			Bold(true),

		Warning: lipgloss.NewStyle().
			Foreground(theme.Warning).
			Bold(true),

		Error: lipgloss.NewStyle().
			Foreground(theme.Error).
			Bold(true),

		Info: lipgloss.NewStyle().
			Foreground(theme.Info).
			Bold(true),

		Logo: lipgloss.NewStyle().
			Foreground(theme.Accent).
			Bold(true).
			Border(lipgloss.RoundedBorder()).
			BorderForeground(theme.Accent).
			Padding(0, 2),

		Help: lipgloss.NewStyle().
			Foreground(theme.Muted).
			Italic(true),
	}
}

// Global theme and styles
var (
	currentTheme  = DefaultTheme()
	currentStyles = NewStyles(currentTheme)
)

// CurrentTheme returns the current theme
func CurrentTheme() Theme {
	return currentTheme
}

// CurrentStyles returns the current styles
func CurrentStyles() Styles {
	return currentStyles
}

// SetTheme sets the current theme and updates styles
func SetTheme(theme Theme) {
	currentTheme = theme
	currentStyles = NewStyles(theme)
	currentThemeName = ""
}

// SetThemeByName applies a theme preset by name (case-insensitive).
func SetThemeByName(name string) bool {
	for _, preset := range themePresets {
		if strings.EqualFold(preset.Name, name) {
			SetTheme(preset.Theme)
			currentThemeName = preset.Name
			return true
		}
	}
	return false
}

func mustParse(hex string) colorful.Color {
	c, _ := colorful.Hex(hex)
	return c
}

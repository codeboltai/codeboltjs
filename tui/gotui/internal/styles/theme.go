package styles

import (
	"github.com/charmbracelet/lipgloss/v2"
	"github.com/lucasb-eyer/go-colorful"
)

// Theme defines the color scheme and styling for the application
type Theme struct {
	// Color definitions
	Primary      colorful.Color
	Secondary    colorful.Color
	Accent       colorful.Color
	Background   colorful.Color
	Foreground   colorful.Color
	Muted        colorful.Color
	Border       colorful.Color
	Success      colorful.Color
	Warning      colorful.Color
	Error        colorful.Color
	Info         colorful.Color
	
	// Surface colors
	Surface      colorful.Color
	SurfaceHigh  colorful.Color
	SurfaceHighest colorful.Color
}

// DefaultTheme returns the default dark theme
func DefaultTheme() Theme {
	mustParse := func(hex string) colorful.Color {
		c, _ := colorful.Hex(hex)
		return c
	}
	
	return Theme{
		Primary:      mustParse("#818cf8"),  // Indigo 400
		Secondary:    mustParse("#34d399"),  // Emerald 400
		Accent:       mustParse("#f59e0b"),  // Amber 500
		Background:   mustParse("#1e293b"),  // Slate 800
		Foreground:   mustParse("#f1f5f9"),  // Slate 100
		Muted:        mustParse("#64748b"),  // Slate 500
		Border:       mustParse("#334155"),  // Slate 700
		Success:      mustParse("#34d399"),  // Emerald 400
		Warning:      mustParse("#f59e0b"),  // Amber 500
		Error:        mustParse("#f472b6"),  // Pink 400
		Info:         mustParse("#60a5fa"),  // Blue 400
		Surface:      mustParse("#0f172a"),  // Slate 900
		SurfaceHigh:  mustParse("#1e293b"),  // Slate 800
		SurfaceHighest: mustParse("#334155"), // Slate 700
	}
}

// Styles contains pre-configured lipgloss styles for common UI elements
type Styles struct {
	// Base styles
	Base      lipgloss.Style
	Title     lipgloss.Style
	Subtitle  lipgloss.Style
	Muted     lipgloss.Style
	
	// Interactive elements
	Button    lipgloss.Style
	ButtonActive lipgloss.Style
	Input     lipgloss.Style
	InputFocused lipgloss.Style
	
	// Layout elements
	Panel     lipgloss.Style
	PanelActive lipgloss.Style
	Border    lipgloss.Style
	
	// Status styles
	Success   lipgloss.Style
	Warning   lipgloss.Style
	Error     lipgloss.Style
	Info      lipgloss.Style
	
	// Special elements
	Logo      lipgloss.Style
	Help      lipgloss.Style
}

// NewStyles creates a new Styles instance with the given theme
func NewStyles(theme Theme) Styles {
	return Styles{
		Base: lipgloss.NewStyle().
			Foreground(theme.Foreground).
			Background(theme.Background),
		
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
			Background(theme.Surface).
			Padding(0, 2).
			Border(lipgloss.RoundedBorder()).
			BorderForeground(theme.Border),
		
		ButtonActive: lipgloss.NewStyle().
			Foreground(theme.Background).
			Background(theme.Primary).
			Padding(0, 2).
			Border(lipgloss.RoundedBorder()).
			BorderForeground(theme.Primary).
			Bold(true),
		
		Input: lipgloss.NewStyle().
			Foreground(theme.Foreground).
			Background(theme.Surface).
			Padding(0, 1).
			Border(lipgloss.NormalBorder()).
			BorderForeground(theme.Border),
		
		InputFocused: lipgloss.NewStyle().
			Foreground(theme.Foreground).
			Background(theme.Surface).
			Padding(0, 1).
			Border(lipgloss.NormalBorder()).
			BorderForeground(theme.Primary),
		
		Panel: lipgloss.NewStyle().
			Foreground(theme.Foreground).
			Background(theme.Background).
			Padding(1),
		
		PanelActive: lipgloss.NewStyle().
			Foreground(theme.Foreground).
			Background(theme.Background).
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
}

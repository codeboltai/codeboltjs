package dialogs

import (
	"strings"

	"github.com/charmbracelet/lipgloss/v2"

	"gotui/internal/styles"
)

// Wrap centers the given body within a dialog frame, leaving the background visible.
func Wrap(body string, width, height int) string {
	if width <= 0 {
		width = lipgloss.Width(body)
	}
	if height <= 0 {
		height = lipgloss.Height(body)
	}

	if width <= 0 {
		width = 60
	}
	if height <= 0 {
		height = lipgloss.Height(body)
		if height <= 0 {
			height = 10
		}
	}

	frame := frameStyle().Render(body)
	return lipgloss.Place(
		width,
		height,
		lipgloss.Center,
		lipgloss.Center,
		frame,
		lipgloss.WithWhitespaceChars(" "),
	)
}

// WrapLayer centers the given body within a dialog frame and returns it as a layer.
func WrapLayer(body string, width, height int) *lipgloss.Layer {
	if strings.TrimSpace(body) == "" {
		return nil
	}

	if width <= 0 {
		width = lipgloss.Width(body)
	}
	if height <= 0 {
		height = lipgloss.Height(body)
	}

	frame := frameStyle().Render(body)

	if width < lipgloss.Width(frame) {
		width = lipgloss.Width(frame)
	}
	if height < lipgloss.Height(frame) {
		height = lipgloss.Height(frame)
	}

	x := (width - lipgloss.Width(frame)) / 2
	y := (height - lipgloss.Height(frame)) / 2
	if x < 0 {
		x = 0
	}
	if y < 0 {
		y = 0
	}

	return lipgloss.NewLayer(frame).X(x).Y(y)
}

func frameStyle() lipgloss.Style {
	theme := styles.CurrentTheme()
	return lipgloss.NewStyle().
		BorderStyle(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color(theme.Primary.Hex())).
		Padding(1, 2)
}

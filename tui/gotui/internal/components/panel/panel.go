package panel

import (
	"fmt"
	"strings"

	"gotui/internal/styles"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"
)

// Panel represents a UI panel with title and content
type Panel struct {
	title     string
	content   []string
	maxLines  int
	active    bool
	visible   bool
	width     int
	height    int
	scrollPos int
}

// New creates a new panel with the given title
func New(title string) *Panel {
	return &Panel{
		title:    title,
		content:  make([]string, 0),
		maxLines: 100, // Keep last 100 lines
		visible:  true,
	}
}

// SetTitle sets the panel title
func (p *Panel) SetTitle(title string) {
	p.title = title
}

// AddLine adds a new line to the panel content
func (p *Panel) AddLine(line string) {
	p.content = append(p.content, line)
	if len(p.content) > p.maxLines {
		p.content = p.content[len(p.content)-p.maxLines:]
	}
	// Auto scroll to bottom when new content is added
	if len(p.content) > p.height-2 { // Account for border
		p.scrollPos = len(p.content) - (p.height - 2)
	}
}

// AddLines adds multiple lines to the panel content
func (p *Panel) AddLines(lines []string) {
	for _, line := range lines {
		p.AddLine(line)
	}
}

// Clear clears all content from the panel
func (p *Panel) Clear() {
	p.content = make([]string, 0)
	p.scrollPos = 0
}

// SetActive sets the panel active state
func (p *Panel) SetActive(active bool) {
	p.active = active
}

// SetVisible sets the panel visibility
func (p *Panel) SetVisible(visible bool) {
	p.visible = visible
}

// IsVisible returns whether the panel is visible
func (p *Panel) IsVisible() bool {
	return p.visible
}

// SetSize sets the panel dimensions
func (p *Panel) SetSize(width, height int) {
	p.width = width
	p.height = height
	// Adjust scroll position if needed
	if len(p.content) > p.height-2 {
		p.scrollPos = len(p.content) - (p.height - 2)
	} else {
		p.scrollPos = 0
	}
}

// ScrollUp scrolls the panel content up
func (p *Panel) ScrollUp() {
	if p.scrollPos > 0 {
		p.scrollPos--
	}
}

// ScrollDown scrolls the panel content down
func (p *Panel) ScrollDown() {
	maxScroll := len(p.content) - (p.height - 2)
	if maxScroll > 0 && p.scrollPos < maxScroll {
		p.scrollPos++
	}
}

// ScrollToTop scrolls to the top of the content
func (p *Panel) ScrollToTop() {
	p.scrollPos = 0
}

// ScrollToBottom scrolls to the bottom of the content
func (p *Panel) ScrollToBottom() {
	if len(p.content) > p.height-2 {
		p.scrollPos = len(p.content) - (p.height - 2)
	} else {
		p.scrollPos = 0
	}
}

// Update handles panel-specific messages
func (p *Panel) Update(msg tea.Msg) tea.Cmd {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		// Panel size will be set by parent
		_ = msg
	case tea.KeyPressMsg:
		// Handle scrolling if panel is active
		if p.active {
			switch msg.String() {
			case "up", "k":
				p.ScrollUp()
			case "down", "j":
				p.ScrollDown()
			case "home", "g":
				p.ScrollToTop()
			case "end", "G":
				p.ScrollToBottom()
			case "pgup":
				for i := 0; i < 10; i++ {
					p.ScrollUp()
				}
			case "pgdown":
				for i := 0; i < 10; i++ {
					p.ScrollDown()
				}
			}
		}
	}
	return nil
}

// View renders the panel
func (p *Panel) View() string {
	if !p.visible {
		return ""
	}

	theme := styles.CurrentTheme()
	s := styles.CurrentStyles()

	// Choose border style based on active state
	panelStyle := s.Panel
	if p.active {
		panelStyle = s.PanelActive
	}

	// Prepare title with status indicators
	title := p.title
	if len(p.content) > 0 {
		title = fmt.Sprintf("%s (%d)", p.title, len(p.content))
	}
	if p.active {
		title = "▶ " + title
	} else {
		title = "  " + title
	}

	// Calculate content area dimensions (no borders anymore)
	contentWidth := p.width - 2   // Account for padding
	contentHeight := p.height - 1 // Account for title

	// Ensure minimum dimensions
	if contentWidth < 0 {
		contentWidth = 0
	}
	if contentHeight <= 0 {
		// Not enough space for content
		return panelStyle.Width(p.width).Height(p.height).Render(title)
	}

	// Prepare visible content lines
	var visibleLines []string
	totalLines := len(p.content)

	if totalLines == 0 {
		// Empty content
		if contentWidth > 0 {
			emptyMsg := s.Muted.Render("(empty)")
			visibleLines = []string{emptyMsg}
		} else {
			visibleLines = []string{""}
		}
	} else if contentWidth == 0 {
		// No room for content, show empty lines
		for i := 0; i < contentHeight; i++ {
			visibleLines = append(visibleLines, "")
		}
	} else {
		// Calculate which lines to show
		startLine := p.scrollPos
		endLine := startLine + contentHeight

		if startLine < 0 {
			startLine = 0
		}
		if endLine > totalLines {
			endLine = totalLines
		}

		// Extract visible content
		for i := startLine; i < endLine; i++ {
			line := p.content[i]
			// Wrap long lines to fit width
			if len(line) > contentWidth && contentWidth > 3 {
				line = line[:contentWidth-3] + "..."
			} else if len(line) > contentWidth && contentWidth > 0 {
				// Very narrow width, just truncate
				line = line[:contentWidth]
			}
			visibleLines = append(visibleLines, line)
		}
	}

	// Pad with empty lines if needed
	for len(visibleLines) < contentHeight {
		visibleLines = append(visibleLines, "")
	}

	// Add scroll indicators
	if p.scrollPos > 0 {
		title = title + " ↑"
	}
	if len(p.content) > p.height-2 && p.scrollPos < len(p.content)-(p.height-2) {
		title = title + " ↓"
	}

	// Render content
	content := strings.Join(visibleLines, "\n")

	// Create the full panel view
	titleStyle := s.Title.Copy().
		Background(theme.SurfaceHigh).
		Width(p.width).
		Padding(0, 1)

	fullContent := lipgloss.JoinVertical(
		lipgloss.Left,
		titleStyle.Render(title),
		lipgloss.NewStyle().Padding(0, 1).Render(content),
	)

	return panelStyle.
		Width(p.width).
		Height(p.height).
		Render(fullContent)
}

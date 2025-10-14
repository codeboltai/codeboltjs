package panel

import (
	"fmt"
	"strings"

	"gotui/internal/styles"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"
	zone "github.com/lrstanley/bubblezone"
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
	collapsed bool
	zonePref  string
}

// New creates a new panel with the given title
func New(title string) *Panel {
	return &Panel{
		title:    title,
		content:  make([]string, 0),
		maxLines: 100, // Keep last 100 lines
		visible:  true,
		zonePref: zone.NewPrefix(),
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
	if height < 1 {
		height = 1
	}
	if p.collapsed {
		height = 1
	}
	p.height = height
	// Adjust scroll position if needed
	if !p.collapsed && len(p.content) > p.height-2 {
		p.scrollPos = len(p.content) - (p.height - 2)
	} else {
		p.scrollPos = 0
	}
}

// ContentLineCount returns the number of content lines stored in the panel.
func (p *Panel) ContentLineCount() int {
	if p == nil {
		return 0
	}
	return len(p.content)
}

// ToggleCollapsed switches the collapsed state.
func (p *Panel) ToggleCollapsed() {
	if p == nil {
		return
	}
	p.collapsed = !p.collapsed
	if p.collapsed {
		p.scrollPos = 0
	}
}

// SetCollapsed explicitly sets the collapsed state.
func (p *Panel) SetCollapsed(collapsed bool) {
	if p == nil {
		return
	}
	p.collapsed = collapsed
	if p.collapsed {
		p.scrollPos = 0
	}
}

// IsCollapsed reports whether the panel is collapsed.
func (p *Panel) IsCollapsed() bool {
	if p == nil {
		return false
	}
	return p.collapsed
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

func (p *Panel) ensureZonePrefix() {
	if p.zonePref == "" {
		p.zonePref = zone.NewPrefix()
	}
}

func (p *Panel) titleZoneID() string {
	p.ensureZonePrefix()
	return fmt.Sprintf("%stitle", p.zonePref)
}

// TitleZoneID exposes the zone identifier for the panel title.
func (p *Panel) TitleZoneID() string {
	if p == nil {
		return ""
	}
	return p.titleZoneID()
}

// DesiredHeight estimates the height needed to display the panel at the given width.
func (p *Panel) DesiredHeight(width int) int {
	if p == nil {
		return 0
	}
	base := 1 // title
	if p.collapsed {
		return base
	}
	usableWidth := width
	if usableWidth <= 0 {
		usableWidth = p.width
	}
	if usableWidth <= 0 {
		usableWidth = 1
	}
	usableWidth = maxInt(1, usableWidth-2)

	lineCount := 0
	if len(p.content) == 0 {
		lineCount = 1
	} else {
		for _, line := range p.content {
			w := lipgloss.Width(line)
			if w <= 0 {
				lineCount++
				continue
			}
			segments := (w + usableWidth - 1) / usableWidth
			if segments < 1 {
				segments = 1
			}
			lineCount += segments
		}
	}

	return base + lineCount
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

	// theme := styles.CurrentTheme()
	s := styles.CurrentStyles()
	p.ensureZonePrefix()

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
	indicator := "▸"
	if !p.collapsed {
		indicator = "▾"
	}
	title = fmt.Sprintf("%s %s", indicator, title)
	if p.active {
		title = "▶ " + title
	} else {
		title = "  " + title
	}
	titleStyle := s.Title.Copy().
		Width(p.width).
		Padding(0, 1)
	titleRendered := zone.Mark(p.titleZoneID(), titleStyle.Render(title))

	contentWidth := p.width - 2   // Account for padding
	contentHeight := p.height - 1 // Account for title
	if contentWidth < 0 {
		contentWidth = 0
	}
	if contentHeight <= 0 || p.collapsed {
		return panelStyle.Width(p.width).Height(p.height).Render(titleRendered)
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
	titleWithIndicators := title
	if p.scrollPos > 0 {
		titleWithIndicators += " ↑"
	}
	if len(p.content) > p.height-2 && p.scrollPos < len(p.content)-(p.height-2) {
		titleWithIndicators += " ↓"
	}
	titleRendered = zone.Mark(p.titleZoneID(), titleStyle.Render(titleWithIndicators))

	// Render content
	content := strings.Join(visibleLines, "\n")

	fullContent := lipgloss.JoinVertical(
		lipgloss.Left,
		titleRendered,
		lipgloss.NewStyle().Padding(0, 1).Render(content),
	)

	return panelStyle.
		Width(p.width).
		Height(p.height).
		Render(fullContent)
}

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

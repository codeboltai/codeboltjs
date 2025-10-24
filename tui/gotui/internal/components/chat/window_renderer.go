package chat

import (
	"strings"

	"gotui/internal/components/chat/windows"
	"gotui/internal/styles"

	"github.com/charmbracelet/lipgloss/v2"
)

func (c *Chat) renderConversationWindow(win *windows.ConversationWindow, _ bool, active bool) string {
	if c == nil || win == nil {
		return ""
	}
	innerWidth := win.InnerWidth()
	innerHeight := win.InnerHeight()
	if innerWidth <= 0 || innerHeight <= 0 {
		return ""
	}

	chatWidth := innerWidth
	contextWidth := 0

	if c.contextDrawerVisible && len(c.rightPanels) > 0 {
		maxContextWidth := innerWidth - minMainWidth - 1
		if maxContextWidth >= minConversationWidth {
			preferred := clampInt(defaultConversationWidth, minConversationWidth, maxContextWidth)
			contextWidth = preferred
			chatWidth = innerWidth - contextWidth - 1
			if chatWidth < minMainWidth {
				deficit := minMainWidth - chatWidth
				contextWidth -= deficit
				if contextWidth < minConversationWidth {
					contextWidth = 0
					chatWidth = innerWidth
				} else {
					chatWidth = innerWidth - contextWidth - 1
				}
			}
			if contextWidth <= 0 {
				contextWidth = 0
				chatWidth = innerWidth
			}
		}
	}

	chatColumn := c.renderWindowChatColumn(win, chatWidth, innerHeight, active)
	if strings.TrimSpace(chatColumn) == "" {
		chatColumn = lipgloss.NewStyle().Width(chatWidth).Height(innerHeight).Render("")
	}

	segments := []string{chatColumn}
	if contextWidth > 0 {
		contextColumn := c.renderWindowContextColumn(contextWidth, innerHeight)
		if strings.TrimSpace(contextColumn) != "" {
			theme := styles.CurrentTheme()
			separator := lipgloss.NewStyle().
				Width(1).
				Height(innerHeight).
				Render(verticalSeparator(theme, innerHeight))
			contextRendered := lipgloss.NewStyle().
				Width(contextWidth).
				Height(innerHeight).
				Render(contextColumn)
			segments = append(segments, separator, contextRendered)
		}
	}

	body := lipgloss.JoinHorizontal(lipgloss.Top, segments...)
	return lipgloss.NewStyle().
		Width(innerWidth).
		Height(innerHeight).
		Render(body)
}

func (c *Chat) renderWindowChatColumn(win *windows.ConversationWindow, width, height int, active bool) string {
	if width <= 0 || height <= 0 {
		return ""
	}
	vp := win.Viewport()
	if vp == nil {
		return lipgloss.NewStyle().Width(width).Height(height).Render("")
	}

	statusView, statusHeight := c.windowStatusView(width)
	inputView, inputHeight := c.windowInputView(width, active)
	helpView, helpHeight := c.windowHelpView(width)

	minViewport := 3
	reserved := inputHeight + helpHeight + statusHeight
	viewportHeight := height - reserved
	if viewportHeight < minViewport {
		if helpHeight > 0 {
			reserved -= helpHeight
			helpView = ""
			helpHeight = 0
			viewportHeight = height - reserved
		}
	}
	if viewportHeight < minViewport && statusHeight > 0 {
		reserved -= statusHeight
		statusView = ""
		statusHeight = 0
		viewportHeight = height - reserved
	}
	if viewportHeight < 1 {
		viewportHeight = 1
	}

	if vp.Width() != width || vp.Height() != viewportHeight {
		vp.SetSize(width, viewportHeight)
	}

	history := lipgloss.NewStyle().
		Width(width).
		Height(viewportHeight).
		Render(vp.View())

	theme := styles.CurrentTheme()
	sections := []string{history}

	if statusView != "" {
		sections = append(sections, horizontalSeparator(theme, width))
		sections = append(sections, statusView)
	}

	if inputView != "" {
		sections = append(sections, horizontalSeparator(theme, width))
		sections = append(sections, inputView)
	}

	if helpView != "" {
		sections = append(sections, helpView)
	}

	return lipgloss.NewStyle().
		Width(width).
		Height(height).
		Render(lipgloss.JoinVertical(lipgloss.Left, sections...))
}

func (c *Chat) renderWindowContextColumn(width, height int) string {
	if width <= 0 || height <= 0 || !c.contextDrawerVisible || len(c.rightPanels) == 0 {
		return ""
	}
	content := c.buildContextDrawerContent(width)
	if strings.TrimSpace(content) == "" {
		return ""
	}
	trimmed := limitContentHeight(content, height)
	return lipgloss.NewStyle().
		Width(width).
		Height(height).
		Render(trimmed)
}

func (c *Chat) windowStatusView(width int) (string, int) {
	if c.modelStatusWidget == nil {
		return "", 0
	}
	view := c.modelStatusWidget.View()
	if strings.TrimSpace(view) == "" {
		return "", 0
	}
	rendered := lipgloss.NewStyle().Width(width).Render(view)
	return rendered, lipgloss.Height(rendered)
}

func (c *Chat) windowHelpView(width int) (string, int) {
	view, height := c.renderHelpBar(width)
	if strings.TrimSpace(view) == "" || height <= 0 {
		return "", 0
	}
	rendered := lipgloss.NewStyle().Width(width).Render(view)
	return rendered, lipgloss.Height(rendered)
}

func (c *Chat) windowInputView(width int, active bool) (string, int) {
	height := c.textHeight
	if height < 1 {
		height = 1
	}
	if c.input == nil {
		return "", height
	}
	if active {
		c.input.SetSize(width, height)
		view := lipgloss.NewStyle().Width(width).Render(c.input.View())
		return view, lipgloss.Height(view)
	}
	theme := styles.CurrentTheme()
	pl := lipgloss.NewStyle().
		Width(width).
		Height(height).
		Border(lipgloss.NormalBorder()).
		BorderForeground(lipgloss.Color(theme.Muted.Hex())).
		Foreground(lipgloss.Color(theme.Muted.Hex())).
		Align(lipgloss.Center, lipgloss.Center).
		Render("Activate window to type")
	return pl, height
}

func limitContentHeight(content string, height int) string {
	if height <= 0 {
		return ""
	}
	lines := strings.Split(content, "\n")
	if len(lines) > height {
		lines = lines[:height]
	}
	return strings.Join(lines, "\n")
}

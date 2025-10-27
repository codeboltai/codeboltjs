package chat

import (
	"strings"

	"gotui/internal/styles"

	"github.com/charmbracelet/bubbles/v2/viewport"
	"github.com/charmbracelet/lipgloss/v2"
	zone "github.com/lrstanley/bubblezone"
)

const (
	minConversationWidth     = 22
	maxConversationWidth     = 36
	defaultConversationWidth = 28
	minMainWidth             = 40

	singleColumnMinConversationHeight = 3
	singleColumnAvgChipWidth          = 18
	singleColumnMinChatHeight         = 8

	twoColumnMinConversationHeight = 6

	contextMinimumHeight = 4
	contextPanelSpacing  = 1
)

// SetSize sets the chat component dimensions.
func (c *Chat) SetSize(width, height int) {

	// Set width/height for the chat component.
	c.width = width
	c.height = height

	helpBarHeight := 0
	if c.helpBar != nil {
		helpBarHeight = c.helpBar.VisibleHeight()
	}

	availableHeight := height - c.textHeight - helpBarHeight
	if availableHeight < 0 {
		availableHeight = 0
	}

	c.contextDrawerVisible = len(c.rightPanels) > 0

	twoColumnMinWidth := minConversationWidth + minMainWidth + 1
	c.singleColumn = width < twoColumnMinWidth

	if c.singleColumn {
		c.configureSingleColumn(width, availableHeight)
	} else {
		c.configureTwoColumn(width, availableHeight)
	}

	if c.helpBar != nil {
		c.helpBar.SetSize(c.contentWidth, helpBarHeight)
	}

	if c.conversationBar != nil {
		c.conversationBar.SetSize(c.conversationListWidth, c.conversationHeight)
	}

	if c.input != nil {
		c.input.SetSize(c.contentWidth, c.textHeight)
	}

	if c.viewport != nil {
		c.viewport.SetSize(c.contentWidth, c.chatHeight)
	}

	c.refreshActiveConversationView()

	if c.windowManager != nil {
		c.windowManager.SetSize(width, height)
	}
}

func (c *Chat) configureSingleColumn(width, availableHeight int) {
	if width < 0 {
		width = 0
	}

	c.conversationListWidth = width
	c.contentWidth = width
	c.rightSidebarWidth = 0
	c.contextWidth = 0

	if availableHeight <= 0 {
		c.conversationHeight = 0
		c.contextHeight = 0
		c.chatHeight = 0
		return
	}

	conversationHeight := clampInt(c.estimateHorizontalConversationHeight(width), singleColumnMinConversationHeight, availableHeight)
	remaining := availableHeight - conversationHeight
	if remaining < 0 {
		remaining = 0
	}

	contextHeight := 0
	if c.contextDrawerVisible && remaining > 0 {
		desired := c.desiredContextHeight(width)
		if desired > 0 {
			lower := contextMinimumHeight
			if desired < lower {
				lower = desired
			}
			if lower > remaining {
				lower = remaining
			}
			contextHeight = clampInt(desired, lower, remaining)
		}
	}

	if contextHeight < 0 {
		contextHeight = 0
	}
	if contextHeight > remaining {
		contextHeight = remaining
	}

	chatHeight := remaining - contextHeight
	if chatHeight < 0 {
		chatHeight = 0
	}

	if chatHeight < singleColumnMinChatHeight && availableHeight >= singleColumnMinChatHeight {
		deficit := singleColumnMinChatHeight - chatHeight

		reducibleContext := maxInt(0, contextHeight-contextMinimumHeight)
		take := minInt(deficit, reducibleContext)
		contextHeight -= take
		chatHeight += take
		deficit -= take

		if deficit > 0 {
			reducibleConversation := maxInt(0, conversationHeight-singleColumnMinConversationHeight)
			take = minInt(deficit, reducibleConversation)
			conversationHeight -= take
			chatHeight += take
		}
	}

	if chatHeight < 0 {
		chatHeight = 0
	}
	if conversationHeight < 0 {
		conversationHeight = 0
	}
	if contextHeight < 0 {
		contextHeight = 0
	}

	c.conversationHeight = conversationHeight
	c.contextHeight = contextHeight
	c.chatHeight = chatHeight
}

func (c *Chat) configureTwoColumn(width, availableHeight int) {
	if width < 0 {
		width = 0
	}

	// Compute conversation area (chips) height across the full width
	chipsHeight := clampInt(c.estimateHorizontalConversationHeight(width), twoColumnMinConversationHeight, availableHeight)
	if chipsHeight > availableHeight {
		chipsHeight = availableHeight
	}

	remaining := maxInt(0, availableHeight-chipsHeight)

	// Determine context drawer width (right column)
	maxContextWidth := width - minMainWidth - 1
	contextWidth := c.contextWidth
	if maxContextWidth < minConversationWidth {
		contextWidth = 0
	} else {
		if contextWidth == 0 {
			contextWidth = defaultConversationWidth
		}
		upper := minInt(maxContextWidth, maxConversationWidth)
		contextWidth = clampInt(contextWidth, minConversationWidth, upper)
	}

	separator := 0
	if contextWidth > 0 {
		separator = 1
	}

	contentWidth := width - contextWidth - separator
	if contentWidth < minMainWidth && contextWidth > 0 {
		shortfall := minMainWidth - contentWidth
		adjusted := contextWidth - shortfall
		if adjusted < minConversationWidth {
			adjusted = 0
		}
		contextWidth = adjusted
		separator = 0
		if contextWidth > 0 {
			separator = 1
		}
		contentWidth = width - contextWidth - separator
	}
	if contentWidth < 0 {
		contentWidth = 0
	}

	c.contextWidth = contextWidth
	c.contentWidth = contentWidth
	c.conversationListWidth = width
	c.conversationHeight = chipsHeight
	c.chatHeight = remaining
	c.contextHeight = remaining
	c.rightSidebarWidth = contextWidth
}

func (c *Chat) estimateHorizontalConversationHeight(width int) int {
	if width <= 0 {
		return singleColumnMinConversationHeight
	}

	totalItems := len(c.conversations) + 1 // include new conversation button
	if totalItems <= 0 {
		totalItems = 1
	}

	perRow := maxInt(1, width/singleColumnAvgChipWidth)
	rows := (totalItems + perRow - 1) / perRow
	if rows < 1 {
		rows = 1
	}

	height := rows + 1
	if rows > 0 {
		height++
	}

	return maxInt(singleColumnMinConversationHeight, height)
}

func (c *Chat) renderChatArea(mainWidth int) (string, int) {
	chatWidth := mainWidth
	if chatWidth <= 0 {
		chatWidth = c.contentWidth
	}
	if chatWidth <= 0 {
		chatWidth = c.width
	}
	if chatWidth <= 0 {
		chatWidth = 40
	}

	statusView := ""
	statusHeight := 0
	if c.modelStatusWidget != nil {
		statusView = c.modelStatusWidget.View()
		if statusView != "" {
			statusHeight = lipgloss.Height(statusView)
		}
	}

	helpbarView, helpbarHeight := c.renderHelpBar(chatWidth)

	viewportHeight := c.chatHeight - statusHeight
	if viewportHeight < 1 {
		viewportHeight = 1
	}

	if c.viewport != nil {
		if c.viewport.Width() != chatWidth || c.viewport.Height() != viewportHeight {
			c.viewport.SetSize(chatWidth, viewportHeight)
		}
	}

	chatHistory := c.viewport.View()
	inputArea := c.input.View()

	sections := []string{chatHistory}
	if statusView != "" {
		sections = append(sections, statusView)
	}
	sections = append(sections, inputArea)
	if helpbarView != "" {
		sections = append(sections, helpbarView)
	}

	content := lipgloss.JoinVertical(lipgloss.Left, sections...)

	totalHeight := c.chatHeight + helpbarHeight
	if totalHeight < 0 {
		totalHeight = c.chatHeight
	}

	rendered := lipgloss.NewStyle().
		Width(chatWidth).
		Height(totalHeight).
		Render(content)

	return zone.Mark(c.chatZoneID, rendered), totalHeight
}

func (c *Chat) renderHelpBar(width int) (string, int) {
	if c.helpBar == nil {
		return "", 0
	}
	if width <= 0 {
		width = c.contentWidth
	}
	if width <= 0 {
		width = c.width
	}
	c.helpBar.SetSize(width, c.helpBar.VisibleHeight())
	view := c.helpBar.View()
	if strings.TrimSpace(view) == "" {
		return "", 0
	}
	height := c.helpBar.VisibleHeight()
	if height <= 0 {
		height = lipgloss.Height(view)
	}
	return view, height
}

func (c *Chat) renderContextDrawer(width, height int) string {
	if width <= 0 || height <= 0 || !c.contextDrawerVisible || len(c.rightPanels) == 0 {
		return ""
	}

	if c.contextViewport.Width() != width || c.contextViewport.Height() != height {
		c.contextViewport = newContextViewport(width, height)
	}

	theme := styles.CurrentTheme()
	c.contextViewport.Style = lipgloss.NewStyle().Foreground(theme.Foreground)
	c.contextViewport.MouseWheelEnabled = true

	content := c.buildContextDrawerContent(width)
	c.contextViewport.SetContent(content)

	rendered := lipgloss.NewStyle().
		Width(width).
		Height(height).
		Render(c.contextViewport.View())

	return zone.Mark(c.contextZoneID, rendered)
}

func (c *Chat) buildContextDrawerContent(width int) string {
	if len(c.rightPanels) == 0 {
		return ""
	}

	var builder strings.Builder
	first := true

	for _, panel := range c.rightPanels {
		if panel == nil {
			continue
		}
		height := panel.DesiredHeight(width)
		if height <= 0 {
			continue
		}
		panel.SetVisible(true)
		panel.SetSize(width, height)
		view := strings.TrimRight(panel.View(), "\n")
		if strings.TrimSpace(view) == "" {
			continue
		}
		if !first {
			for i := 0; i < contextPanelSpacing; i++ {
				builder.WriteByte('\n')
			}
		}
		builder.WriteString(view)
		first = false
	}

	return builder.String()
}

func (c *Chat) desiredContextHeight(width int) int {
	if len(c.rightPanels) == 0 {
		return 0
	}

	total := 0
	prev := false
	for _, panel := range c.rightPanels {
		if panel == nil {
			continue
		}
		height := panel.DesiredHeight(width)
		if height <= 0 {
			continue
		}
		if prev {
			total += contextPanelSpacing
		}
		total += height
		prev = true
	}

	return total
}

func (c *Chat) renderSingleColumnLayout(theme styles.Theme, chatArea string, chatAreaHeight int) string {
	var sections []string

	if c.conversationHeight > 0 {
		convo := c.renderConversationList()
		if strings.TrimSpace(convo) != "" {
			convo = lipgloss.NewStyle().
				Width(c.contentWidth).
				Height(c.conversationHeight).
				Render(convo)
			sections = append(sections, convo)
		}
	}

	chatView := lipgloss.NewStyle().
		Width(c.contentWidth).
		Height(chatAreaHeight).
		Render(chatArea)

	if len(sections) > 0 && strings.TrimSpace(chatView) != "" {
		sections = append(sections, horizontalSeparator(theme, c.contentWidth))
	}

	sections = append(sections, chatView)

	if c.contextDrawerVisible && c.contextHeight > 0 {
		contextView := c.renderContextDrawer(c.contentWidth, c.contextHeight)
		if strings.TrimSpace(contextView) != "" {
			sections = append(sections, horizontalSeparator(theme, c.contentWidth))
			sections = append(sections, lipgloss.NewStyle().
				Width(c.contentWidth).
				Height(c.contextHeight).
				Render(contextView))
		}
	}

	content := lipgloss.JoinVertical(lipgloss.Left, sections...)
	return lipgloss.NewStyle().
		Width(c.width).
		Height(c.height).
		Render(content)
}

func (c *Chat) renderTwoColumnLayout(theme styles.Theme, chatArea string, chatAreaHeight int) string {
	var sections []string

	if c.conversationHeight > 0 {
		convo := c.renderConversationList()
		if strings.TrimSpace(convo) != "" {
			convo = lipgloss.NewStyle().
				Width(c.width).
				Height(c.conversationHeight).
				Render(convo)
			sections = append(sections, convo)
			sections = append(sections, horizontalSeparator(theme, c.width))
		}
	}

	chatView := lipgloss.NewStyle().
		Width(c.contentWidth).
		Height(chatAreaHeight).
		Render(chatArea)

	rowSegments := []string{chatView}

	if c.contextDrawerVisible && c.contextWidth > 0 {
		contextView := c.renderContextDrawer(c.contextWidth, c.contextHeight)
		if strings.TrimSpace(contextView) != "" {
			rowSegments = append(rowSegments, verticalSeparator(theme, chatAreaHeight))
			rowSegments = append(rowSegments, lipgloss.NewStyle().
				Width(c.contextWidth).
				Height(chatAreaHeight).
				Render(contextView))
		}
	}

	mainRow := lipgloss.JoinHorizontal(lipgloss.Top, rowSegments...)
	sections = append(sections, mainRow)

	content := lipgloss.JoinVertical(lipgloss.Left, sections...)
	return lipgloss.NewStyle().
		Width(c.width).
		Height(c.height).
		Render(content)
}

func horizontalSeparator(theme styles.Theme, width int) string {
	if width <= 0 {
		width = 1
	}

	return lipgloss.NewStyle().
		Width(width).
		Foreground(theme.Border).
		Render(strings.Repeat("─", width))
}

func verticalSeparator(theme styles.Theme, height int) string {
	if height <= 0 {
		height = 1
	}

	line := strings.Repeat("│\n", height-1) + "│"
	return lipgloss.NewStyle().
		Width(1).
		Foreground(theme.Border).
		Render(line)
}

func newContextViewport(width, height int) viewport.Model {
	w := maxInt(width, 1)
	h := maxInt(height, 1)
	vp := viewport.New(viewport.WithWidth(w), viewport.WithHeight(h))
	theme := styles.CurrentTheme()
	vp.Style = lipgloss.NewStyle().Foreground(theme.Foreground)
	vp.MouseWheelEnabled = true
	vp.KeyMap.PageDown.SetKeys("pgdown")
	vp.KeyMap.PageUp.SetKeys("pgup")
	vp.KeyMap.HalfPageDown.SetKeys("ctrl+d")
	vp.KeyMap.HalfPageUp.SetKeys("ctrl+u")
	vp.KeyMap.Down.SetEnabled(false)
	vp.KeyMap.Up.SetEnabled(false)
	vp.KeyMap.Left.SetEnabled(false)
	vp.KeyMap.Right.SetEnabled(false)
	return vp
}

func (c *Chat) GetMainWidth() int {
	if c.width <= 0 {
		return 80
	}
	return c.width
}

func (c *Chat) GetSidebarWidth() int {
	return 0
}

func clampInt(value, min, max int) int {
	if value < min {
		return min
	}
	if value > max {
		return max
	}
	return value
}

func minInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

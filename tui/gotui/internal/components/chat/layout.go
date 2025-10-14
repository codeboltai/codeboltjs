package chat

import (
	"fmt"
	"strings"

	"gotui/internal/styles"

	"github.com/charmbracelet/bubbles/v2/viewport"
	"github.com/charmbracelet/lipgloss/v2"
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

	if c.conversationPanel != nil {
		c.conversationPanel.SetHorizontalLayout(c.singleColumn)
		c.conversationPanel.SetSize(c.conversationListWidth, c.conversationHeight)
	}

	if c.input != nil {
		c.input.SetSize(c.contentWidth, c.textHeight)
	}

	if c.viewport != nil {
		c.viewport.SetSize(c.contentWidth, c.chatHeight)
	}

	c.refreshActiveConversationView()
}

func (c *Chat) configureSingleColumn(width, availableHeight int) {
	if width < 0 {
		width = 0
	}

	c.conversationListWidth = width
	c.contentWidth = width
	c.rightSidebarWidth = 0

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
			contextHeight = clampInt(desired, contextMinimumHeight, remaining)
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

	maxListWidth := width - minMainWidth - 1
	if maxListWidth < minConversationWidth {
		c.conversationListWidth = 0
	} else {
		if c.conversationListWidth == 0 {
			c.conversationListWidth = defaultConversationWidth
		}
		upper := minInt(maxListWidth, maxConversationWidth)
		c.conversationListWidth = clampInt(c.conversationListWidth, minConversationWidth, upper)
	}

	separator := 0
	if c.conversationListWidth > 0 {
		separator = 1
	}

	c.contentWidth = width - c.conversationListWidth - separator
	if c.contentWidth < minMainWidth && c.conversationListWidth > 0 {
		shortfall := minMainWidth - c.contentWidth
		adjusted := c.conversationListWidth - shortfall
		if adjusted < minConversationWidth {
			adjusted = 0
		}
		c.conversationListWidth = adjusted
		separator = 0
		if c.conversationListWidth > 0 {
			separator = 1
		}
		c.contentWidth = width - c.conversationListWidth - separator
	}
	if c.contentWidth < 0 {
		c.contentWidth = 0
	}

	c.rightSidebarWidth = 0
	c.chatHeight = maxInt(0, availableHeight)

	if c.conversationListWidth == 0 {
		c.conversationHeight = 0
		c.contextHeight = 0
		return
	}

	conversationHeight := availableHeight
	contextHeight := 0

	if c.contextDrawerVisible && availableHeight > twoColumnMinConversationHeight {
		desired := c.desiredContextHeight(c.conversationListWidth)
		maxContext := maxInt(0, availableHeight-twoColumnMinConversationHeight)
		if maxContext > 0 && desired > 0 {
			contextHeight = clampInt(desired, contextMinimumHeight, maxContext)
		}
		if contextHeight > maxContext {
			contextHeight = maxContext
		}
	}

	conversationHeight = availableHeight - contextHeight
	if conversationHeight < twoColumnMinConversationHeight && availableHeight >= twoColumnMinConversationHeight {
		deficit := twoColumnMinConversationHeight - conversationHeight
		contextHeight -= deficit
		if contextHeight < 0 {
			contextHeight = 0
		}
		conversationHeight = availableHeight - contextHeight
	}

	if conversationHeight < 0 {
		conversationHeight = 0
	}
	if contextHeight < 0 {
		contextHeight = 0
	}

	c.conversationHeight = conversationHeight
	c.contextHeight = contextHeight
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

func (c *Chat) renderModelStatus() string {
	if c.selectedModel == nil {
		return ""
	}
	theme := styles.CurrentTheme()
	model := fmt.Sprintf("Model: %s", c.selectedModel.Name)
	provider := c.selectedModel.Provider
	if provider != "" {
		model += fmt.Sprintf("  •  %s", provider)
	}
	if c.selectedModel.Context != "" {
		model += fmt.Sprintf("  •  %s context", c.selectedModel.Context)
	}
	return lipgloss.NewStyle().
		Foreground(theme.Primary).
		Border(lipgloss.NormalBorder()).
		BorderForeground(theme.Primary).
		Padding(0, 1).
		Render(model)
}

func (c *Chat) renderChatArea(mainWidth int) string {
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

	chatHistory := c.viewport.View()
	inputArea := c.input.View()
	if c.selectedModel != nil {
		inputArea = lipgloss.JoinVertical(
			lipgloss.Left,
			c.renderModelStatus(),
			inputArea,
		)
	}

	sections := []string{chatHistory, inputArea}
	if helpbarView := c.renderHelpBar(chatWidth); helpbarView != "" {
		sections = append(sections, helpbarView)
	}

	content := lipgloss.JoinVertical(lipgloss.Left, sections...)

	return lipgloss.NewStyle().
		Width(chatWidth).
		Height(c.chatHeight).
		Render(content)
}

func (c *Chat) renderHelpBar(width int) string {
	if c.helpBar == nil {
		return ""
	}
	if width <= 0 {
		width = c.contentWidth
	}
	if width <= 0 {
		width = c.width
	}
	c.helpBar.SetSize(width, c.helpBar.VisibleHeight())
	return c.helpBar.View()
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

	return lipgloss.NewStyle().
		Width(width).
		Height(height).
		Render(c.contextViewport.View())
}

func (c *Chat) buildContextDrawerContent(width int) string {
	if len(c.rightPanels) == 0 {
		return ""
	}

	var sections []string
	separator := strings.Repeat("\n", contextPanelSpacing)

	for _, panel := range c.rightPanels {
		if panel == nil {
			continue
		}
		panel.SetVisible(true)
		height := panel.ContentLineCount() + 1
		if height < 3 {
			height = 3
		}
		panel.SetSize(width, height)
		view := strings.TrimRight(panel.View(), "\n")
		if strings.TrimSpace(view) == "" {
			continue
		}
		sections = append(sections, view)
	}

	if len(sections) == 0 {
		return ""
	}

	return strings.Join(sections, separator)
}

func (c *Chat) desiredContextHeight(width int) int {
	if len(c.rightPanels) == 0 {
		return 0
	}

	total := 0
	count := 0
	for _, panel := range c.rightPanels {
		if panel == nil {
			continue
		}
		height := panel.ContentLineCount() + 1
		if height < 3 {
			height = 3
		}
		total += height
		count++
	}

	if count > 1 {
		total += (count - 1) * contextPanelSpacing
	}

	return total
}

func (c *Chat) renderSingleColumnLayout(theme styles.Theme, chatArea string) string {
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
		Height(c.chatHeight).
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

func (c *Chat) renderTwoColumnLayout(theme styles.Theme, chatArea string) string {
	var leftSections []string

	if c.conversationListWidth > 0 && c.conversationHeight > 0 {
		convo := c.renderConversationList()
		if strings.TrimSpace(convo) != "" {
			convo = lipgloss.NewStyle().
				Width(c.conversationListWidth).
				Height(c.conversationHeight).
				Render(convo)
			leftSections = append(leftSections, convo)
		}
	}

	if c.contextDrawerVisible && c.contextHeight > 0 {
		contextView := c.renderContextDrawer(c.conversationListWidth, c.contextHeight)
		if strings.TrimSpace(contextView) != "" {
			if len(leftSections) > 0 {
				leftSections = append(leftSections, horizontalSeparator(theme, c.conversationListWidth))
			}
			leftSections = append(leftSections, lipgloss.NewStyle().
				Width(c.conversationListWidth).
				Height(c.contextHeight).
				Render(contextView))
		}
	}

	leftColumn := ""
	if len(leftSections) > 0 {
		leftColumn = lipgloss.JoinVertical(lipgloss.Left, leftSections...)
		leftColumn = lipgloss.NewStyle().
			Width(c.conversationListWidth).
			Height(c.chatHeight).
			Render(leftColumn)
	}

	chatView := lipgloss.NewStyle().
		Width(c.contentWidth).
		Height(c.chatHeight).
		Render(chatArea)

	segments := []string{}
	if leftColumn != "" {
		segments = append(segments, leftColumn, verticalSeparator(theme, c.chatHeight))
	}
	segments = append(segments, chatView)

	content := lipgloss.JoinHorizontal(lipgloss.Top, segments...)
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

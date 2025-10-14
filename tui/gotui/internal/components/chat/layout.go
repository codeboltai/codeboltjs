package chat

import (
	"fmt"
	"strings"

	"gotui/internal/styles"

	"github.com/charmbracelet/lipgloss/v2"
)

// SetSize sets the chat component dimensions.
func (c *Chat) SetSize(width, height int) {
	c.width = width
	c.height = height
	helpBarHeight := 0
	if c.helpBar != nil {
		helpBarHeight = c.helpBar.VisibleHeight()
	}

	c.chatHeight = height - c.textHeight - helpBarHeight
	if c.chatHeight < 0 {
		c.chatHeight = 0
	}

	const (
		minConversationWidth     = 22
		maxConversationWidth     = 36
		defaultConversationWidth = 28
		minMainWidth             = 40
		minRightWidth            = 18
		maxRightWidth            = 32
		defaultRightWidth        = 26
	)

	minimumWidthForList := minMainWidth + minConversationWidth + 1
	if width < minimumWidthForList {
		c.conversationListWidth = 0
	} else {
		if c.conversationListWidth == 0 {
			c.conversationListWidth = defaultConversationWidth
		}
		maxListWidth := width - minMainWidth - 1
		if maxListWidth < minConversationWidth {
			c.conversationListWidth = 0
		} else {
			upperBound := maxConversationWidth
			if maxListWidth < upperBound {
				upperBound = maxListWidth
			}
			c.conversationListWidth = clampInt(c.conversationListWidth, minConversationWidth, upperBound)
		}
	}

	leftSeparator := 0
	if c.conversationListWidth > 0 {
		leftSeparator = 1
	}

	availableAfterLeft := width - c.conversationListWidth - leftSeparator
	if availableAfterLeft < 0 {
		availableAfterLeft = 0
	}

	maxAllowedRight := availableAfterLeft - minMainWidth - 1
	rightWidth := 0
	if maxAllowedRight >= minRightWidth {
		desired := c.rightSidebarWidth
		if desired == 0 {
			desired = defaultRightWidth
		}
		upper := maxAllowedRight
		if upper > maxRightWidth {
			upper = maxRightWidth
		}
		if upper < minRightWidth {
			upper = minRightWidth
		}
		rightWidth = clampInt(desired, minRightWidth, upper)
	}

	rightSeparator := 0
	if rightWidth > 0 {
		rightSeparator = 1
	}

	availableForMain := availableAfterLeft - rightWidth - rightSeparator
	if availableForMain < 0 {
		availableForMain = 0
	}

	c.rightSidebarWidth = rightWidth
	c.contentWidth = availableForMain

	if c.helpBar != nil {
		c.helpBar.SetSize(c.contentWidth, helpBarHeight)
	}

	if len(c.rightPanels) > 0 {
		visible := rightWidth > 0
		remainingHeight := c.chatHeight
		if remainingHeight < 0 {
			remainingHeight = 0
		}
		for i, panel := range c.rightPanels {
			if panel == nil {
				continue
			}
			panel.SetVisible(visible)
			if !visible {
				continue
			}
			panelsLeft := len(c.rightPanels) - i
			if panelsLeft <= 0 {
				panelsLeft = 1
			}
			height := 0
			if panelsLeft > 0 {
				height = remainingHeight / panelsLeft
			}
			if height < 3 && remainingHeight > 0 {
				if remainingHeight < 3 {
					height = remainingHeight
				} else {
					height = 3
				}
			}
			if height < 0 {
				height = 0
			}
			panel.SetSize(rightWidth, height)
			remainingHeight -= height
			if remainingHeight < 0 {
				remainingHeight = 0
			}
		}
	}

	c.input.SetSize(c.contentWidth, c.textHeight)
	c.viewport.SetSize(c.contentWidth, c.chatHeight)
	if c.conversationPanel != nil {
		c.conversationPanel.SetSize(c.conversationListWidth, c.chatHeight)
	}
	c.refreshActiveConversationView()
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
	if mainWidth <= 0 {
		separatorCount := 0
		if c.conversationListWidth > 0 {
			separatorCount++
		}
		if c.rightSidebarWidth > 0 {
			separatorCount++
		}
		mainWidth = c.width - c.conversationListWidth - c.rightSidebarWidth - separatorCount
	}

	chatWidth := mainWidth
	if chatWidth <= 0 {
		if c.width > 0 {
			chatWidth = c.width
		} else {
			chatWidth = 40
		}
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

	return lipgloss.NewStyle().
		Width(chatWidth).
		Render(lipgloss.JoinVertical(lipgloss.Left, sections...))
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

func (c *Chat) renderRightSidebar(theme styles.Theme) string {
	if c.rightSidebarWidth <= 0 || len(c.rightPanels) == 0 {
		return ""
	}

	var sections []string
	for _, panel := range c.rightPanels {
		if panel == nil {
			continue
		}
		view := panel.View()
		if strings.TrimSpace(view) == "" {
			continue
		}
		sections = append(sections, view)
	}

	if len(sections) == 0 {
		return ""
	}

	sidebar := lipgloss.JoinVertical(lipgloss.Left, sections...)

	return lipgloss.NewStyle().
		Width(c.rightSidebarWidth).
		Height(c.chatHeight).
		Render(sidebar)
}

func (c *Chat) composeLayout(theme styles.Theme, leftSidebar, chatArea, rightSidebar string) string {
	segments := make([]string, 0, 5)

	if leftSidebar != "" {
		segments = append(segments, leftSidebar)
		segments = append(segments, layoutSeparator(theme))
	}

	segments = append(segments, chatArea)

	if rightSidebar != "" {
		segments = append(segments, layoutSeparator(theme))
		segments = append(segments, rightSidebar)
	}

	return lipgloss.NewStyle().
		Width(c.width).
		Height(c.height).
		Render(lipgloss.JoinHorizontal(lipgloss.Top, segments...))
}

func layoutSeparator(theme styles.Theme) string {
	return lipgloss.NewStyle().
		Width(1).
		Foreground(theme.Border).
		Render("│")
}

func (c *Chat) GetMainWidth() int {
	if c.width <= 0 {
		return 80
	}
	return c.width
}

func (c *Chat) GetSidebarWidth() int {
	width := c.rightSidebarWidth
	if width <= 0 {
		return 0
	}
	totalWidth := c.width + width + 1
	if totalWidth < 60 {
		return 0
	}
	return width
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

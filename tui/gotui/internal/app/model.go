package app

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"

	"github.com/charmbracelet/bubbles/v2/key"
	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"
	zone "github.com/lrstanley/bubblezone"
	"golang.org/x/term"

	"gotui/internal/components/chat"
	"gotui/internal/components/helpbar"
	"gotui/internal/layout/panels"
	"gotui/internal/layout/sidebar"
	"gotui/internal/styles"
	"gotui/internal/wsclient"
)

// Config holds application configuration
type Config struct {
	Host string
	Port int
}

const tabBarHeight = 2

type tabID int

const (
	tabChat tabID = iota
	tabLogs
	tabGit
)

type tabRegion struct {
	id    tabID
	start int
	end   int
}

// Model represents the main application model
type Model struct {
	// Configuration
	cfg Config

	// Services
	wsClient *wsclient.Client

	// Components
	chat      *chat.Chat
	sidebar   *sidebar.Sidebar
	helpBar   *helpbar.HelpBar
	gitPanels *panels.GitPanels

	// State
	retryCount  int
	isRetrying  bool
	lastError   string
	chatFocused bool

	// Layout
	width      int
	height     int
	tabs       []string
	activeTab  tabID
	tabRegions []tabRegion

	// Key mappings
	keyMap helpbar.KeyMap
}

// NewModel creates a new application model
func NewModel(cfg Config) *Model {
	// Create services
	wsClient := wsclient.New(cfg.Host, cfg.Port)

	// Create components
	chatComp := chat.New()
	sidebarComp := sidebar.New(wsClient, cfg.Host, cfg.Port)
	helpBarComp := helpbar.New()
	gitPanels := panels.NewGitPanels()
	tabs := []string{"Chat", "Logs", "Git"}

	// Set up WebSocket logging and notifications
	wsClient.SetLogger(func(msg string) {
		sidebarComp.LogsPanel().AddLine(fmt.Sprintf("[WS] %s", msg))
	})

	wsClient.OnNotification(func(n wsclient.Notification) {
		notifLine := fmt.Sprintf("[%s] %s", n.Type, n.Action)
		if n.Event != "" {
			notifLine = fmt.Sprintf("[%s] %s", n.Type, n.Event)
		}
		sidebarComp.NotificationsPanel().AddLine(notifLine)
	})

	m := &Model{
		cfg:         cfg,
		wsClient:    wsClient,
		chat:        chatComp,
		sidebar:     sidebarComp,
		helpBar:     helpBarComp,
		gitPanels:   gitPanels,
		tabs:        tabs,
		activeTab:   tabChat,
		chatFocused: true,
		keyMap:      helpbar.DefaultKeyMap(),
	}

	// Focus chat initially
	m.chat.Focus()

	// Add initial status information
	sidebarComp.LogsPanel().AddLine("═══ SYSTEM STARTUP ═══")
	sidebarComp.LogsPanel().AddLine("🚀 Codebolt TUI Client initialized")
	sidebarComp.LogsPanel().AddLine("🔧 WebSocket client created")
	// Client no longer manages local agent processes
	sidebarComp.LogsPanel().AddLine("🎨 UI components loaded")
	sidebarComp.LogsPanel().AddLine("")
	sidebarComp.LogsPanel().AddLine("═══ AVAILABLE COMMANDS ═══")
	sidebarComp.LogsPanel().AddLine("📖 read <file> - Read file content")
	sidebarComp.LogsPanel().AddLine("✏️  write <file> - Create/edit file")
	sidebarComp.LogsPanel().AddLine("🤖 ask <question> - Ask AI")
	sidebarComp.LogsPanel().AddLine("❓ help - Show help")
	sidebarComp.LogsPanel().AddLine("🗑️  clear - Clear chat")
	sidebarComp.LogsPanel().AddLine("")

	// TUI is now always in client-only mode (server is started by agentserver)
	sidebarComp.LogsPanel().AddLine("📡 Client mode - connecting to server")
	sidebarComp.LogsPanel().AddLine(fmt.Sprintf("🔗 Target server: %s:%d", cfg.Host, cfg.Port))
	sidebarComp.LogsPanel().AddLine("ℹ️  Server should be started by codebolt-code command")

	m.refreshGitPanels()

	return m
}

// connectMsg represents a connection attempt result
type connectMsg struct {
	success bool
	err     error
}

// retryMsg represents a retry timer message
type retryMsg struct{}

// tryConnectMsg triggers a connection attempt
type tryConnectMsg struct{}

// Removed agent manager; no local agent process lifecycle

// getTerminalSize detects the actual terminal dimensions
func getTerminalSize() (int, int) {
	// Try to get terminal size from golang.org/x/term
	if width, height, err := term.GetSize(int(os.Stdout.Fd())); err == nil {
		log.Printf("Terminal size detected: %dx%d", width, height)
		return width, height
	}

	// Fallback: try environment variables
	if cols := os.Getenv("COLUMNS"); cols != "" {
		if width, err := strconv.Atoi(cols); err == nil {
			if lines := os.Getenv("LINES"); lines != "" {
				if height, err := strconv.Atoi(lines); err == nil {
					log.Printf("Terminal size from env: %dx%d", width, height)
					return width, height
				}
			}
		}
	}

	// Ultimate fallback
	log.Printf("Using fallback terminal size: 120x40")
	return 120, 40
}

// updateAllComponents updates all UI components with current dimensions
func (m *Model) updateAllComponents() {
	log.Printf("updateAllComponents: Updating components with %dx%d", m.width, m.height)

	if m.width > 0 && m.height > 0 {
		// Calculate help bar height
		helpBarHeight := 3
		if !m.helpBar.IsVisible() {
			helpBarHeight = 0
		}

		contentHeight := m.height - helpBarHeight - tabBarHeight
		if contentHeight < 1 {
			contentHeight = 1
		}

		m.chat.SetSize(m.width, contentHeight)
		m.sidebar.SetSize(m.width, contentHeight)
		if m.gitPanels != nil {
			m.gitPanels.SetSize(m.width, contentHeight)
		}

		m.helpBar.SetSize(m.width, helpBarHeight)

		log.Printf("updateAllComponents: contentHeight=%d helpbar=%d tab=%d",
			contentHeight, helpBarHeight, tabBarHeight)
	}
}

// Init initializes the application
func (m *Model) Init() tea.Cmd {
	log.Printf("Init() called")
	m.sidebar.LogsPanel().AddLine("🚀 Initializing Codebolt Go TUI...")

	var cmds []tea.Cmd

	// TUI is now always in client mode - connect to existing server
	m.sidebar.LogsPanel().AddLine("📡 Client mode - connecting to server")
	m.sidebar.LogsPanel().AddLine(fmt.Sprintf("🔌 Connecting to server at %s:%d", m.cfg.Host, m.cfg.Port))

	// Start connection attempts (external server should be running)
	delay := 1 * time.Second

	cmds = append(cmds, tea.Tick(delay, func(time.Time) tea.Msg {
		return tryConnectMsg{}
	}))

	// Detect actual terminal size and use it
	termWidth, termHeight := getTerminalSize()
	log.Printf("Init: Using terminal size: %dx%d", termWidth, termHeight)

	// Set initial size immediately (Bubble Tea will send its own WindowSizeMsg later)
	m.width = termWidth
	m.height = termHeight
	log.Printf("Init: Set model dimensions to %dx%d", m.width, m.height)

	// Force update all components with actual terminal size
	m.updateAllComponents()

	return tea.Batch(cmds...)
}

// No local agent start/stop; server handles agent lifecycle

// tryConnect attempts to connect to the WebSocket server
func (m *Model) tryConnect() tea.Cmd {
	return func() tea.Msg {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		err := m.wsClient.Connect(ctx)
		return connectMsg{success: err == nil, err: err}
	}
}

// toggleChatFocus toggles focus between chat and scroll mode
func (m *Model) toggleChatFocus() {
	m.chatFocused = !m.chatFocused
	if m.chatFocused {
		m.chat.Focus()
		m.sidebar.LogsPanel().AddLine("🎯 Chat focused - type to send messages")
	} else {
		m.chat.Blur()
		m.sidebar.LogsPanel().AddLine("🎯 Chat unfocused - use scroll keys to navigate")
	}
}

// Update handles incoming messages
func (m *Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd
	var cmds []tea.Cmd

	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		m.updateLayout()

	case tea.MouseClickMsg:
		mouse := msg.Mouse()
		if mouse.Y <= 1 {
			if target, ok := m.tabIDForX(mouse.X); ok {
				if cmd := m.switchTab(target); cmd != nil {
					return m, cmd
				}
				return m, nil
			}
		}

	case tea.KeyMsg:
		switch {
		case key.Matches(msg, m.keyMap.NextTab):
			if cmd := m.switchTab(m.nextTabID()); cmd != nil {
				return m, cmd
			}
			return m, nil
		case key.Matches(msg, m.keyMap.PrevTab):
			if cmd := m.switchTab(m.prevTabID()); cmd != nil {
				return m, cmd
			}
			return m, nil
		case key.Matches(msg, m.keyMap.TabChat):
			if cmd := m.switchTab(tabChat); cmd != nil {
				return m, cmd
			}
			return m, nil
		case key.Matches(msg, m.keyMap.TabLogs):
			if cmd := m.switchTab(tabLogs); cmd != nil {
				return m, cmd
			}
			return m, nil
		case key.Matches(msg, m.keyMap.TabGit):
			if cmd := m.switchTab(tabGit); cmd != nil {
				return m, cmd
			}
			return m, nil
		}

		if m.chat != nil && m.activeTab == tabChat {
			if key.Matches(msg, m.keyMap.ShowCommands) {
				m.chat.ToggleCommandPalette()
				return m, nil
			}
		}

		switch {
		case key.Matches(msg, m.keyMap.Quit):
			return m, tea.Quit
		case key.Matches(msg, m.keyMap.Help):
			m.helpBar.Toggle()
			m.updateLayout()
		case key.Matches(msg, m.keyMap.FocusChat):
			if m.activeTab == tabChat {
				m.toggleChatFocus()
			}
		}

	case chat.ModelSelectedMsg:
		m.sidebar.AgentPanel().AddLine(fmt.Sprintf("🤖 Model selected: %s", msg.Option.Name))
		m.sidebar.LogsPanel().AddLine(fmt.Sprintf("🤖 Active model set to %s (%s)", msg.Option.Name, msg.Option.Provider))
	}

	// Pass messages to components
	m.chat, cmd = m.chat.Update(msg)
	cmds = append(cmds, cmd)

	cmd = m.sidebar.Update(msg)
	cmds = append(cmds, cmd)

	if m.gitPanels != nil {
		if gitCmd := m.gitPanels.Update(msg); gitCmd != nil {
			cmds = append(cmds, gitCmd)
		}
	}

	return m, tea.Batch(cmds...)
}

func (m *Model) helpBarHeight() int {
	if m.helpBar == nil || !m.helpBar.IsVisible() {
		return 0
	}
	return 3
}

func (m *Model) renderTabs() string {
	if len(m.tabs) == 0 {
		return ""
	}

	theme := styles.CurrentTheme()

	activeStyle := lipgloss.NewStyle().
		BorderStyle(lipgloss.NormalBorder()).
		BorderForeground(theme.Primary).
		BorderBottom(false).
		Padding(0, 2).
		Background(theme.SurfaceHigh).
		Foreground(theme.Primary).
		Bold(true)

	inactiveStyle := lipgloss.NewStyle().
		BorderStyle(lipgloss.NormalBorder()).
		BorderForeground(theme.Border).
		BorderBottom(true).
		Padding(0, 2).
		Background(theme.Surface).
		Foreground(theme.Muted)

	var rendered []string
	m.tabRegions = m.tabRegions[:0]
	cursor := 0
	for idx, label := range m.tabs {
		style := inactiveStyle
		if idx == int(m.activeTab) {
			style = activeStyle
		}
		renderedTab := style.Render(label)
		tabWidth := lipgloss.Width(renderedTab)
		if tabWidth < 0 {
			tabWidth = 0
		}
		m.tabRegions = append(m.tabRegions, tabRegion{id: tabID(idx), start: cursor, end: cursor + tabWidth})
		rendered = append(rendered, renderedTab)
		cursor += tabWidth
	}

	row := lipgloss.JoinHorizontal(lipgloss.Top, rendered...)
	rowWidth := lipgloss.Width(row)
	if rowWidth < m.width {
		padding := lipgloss.NewStyle().
			Width(m.width - rowWidth).
			BorderStyle(lipgloss.NormalBorder()).
			BorderBottom(true).
			BorderForeground(theme.Border).
			Render("")
		row = lipgloss.JoinHorizontal(lipgloss.Top, row, padding)
	}

	separatorWidth := m.width
	if separatorWidth < 0 {
		separatorWidth = 0
	}
	separator := lipgloss.NewStyle().
		Width(separatorWidth).
		Foreground(theme.Border).
		Render(strings.Repeat("─", separatorWidth))

	bar := lipgloss.JoinVertical(lipgloss.Left, row, separator)

	return lipgloss.NewStyle().
		Width(m.width).
		Height(tabBarHeight).
		Background(theme.Background).
		Render(bar)
}

func (m *Model) renderActiveTab(theme styles.Theme) string {
	contentHeight := m.height - m.helpBarHeight() - tabBarHeight
	if contentHeight < 1 {
		contentHeight = 1
	}

	var view string
	switch m.activeTab {
	case tabChat:
		view = m.chat.View()
	case tabLogs:
		view = m.sidebar.View()
	case tabGit:
		if m.gitPanels != nil {
			view = m.gitPanels.View()
		}
	}

	if view == "" {
		placeholder := lipgloss.NewStyle().
			Width(m.width).
			Height(contentHeight).
			Align(lipgloss.Center, lipgloss.Center).
			Foreground(theme.Muted).
			Render("No content")
		view = placeholder
	}

	return lipgloss.NewStyle().
		Width(m.width).
		Height(contentHeight).
		Background(theme.Background).
		Render(view)
}

func (m *Model) nextTabID() tabID {
	if len(m.tabs) == 0 {
		return m.activeTab
	}
	return tabID((int(m.activeTab) + 1) % len(m.tabs))
}

func (m *Model) prevTabID() tabID {
	if len(m.tabs) == 0 {
		return m.activeTab
	}
	return tabID((int(m.activeTab) - 1 + len(m.tabs)) % len(m.tabs))
}

func (m *Model) tabIDForX(x int) (tabID, bool) {
	for _, region := range m.tabRegions {
		if x >= region.start && x < region.end {
			return region.id, true
		}
	}
	return 0, false
}

func (m *Model) switchTab(target tabID) tea.Cmd {
	if target < 0 || int(target) >= len(m.tabs) {
		return nil
	}
	if target == m.activeTab {
		return nil
	}

	var cmds []tea.Cmd

	if m.activeTab == tabChat && target != tabChat {
		m.chatFocused = false
		m.chat.Blur()
	}

	m.activeTab = target

	if target == tabChat {
		m.chatFocused = true
		if cmd := m.chat.Focus(); cmd != nil {
			cmds = append(cmds, cmd)
		}
	}

	if target == tabGit {
		m.refreshGitPanels()
	}

	m.updateAllComponents()

	return tea.Batch(cmds...)
}

func (m *Model) refreshGitPanels() {
	if m.gitPanels == nil {
		return
	}

	status := m.runGitCommand("status", "--short", "--branch")
	commits := m.runGitCommand("log", "--oneline", "-n", "5")

	m.gitPanels.SetStatus(status)
	m.gitPanels.SetCommits(commits)
}

func (m *Model) runGitCommand(args ...string) []string {
	cmd := exec.Command("git", args...)
	output, err := cmd.CombinedOutput()
	trimmed := strings.TrimSpace(string(output))
	if err != nil {
		if trimmed == "" {
			return []string{fmt.Sprintf("Error: %v", err)}
		}
		lines := strings.Split(trimmed, "\n")
		lines = append(lines, fmt.Sprintf("Error: %v", err))
		return lines
	}
	if trimmed == "" {
		return []string{"(no output)"}
	}
	return strings.Split(trimmed, "\n")
}

// executeCommand executes the given command
func (m *Model) executeCommand(input string) tea.Cmd {
	parts := strings.Fields(input)
	if len(parts) == 0 {
		return nil
	}

	command := strings.ToLower(parts[0])
	args := parts[1:]

	return func() tea.Msg {
		switch command {
		case "read", "r":
			if len(args) == 0 {
				m.chat.AddMessage("error", "Usage: read <filepath>")
				return nil
			}
			filepath := strings.Join(args, " ")

			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer cancel()

			content, err := m.wsClient.ReadFile(ctx, filepath)
			if err != nil {
				m.chat.AddMessage("error", fmt.Sprintf("Error reading file: %v", err))
				return nil
			}

			// Show file preview in chat
			preview := content
			if len(content) > 500 {
				preview = content[:500] + "\n... (truncated)"
			}
			m.chat.AddMessage("ai", fmt.Sprintf("📄 **File: %s** (%d chars)\n\n```\n%s\n```", filepath, len(content), preview))

		case "write", "w":
			if len(args) < 2 {
				m.chat.AddMessage("error", "Usage: write <filepath> <content>")
				return nil
			}
			filepath := args[0]
			content := strings.Join(args[1:], " ")

			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer cancel()

			if err := m.wsClient.WriteFile(ctx, filepath, content); err != nil {
				m.chat.AddMessage("error", fmt.Sprintf("Error writing file: %v", err))
				return nil
			}
			m.chat.AddMessage("system", fmt.Sprintf("✅ File written successfully: %s", filepath))

		case "ask", "ai":
			if len(args) == 0 {
				m.chat.AddMessage("error", "Usage: ask <prompt>")
				return nil
			}
			prompt := strings.Join(args, " ")

			ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
			defer cancel()

			response, err := m.wsClient.AskAI(ctx, prompt)
			if err != nil {
				m.chat.AddMessage("error", fmt.Sprintf("Error asking AI: %v", err))
				return nil
			}

			m.chat.AddMessage("ai", response)

		case "test":
			_ = m.wsClient.Send("test", map[string]any{
				"message":   "Hello from Go TUI!",
				"timestamp": time.Now().UnixMilli(),
			})
			m.chat.AddMessage("system", "🔧 Test message sent to server")

		case "help", "h":
			help := []string{
				"## 📚 Available Commands",
				"",
				"- **read|r** `<filepath>` - Read a file",
				"- **write|w** `<filepath> <content>` - Write to a file",
				"- **ask|ai** `<prompt>` - Ask AI a question",
				"- **test** - Send test message to server",
				"- **help|h** - Show this help",
				"",
				"## ⌨️ Keyboard Shortcuts",
				"",
				"- **Enter** - Send message",
				"- **Ctrl+J** - New line in message",
				"- **Tab** - Toggle focus (chat/scroll)",
				"- **Ctrl+R** - Retry connection",
				"- **Ctrl+S/L/V/A/N** - Toggle sidebar panels",
				"- **?** - Toggle help bar",
				"- **Ctrl+C** - Quit",
			}
			m.chat.AddMessage("system", strings.Join(help, "\n"))

		case "clear":
			// Could implement clear chat history here
			m.chat.AddMessage("system", "💡 Tip: Use Ctrl+S/L/V/A/N to toggle sidebar panels")

		default:
			m.chat.AddMessage("error", fmt.Sprintf("❌ Unknown command: %s. Type 'help' for available commands.", command))
		}

		return nil
	}
}

// updateLayout updates component sizes based on window dimensions
func (m *Model) updateLayout() {
	if m.width <= 0 || m.height <= 0 {
		return
	}

	// Use the centralized component update logic
	m.updateAllComponents()
}

// View renders the application
func (m *Model) View() string {
	if m.width == 0 || m.height == 0 {
		return "Initializing..."
	}

	theme := styles.CurrentTheme()

	tabBar := m.renderTabs()
	content := m.renderActiveTab(theme)

	view := lipgloss.JoinVertical(
		lipgloss.Left,
		tabBar,
		content,
	)

	if m.helpBarHeight() > 0 {
		help := lipgloss.NewStyle().
			Width(m.width).
			Background(theme.Background).
			Render(m.helpBar.View())
		view = lipgloss.JoinVertical(lipgloss.Left, view, help)
	}

	return zone.Scan(lipgloss.NewStyle().
		Width(m.width).
		Height(m.height).
		Background(theme.Background).
		Render(view))
}

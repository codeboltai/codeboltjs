package app

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
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
	"gotui/internal/components/chatcomponents"
	"gotui/internal/components/helpbar"
	"gotui/internal/layout/tabpages"
	"gotui/internal/messaging/messagehandler"
	"gotui/internal/messaging/messagesender"
	"gotui/internal/styles"
	"gotui/internal/wsclient"
)

// Config holds application configuration
type Config struct {
	Host        string
	Port        int
	Protocol    string
	TuiID       string
	ProjectPath string
	ProjectName string
	ProjectType string
	Agent       wsclient.AgentSelection
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
	agent    wsclient.AgentSelection
	tuiID    string

	// Components
	chatPage *tabpages.ChatPage
	helpBar  *helpbar.HelpBar
	logsPage *tabpages.LogsPage
	gitPage  *tabpages.GitPage

	messageSender  *messagesender.Sender
	messageHandler *messagehandler.Handler

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

func (m *Model) chatComponent() *chat.Chat {
	if m == nil || m.chatPage == nil {
		return nil
	}
	return m.chatPage.Chat()
}

// NewModel creates a new application model
func NewModel(cfg Config) *Model {
	// Create services
	wsClient := wsclient.New(wsclient.Config{
		Host:        cfg.Host,
		Port:        cfg.Port,
		Protocol:    cfg.Protocol,
		TuiID:       cfg.TuiID,
		ProjectPath: cfg.ProjectPath,
		ProjectName: cfg.ProjectName,
		ProjectType: cfg.ProjectType,
	})

	// Create components
	chatPage := tabpages.NewChatPage()
	chatComp := chatPage.Chat()
	helpBarComp := helpbar.New()
	logsPage := tabpages.NewLogsPage(wsClient, cfg.Host, cfg.Port)
	gitPage := tabpages.NewGitPage()
	tabs := []string{"Chat", "Logs", "Git"}

	// Set up WebSocket logging and notifications
	wsClient.SetLogger(func(msg string) {
		logsPage.LogsPanel().AddLine(fmt.Sprintf("[WS] %s", msg))
	})

	wsClient.OnNotification(func(n wsclient.Notification) {
		notifLine := fmt.Sprintf("[%s] %s", n.Type, n.Action)
		if n.Event != "" {
			notifLine = fmt.Sprintf("[%s] %s", n.Type, n.Event)
		}
		logsPage.NotificationsPanel().AddLine(notifLine)
	})

	sender := messagesender.New(wsClient, cfg.Agent)

	var handler *messagehandler.Handler
	if chatComp != nil {
		handler = messagehandler.New(chatComp, func(entry string) {
			if strings.TrimSpace(entry) == "" {
				return
			}
			logsPage.LogsPanel().AddLine(entry)
		})
		wsClient.OnMessage(handler.HandleRaw)
	}

	m := &Model{
		cfg:            cfg,
		wsClient:       wsClient,
		agent:          cfg.Agent,
		tuiID:          cfg.TuiID,
		chatPage:       chatPage,
		helpBar:        helpBarComp,
		logsPage:       logsPage,
		gitPage:        gitPage,
		tabs:           tabs,
		activeTab:      tabChat,
		chatFocused:    true,
		keyMap:         helpbar.DefaultKeyMap(),
		messageSender:  sender,
		messageHandler: handler,
	}

	// Focus chat initially
	if chatComp != nil {
		chatComp.Focus()
	}

	// Add initial status information
	logsPage.LogsPanel().AddLine("═══ SYSTEM STARTUP ═══")
	logsPage.LogsPanel().AddLine("🚀 Codebolt TUI Client initialized")
	logsPage.LogsPanel().AddLine("🔧 WebSocket client created")
	// Client no longer manages local agent processes
	logsPage.LogsPanel().AddLine("🎨 UI components loaded")
	logsPage.LogsPanel().AddLine("")
	logsPage.LogsPanel().AddLine("═══ AVAILABLE COMMANDS ═══")
	logsPage.LogsPanel().AddLine("📖 read <file> - Read file content")
	logsPage.LogsPanel().AddLine("✏️  write <file> - Create/edit file")
	logsPage.LogsPanel().AddLine("🤖 ask <question> - Ask AI")
	logsPage.LogsPanel().AddLine("❓ help - Show help")
	logsPage.LogsPanel().AddLine("🗑️  clear - Clear chat")
	logsPage.LogsPanel().AddLine("")

	// TUI is now always in client-only mode (server is started by agentserver)
	logsPage.LogsPanel().AddLine("📡 Client mode - connecting to server")
	logsPage.LogsPanel().AddLine(fmt.Sprintf("🔗 Target server: %s:%d", cfg.Host, cfg.Port))
	if cfg.Protocol != "" {
		logsPage.LogsPanel().AddLine(fmt.Sprintf("🌐 Protocol: %s", strings.ToUpper(cfg.Protocol)))
	}
	if m.tuiID != "" {
		logsPage.LogsPanel().AddLine(fmt.Sprintf("🆔 TUI ID: %s", m.tuiID))
	}
	if cfg.ProjectPath != "" {
		logsPage.LogsPanel().AddLine(fmt.Sprintf("📁 Project: %s", cfg.ProjectPath))
	}
	logsPage.LogsPanel().AddLine("ℹ️  Server should be started by codebolt-code command")
	logsPage.LogsPanel().AddLine("🤖 Fetching available models from server...")

	m.refreshGitPanels()

	return m
}

// connectMsg represents a connection attempt result
type connectMsg struct {
	success bool
	err     error
}

// retryMsg represents a retry timer message
// tryConnectMsg triggers a connection attempt
type tryConnectMsg struct{}

type sendUserMessageResult struct {
	err error
}

type modelFetchResult struct {
	options []chatcomponents.ModelOption
	err     error
}

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

		if chat := m.chatComponent(); chat != nil {
			chat.SetSize(m.width, contentHeight)
		}
		m.logsPage.SetSize(m.width, contentHeight)
		m.gitPage.SetSize(m.width, contentHeight)

		m.helpBar.SetSize(m.width, helpBarHeight)

		log.Printf("updateAllComponents: contentHeight=%d helpbar=%d tab=%d",
			contentHeight, helpBarHeight, tabBarHeight)
	}
}

// Init initializes the application
func (m *Model) Init() tea.Cmd {
	log.Printf("Init() called")
	m.logsPage.LogsPanel().AddLine("🚀 Initializing Codebolt Go TUI...")

	var cmds []tea.Cmd

	// TUI is now always in client mode - connect to existing server
	m.logsPage.LogsPanel().AddLine("📡 Client mode - connecting to server")
	m.logsPage.LogsPanel().AddLine(fmt.Sprintf("🔌 Connecting to server at %s:%d", m.cfg.Host, m.cfg.Port))

	// Start connection attempts (external server should be running)
	delay := 1 * time.Second

	cmds = append(cmds, tea.Tick(delay, func(time.Time) tea.Msg {
		return tryConnectMsg{}
	}))

	cmds = append(cmds, m.fetchModelOptions())

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

func (m *Model) fetchModelOptions() tea.Cmd {
	return func() tea.Msg {
		scheme := "http"
		protocol := strings.ToLower(strings.TrimSpace(m.cfg.Protocol))
		if protocol == "https" || protocol == "wss" {
			scheme = "https"
		}
		host := strings.TrimSpace(m.cfg.Host)
		if host == "" {
			host = "localhost"
		}
		url := fmt.Sprintf("%s://%s:%d/models", scheme, host, m.cfg.Port)

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
		if err != nil {
			return modelFetchResult{err: err}
		}

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			return modelFetchResult{err: err}
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(io.LimitReader(resp.Body, 2048))
			snippet := strings.TrimSpace(string(body))
			if snippet != "" {
				err = fmt.Errorf("models request failed: %d %s", resp.StatusCode, snippet)
			} else {
				err = fmt.Errorf("models request failed with status %d", resp.StatusCode)
			}
			return modelFetchResult{err: err}
		}

		var payload struct {
			Models []chatcomponents.ModelOption `json:"models"`
		}

		if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
			return modelFetchResult{err: err}
		}

		return modelFetchResult{options: payload.Models}
	}
}

func (m *Model) sendUserMessage(content string) tea.Cmd {
	return func() tea.Msg {
		if m.messageSender == nil {
			return sendUserMessageResult{err: errors.New("message sender not initialized")}
		}
		if err := m.messageSender.Send(content); err != nil {
			return sendUserMessageResult{err: err}
		}
		return sendUserMessageResult{}
	}
}

// toggleChatFocus toggles focus between chat and scroll mode
func (m *Model) toggleChatFocus() {
	m.chatFocused = !m.chatFocused
	chat := m.chatComponent()
	if chat == nil {
		return
	}
	if m.chatFocused {
		chat.Focus()
		m.logsPage.LogsPanel().AddLine("🎯 Chat focused - type to send messages")
	} else {
		chat.Blur()
		m.logsPage.LogsPanel().AddLine("🎯 Chat unfocused - use scroll keys to navigate")
	}
}

// Update handles incoming messages
func (m *Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd
	var cmds []tea.Cmd

	switch msg := msg.(type) {
	case tryConnectMsg:
		if m.wsClient == nil {
			return m, nil
		}
		if m.wsClient.IsConnected() {
			m.isRetrying = false
			if m.logsPage != nil {
				m.logsPage.SetRetryInfo(m.retryCount, m.isRetrying, m.lastError)
			}
			return m, nil
		}
		m.isRetrying = true
		if m.logsPage != nil {
			m.logsPage.SetRetryInfo(m.retryCount, m.isRetrying, m.lastError)
			if m.retryCount == 0 {
				m.logsPage.LogsPanel().AddLine("🔌 Attempting to connect...")
			} else {
				m.logsPage.LogsPanel().AddLine(fmt.Sprintf("🔄 Retry attempt %d", m.retryCount+1))
			}
		}
		return m, m.tryConnect()

	case connectMsg:
		m.isRetrying = false
		if msg.success {
			m.retryCount = 0
			m.lastError = ""
			if m.logsPage != nil {
				m.logsPage.SetRetryInfo(m.retryCount, m.isRetrying, m.lastError)
				m.logsPage.LogsPanel().AddLine("✅ Connected to agent server")
			}
			return m, nil
		}

		m.retryCount++
		if msg.err != nil {
			m.lastError = msg.err.Error()
		} else {
			m.lastError = "connection failed"
		}
		if m.logsPage != nil {
			m.logsPage.LogsPanel().AddLine(fmt.Sprintf("❌ Connection failed: %v", msg.err))
		}

		if m.retryCount >= 60 {
			m.isRetrying = false
			if m.logsPage != nil {
				m.logsPage.SetRetryInfo(m.retryCount, m.isRetrying, m.lastError)
				m.logsPage.LogsPanel().AddLine("🚫 Max retry attempts reached. Press Ctrl+R to retry.")
			}
			return m, nil
		}

		delay := time.Duration(m.retryCount*2) * time.Second
		if delay > 10*time.Second {
			delay = 10 * time.Second
		}
		m.isRetrying = true
		if m.logsPage != nil {
			m.logsPage.SetRetryInfo(m.retryCount, m.isRetrying, m.lastError)
			m.logsPage.LogsPanel().AddLine(fmt.Sprintf("🔁 Retrying in %s", delay))
		}
		return m, tea.Tick(delay, func(time.Time) tea.Msg { return tryConnectMsg{} })

	case modelFetchResult:
		if msg.err != nil {
			if m.logsPage != nil {
				m.logsPage.LogsPanel().AddLine(fmt.Sprintf("⚠️ Failed to load models: %v", msg.err))
			}
			return m, nil
		}
		if chat := m.chatComponent(); chat != nil {
			chat.SetModelOptions(msg.options)
		}
		if m.logsPage != nil {
			total := len(msg.options)
			if total == 0 {
				m.logsPage.LogsPanel().AddLine("ℹ️ Server returned no models")
			} else {
				m.logsPage.LogsPanel().AddLine(fmt.Sprintf("🤖 Loaded %d models from server", total))
			}
		}
		return m, nil

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
		case key.Matches(msg, m.keyMap.Retry):
			if m.wsClient == nil {
				return m, nil
			}
			if m.wsClient.IsConnected() {
				if m.logsPage != nil {
					m.logsPage.LogsPanel().AddLine("ℹ️  Already connected to server")
				}
				return m, nil
			}
			m.retryCount = 0
			m.lastError = ""
			m.isRetrying = true
			if m.logsPage != nil {
				m.logsPage.SetRetryInfo(m.retryCount, m.isRetrying, m.lastError)
				m.logsPage.LogsPanel().AddLine("🔄 Manual retry triggered")
			}
			return m, m.tryConnect()
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

		if chat := m.chatComponent(); chat != nil && m.activeTab == tabChat {
			if key.Matches(msg, m.keyMap.ShowCommands) {
				chat.ToggleCommandPalette()
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
		m.logsPage.AgentPanel().AddLine(fmt.Sprintf("🤖 Model selected: %s", msg.Option.Name))
		m.logsPage.LogsPanel().AddLine(fmt.Sprintf("🤖 Active model set to %s (%s)", msg.Option.Name, msg.Option.Provider))

	case chat.ThemeSelectedMsg:
		if m.logsPage != nil {
			m.logsPage.LogsPanel().AddLine(fmt.Sprintf("🎨 Theme changed to %s", msg.Preset.Name))
		}

	case chat.SubmitMsg:
		content := msg.Content
		trimmed := strings.TrimSpace(content)
		if trimmed == "" {
			return m, nil
		}
		if m.wsClient == nil || !m.wsClient.IsConnected() {
			errText := "❌ Not connected to server. Press Ctrl+R to retry."
			if chat := m.chatComponent(); chat != nil {
				chat.AddMessage("error", errText)
			}
			if m.logsPage != nil {
				m.logsPage.LogsPanel().AddLine(errText)
			}
			return m, nil
		}
		return m, m.sendUserMessage(content)

	case sendUserMessageResult:
		if msg.err != nil {
			errText := fmt.Sprintf("❌ Failed to send message: %v", msg.err)
			if chat := m.chatComponent(); chat != nil {
				chat.AddMessage("error", errText)
			}
			if m.logsPage != nil {
				m.logsPage.LogsPanel().AddLine(errText)
			}
			return m, nil
		}
		if m.logsPage != nil {
			m.logsPage.LogsPanel().AddLine("📨 Message sent to agent server")
		}
		return m, nil
	}

	// Pass messages to components
	if updateCmd := m.chatPage.Update(msg); updateCmd != nil {
		cmds = append(cmds, updateCmd)
	}

	cmd = m.logsPage.Update(msg)
	cmds = append(cmds, cmd)

	if gitCmd := m.gitPage.Update(msg); gitCmd != nil {
		cmds = append(cmds, gitCmd)
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
		// Background(theme.SurfaceHigh).
		Foreground(theme.Primary).
		Bold(true)

	inactiveStyle := lipgloss.NewStyle().
		BorderStyle(lipgloss.NormalBorder()).
		BorderForeground(theme.Border).
		BorderBottom(true).
		Padding(0, 2).
		// Background(theme.Surface).
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
		// Background(theme.Background).
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
		if chat := m.chatComponent(); chat != nil {
			view = chat.View()
		}
	case tabLogs:
		view = m.logsPage.View()
	case tabGit:
		view = m.gitPage.View()
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
		// Background(theme.Background).
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
		if chat := m.chatComponent(); chat != nil {
			chat.Blur()
		}
	}

	m.activeTab = target

	if target == tabChat {
		m.chatFocused = true
		if chat := m.chatComponent(); chat != nil {
			if cmd := chat.Focus(); cmd != nil {
				cmds = append(cmds, cmd)
			}
		}
	}

	if target == tabGit {
		m.refreshGitPanels()
	}

	m.updateAllComponents()

	return tea.Batch(cmds...)
}

func (m *Model) refreshGitPanels() {
	if m.gitPage == nil {
		return
	}

	status := m.runGitCommand("status", "--short", "--branch")
	commits := m.runGitCommand("log", "--oneline", "-n", "5")

	m.gitPage.Refresh(status, commits)
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
			// Background(theme.Background).
			Render(m.helpBar.View())
		view = lipgloss.JoinVertical(lipgloss.Left, view, help)
	}

	return zone.Scan(lipgloss.NewStyle().
		Width(m.width).
		Height(m.height).
		// Background(theme.Background).
		Render(view))
}

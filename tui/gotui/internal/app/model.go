package app

import (
	"context"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/charmbracelet/bubbles/v2/key"
	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"
	"golang.org/x/term"

	"gotui/internal/components/chat"
	"gotui/internal/components/helpbar"
	"gotui/internal/layout/sidebar"
	"gotui/internal/styles"
	"gotui/internal/wsclient"
)

// Config holds application configuration
type Config struct {
	Host string
	Port int
}

// Model represents the main application model
type Model struct {
	// Configuration
	cfg Config

	// Services
	wsClient *wsclient.Client

	// Components
	chat    *chat.Chat
	sidebar *sidebar.Sidebar
	helpBar *helpbar.HelpBar

	// State
	retryCount  int
	isRetrying  bool
	lastError   string
	chatFocused bool

	// Layout
	width  int
	height int

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

		// Calculate available height for chat and sidebar
		availableHeight := m.height - helpBarHeight

		// First, set the chat component's total width so it can calculate internal layout
		m.chat.SetSize(m.width, availableHeight)

		// Now get the calculated widths
		sidebarWidth := m.chat.GetSidebarWidth()

		// Update sidebar component
		m.sidebar.SetSize(sidebarWidth, availableHeight)

		// Update help bar
		m.helpBar.SetSize(m.width, helpBarHeight)

		log.Printf("updateAllComponents: chat=%dx%d, sidebar=%dx%d, helpbar=%dx%d",
			m.width, availableHeight, sidebarWidth, availableHeight, m.width, helpBarHeight)
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

	case tea.KeyMsg:
		switch {
		case key.Matches(msg, m.keyMap.Quit):
			return m, tea.Quit
		case key.Matches(msg, m.keyMap.Help):
			m.helpBar.Toggle()
			m.updateLayout()
		case key.Matches(msg, m.keyMap.FocusChat):
			m.toggleChatFocus()
		}
	}

	// Pass messages to components
	m.chat, cmd = m.chat.Update(msg)
	cmds = append(cmds, cmd)

	cmd = m.sidebar.Update(msg)
	cmds = append(cmds, cmd)

	return m, tea.Batch(cmds...)
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

	// Main content (chat + separator + sidebar)
	separator := lipgloss.NewStyle().
		Width(1).
		Height(m.height).
		Background(theme.Background).
		Foreground(theme.Border).
		Render("│")

	mainContent := lipgloss.JoinHorizontal(
		lipgloss.Top,
		m.chat.View(),
		separator,
		m.sidebar.View(),
	)

	// Full view with help bar and guaranteed background fill
	fullView := lipgloss.JoinVertical(
		lipgloss.Left,
		mainContent,
		lipgloss.NewStyle().
			Width(m.width).
			Background(theme.Background).
			Render(m.helpBar.View()),
	)

	return lipgloss.NewStyle().
		Width(m.width).
		Height(m.height).
		Background(theme.Background).
		Render(fullView)
}

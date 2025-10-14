package app

import (
	"fmt"
	"strings"

	"gotui/internal/components/chat"
	"gotui/internal/components/helpbar"
	"gotui/internal/keybindings"
	"gotui/internal/layout/tabpages"
	"gotui/internal/messaging/messagehandler"
	"gotui/internal/messaging/messagesender"
	"gotui/internal/wsclient"
)

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

type Model struct {
	cfg Config

	wsClient *wsclient.Client
	agent    wsclient.AgentSelection
	tuiID    string

	chatPage *tabpages.ChatPage
	helpBar  *helpbar.HelpBar
	logsPage *tabpages.LogsPage
	gitPage  *tabpages.GitPage

	messageSender  *messagesender.Sender
	messageHandler *messagehandler.Handler

	retryCount  int
	isRetrying  bool
	lastError   string
	chatFocused bool

	width      int
	height     int
	tabs       []string
	activeTab  tabID
	tabRegions []tabRegion

	keyMap keybindings.KeyMap
}

func (m *Model) chatComponent() *chat.Chat {
	if m == nil || m.chatPage == nil {
		return nil
	}
	return m.chatPage.Chat()
}

func NewModel(cfg Config) *Model {
	wsClient := wsclient.New(wsclient.Config{
		Host:        cfg.Host,
		Port:        cfg.Port,
		Protocol:    cfg.Protocol,
		TuiID:       cfg.TuiID,
		ProjectPath: cfg.ProjectPath,
		ProjectName: cfg.ProjectName,
		ProjectType: cfg.ProjectType,
	})

	chatPage := tabpages.NewChatPage()
	chatComp := chatPage.Chat()
	helpBarComp := helpbar.New()
	if chatComp != nil {
		chatComp.SetHelpBar(helpBarComp)
	}
	logsPage := tabpages.NewLogsPage(wsClient, cfg.Host, cfg.Port)
	gitPage := tabpages.NewGitPage()
	tabs := []string{"Chat", "Logs", "Git"}

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
		keyMap:         keybindings.DefaultKeyMap(),
		messageSender:  sender,
		messageHandler: handler,
	}

	if chatComp != nil {
		chatComp.Focus()
	}

	logsPage.LogsPanel().AddLine("═══ SYSTEM STARTUP ═══")
	logsPage.LogsPanel().AddLine("🚀 Codebolt TUI Client initialized")
	logsPage.LogsPanel().AddLine("🔧 WebSocket client created")
	logsPage.LogsPanel().AddLine("🎨 UI components loaded")
	logsPage.LogsPanel().AddLine("")
	logsPage.LogsPanel().AddLine("═══ AVAILABLE COMMANDS ═══")
	logsPage.LogsPanel().AddLine("📖 read <file> - Read file content")
	logsPage.LogsPanel().AddLine("✏️  write <file> - Create/edit file")
	logsPage.LogsPanel().AddLine("🤖 ask <question> - Ask AI")
	logsPage.LogsPanel().AddLine("❓ help - Show help")
	logsPage.LogsPanel().AddLine("🗑️  clear - Clear chat")
	logsPage.LogsPanel().AddLine("")
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

package app

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	tea "github.com/charmbracelet/bubbletea/v2"

	"gotui/internal/components/chatcomponents"
	"gotui/internal/stores"
)

type connectMsg struct {
	success bool
	err     error
}

type tryConnectMsg struct{}

type sendUserMessageResult struct {
	err error
}

type modelFetchResult struct {
	options []chatcomponents.ModelOption
	err     error
}

func (m *Model) Init() tea.Cmd {
	log.Printf("Init() called")
	m.logsPage.LogsPanel().AddLine("🚀 Initializing Codebolt Go TUI...")

	var cmds []tea.Cmd

	m.logsPage.LogsPanel().AddLine("📡 Client mode - connecting to server")
	m.logsPage.LogsPanel().AddLine(fmt.Sprintf("🔌 Connecting to server at %s:%d", m.cfg.Host, m.cfg.Port))

	delay := 1 * time.Second

	cmds = append(cmds, tea.Tick(delay, func(time.Time) tea.Msg {
		return tryConnectMsg{}
	}))

	cmds = append(cmds, m.fetchModelOptions())

	termWidth, termHeight := getTerminalSize()
	log.Printf("Init: Using terminal size: %dx%d", termWidth, termHeight)

	m.width = termWidth
	m.height = termHeight
	log.Printf("Init: Set model dimensions to %dx%d", m.width, m.height)

	m.updateAllComponents()

	return tea.Batch(cmds...)
}

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
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if m.modelStore == nil {
			m.modelStore = stores.SharedAIModelStore()
		}

		options, err := m.modelStore.Fetch(ctx, m.cfg.Protocol, m.cfg.Host, m.cfg.Port)
		if err != nil {
			return modelFetchResult{err: err}
		}

		return modelFetchResult{options: options}
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

package app

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	tea "github.com/charmbracelet/bubbletea/v2"

	"gotui/internal/components/chatcomponents"
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

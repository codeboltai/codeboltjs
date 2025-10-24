package app

import (
	"fmt"
	"strings"
	"time"

	"github.com/charmbracelet/bubbles/v2/key"
	tea "github.com/charmbracelet/bubbletea/v2"

	"gotui/internal/components/chat"
)

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

	case agentFetchResult:
		if msg.err != nil {
			if m.logsPage != nil {
				m.logsPage.AgentPanel().AddLine(fmt.Sprintf("⚠️ Failed to load agents: %v", msg.err))
				m.logsPage.LogsPanel().AddLine(fmt.Sprintf("⚠️ Failed to load agents: %v", msg.err))
			}
			return m, nil
		}
		if m.logsPage != nil {
			total := len(msg.options)
			if total == 0 {
				m.logsPage.AgentPanel().AddLine("ℹ️ Server returned no agents")
				m.logsPage.LogsPanel().AddLine("ℹ️ Server returned no agents")
			} else {
				m.logsPage.AgentPanel().AddLine(fmt.Sprintf("🧭 Loaded %d agents from server", total))
				m.logsPage.LogsPanel().AddLine(fmt.Sprintf("🧭 Loaded %d agents from server", total))
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
		case key.Matches(msg, m.keyMap.ToggleMode):
			if m.activeTab == tabChat {
				if chat := m.chatComponent(); chat != nil {
					windowMode := chat.ToggleLayoutMode()
					if m.logsPage != nil {
						if windowMode {
							m.logsPage.LogsPanel().AddLine("🪟 Switched to window mode")
						} else {
							m.logsPage.LogsPanel().AddLine("🪟 Returned to panel mode")
						}
					}
				}
			}
			return m, nil
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

	case chat.AgentSelectedMsg:
		if m.logsPage != nil {
			m.logsPage.AgentPanel().AddLine(fmt.Sprintf("🧭 Agent selected: %s", msg.Option.Name))
			m.logsPage.LogsPanel().AddLine(fmt.Sprintf("🧭 Active agent set to %s", msg.Option.Name))
		}

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

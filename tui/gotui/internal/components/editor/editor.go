package editor

import (
	"context"
	"fmt"
	"strings"
	"time"

	"gotui/internal/markdown"
	"gotui/internal/styles"
	"gotui/internal/wsclient"

	"github.com/charmbracelet/bubbles/v2/key"
	"github.com/charmbracelet/bubbles/v2/textarea"
	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"
)

// Editor represents the command input editor
type Editor struct {
	textarea    textarea.Model
	wsClient    *wsclient.Client
	active      bool
	submitting  bool
	width       int
	height      int
	placeholder string
	keyMap      KeyMap
}

// KeyMap defines the key bindings for the editor
type KeyMap struct {
	Submit  key.Binding
	Newline key.Binding
	Cancel  key.Binding
}

// DefaultKeyMap returns the default key mappings
func DefaultKeyMap() KeyMap {
	return KeyMap{
		Submit: key.NewBinding(
			key.WithKeys("enter"),
			key.WithHelp("enter", "submit"),
		),
		Newline: key.NewBinding(
			key.WithKeys("alt+enter", "ctrl+j"),
			key.WithHelp("alt+enter", "new line"),
		),
		Cancel: key.NewBinding(
			key.WithKeys("esc"),
			key.WithHelp("esc", "cancel"),
		),
	}
}

// SubmitMsg is sent when the editor content is submitted
type SubmitMsg struct {
	Content string
}

// ClearMsg is sent to clear the editor content
type ClearMsg struct{}

// LogMsg is sent to add a log message
type LogMsg string

// New creates a new editor
func New(wsClient *wsclient.Client) *Editor {
	theme := styles.CurrentTheme()

	ta := textarea.New()
	ta.Prompt = "> "
	ta.Placeholder = "Type your command here (e.g., help, read package.json, ask \"What is Node.js?\")"
	ta.ShowLineNumbers = false
	ta.CharLimit = -1

	// Style the textarea with v2 API
	ta.Styles.Focused.Base = lipgloss.NewStyle().
		Foreground(theme.Foreground)
	//	.Background(theme.Surface)
	ta.Styles.Focused.Prompt = lipgloss.NewStyle().
		Foreground(theme.Primary).
		Bold(true)
	ta.Styles.Focused.Text = lipgloss.NewStyle().
		Foreground(theme.Foreground)
	ta.Styles.Focused.Placeholder = lipgloss.NewStyle().
		Foreground(theme.Muted)

	ta.Styles.Blurred.Base = lipgloss.NewStyle().
		Foreground(theme.Muted)
	//	.Background(theme.Surface)
	ta.Styles.Blurred.Prompt = lipgloss.NewStyle().
		Foreground(theme.Muted)
	ta.Styles.Blurred.Text = lipgloss.NewStyle().
		Foreground(theme.Muted)
	ta.Styles.Blurred.Placeholder = lipgloss.NewStyle().
		Foreground(theme.Muted)

	return &Editor{
		textarea:    ta,
		wsClient:    wsClient,
		placeholder: "Ready - Type a command",
		keyMap:      DefaultKeyMap(),
	}
}

// SetActive sets whether the editor is active
func (e *Editor) SetActive(active bool) tea.Cmd {
	e.active = active
	if active {
		return e.textarea.Focus()
	}
	e.textarea.Blur()
	return nil
}

// IsActive returns whether the editor is active
func (e *Editor) IsActive() bool {
	return e.active
}

// SetSize sets the editor dimensions
func (e *Editor) SetSize(width, height int) {
	e.width = width
	e.height = height
	e.textarea.SetWidth(width - 4) // Account for border and padding
	if height > 2 {
		e.textarea.SetHeight(height - 2) // Account for border
	}
}

// Cursor returns the cursor position for the editor
func (e *Editor) Cursor() *tea.Cursor {
	if !e.active || e.submitting {
		return nil
	}
	return e.textarea.Cursor()
}

// Update handles messages for the editor
func (e *Editor) Update(msg tea.Msg) (*Editor, tea.Cmd) {
	var cmd tea.Cmd
	var cmds []tea.Cmd

	switch msg := msg.(type) {
	case ClearMsg:
		e.textarea.Reset()
		e.submitting = false
		return e, nil

	case tea.KeyPressMsg:
		if !e.active {
			return e, nil
		}

		switch {
		case key.Matches(msg, e.keyMap.Submit):
			if !e.submitting {
				return e, e.submit()
			}
			return e, nil

		case key.Matches(msg, e.keyMap.Newline):
			e.textarea.InsertRune('\n')
			return e, nil

		case key.Matches(msg, e.keyMap.Cancel):
			if e.submitting {
				e.submitting = false
				e.textarea.Placeholder = e.placeholder
			} else if e.textarea.Value() != "" {
				e.textarea.Reset()
			}
			return e, nil
		}
	}

	// Update textarea
	e.textarea, cmd = e.textarea.Update(msg)
	cmds = append(cmds, cmd)

	return e, tea.Batch(cmds...)
}

// submit handles submitting the editor content
func (e *Editor) submit() tea.Cmd {
	value := strings.TrimSpace(e.textarea.Value())
	if value == "" {
		return nil
	}

	e.submitting = true
	e.textarea.Placeholder = "Processing command..."

	// Parse and execute command
	parts := strings.Fields(value)
	if len(parts) == 0 {
		return nil
	}

	command := strings.ToLower(parts[0])
	args := parts[1:]

	// Clear the input
	e.textarea.Reset()

	return tea.Batch(
		tea.Cmd(func() tea.Msg { return SubmitMsg{Content: value} }),
		e.executeCommand(command, args),
	)
}

// executeCommand executes the given command with arguments
func (e *Editor) executeCommand(command string, args []string) tea.Cmd {
	switch command {
	case "read", "r":
		if len(args) == 0 {
			return tea.Cmd(func() tea.Msg {
				e.submitting = false
				e.textarea.Placeholder = e.placeholder
				return LogMsg("Usage: read <filepath>")
			})
		}
		filepath := strings.Join(args, " ")
		return func() tea.Msg {
			defer func() {
				e.submitting = false
				e.textarea.Placeholder = e.placeholder
			}()

			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer cancel()

			content, err := e.wsClient.ReadFile(ctx, filepath)
			if err != nil {
				return LogMsg(fmt.Sprintf("Error reading file: %v", err))
			}

			preview := content
			if len(content) > 500 {
				preview = content[:500] + "..."
			}
			return LogMsg(fmt.Sprintf("📄 File content (%d chars):\n%s", len(content), preview))
		}

	case "write", "w":
		if len(args) < 2 {
			return tea.Cmd(func() tea.Msg {
				e.submitting = false
				e.textarea.Placeholder = e.placeholder
				return LogMsg("Usage: write <filepath> <content>")
			})
		}
		filepath := args[0]
		content := strings.Join(args[1:], " ")
		return func() tea.Msg {
			defer func() {
				e.submitting = false
				e.textarea.Placeholder = e.placeholder
			}()

			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer cancel()

			if err := e.wsClient.WriteFile(ctx, filepath, content); err != nil {
				return LogMsg(fmt.Sprintf("Error writing file: %v", err))
			}
			return LogMsg(fmt.Sprintf("✅ File written successfully: %s", filepath))
		}

	case "ask", "ai":
		if len(args) == 0 {
			return tea.Cmd(func() tea.Msg {
				e.submitting = false
				e.textarea.Placeholder = e.placeholder
				return LogMsg("Usage: ask <prompt>")
			})
		}
		prompt := strings.Join(args, " ")
		return func() tea.Msg {
			defer func() {
				e.submitting = false
				e.textarea.Placeholder = e.placeholder
			}()

			ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
			defer cancel()

			response, err := e.wsClient.AskAI(ctx, prompt)
			if err != nil {
				return LogMsg(fmt.Sprintf("Error asking AI: %v", err))
			}

			// Render AI response with markdown if it looks like markdown
			if markdown.IsMarkdown(response) {
				renderer, err := markdown.New(80) // Use reasonable width for AI responses
				if err != nil {
					return LogMsg(fmt.Sprintf("🤖 AI response:\n%s", response))
				}

				rendered, err := renderer.Render(response)
				if err != nil {
					return LogMsg(fmt.Sprintf("🤖 AI response:\n%s", response))
				}

				return LogMsg(fmt.Sprintf("🤖 AI response:\n%s", rendered))
			}

			return LogMsg(fmt.Sprintf("🤖 AI response:\n%s", response))
		}

	case "test":
		return func() tea.Msg {
			defer func() {
				e.submitting = false
				e.textarea.Placeholder = e.placeholder
			}()

			_ = e.wsClient.Send("test", map[string]any{
				"message":   "Hello from Go TUI!",
				"timestamp": time.Now().UnixMilli(),
			})
			return LogMsg("🔧 Test message sent to server")
		}

	case "help", "h":
		return tea.Cmd(func() tea.Msg {
			e.submitting = false
			e.textarea.Placeholder = e.placeholder
			help := []string{
				"📚 Available commands:",
				"  read|r <filepath>                 - Read a file",
				"  write|w <filepath> <content>      - Write to a file",
				"  ask|ai <prompt>                   - Ask AI a question",
				"  test                              - Send test message",
				"  help|h                            - Show this help",
				"  clear                             - Clear input",
			}
			return LogMsg(strings.Join(help, "\n"))
		})

	case "clear":
		return tea.Cmd(func() tea.Msg {
			e.submitting = false
			e.textarea.Placeholder = e.placeholder
			return ClearMsg{}
		})

	default:
		return tea.Cmd(func() tea.Msg {
			e.submitting = false
			e.textarea.Placeholder = e.placeholder
			return LogMsg(fmt.Sprintf("❌ Unknown command: %s. Type 'help' for available commands.", command))
		})
	}
}

// View renders the editor
func (e *Editor) View() string {
	s := styles.CurrentStyles()

	// Editor title
	title := "💬 Command Input"
	if e.active {
		title += " (✅ ACTIVE - Type your command)"
	} else {
		title += " (Press Tab to activate)"
	}

	// Status indicator
	status := "✓ Ready - Press Enter to execute"
	if e.submitting {
		status = "⏳ Processing command..."
	}

	// Input hint
	hint := ""
	if e.textarea.Value() == "" && !e.submitting {
		hint = s.Muted.Render("💡 Try: help | read package.json | ask \"What is TypeScript?\"")
	}

	// Choose style based on active state
	borderStyle := s.Panel
	if e.active {
		borderStyle = s.PanelActive
	}

	// Build content
	content := lipgloss.JoinVertical(
		lipgloss.Left,
		s.Title.Render(title),
		e.textarea.View(),
		s.Info.Render(status),
	)

	if hint != "" {
		content = lipgloss.JoinVertical(lipgloss.Left, content, hint)
	}

	return borderStyle.
		Width(e.width).
		Height(e.height).
		Render(content)
}

// KeyBindings returns the key bindings for help
func (e *Editor) KeyBindings() []key.Binding {
	return []key.Binding{
		e.keyMap.Submit,
		e.keyMap.Newline,
		e.keyMap.Cancel,
	}
}

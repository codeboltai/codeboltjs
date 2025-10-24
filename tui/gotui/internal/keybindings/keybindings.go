package keybindings

import "github.com/charmbracelet/bubbles/v2/key"

// KeyMap defines the key bindings exposed to the rest of the app.
type KeyMap struct {
	Submit       key.Binding
	Newline      key.Binding
	Quit         key.Binding
	Retry        key.Binding
	FocusChat    key.Binding
	ShowCommands key.Binding
	ScrollUp     key.Binding
	ScrollDown   key.Binding
	ToggleMode   key.Binding
	NextTab      key.Binding
	PrevTab      key.Binding
	TabChat      key.Binding
	TabLogs      key.Binding
	TabGit       key.Binding
	ToggleStatus key.Binding
	ToggleLogs   key.Binding
	ToggleServer key.Binding
	ToggleAgent  key.Binding
	ToggleNotifs key.Binding
	Help         key.Binding
}

// DefaultKeyMap provides the default keyboard shortcuts used elsewhere.
func DefaultKeyMap() KeyMap {
	return KeyMap{
		Submit:       key.NewBinding(key.WithKeys("enter"), key.WithHelp("enter", "send message")),
		Newline:      key.NewBinding(key.WithKeys("ctrl+j"), key.WithHelp("ctrl+j", "new line")),
		Quit:         key.NewBinding(key.WithKeys("ctrl+c", "ctrl+q"), key.WithHelp("ctrl+c", "quit")),
		Retry:        key.NewBinding(key.WithKeys("ctrl+r"), key.WithHelp("ctrl+r", "retry connection")),
		FocusChat:    key.NewBinding(key.WithKeys("tab"), key.WithHelp("tab", "focus chat/scroll")),
		ShowCommands: key.NewBinding(key.WithKeys("ctrl+k"), key.WithHelp("ctrl+k", "commands")),
		ToggleMode:   key.NewBinding(key.WithKeys("ctrl+t"), key.WithHelp("ctrl+t", "toggle layout mode")),
		NextTab:      key.NewBinding(key.WithKeys("ctrl+]"), key.WithHelp("ctrl+]", "next tab")),
		PrevTab:      key.NewBinding(key.WithKeys("ctrl+["), key.WithHelp("ctrl+[", "prev tab")),
		TabChat:      key.NewBinding(key.WithKeys("ctrl+1", "shift+1"), key.WithHelp("ctrl+1/shift+1", "chat tab")),
		TabLogs:      key.NewBinding(key.WithKeys("ctrl+2", "shift+2"), key.WithHelp("ctrl+2/shift+2", "logs tab")),
		TabGit:       key.NewBinding(key.WithKeys("ctrl+3", "shift+3"), key.WithHelp("ctrl+3/shift+3", "git tab")),
		ScrollUp:     key.NewBinding(key.WithKeys("up", "k"), key.WithHelp("↑/k", "scroll up")),
		ScrollDown:   key.NewBinding(key.WithKeys("down", "j"), key.WithHelp("↓/j", "scroll down")),
		ToggleStatus: key.NewBinding(key.WithKeys("ctrl+s"), key.WithHelp("ctrl+s", "toggle connection")),
		ToggleLogs:   key.NewBinding(key.WithKeys("ctrl+l"), key.WithHelp("ctrl+l", "toggle logs")),
		ToggleServer: key.NewBinding(key.WithKeys("ctrl+v"), key.WithHelp("ctrl+v", "toggle server")),
		ToggleAgent:  key.NewBinding(key.WithKeys("ctrl+a"), key.WithHelp("ctrl+a", "toggle agent")),
		ToggleNotifs: key.NewBinding(key.WithKeys("ctrl+n"), key.WithHelp("ctrl+n", "toggle notifications")),
		Help:         key.NewBinding(key.WithKeys("?", "ctrl+h"), key.WithHelp("?", "toggle help")),
	}
}

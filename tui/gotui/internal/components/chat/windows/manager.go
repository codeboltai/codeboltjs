package windows

import (
	"math"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/charmbracelet/lipgloss/v2"

	"gotui/internal/components/chattemplates"
	"gotui/internal/stores"
	"gotui/internal/styles"
)

type Mode int

const (
	ModePanel Mode = iota
	ModeWindow
)

type ActivateConversationMsg struct {
	ConversationID string
}

type Manager struct {
	mode            Mode
	width           int
	height          int
	templateManager *chattemplates.TemplateManager
	windows         map[string]*ConversationWindow
	order           []string
	focusedID       string
	activeID        string
	dragging        *dragState
}

type dragState struct {
	windowID string
	offsetX  int
	offsetY  int
}

func NewManager(templateManager *chattemplates.TemplateManager) *Manager {
	return &Manager{
		mode:            ModePanel,
		templateManager: templateManager,
		windows:         make(map[string]*ConversationWindow),
	}
}

func (m *Manager) Mode() Mode {
	return m.mode
}

func (m *Manager) SetMode(mode Mode) {
	if m.mode == mode {
		return
	}
	m.mode = mode
	if mode != ModeWindow {
		m.dragging = nil
		return
	}
	if m.focusedID == "" && m.activeID != "" {
		m.focusWindow(m.activeID)
	}
	m.ensureWindowBounds()
}

func (m *Manager) ToggleMode() Mode {
	if m.mode == ModeWindow {
		m.SetMode(ModePanel)
	} else {
		m.SetMode(ModeWindow)
	}
	return m.mode
}

func (m *Manager) IsWindowMode() bool {
	return m.mode == ModeWindow
}

func (m *Manager) SetSize(width, height int) {
	if width <= 0 {
		width = 80
	}
	if height <= 0 {
		height = 24
	}
	m.width = width
	m.height = height
	m.ensureWindowBounds()
}

func (m *Manager) SyncConversations(conversations []*stores.Conversation, activeID string) {
	if m.templateManager == nil {
		return
	}

	seen := make(map[string]struct{}, len(conversations))
	for _, conv := range conversations {
		if conv == nil || conv.ID == "" {
			continue
		}

		seen[conv.ID] = struct{}{}

		win, ok := m.windows[conv.ID]
		if !ok {
			win = NewConversationWindow(conv, m.templateManager)
			m.windows[conv.ID] = win
			m.order = append(m.order, conv.ID)
			win.SetBounds(m.defaultBounds(len(m.order) - 1))
		} else {
			win.SyncConversation(conv)
		}
	}

	// Remove stale windows
	for id := range m.windows {
		if _, ok := seen[id]; !ok {
			delete(m.windows, id)
			m.removeFromOrder(id)
			if m.focusedID == id {
				m.focusedID = ""
			}
		}
	}

	m.activeID = activeID
	if m.focusedID == "" && activeID != "" {
		m.focusWindow(activeID)
	}

	m.ensureWindowBounds()
}

func (m *Manager) HandleMessage(msg tea.Msg) (tea.Cmd, bool) {
	if m.mode != ModeWindow {
		return nil, false
	}

	switch ev := msg.(type) {
	case tea.MouseClickMsg:
		mouse := ev.Mouse()
		if mouse.Button != tea.MouseLeft {
			return nil, false
		}

		id := m.windowAt(mouse.X, mouse.Y)
		if id == "" {
			m.dragging = nil
			return nil, true
		}

		m.focusWindow(id)
		win := m.windows[id]
		if win == nil {
			return nil, true
		}

		m.dragging = &dragState{
			windowID: id,
			offsetX:  mouse.X - win.X,
			offsetY:  mouse.Y - win.Y,
		}

		cmd := win.HandleViewportMsg(ev)
		activate := tea.Cmd(func() tea.Msg {
			return ActivateConversationMsg{ConversationID: id}
		})

		if cmd != nil {
			return tea.Batch(cmd, activate), true
		}
		return activate, true

	case tea.MouseMotionMsg:
		if m.dragging == nil {
			return nil, false
		}
		win := m.windows[m.dragging.windowID]
		if win == nil {
			m.dragging = nil
			return nil, true
		}
		mouse := ev.Mouse()
		newX := mouse.X - m.dragging.offsetX
		newY := mouse.Y - m.dragging.offsetY
		win.SetPosition(newX, newY)
		win.ConstrainTo(m.width, m.height)
		return nil, true

	case tea.MouseReleaseMsg:
		mouse := ev.Mouse()
		if mouse.Button == tea.MouseLeft {
			m.dragging = nil
			return nil, true
		}
		return nil, false

	case tea.MouseWheelMsg:
		mouse := ev.Mouse()
		id := m.windowAt(mouse.X, mouse.Y)
		if id == "" {
			return nil, false
		}
		if win := m.windows[id]; win != nil {
			cmd := win.HandleViewportMsg(ev)
			return cmd, true
		}
		return nil, false

	case tea.KeyPressMsg:
		switch ev.String() {
		case "tab":
			m.cycleFocus(1)
			return nil, true
		case "shift+tab":
			m.cycleFocus(-1)
			return nil, true
		}
	}

	return nil, false
}

func (m *Manager) View() string {
	if m.width <= 0 || m.height <= 0 {
		return ""
	}

	theme := styles.CurrentTheme()

	base := lipgloss.NewStyle().
		Width(m.width).
		Height(m.height).
		Background(lipgloss.Color(theme.Background.Hex())).
		Render("")

	canvas := lipgloss.NewCanvas(lipgloss.NewLayer(base))

	for idx, id := range m.order {
		win := m.windows[id]
		if win == nil {
			continue
		}

		focused := id == m.focusedID
		active := id == m.activeID
		layerContent := win.Render(focused, active)

		layer := lipgloss.NewLayer(layerContent).
			X(win.X).
			Y(win.Y).
			Z(idx + 10).
			ID(id)

		canvas.AddLayers(layer)
	}

	instructions := lipgloss.NewStyle().
		Background(lipgloss.Color(theme.SurfaceHigh.Hex())).
		Foreground(lipgloss.Color(theme.Muted.Hex())).
		Padding(0, 1).
		Render("Window mode – drag windows with mouse, TAB to cycle, Ctrl+T to exit")

	canvas.AddLayers(lipgloss.NewLayer(instructions).
		X(1).
		Y(0).
		Z(1000).
		ID("window-mode-hint"))

	return canvas.Render()
}

func (m *Manager) windowAt(x, y int) string {
	for i := len(m.order) - 1; i >= 0; i-- {
		id := m.order[i]
		win := m.windows[id]
		if win == nil {
			continue
		}
		if win.ContainsPoint(x, y) {
			return id
		}
	}
	return ""
}

func (m *Manager) focusWindow(id string) {
	if id == "" {
		return
	}
	if _, ok := m.windows[id]; !ok {
		return
	}
	m.removeFromOrder(id)
	m.order = append(m.order, id)
	m.focusedID = id
}

func (m *Manager) cycleFocus(delta int) {
	if len(m.order) == 0 {
		return
	}

	currentIndex := 0
	if m.focusedID != "" {
		for i, id := range m.order {
			if id == m.focusedID {
				currentIndex = i
				break
			}
		}
	}

	next := currentIndex + delta
	n := len(m.order)
	next = ((next % n) + n) % n
	target := m.order[next]
	m.focusWindow(target)
}

func (m *Manager) removeFromOrder(id string) {
	for idx, existing := range m.order {
		if existing == id {
			m.order = append(m.order[:idx], m.order[idx+1:]...)
			return
		}
	}
}

func (m *Manager) ensureWindowBounds() {
	if len(m.windows) == 0 {
		return
	}
	for _, id := range m.order {
		win := m.windows[id]
		if win == nil {
			continue
		}
		if win.Width <= 0 || win.Height <= 0 {
			win.SetBounds(m.defaultBounds(0))
		}
		win.ConstrainTo(m.width, m.height)
	}
}

func (m *Manager) defaultBounds(index int) (int, int, int, int) {
	maxWidth := maxInt(minWindowWidth, m.width-4)
	width := defaultWindowWidth
	if width > maxWidth {
		width = maxWidth
	}
	if width > m.width-2 {
		width = m.width - 2
	}
	if width < minWindowWidth {
		width = minWindowWidth
	}
	if width <= 0 {
		width = int(math.Max(30, float64(m.width)/2))
	}

	maxHeight := maxInt(minWindowHeight, m.height-4)
	height := defaultWindowHeight
	if height > maxHeight {
		height = maxHeight
	}
	if height > m.height-2 {
		height = m.height - 2
	}
	if height < minWindowHeight {
		height = minWindowHeight
	}
	if height <= 0 {
		height = int(math.Max(10, float64(m.height)/2))
	}

	padding := 2
	maxX := maxInt(0, m.width-width-padding)
	maxY := maxInt(0, m.height-height-padding)

	offset := index * 6
	spanX := maxInt(1, maxX)
	x := padding + (offset % spanX)
	y := padding + ((offset / spanX) * 2)

	if x > maxX {
		x = maxX
	}
	if y > maxY {
		y = maxY
	}

	return x, y, width, height
}

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

const (
	defaultWindowWidth  = 60
	defaultWindowHeight = 18
)

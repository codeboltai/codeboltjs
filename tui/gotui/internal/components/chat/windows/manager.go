package windows

import (
	"fmt"
	"math"
	"time"

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
	autoTile        bool
	animations      map[string]*animation
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
		animations:      make(map[string]*animation),
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

func (m *Manager) SyncConversations(conversations []*stores.Conversation, activeID string) tea.Cmd {
	if m.templateManager == nil {
		return nil
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

	if m.autoTile {
		return m.layoutAutoTile(true)
	}

	m.ensureWindowBounds()
	return nil
}

func (m *Manager) HandleMessage(msg tea.Msg) (tea.Cmd, bool) {
	if m.mode != ModeWindow {
		return nil, false
	}

	switch ev := msg.(type) {
	case tea.MouseClickMsg:
		if m.autoTile {
			mouse := ev.Mouse()
			if mouse.Button != tea.MouseLeft {
				return nil, false
			}
			id := m.windowAt(mouse.X, mouse.Y)
			if id == "" {
				return nil, true
			}
			m.focusWindow(id)
			activate := tea.Cmd(func() tea.Msg {
				return ActivateConversationMsg{ConversationID: id}
			})
			return activate, true
		}
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
		if m.autoTile {
			return nil, false
		}
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
		if m.autoTile {
			return nil, false
		}
		mouse := ev.Mouse()
		if mouse.Button == tea.MouseLeft {
			m.dragging = nil
			return nil, true
		}
		return nil, false

	case tea.MouseWheelMsg:
		if m.autoTile {
			return nil, false
		}
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
	case AnimationTickMsg:
		if !m.autoTile {
			return nil, true
		}
		m.applyAnimations(ev.Time)
		if len(m.animations) > 0 {
			return m.animationTickCmd(), true
		}
		return nil, true
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

	m.applyAnimations(time.Now())

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

	autoStatus := "OFF"
	if m.autoTile {
		autoStatus = "ON"
	}
	instructionText := fmt.Sprintf("Window mode – drag windows with mouse, TAB to cycle, Ctrl+T to exit, Ctrl+U auto-tiling %s", autoStatus)
	instructions := lipgloss.NewStyle().
		Background(lipgloss.Color(theme.SurfaceHigh.Hex())).
		Foreground(lipgloss.Color(theme.Muted.Hex())).
		Padding(0, 1).
		Render(instructionText)

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
	if m.autoTile {
		m.layoutAutoTile(false)
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

func (m *Manager) layoutAutoTile(animated bool) tea.Cmd {
	if len(m.order) == 0 || m.width <= 0 || m.height <= 0 {
		return nil
	}

	cols := int(math.Ceil(math.Sqrt(float64(len(m.order)))))
	if cols < 1 {
		cols = 1
	}
	rows := int(math.Ceil(float64(len(m.order)) / float64(cols)))
	if rows < 1 {
		rows = 1
	}

	gutter := autoTileGutter
	usableWidth := maxInt(1, m.width-(cols+1)*gutter)
	usableHeight := maxInt(1, m.height-(rows+1)*gutter)
	tileWidth := maxInt(minWindowWidth, usableWidth/cols)
	tileHeight := maxInt(minWindowHeight, usableHeight/rows)

	now := time.Now()
	started := false

	for idx, id := range m.order {
		win := m.windows[id]
		if win == nil {
			continue
		}
		col := idx % cols
		row := idx / cols

		target := rect{
			x:      gutter + col*(tileWidth+gutter),
			y:      gutter + row*(tileHeight+gutter),
			width:  tileWidth,
			height: tileHeight,
		}

		if animated {
			if m.startAnimation(id, win, target, now) {
				started = true
			}
		} else {
			win.SetBounds(target.x, target.y, target.width, target.height)
		}
	}

	if animated && started {
		return m.animationTickCmd()
	}

	if !animated {
		m.animations = make(map[string]*animation)
	}

	return nil
}

func (m *Manager) startAnimation(id string, win *ConversationWindow, target rect, now time.Time) bool {
	start := rect{x: win.X, y: win.Y, width: win.Width, height: win.Height}
	if start == target {
		return false
	}
	m.animations[id] = &animation{
		windowID:  id,
		start:     start,
		target:    target,
		startTime: now,
		duration:  animationDuration,
	}
	return true
}

func (m *Manager) applyAnimations(now time.Time) {
	if len(m.animations) == 0 {
		return
	}
	for id, anim := range m.animations {
		win := m.windows[id]
		if win == nil {
			delete(m.animations, id)
			continue
		}

		progress := float64(now.Sub(anim.startTime)) / float64(anim.duration)
		if progress >= 1 {
			win.SetBounds(anim.target.x, anim.target.y, anim.target.width, anim.target.height)
			delete(m.animations, id)
			continue
		}
		if progress < 0 {
			progress = 0
		}
		smoothed := easeOutCubic(progress)
		x := interpolate(anim.start.x, anim.target.x, smoothed)
		y := interpolate(anim.start.y, anim.target.y, smoothed)
		w := interpolate(anim.start.width, anim.target.width, smoothed)
		h := interpolate(anim.start.height, anim.target.height, smoothed)
		win.SetBounds(x, y, w, h)
	}
}

func (m *Manager) animationTickCmd() tea.Cmd {
	if len(m.animations) == 0 {
		return nil
	}
	return tea.Tick(animationFrameDuration, func(t time.Time) tea.Msg {
		return AnimationTickMsg{Time: t}
	})
}

func (m *Manager) ToggleAutoTile() (bool, tea.Cmd) {
	m.autoTile = !m.autoTile
	if !m.autoTile {
		m.animations = make(map[string]*animation)
		return false, nil
	}
	return true, m.layoutAutoTile(true)
}

func (m *Manager) AutoTileEnabled() bool {
	return m.autoTile
}

func (m *Manager) RefreshAutoTile(animated bool) tea.Cmd {
	if !m.autoTile {
		return nil
	}
	return m.layoutAutoTile(animated)
}

func easeOutCubic(t float64) float64 {
	if t < 0 {
		t = 0
	}
	if t > 1 {
		t = 1
	}
	return 1 - math.Pow(1-t, 3)
}

func interpolate(start, end int, t float64) int {
	return int(math.Round(float64(start) + (float64(end-start) * t)))
}

type rect struct {
	x      int
	y      int
	width  int
	height int
}

type animation struct {
	windowID  string
	start     rect
	target    rect
	startTime time.Time
	duration  time.Duration
}

type AnimationTickMsg struct {
	Time time.Time
}

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

const (
	defaultWindowWidth     = 60
	defaultWindowHeight    = 18
	autoTileGutter         = 2
	animationDuration      = 180 * time.Millisecond
	animationFrameDuration = time.Second / 60
)

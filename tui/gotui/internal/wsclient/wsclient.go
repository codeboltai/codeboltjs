package wsclient

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type Message struct {
	ID        string          `json:"id,omitempty"`
	Type      string          `json:"type"`
	Timestamp *string         `json:"timestamp,omitempty"`
	Payload   json.RawMessage `json:"-"`
}

type Response struct {
	ID        string      `json:"id"`
	Type      string      `json:"type"`
	Success   bool        `json:"success"`
	Data      interface{} `json:"data,omitempty"`
	Error     string      `json:"error,omitempty"`
	Timestamp string      `json:"timestamp,omitempty"`
}

type Notification struct {
	Type      string      `json:"type"`
	Action    string      `json:"action,omitempty"`
	Event     string      `json:"event,omitempty"`
	Data      interface{} `json:"data,omitempty"`
	Timestamp int64       `json:"timestamp"`
}

type Config struct {
	Host        string
	Port        int
	Protocol    string
	TuiID       string
	ProjectPath string
	ProjectName string
	ProjectType string
}

type AgentSelection struct {
	ID           string
	Name         string
	AgentType    string
	AgentDetails string
}

type Client struct {
	url        string
	conn       *websocket.Conn
	mu         sync.RWMutex
	connected  bool
	pending    map[string]chan Response
	logf       func(string)
	onNotif    func(Notification)
	config     Config
	tuiID      string
	pingTicker *time.Ticker
	stopPingCh chan struct{}
	writeMu    sync.Mutex
}

func New(cfg Config) *Client {
	protocol := strings.TrimSpace(cfg.Protocol)
	if protocol == "" {
		protocol = "ws"
	}

	tuiID := strings.TrimSpace(cfg.TuiID)
	if tuiID == "" {
		tuiID = uuid.NewString()
	}

	query := url.Values{}
	query.Set("clientType", "tui")
	query.Set("tuiId", tuiID)
	if cfg.ProjectPath != "" {
		query.Set("currentProject", cfg.ProjectPath)
	}
	if cfg.ProjectName != "" {
		query.Set("projectName", cfg.ProjectName)
	}
	if cfg.ProjectType != "" {
		query.Set("projectType", cfg.ProjectType)
	}

	u := url.URL{
		Scheme:   protocol,
		Host:     fmt.Sprintf("%s:%d", cfg.Host, cfg.Port),
		RawQuery: query.Encode(),
	}

	return &Client{
		url:        u.String(),
		pending:    make(map[string]chan Response),
		logf:       func(string) {},
		onNotif:    func(Notification) {},
		config:     cfg,
		tuiID:      tuiID,
		stopPingCh: make(chan struct{}),
	}
}

func (c *Client) SetLogger(logf func(string))          { c.logf = logf }
func (c *Client) OnNotification(fn func(Notification)) { c.onNotif = fn }

func (c *Client) Connect(ctx context.Context) error {
	c.mu.RLock()
	if c.connected {
		c.mu.RUnlock()
		return nil
	}
	c.mu.RUnlock()

	u, err := url.Parse(c.url)
	if err != nil {
		return err
	}

	d := websocket.Dialer{HandshakeTimeout: 10 * time.Second}
	conn, _, err := d.DialContext(ctx, u.String(), nil)
	if err != nil {
		return err
	}

	c.mu.Lock()
	if c.connected {
		c.mu.Unlock()
		conn.Close()
		return nil
	}
	c.conn = conn
	c.connected = true
	c.mu.Unlock()

	c.logf(fmt.Sprintf("Connected to %s", c.url))

	if err := c.sendRaw(map[string]any{
		"id":         uuid.NewString(),
		"type":       "register",
		"clientType": "tui",
		"clientId":   c.tuiID,
	}); err != nil {
		c.logf(fmt.Sprintf("Failed to send registration message: %v", err))
		c.mu.Lock()
		if c.conn != nil {
			_ = c.conn.Close()
		}
		c.conn = nil
		c.connected = false
		c.mu.Unlock()
		return err
	}

	c.startPing()
	go c.readLoop()
	return nil
}

func (c *Client) Close() error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.conn != nil {
		err := c.conn.Close()
		c.connected = false
		c.stopPing()
		return err
	}
	c.stopPing()
	return nil
}

func (c *Client) IsConnected() bool {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.connected
}

func (c *Client) readLoop() {
	for {
		_, data, err := c.conn.ReadMessage()
		if err != nil {
			c.logf(fmt.Sprintf("WebSocket read error: %v", err))
			c.mu.Lock()
			c.connected = false
			c.mu.Unlock()
			c.stopPing()
			return
		}
		var resp Response
		if err := json.Unmarshal(data, &resp); err == nil && (resp.Type == "response" || resp.Type == "messageResponse" || resp.Type == "readFileResponse" || resp.Type == "writeFileResponse" || resp.Type == "askAIResponse") {
			if ch := c.takePending(resp.ID); ch != nil {
				ch <- resp
				close(ch)
				continue
			}
		}
		var notif Notification
		if err := json.Unmarshal(data, &notif); err == nil && (notif.Type == "notification" || notif.Type == "fsnotify") {
			c.onNotif(notif)
			continue
		}
		c.logf(fmt.Sprintf("WS recv: %s", string(data)))
	}
}

func (c *Client) takePending(id string) chan Response {
	c.mu.Lock()
	defer c.mu.Unlock()
	ch := c.pending[id]
	delete(c.pending, id)
	return ch
}

func (c *Client) sendRaw(v any) error {
	data, err := json.Marshal(v)
	if err != nil {
		return err
	}

	c.writeMu.Lock()
	defer c.writeMu.Unlock()

	c.mu.RLock()
	conn := c.conn
	connected := c.connected
	c.mu.RUnlock()

	if !connected || conn == nil {
		return errors.New("not connected")
	}

	return conn.WriteMessage(websocket.TextMessage, data)
}

func (c *Client) Send(msgType string, fields map[string]any) error {
	if fields == nil {
		fields = map[string]any{}
	}
	id := uuid.NewString()
	fields["type"] = msgType
	fields["id"] = id
	return c.sendRaw(fields)
}

func (c *Client) Request(ctx context.Context, msgType string, fields map[string]any) (Response, error) {
	if fields == nil {
		fields = map[string]any{}
	}
	id := uuid.NewString()
	fields["type"] = msgType
	fields["id"] = id

	ch := make(chan Response, 1)
	c.mu.Lock()
	c.pending[id] = ch
	c.mu.Unlock()

	if err := c.sendRaw(fields); err != nil {
		c.mu.Lock()
		delete(c.pending, id)
		c.mu.Unlock()
		return Response{}, err
	}

	select {
	case <-ctx.Done():
		c.mu.Lock()
		delete(c.pending, id)
		c.mu.Unlock()
		return Response{}, ctx.Err()
	case resp := <-ch:
		return resp, nil
	case <-time.After(10 * time.Second):
		c.mu.Lock()
		delete(c.pending, id)
		c.mu.Unlock()
		return Response{}, errors.New("request timeout")
	}
}

func (c *Client) SendUserMessage(content string, agent AgentSelection) error {
	if strings.TrimSpace(content) == "" {
		return errors.New("message content cannot be empty")
	}
	if agent.ID == "" {
		agent.ID = uuid.NewString()
	}
	if agent.Name == "" {
		agent.Name = "Default Agent"
	}

	messageID := uuid.NewString()
	threadID := uuid.NewString()
	selectedAgent := map[string]any{
		"id":   agent.ID,
		"name": agent.Name,
	}
	if agent.AgentType != "" {
		selectedAgent["agentType"] = agent.AgentType
	}
	if agent.AgentDetails != "" {
		selectedAgent["agentDetails"] = agent.AgentDetails
	}

	payload := map[string]any{
		"type": "messageResponse",
		"message": map[string]any{
			"userMessage":        content,
			"selectedAgent":      selectedAgent,
			"mentionedFiles":     []string{},
			"mentionedFullPaths": []string{},
			"mentionedFolders":   []string{},
			"mentionedMCPs":      []string{},
			"uploadedImages":     []string{},
			"mentionedAgents":    []any{},
			"mentionedDocs":      []any{},
			"links":              []any{},
			"messageId":          messageID,
			"threadId":           threadID,
		},
		"sender": map[string]any{
			"senderType": "user",
			"senderInfo": map[string]any{"name": "user"},
		},
		"templateType": "",
		"data": map[string]any{
			"text": "",
		},
		"messageId": messageID,
		"timestamp": fmt.Sprintf("%d", time.Now().UnixMilli()),
	}

	return c.sendRaw(payload)
}

func (c *Client) ReadFile(ctx context.Context, filepath string) (string, error) {
	resp, err := c.Request(ctx, "readFile", map[string]any{"filePath": filepath})
	if err != nil {
		return "", err
	}
	if !resp.Success {
		return "", fmt.Errorf(resp.Error)
	}
	if s, ok := resp.Data.(string); ok {
		return s, nil
	}
	if m, ok := resp.Data.(map[string]any); ok {
		if content, ok := m["content"].(string); ok {
			return content, nil
		}
	}
	return "", nil
}

func (c *Client) WriteFile(ctx context.Context, filepath, content string) error {
	resp, err := c.Request(ctx, "writeFile", map[string]any{"filePath": filepath, "content": content})
	if err != nil {
		return err
	}
	if !resp.Success {
		return fmt.Errorf(resp.Error)
	}
	return nil
}

func (c *Client) AskAI(ctx context.Context, prompt string) (string, error) {
	resp, err := c.Request(ctx, "askAI", map[string]any{"prompt": prompt})
	if err != nil {
		return "", err
	}
	if !resp.Success {
		return "", fmt.Errorf(resp.Error)
	}
	if s, ok := resp.Data.(string); ok {
		return s, nil
	}
	return "", nil
}

func (c *Client) startPing() {
	c.stopPing()
	ticker := time.NewTicker(10 * time.Second)
	c.pingTicker = ticker
	stop := make(chan struct{})
	c.stopPingCh = stop
	go func() {
		for {
			select {
			case <-ticker.C:
				if err := c.sendRaw(map[string]any{
					"id":        uuid.NewString(),
					"type":      "tui_ping",
					"timestamp": time.Now().UnixMilli(),
					"message":   "ping from Go TUI",
					"clientId":  c.tuiID,
				}); err != nil {
					c.logf(fmt.Sprintf("Failed to send ping: %v", err))
				}
			case <-stop:
				return
			}
		}
	}()
}

func (c *Client) stopPing() {
	if c.pingTicker != nil {
		c.pingTicker.Stop()
		c.pingTicker = nil
	}
	if c.stopPingCh != nil {
		close(c.stopPingCh)
		c.stopPingCh = nil
	}
}

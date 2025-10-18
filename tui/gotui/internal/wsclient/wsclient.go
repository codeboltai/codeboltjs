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

	"gotui/internal/logging"
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
	url       string
	conn      *websocket.Conn
	mu        sync.RWMutex
	connected bool
	pending   map[string]chan Response
	logf      func(string)
	onNotif   func(Notification)
	onMessage func([]byte)
	config    Config
	tuiID     string
	writeMu   sync.Mutex
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
		url:       u.String(),
		pending:   make(map[string]chan Response),
		logf:      func(msg string) { logging.Printf("%s", msg) },
		onNotif:   func(Notification) {},
		onMessage: func([]byte) {},
		config:    cfg,
		tuiID:     tuiID,
	}
}

func (c *Client) SetLogger(logf func(string))          { c.logf = logf }
func (c *Client) OnNotification(fn func(Notification)) { c.onNotif = fn }
func (c *Client) OnMessage(fn func([]byte))            { c.onMessage = fn }

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

	logging.Printf("Connected to %s", c.url)

	if err := c.sendRaw(map[string]any{
		"id":         uuid.NewString(),
		"type":       "register",
		"clientType": "tui",
		"clientId":   c.tuiID,
	}); err != nil {
		logging.Printf("Failed to send registration message: %v", err)
		c.mu.Lock()
		if c.conn != nil {
			_ = c.conn.Close()
		}
		c.conn = nil
		c.connected = false
		c.mu.Unlock()
		return err
	}

	go c.readLoop()
	return nil
}

func (c *Client) Close() error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.conn != nil {
		err := c.conn.Close()
		c.connected = false
		return err
	}
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
			logging.Printf("WebSocket read error: %v", err)
			c.mu.Lock()
			c.connected = false
			c.mu.Unlock()
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
		logging.Printf("WS recv: %s", string(data))
		c.onMessage(data)
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

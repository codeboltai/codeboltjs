package wsclient

import (
    "context"
    "encoding/json"
    "errors"
    "fmt"
    "net/url"
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

type Client struct {
    url        string
    conn       *websocket.Conn
    mu         sync.RWMutex
    connected  bool
    pending    map[string]chan Response
    logf       func(string)
    onNotif    func(Notification)
}

func New(host string, port int) *Client {
    return &Client{
        url:     fmt.Sprintf("ws://%s:%d", host, port),
        pending: make(map[string]chan Response),
        logf:    func(string) {},
        onNotif: func(Notification) {},
    }
}

func (c *Client) SetLogger(logf func(string)) { c.logf = logf }
func (c *Client) OnNotification(fn func(Notification)) { c.onNotif = fn }

func (c *Client) Connect(ctx context.Context) error {
    c.mu.Lock()
    defer c.mu.Unlock()
    if c.connected {
        return nil
    }

    u, err := url.Parse(c.url)
    if err != nil { return err }
    d := websocket.Dialer{HandshakeTimeout: 10 * time.Second}
    conn, _, err := d.DialContext(ctx, u.String(), nil)
    if err != nil { return err }
    c.conn = conn
    c.connected = true
    c.logf(fmt.Sprintf("Connected to %s", c.url))

    // Auto-register as app client
    _ = c.sendRaw(map[string]any{
        "type":       "register",
        "clientType": "app",
    })

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
    c.mu.RLock(); defer c.mu.RUnlock(); return c.connected
}

func (c *Client) readLoop() {
    for {
        _, data, err := c.conn.ReadMessage()
        if err != nil {
            c.logf(fmt.Sprintf("WebSocket read error: %v", err))
            c.mu.Lock()
            c.connected = false
            c.mu.Unlock()
            return
        }
        // Try response first
        var resp Response
        if err := json.Unmarshal(data, &resp); err == nil && (resp.Type == "response" || resp.Type == "messageResponse" || resp.Type == "readFileResponse" || resp.Type == "writeFileResponse" || resp.Type == "askAIResponse") {
            if ch := c.takePending(resp.ID); ch != nil {
                ch <- resp
                close(ch)
                continue
            }
        }
        // Try notification
        var notif Notification
        if err := json.Unmarshal(data, &notif); err == nil && (notif.Type == "notification" || notif.Type == "fsnotify") {
            c.onNotif(notif)
            continue
        }
        // Unknown; log
        c.logf(fmt.Sprintf("WS recv: %s", string(data)))
    }
}

func (c *Client) takePending(id string) chan Response {
    c.mu.Lock(); defer c.mu.Unlock()
    ch := c.pending[id]
    delete(c.pending, id)
    return ch
}

func (c *Client) sendRaw(v any) error {
    c.mu.RLock()
    defer c.mu.RUnlock()
    if !c.connected || c.conn == nil { return errors.New("not connected") }
    data, err := json.Marshal(v)
    if err != nil { return err }
    return c.conn.WriteMessage(websocket.TextMessage, data)
}

func (c *Client) Send(msgType string, fields map[string]any) error {
    if fields == nil { fields = map[string]any{} }
    id := uuid.NewString()
    fields["type"] = msgType
    fields["id"] = id
    return c.sendRaw(fields)
}

func (c *Client) Request(ctx context.Context, msgType string, fields map[string]any) (Response, error) {
    if fields == nil { fields = map[string]any{} }
    id := uuid.NewString()
    fields["type"] = msgType
    fields["id"] = id

    ch := make(chan Response, 1)
    c.mu.Lock()
    c.pending[id] = ch
    c.mu.Unlock()

    if err := c.sendRaw(fields); err != nil {
        c.mu.Lock(); delete(c.pending, id); c.mu.Unlock()
        return Response{}, err
    }

    select {
    case <-ctx.Done():
        c.mu.Lock(); delete(c.pending, id); c.mu.Unlock()
        return Response{}, ctx.Err()
    case resp := <-ch:
        return resp, nil
    case <-time.After(10 * time.Second):
        c.mu.Lock(); delete(c.pending, id); c.mu.Unlock()
        return Response{}, errors.New("request timeout")
    }
}

// Convenience wrappers mirroring Node TUI
func (c *Client) ReadFile(ctx context.Context, filepath string) (string, error) {
    resp, err := c.Request(ctx, "readFile", map[string]any{"filePath": filepath})
    if err != nil { return "", err }
    if !resp.Success { return "", fmt.Errorf(resp.Error) }
    if s, ok := resp.Data.(string); ok { return s, nil }
    // handle nested map in some handlers
    if m, ok := resp.Data.(map[string]any); ok {
        if content, ok := m["content"].(string); ok { return content, nil }
    }
    return "", nil
}

func (c *Client) WriteFile(ctx context.Context, filepath, content string) error {
    resp, err := c.Request(ctx, "writeFile", map[string]any{"filePath": filepath, "content": content})
    if err != nil { return err }
    if !resp.Success { return fmt.Errorf(resp.Error) }
    return nil
}

func (c *Client) AskAI(ctx context.Context, prompt string) (string, error) {
    resp, err := c.Request(ctx, "askAI", map[string]any{"prompt": prompt})
    if err != nil { return "", err }
    if !resp.Success { return "", fmt.Errorf(resp.Error) }
    if s, ok := resp.Data.(string); ok { return s, nil }
    return "", nil
}



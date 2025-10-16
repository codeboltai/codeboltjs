package stores

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"
)

// AgentOption represents a single agent entry exposed by the agent server.
type AgentOption struct {
	ID          string `json:"agentId"`
	Name        string `json:"agentName"`
	Description string `json:"agentDescription"`
}

type agentListener func([]AgentOption)

// AgentStore caches available agents and notifies listeners about updates.
type AgentStore struct {
	client *http.Client

	mu         sync.RWMutex
	agents     []AgentOption
	listeners  map[int64]agentListener
	nextListen int64
}

var (
	sharedAgentStore     *AgentStore
	sharedAgentStoreOnce sync.Once
)

// SharedAgentStore returns the singleton agent store instance.
func SharedAgentStore() *AgentStore {
	sharedAgentStoreOnce.Do(func() {
		sharedAgentStore = NewAgentStore(nil)
	})
	return sharedAgentStore
}

// NewAgentStore constructs a new agent store using the provided HTTP client.
func NewAgentStore(client *http.Client) *AgentStore {
	if client == nil {
		client = &http.Client{}
	}
	return &AgentStore{
		client:    client,
		listeners: make(map[int64]agentListener),
	}
}

// Agents returns a defensive copy of the cached agents.
func (s *AgentStore) Agents() []AgentOption {
	if s == nil {
		return nil
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	return cloneAgents(s.agents)
}

// AgentByID retrieves an agent by its identifier.
func (s *AgentStore) AgentByID(id string) (*AgentOption, bool) {
	if s == nil {
		return nil, false
	}
	id = strings.TrimSpace(id)
	if id == "" {
		return nil, false
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, agent := range s.agents {
		if strings.EqualFold(agent.ID, id) {
			agentCopy := agent
			return &agentCopy, true
		}
	}
	return nil, false
}

// Subscribe registers a listener for agent updates and returns an unsubscribe function.
func (s *AgentStore) Subscribe(listener agentListener) func() {
	if s == nil || listener == nil {
		return func() {}
	}
	id := atomic.AddInt64(&s.nextListen, 1)
	s.mu.Lock()
	s.listeners[id] = listener
	current := cloneAgents(s.agents)
	s.mu.Unlock()

	listener(current)

	return func() {
		s.mu.Lock()
		delete(s.listeners, id)
		s.mu.Unlock()
	}
}

// SetAgents replaces the cached agent list and notifies listeners.
func (s *AgentStore) SetAgents(agents []AgentOption) {
	if s == nil {
		return
	}
	s.mu.Lock()
	s.agents = cloneAgents(agents)
	listeners := make([]agentListener, 0, len(s.listeners))
	for _, listener := range s.listeners {
		listeners = append(listeners, listener)
	}
	current := cloneAgents(s.agents)
	s.mu.Unlock()

	for _, listener := range listeners {
		listener(current)
	}
}

// Fetch retrieves the agent list from the remote server and updates the cache.
func (s *AgentStore) Fetch(ctx context.Context, protocol, host string, port int) ([]AgentOption, error) {
	if s == nil {
		return nil, fmt.Errorf("AgentStore is not initialized")
	}

	scheme := "http"
	protocol = strings.ToLower(strings.TrimSpace(protocol))
	if protocol == "https" || protocol == "wss" {
		scheme = "https"
	}

	host = strings.TrimSpace(host)
	if host == "" {
		host = "localhost"
	}

	url := fmt.Sprintf("%s://%s:%d/agents", scheme, host, port)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 2048))
		snippet := strings.TrimSpace(string(body))
		if snippet != "" {
			return nil, fmt.Errorf("agents request failed: %d %s", resp.StatusCode, snippet)
		}
		return nil, fmt.Errorf("agents request failed with status %d", resp.StatusCode)
	}

	var payload struct {
		Agents []AgentOption `json:"agents"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, err
	}

	s.SetAgents(payload.Agents)
	return cloneAgents(payload.Agents), nil
}

func cloneAgents(agents []AgentOption) []AgentOption {
	if len(agents) == 0 {
		return []AgentOption{}
	}
	copies := make([]AgentOption, len(agents))
	copy(copies, agents)
	return copies
}

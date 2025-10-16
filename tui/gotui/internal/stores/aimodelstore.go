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

// ModelOption represents a single AI model entry exposed by the agent server.
type ModelOption struct {
	Name         string   `json:"display_name"`
	Provider     string   `json:"provider"`
	Capabilities []string `json:"capabilities"`
	Description  string   `json:"description"`
	Context      string   `json:"context"`
}

type modelListener func([]ModelOption)

// AIModelStore handles retrieval and caching of AI model metadata from the agent server.
type AIModelStore struct {
	client *http.Client

	mu         sync.RWMutex
	models     []ModelOption
	listeners  map[int64]modelListener
	nextListen int64
}

var (
	sharedStore     *AIModelStore
	sharedStoreOnce sync.Once
)

// SharedAIModelStore returns a singleton instance used across the TUI.
func SharedAIModelStore() *AIModelStore {
	sharedStoreOnce.Do(func() {
		sharedStore = NewAIModelStore(nil)
	})
	return sharedStore
}

// NewAIModelStore creates a new store instance. A custom HTTP client can be supplied for testing; otherwise a default client is used.
func NewAIModelStore(client *http.Client) *AIModelStore {
	if client == nil {
		client = &http.Client{}
	}
	return &AIModelStore{
		client:    client,
		listeners: make(map[int64]modelListener),
	}
}

// Models returns a defensive copy of the cached model list.
func (s *AIModelStore) Models() []ModelOption {
	if s == nil {
		return nil
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	return cloneModels(s.models)
}

// ModelByNameProvider retrieves a model matching the provided name and provider.
func (s *AIModelStore) ModelByNameProvider(name, provider string) (*ModelOption, bool) {
	if s == nil {
		return nil, false
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, model := range s.models {
		if strings.EqualFold(model.Name, name) && strings.EqualFold(model.Provider, provider) {
			copy := model
			return &copy, true
		}
	}
	return nil, false
}

// Subscribe registers a listener that will be invoked whenever the model list changes.
// It returns a function that can be called to unsubscribe the listener.
func (s *AIModelStore) Subscribe(listener modelListener) func() {
	if s == nil || listener == nil {
		return func() {}
	}
	id := atomic.AddInt64(&s.nextListen, 1)
	s.mu.Lock()
	s.listeners[id] = listener
	current := cloneModels(s.models)
	s.mu.Unlock()

	// Emit current snapshot to new subscriber immediately.
	listener(current)

	return func() {
		s.mu.Lock()
		delete(s.listeners, id)
		s.mu.Unlock()
	}
}

// SetModels replaces the cached models and notifies listeners.
func (s *AIModelStore) SetModels(models []ModelOption) {
	if s == nil {
		return
	}
	s.mu.Lock()
	s.models = cloneModels(models)
	listeners := make([]modelListener, 0, len(s.listeners))
	for _, listener := range s.listeners {
		listeners = append(listeners, listener)
	}
	current := cloneModels(s.models)
	s.mu.Unlock()

	for _, listener := range listeners {
		listener(current)
	}
}

// Fetch retrieves model options from the configured server and updates the cache.
func (s *AIModelStore) Fetch(ctx context.Context, protocol, host string, port int) ([]ModelOption, error) {
	if s == nil {
		return nil, fmt.Errorf("AIModelStore is not initialized")
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

	url := fmt.Sprintf("%s://%s:%d/models", scheme, host, port)

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
			return nil, fmt.Errorf("models request failed: %d %s", resp.StatusCode, snippet)
		}
		return nil, fmt.Errorf("models request failed with status %d", resp.StatusCode)
	}

	var payload struct {
		Models []ModelOption `json:"models"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, err
	}

	s.SetModels(payload.Models)
	return cloneModels(payload.Models), nil
}

func cloneModels(models []ModelOption) []ModelOption {
	if len(models) == 0 {
		return []ModelOption{}
	}
	copySlice := make([]ModelOption, len(models))
	copy(copySlice, models)
	return copySlice
}

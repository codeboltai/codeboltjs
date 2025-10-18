package stores

import (
	"sync"
	"sync/atomic"
)

// ApplicationSettings captures global configuration that should persist across conversations.
type ApplicationSettings struct {
	DefaultModel *ModelOption
	DefaultAgent *AgentSelection
}

// Clone returns a deep copy of the settings structure to avoid external mutation.
func (s ApplicationSettings) Clone() ApplicationSettings {
	copy := ApplicationSettings{}
	if s.DefaultModel != nil {
		modelCopy := *s.DefaultModel
		copy.DefaultModel = &modelCopy
	}
	if s.DefaultAgent != nil {
		agentCopy := *s.DefaultAgent
		copy.DefaultAgent = &agentCopy
	}
	return copy
}

type settingsListener func(ApplicationSettings)

// ApplicationSettingsStore provides thread-safe access to global application preferences.
type ApplicationSettingsStore struct {
	mu         sync.RWMutex
	settings   ApplicationSettings
	listeners  map[int64]settingsListener
	nextListen int64
}

var (
	sharedApplicationSettings     *ApplicationSettingsStore
	sharedApplicationSettingsOnce sync.Once
)

// SharedApplicationSettingsStore returns the singleton store instance.
func SharedApplicationSettingsStore() *ApplicationSettingsStore {
	sharedApplicationSettingsOnce.Do(func() {
		sharedApplicationSettings = NewApplicationSettingsStore()
	})
	return sharedApplicationSettings
}

// NewApplicationSettingsStore initializes a new store with zeroed settings.
func NewApplicationSettingsStore() *ApplicationSettingsStore {
	return &ApplicationSettingsStore{
		listeners: make(map[int64]settingsListener),
	}
}

// Settings returns a copy of the current application settings.
func (s *ApplicationSettingsStore) Settings() ApplicationSettings {
	if s == nil {
		return ApplicationSettings{}
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.settings.Clone()
}

// Update replaces all settings and notifies subscribers.
func (s *ApplicationSettingsStore) Update(settings ApplicationSettings) {
	if s == nil {
		return
	}
	s.mu.Lock()
	s.settings = settings.Clone()
	listeners := s.snapshotListenersLocked()
	current := s.settings.Clone()
	s.mu.Unlock()

	for _, listener := range listeners {
		listener(current)
	}
}

// SetDefaultModel updates the globally configured default model and notifies listeners.
func (s *ApplicationSettingsStore) SetDefaultModel(model *ModelOption) {
	if s == nil {
		return
	}
	s.mu.Lock()
	if model != nil {
		modelCopy := *model
		s.settings.DefaultModel = &modelCopy
	} else {
		s.settings.DefaultModel = nil
	}
	listeners := s.snapshotListenersLocked()
	current := s.settings.Clone()
	s.mu.Unlock()

	for _, listener := range listeners {
		listener(current)
	}
}

// SetDefaultAgent updates the globally configured default agent and notifies listeners.
func (s *ApplicationSettingsStore) SetDefaultAgent(agent *AgentSelection) {
	if s == nil {
		return
	}
	s.mu.Lock()
	if agent != nil {
		agentCopy := *agent
		s.settings.DefaultAgent = &agentCopy
	} else {
		s.settings.DefaultAgent = nil
	}
	listeners := s.snapshotListenersLocked()
	current := s.settings.Clone()
	s.mu.Unlock()

	for _, listener := range listeners {
		listener(current)
	}
}

// Subscribe registers a listener for settings changes and returns an unsubscribe function.
func (s *ApplicationSettingsStore) Subscribe(listener settingsListener) func() {
	if s == nil || listener == nil {
		return func() {}
	}
	id := atomic.AddInt64(&s.nextListen, 1)
	s.mu.Lock()
	s.listeners[id] = listener
	current := s.settings.Clone()
	s.mu.Unlock()

	listener(current)

	return func() {
		s.mu.Lock()
		delete(s.listeners, id)
		s.mu.Unlock()
	}
}

func (s *ApplicationSettingsStore) snapshotListenersLocked() []settingsListener {
	listeners := make([]settingsListener, 0, len(s.listeners))
	for _, listener := range s.listeners {
		listeners = append(listeners, listener)
	}
	return listeners
}

package stores

import (
	"strings"
	"sync"
	"sync/atomic"
)

// AgentSelection represents the agent chosen for handling conversation requests.
type AgentSelection struct {
	ID           string
	Name         string
	AgentType    string
	AgentDetails string
}

// ApplicationState captures dynamic UI selections such as the active conversation,
// model, and agent.
type ApplicationState struct {
	SelectedConversationID string
	SelectedModel          *ModelOption
	SelectedAgent          *AgentSelection

	Host        string
	Port        int
	Protocol    string
	TuiID       string
	ProjectPath string
	ProjectName string
	ProjectType string
}

// Clone returns a deep copy of the application state.
func (s ApplicationState) Clone() ApplicationState {
	copy := ApplicationState{SelectedConversationID: s.SelectedConversationID}
	if s.SelectedModel != nil {
		modelCopy := *s.SelectedModel
		copy.SelectedModel = &modelCopy
	}
	if s.SelectedAgent != nil {
		agentCopy := *s.SelectedAgent
		copy.SelectedAgent = &agentCopy
	}
	copy.Host = s.Host
	copy.Port = s.Port
	copy.Protocol = s.Protocol
	copy.TuiID = s.TuiID
	copy.ProjectPath = s.ProjectPath
	copy.ProjectName = s.ProjectName
	copy.ProjectType = s.ProjectType
	return copy
}

type stateListener func(ApplicationState)

// ApplicationStateStore manages the shared application state and notifies
// subscribers whenever it changes.
type ApplicationStateStore struct {
	mu        sync.RWMutex
	state     ApplicationState
	listeners map[int64]stateListener
	nextID    int64
}

var (
	sharedApplicationState     *ApplicationStateStore
	sharedApplicationStateOnce sync.Once
)

// SharedApplicationStateStore returns the application-wide singleton instance.
func SharedApplicationStateStore() *ApplicationStateStore {
	sharedApplicationStateOnce.Do(func() {
		sharedApplicationState = NewApplicationStateStore()
	})
	return sharedApplicationState
}

// NewApplicationStateStore creates a new, empty state store.
func NewApplicationStateStore() *ApplicationStateStore {
	return &ApplicationStateStore{
		listeners: make(map[int64]stateListener),
	}
}

// State returns the current state as a defensive copy.
func (s *ApplicationStateStore) State() ApplicationState {
	if s == nil {
		return ApplicationState{}
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.state.Clone()
}

// Update replaces the stored state and notifies listeners.
func (s *ApplicationStateStore) Update(state ApplicationState) {
	if s == nil {
		return
	}
	s.mu.Lock()
	s.state = state.Clone()
	listeners := s.snapshotListenersLocked()
	current := s.state.Clone()
	s.mu.Unlock()

	for _, listener := range listeners {
		listener(current)
	}
}

// SetSelectedConversation updates the active conversation identifier.
func (s *ApplicationStateStore) SetSelectedConversation(id string) {
	if s == nil {
		return
	}
	id = strings.TrimSpace(id)
	s.mu.Lock()
	s.state.SelectedConversationID = id
	listeners := s.snapshotListenersLocked()
	current := s.state.Clone()
	s.mu.Unlock()

	for _, listener := range listeners {
		listener(current)
	}
}

// SetSelectedModel updates the active model reference.
func (s *ApplicationStateStore) SetSelectedModel(model *ModelOption) {
	if s == nil {
		return
	}
	s.mu.Lock()
	if model != nil {
		modelCopy := *model
		s.state.SelectedModel = &modelCopy
	} else {
		s.state.SelectedModel = nil
	}
	listeners := s.snapshotListenersLocked()
	current := s.state.Clone()
	s.mu.Unlock()

	for _, listener := range listeners {
		listener(current)
	}
}

// SetSelectedAgent updates the active agent reference.
func (s *ApplicationStateStore) SetSelectedAgent(agent *AgentSelection) {
	if s == nil {
		return
	}
	s.mu.Lock()
	if agent != nil {
		agentCopy := *agent
		s.state.SelectedAgent = &agentCopy
	} else {
		s.state.SelectedAgent = nil
	}
	listeners := s.snapshotListenersLocked()
	current := s.state.Clone()
	s.mu.Unlock()

	for _, listener := range listeners {
		listener(current)
	}
}

// SetConnectionInfo records the current server connection details.
func (s *ApplicationStateStore) SetConnectionInfo(host string, port int, protocol string) {
	if s == nil {
		return
	}
	host = strings.TrimSpace(host)
	protocol = strings.TrimSpace(protocol)
	s.mu.Lock()
	s.state.Host = host
	s.state.Port = port
	s.state.Protocol = protocol
	listeners := s.snapshotListenersLocked()
	current := s.state.Clone()
	s.mu.Unlock()

	for _, listener := range listeners {
		listener(current)
	}
}

// SetProjectDetails updates project metadata in the shared state.
func (s *ApplicationStateStore) SetProjectDetails(path, name, projectType string) {
	if s == nil {
		return
	}
	path = strings.TrimSpace(path)
	name = strings.TrimSpace(name)
	projectType = strings.TrimSpace(projectType)
	s.mu.Lock()
	s.state.ProjectPath = path
	s.state.ProjectName = name
	s.state.ProjectType = projectType
	listeners := s.snapshotListenersLocked()
	current := s.state.Clone()
	s.mu.Unlock()

	for _, listener := range listeners {
		listener(current)
	}
}

// SetTuiID records the current TUI identifier shared across components.
func (s *ApplicationStateStore) SetTuiID(tuiID string) {
	if s == nil {
		return
	}
	tuiID = strings.TrimSpace(tuiID)
	s.mu.Lock()
	s.state.TuiID = tuiID
	listeners := s.snapshotListenersLocked()
	current := s.state.Clone()
	s.mu.Unlock()

	for _, listener := range listeners {
		listener(current)
	}
}

// Subscribe registers a listener that will be invoked whenever the state changes.
// It returns a function that removes the listener when invoked.
func (s *ApplicationStateStore) Subscribe(listener stateListener) func() {
	if s == nil || listener == nil {
		return func() {}
	}
	id := atomic.AddInt64(&s.nextID, 1)
	s.mu.Lock()
	s.listeners[id] = listener
	current := s.state.Clone()
	s.mu.Unlock()

	listener(current)

	return func() {
		s.mu.Lock()
		delete(s.listeners, id)
		s.mu.Unlock()
	}
}

func (s *ApplicationStateStore) snapshotListenersLocked() []stateListener {
	listeners := make([]stateListener, 0, len(s.listeners))
	for _, listener := range s.listeners {
		listeners = append(listeners, listener)
	}
	return listeners
}

package stores

import (
	"strings"
	"sync"
	"sync/atomic"
)

// ConversationState captures per-conversation selections such as model and agent.
type ConversationState struct {
	SelectedModel *ModelOption
	SelectedAgent *AgentSelection
}

// Clone returns a defensive copy of the conversation state.
func (s ConversationState) Clone() ConversationState {
	copy := ConversationState{}
	if s.SelectedModel != nil {
		modelCopy := *s.SelectedModel
		copy.SelectedModel = &modelCopy
	}
	if s.SelectedAgent != nil {
		agentCopy := *s.SelectedAgent
		copy.SelectedAgent = &agentCopy
	}
	return copy
}

type conversationStateListener func(string, ConversationState)

// ConversationStateStore maintains state for each conversation id.
type ConversationStateStore struct {
	mu        sync.RWMutex
	states    map[string]ConversationState
	listeners map[int64]conversationStateListener
	nextID    int64
}

var (
	sharedConversationState     *ConversationStateStore
	sharedConversationStateOnce sync.Once
)

// SharedConversationStateStore returns the singleton conversation state store.
func SharedConversationStateStore() *ConversationStateStore {
	sharedConversationStateOnce.Do(func() {
		sharedConversationState = &ConversationStateStore{
			states:    make(map[string]ConversationState),
			listeners: make(map[int64]conversationStateListener),
		}
	})
	return sharedConversationState
}

// State returns a defensive copy of the state for the supplied conversation id.
func (s *ConversationStateStore) State(conversationID string) ConversationState {
	if s == nil || strings.TrimSpace(conversationID) == "" {
		return ConversationState{}
	}
	s.mu.RLock()
	state := s.states[conversationID]
	s.mu.RUnlock()
	return state.Clone()
}

// SetSelectedModel stores the selected model for the conversation.
func (s *ConversationStateStore) SetSelectedModel(conversationID string, model *ModelOption) {
	s.updateState(conversationID, func(current ConversationState) ConversationState {
		if model != nil {
			modelCopy := *model
			current.SelectedModel = &modelCopy
		} else {
			current.SelectedModel = nil
		}
		return current
	})
}

// SetSelectedAgent stores the selected agent for the conversation.
func (s *ConversationStateStore) SetSelectedAgent(conversationID string, agent *AgentSelection) {
	s.updateState(conversationID, func(current ConversationState) ConversationState {
		if agent != nil {
			agentCopy := *agent
			current.SelectedAgent = &agentCopy
		} else {
			current.SelectedAgent = nil
		}
		return current
	})
}

// Update replaces the entire conversation state for the provided identifier.
func (s *ConversationStateStore) Update(conversationID string, state ConversationState) {
	s.updateState(conversationID, func(ConversationState) ConversationState {
		return state.Clone()
	})
}

// Subscribe registers a listener for conversation state updates.
func (s *ConversationStateStore) Subscribe(listener conversationStateListener) func() {
	if s == nil || listener == nil {
		return func() {}
	}
	id := atomic.AddInt64(&s.nextID, 1)
	s.mu.Lock()
	s.listeners[id] = listener
	s.mu.Unlock()
	return func() {
		s.mu.Lock()
		delete(s.listeners, id)
		s.mu.Unlock()
	}
}

func (s *ConversationStateStore) updateState(conversationID string, mutate func(ConversationState) ConversationState) {
	if s == nil || mutate == nil {
		return
	}
	conversationID = strings.TrimSpace(conversationID)
	if conversationID == "" {
		return
	}
	s.mu.Lock()
	current := s.states[conversationID]
	updated := mutate(current.Clone())
	s.states[conversationID] = updated
	listeners := s.snapshotListenersLocked()
	s.mu.Unlock()

	for _, listener := range listeners {
		listener(conversationID, updated.Clone())
	}
}

func (s *ConversationStateStore) snapshotListenersLocked() []conversationStateListener {
	listeners := make([]conversationStateListener, 0, len(s.listeners))
	for _, listener := range s.listeners {
		listeners = append(listeners, listener)
	}
	return listeners
}

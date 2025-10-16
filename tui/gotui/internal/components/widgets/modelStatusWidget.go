package widgets

import (
	"fmt"
	"strings"

	"gotui/internal/components/chatcomponents"
	"gotui/internal/stores"
	"gotui/internal/styles"

	"github.com/charmbracelet/lipgloss/v2"
)

// ModelStatusWidget renders the current model and agent selection status.
type ModelStatusWidget struct {
	modelStore       *stores.AIModelStore
	agentStore       *stores.AgentStore
	stateStore       *stores.ApplicationStateStore
	modelUnsubscribe func()
	agentUnsubscribe func()
	stateUnsubscribe func()
	currentState     stores.ApplicationState
}

// NewModelStatusWidget creates a widget instance bound to the provided stores.
func NewModelStatusWidget(modelStore *stores.AIModelStore, agentStore *stores.AgentStore) *ModelStatusWidget {
	widget := &ModelStatusWidget{}
	widget.SetModelStore(modelStore)
	widget.SetAgentStore(agentStore)
	return widget
}

// SetModelStore binds the widget to the shared model store.
func (w *ModelStatusWidget) SetModelStore(store *stores.AIModelStore) {
	if w == nil {
		return
	}
	if w.modelUnsubscribe != nil {
		w.modelUnsubscribe()
		w.modelUnsubscribe = nil
	}
	w.modelStore = store
	if store != nil {
		w.modelUnsubscribe = store.Subscribe(func(models []stores.ModelOption) {
			_ = models
		})
	}
}

// SetAgentStore binds the widget to the shared agent store.
func (w *ModelStatusWidget) SetAgentStore(store *stores.AgentStore) {
	if w == nil {
		return
	}
	if w.agentUnsubscribe != nil {
		w.agentUnsubscribe()
		w.agentUnsubscribe = nil
	}
	w.agentStore = store
	if store != nil {
		w.agentUnsubscribe = store.Subscribe(func(options []stores.AgentOption) {
			_ = options
		})
	}
}

// SetStateStore binds the widget to the shared application state store.
func (w *ModelStatusWidget) SetStateStore(store *stores.ApplicationStateStore) {
	if w == nil {
		return
	}
	if w.stateUnsubscribe != nil {
		w.stateUnsubscribe()
		w.stateUnsubscribe = nil
	}
	w.stateStore = store
	w.currentState = stores.ApplicationState{}
	if store != nil {
		w.stateUnsubscribe = store.Subscribe(func(state stores.ApplicationState) {
			w.currentState = state
		})
	}
}

// Model returns a copy of the active model resolved from the store, if any.
func (w *ModelStatusWidget) Model() *chatcomponents.ModelOption {
	if w == nil {
		return nil
	}
	selected := w.currentState.SelectedModel
	if selected == nil {
		return nil
	}
	if w.modelStore != nil {
		if model, ok := w.modelStore.ModelByNameProvider(selected.Name, selected.Provider); ok {
			copy := chatcomponents.ModelOption(*model)
			return &copy
		}
	}
	copy := chatcomponents.ModelOption(*selected)
	return &copy
}

// Agent returns a copy of the active agent resolved from the store, if any.
func (w *ModelStatusWidget) Agent() *stores.AgentOption {
	if w == nil {
		return nil
	}
	selected := w.currentState.SelectedAgent
	if selected == nil || strings.TrimSpace(selected.ID) == "" {
		return nil
	}
	if w.agentStore != nil {
		if agent, ok := w.agentStore.AgentByID(selected.ID); ok {
			copy := *agent
			return &copy
		}
	}
	return &stores.AgentOption{ID: selected.ID, Name: selected.Name, Description: selected.AgentDetails}
}

// View renders the widget using the latest information from the stores.
func (w *ModelStatusWidget) View() string {
	if w == nil {
		return ""
	}

	model := w.Model()
	agent := w.Agent()
	if model == nil && agent == nil {
		return ""
	}

	theme := styles.CurrentTheme()
	segments := []string{}

	if model != nil {
		label := fmt.Sprintf("Model: %s", model.Name)
		if provider := strings.TrimSpace(model.Provider); provider != "" {
			label += fmt.Sprintf("  •  %s", provider)
		}
		if ctx := strings.TrimSpace(model.Context); ctx != "" {
			label += fmt.Sprintf("  •  %s context", ctx)
		}
		segments = append(segments, label)
	}

	if agent != nil {
		label := fmt.Sprintf("Agent: %s", agent.Name)
		segments = append(segments, label)
	}

	content := strings.Join(segments, "  │  ")

	return lipgloss.NewStyle().
		Foreground(theme.Primary).
		Border(lipgloss.NormalBorder()).
		BorderForeground(theme.Primary).
		Padding(0, 1).
		Render(content)
}

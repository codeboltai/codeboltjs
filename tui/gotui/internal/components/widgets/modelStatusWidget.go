package widgets

import (
	"fmt"
	"strings"

	"gotui/internal/components/chatcomponents"
	"gotui/internal/stores"
	"gotui/internal/styles"

	"github.com/charmbracelet/lipgloss/v2"
)

type modelKey struct {
	Name     string
	Provider string
}

// ModelStatusWidget renders the current model selection status.
type ModelStatusWidget struct {
	store       *stores.AIModelStore
	unsubscribe func()
	selected    *modelKey
}

// NewModelStatusWidget creates a widget instance bound to the provided store.
func NewModelStatusWidget(store *stores.AIModelStore) *ModelStatusWidget {
	widget := &ModelStatusWidget{}
	widget.SetStore(store)
	return widget
}

// SetStore binds the widget to the shared model store.
func (w *ModelStatusWidget) SetStore(store *stores.AIModelStore) {
	if w == nil {
		return
	}
	if w.unsubscribe != nil {
		w.unsubscribe()
		w.unsubscribe = nil
	}
	w.store = store
	if store != nil {
		w.unsubscribe = store.Subscribe(func(models []stores.ModelOption) {
			// No additional work required; View pulls latest data when rendered.
		})
	}
}

// SetModel records the selected model using the shared store as the source of truth.
func (w *ModelStatusWidget) SetModel(model *chatcomponents.ModelOption) {
	if w == nil {
		return
	}
	if model == nil {
		w.selected = nil
		return
	}
	w.selected = &modelKey{Name: model.Name, Provider: model.Provider}
}

// Model returns a copy of the active model resolved from the store, if any.
func (w *ModelStatusWidget) Model() *chatcomponents.ModelOption {
	if w == nil || w.store == nil || w.selected == nil {
		return nil
	}
	model, ok := w.store.ModelByNameProvider(w.selected.Name, w.selected.Provider)
	if !ok {
		return nil
	}
	copy := chatcomponents.ModelOption(*model)
	return &copy
}

// View renders the widget using the latest information from the store.
func (w *ModelStatusWidget) View() string {
	model := w.Model()
	if w == nil || model == nil {
		return ""
	}

	theme := styles.CurrentTheme()
	label := fmt.Sprintf("Model: %s", model.Name)

	if provider := strings.TrimSpace(model.Provider); provider != "" {
		label += fmt.Sprintf("  •  %s", provider)
	}
	if ctx := strings.TrimSpace(model.Context); ctx != "" {
		label += fmt.Sprintf("  •  %s context", ctx)
	}

	return lipgloss.NewStyle().
		Foreground(theme.Primary).
		Border(lipgloss.NormalBorder()).
		BorderForeground(theme.Primary).
		Padding(0, 1).
		Render(label)
}

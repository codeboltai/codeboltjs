package app

import (
	"fmt"
	"sort"

	"github.com/Gaurav-Gosain/tuios/internal/config"
	"github.com/Gaurav-Gosain/tuios/internal/ui"
)

// CreateMinimizeAnimation creates a minimize animation for the window at index i
func (m *OS) CreateMinimizeAnimation(i int) *ui.Animation {
	if i < 0 || i >= len(m.Windows) {
		return nil
	}

	window := m.Windows[i]

	// Calculate dock position for this window
	dockX, dockY := m.calculateDockPosition(i)

	return ui.NewMinimizeAnimation(window, dockX, dockY, config.DefaultAnimationDuration)
}

// CreateRestoreAnimation creates a restore animation for the window at index i
func (m *OS) CreateRestoreAnimation(i int) *ui.Animation {
	if i < 0 || i >= len(m.Windows) {
		return nil
	}

	window := m.Windows[i]

	// Calculate dock position for this window
	dockX, dockY := m.calculateDockPosition(i)

	return ui.NewRestoreAnimation(window, dockX, dockY, config.DefaultAnimationDuration)
}

// CreateSnapAnimation creates a snap animation for the window at index i
func (m *OS) CreateSnapAnimation(i int, quarter SnapQuarter) *ui.Animation {
	if i < 0 || i >= len(m.Windows) {
		return nil
	}

	window := m.Windows[i]

	// Calculate target bounds for the snap
	targetX, targetY, targetWidth, targetHeight := m.calculateSnapBounds(quarter)

	// Enforce minimum size
	targetWidth = max(targetWidth, config.DefaultWindowWidth)
	targetHeight = max(targetHeight, config.DefaultWindowHeight)

	return ui.NewSnapAnimation(window, targetX, targetY, targetWidth, targetHeight, config.DefaultAnimationDuration)
}

// HasActiveAnimations returns true if there are any active animations
func (m *OS) HasActiveAnimations() bool {
	return len(m.Animations) > 0
}

// UpdateAnimations updates all active animations and applies their effects.
func (m *OS) UpdateAnimations() {
	// Update animations in reverse order so we can safely remove completed ones
	for i := len(m.Animations) - 1; i >= 0; i-- {
		anim := m.Animations[i]

		// Update the animation and check if it's complete
		isComplete := anim.Update()

		// If animation is complete, handle post-animation logic
		if isComplete {
			// Handle minimize animation completion
			if anim.Type == ui.AnimationMinimize {
				// Find the window index for this animation
				for winIdx, win := range m.Windows {
					if win == anim.Window {
						// NOW change focus after animation completes
						if winIdx == m.FocusedWindow {
							m.FocusNextVisibleWindow()
						}
						break
					}
				}
			}

			// Remove completed animation
			m.Animations = append(m.Animations[:i], m.Animations[i+1:]...)
		}
	}
}

// calculateDockPosition calculates the position in the dock for a minimized window
func (m *OS) calculateDockPosition(windowIndex int) (int, int) {
	// Find all minimized/minimizing windows in current workspace
	dockWindows := []int{}

	for i, window := range m.Windows {
		if window.Workspace == m.CurrentWorkspace && (window.Minimized || window.Minimizing) {
			dockWindows = append(dockWindows, i)
			if len(dockWindows) >= 9 {
				break
			}
		}
	}

	// Sort by minimize order to match renderDock
	sort.Slice(dockWindows, func(i, j int) bool {
		return m.Windows[dockWindows[i]].MinimizeOrder < m.Windows[dockWindows[j]].MinimizeOrder
	})

	// Find target window's position in sorted dock
	targetDockIndex := -1
	for idx, winIdx := range dockWindows {
		if winIdx == windowIndex {
			targetDockIndex = idx
			break
		}
	}

	// If not found in dock windows, use the next position
	if targetDockIndex == -1 {
		targetDockIndex = len(dockWindows)
	}

	// Dock is at the bottom of the screen
	dockY := m.Height - config.DockHeight + 1 // +1 for the separator line

	// Calculate dock layout matching renderDock() logic EXACTLY
	leftWidth := 30
	// Right width changes based on copy mode, but during animation use default
	rightWidth := 32 // CPU graph + RAM stats

	// Calculate actual width of each dock item (matching renderDock pill rendering)
	var dockItemsWidth int
	for idx, winIdx := range dockWindows {
		window := m.Windows[winIdx]
		windowName := window.CustomName

		// Match the exact label format from renderDock
		var labelWidth int
		if windowName != "" {
			if len(windowName) > 12 {
				windowName = windowName[:9] + "..."
			}
			labelWidth = len(fmt.Sprintf(" %d:%s ", idx+1, windowName))
		} else {
			labelWidth = len(fmt.Sprintf(" %d ", idx+1))
		}

		// Add left circle (1) + label + right circle (1)
		itemWidth := 1 + labelWidth + 1
		dockItemsWidth += itemWidth

		// Add space between items
		if idx > 0 {
			dockItemsWidth += 1
		}
	}

	// Calculate center positioning
	availableSpace := m.Width - leftWidth - rightWidth - dockItemsWidth
	if availableSpace < 0 {
		availableSpace = 0
	}
	leftSpacer := availableSpace / 2

	// Calculate X position for target dock item
	dockX := leftWidth + leftSpacer
	for idx, winIdx := range dockWindows {
		if idx == targetDockIndex {
			// Add half the item width to center on it
			window := m.Windows[winIdx]
			windowName := window.CustomName
			var labelWidth int
			if windowName != "" {
				if len(windowName) > 12 {
					windowName = windowName[:9] + "..."
				}
				labelWidth = len(fmt.Sprintf(" %d:%s ", idx+1, windowName))
			} else {
				labelWidth = len(fmt.Sprintf(" %d ", idx+1))
			}
			itemWidth := 1 + labelWidth + 1
			dockX += itemWidth / 2
			break
		}

		// Add width of previous items
		window := m.Windows[winIdx]
		windowName := window.CustomName
		var labelWidth int
		if windowName != "" {
			if len(windowName) > 12 {
				windowName = windowName[:9] + "..."
			}
			labelWidth = len(fmt.Sprintf(" %d:%s ", idx+1, windowName))
		} else {
			labelWidth = len(fmt.Sprintf(" %d ", idx+1))
		}
		itemWidth := 1 + labelWidth + 1
		dockX += itemWidth + 1 // +1 for space between items
	}

	return dockX, dockY
}

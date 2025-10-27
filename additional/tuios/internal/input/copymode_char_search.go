// Package input implements vim-style copy mode for TUIOS.
package input

import (
	"github.com/Gaurav-Gosain/tuios/internal/terminal"
)

// Character search-related functions for copy mode (f/F/t/T and ;/,)

// findCharOnLine searches for a character across multiple lines
// direction: 1 for forward, -1 for backward
// till: true to stop before the character, false to land on it
func findCharOnLine(cm *terminal.CopyMode, window *terminal.Window, char rune, direction int, till bool) {
	startAbsY := getAbsoluteY(cm, window)
	scrollbackLen := window.ScrollbackLen()
	screenHeight := window.Terminal.Height()
	totalLines := scrollbackLen + screenHeight

	maxIterations := 1000 // Prevent infinite loops

	if direction > 0 {
		// Search forward across lines
		for lineOffset := 0; lineOffset < maxIterations; lineOffset++ {
			absY := startAbsY + lineOffset
			if absY >= totalLines {
				break
			}

			lineText := getLineText(cm, window, absY)
			if lineText == "" {
				continue
			}

			// Convert lineText to runes
			runes := []rune(lineText)

			// Determine starting position
			startCharIdx := 0
			if lineOffset == 0 {
				// On current line, start from cursor + 1
				startCharIdx = 1 // Skip current character
			}

			// Search this line
			for charIdx := startCharIdx; charIdx < len(runes); charIdx++ {
				if runes[charIdx] == char {
					// Found it!
					targetCharIdx := charIdx
					if till {
						targetCharIdx = charIdx - 1
						if targetCharIdx < 0 {
							continue // Can't stop before first character
						}
					}

					// Move to the target line using step-by-step movement
					// This ensures scroll offset is handled correctly
					linesToMove := absY - startAbsY
					for i := 0; i < linesToMove; i++ {
						moveDown(cm, window)
					}

					// Set cursor X position
					cm.CursorX = convertRuneIndexToColumn(window, absY, targetCharIdx)
					return
				}
			}
		}
	} else {
		// Search backward across lines
		for lineOffset := 0; lineOffset < maxIterations; lineOffset++ {
			absY := startAbsY - lineOffset
			if absY < 0 {
				break
			}

			lineText := getLineText(cm, window, absY)
			if lineText == "" {
				continue
			}

			// Convert lineText to runes
			runes := []rune(lineText)

			// Determine starting position
			endCharIdx := len(runes) - 1
			if lineOffset == 0 {
				// On current line, start from cursor - 1
				endCharIdx = -1 // Start searching from previous character
			}

			// Search this line backward
			for charIdx := endCharIdx; charIdx >= 0; charIdx-- {
				if runes[charIdx] == char {
					// Found it!
					targetCharIdx := charIdx
					if till {
						targetCharIdx = charIdx + 1
						if targetCharIdx >= len(runes) {
							continue // Can't stop after last character
						}
					}

					// Move to the target line using step-by-step movement
					// This ensures scroll offset is handled correctly
					linesToMove := startAbsY - absY
					for i := 0; i < linesToMove; i++ {
						moveUp(cm, window)
					}

					// Set cursor X position
					cm.CursorX = convertRuneIndexToColumn(window, absY, targetCharIdx)
					return
				}
			}
		}
	}
	// Character not found - no movement
}

// repeatCharSearch repeats the last character search
func repeatCharSearch(cm *terminal.CopyMode, window *terminal.Window, reverse bool) {
	if cm.LastCharSearch == 0 {
		return // No previous character search
	}

	direction := cm.LastCharSearchDir
	if reverse {
		direction = -direction
	}

	findCharOnLine(cm, window, cm.LastCharSearch, direction, cm.LastCharSearchTill)
}

// convertRuneIndexToColumn converts a rune index in the text string to a column position
// accounting for wide characters (emoji, nerd fonts, CJK, etc.)
func convertRuneIndexToColumn(window *terminal.Window, absY int, runeIndex int) int {
	scrollbackLen := window.ScrollbackLen()

	if runeIndex < 0 {
		return 0
	}

	// Count actual columns (accounting for wide chars)
	col := 0
	runeCount := 0

	if absY < scrollbackLen {
		line := window.ScrollbackLine(absY)
		if line != nil {
			for _, cell := range line {
				if runeCount >= runeIndex {
					break
				}
				if cell.Width > 0 { // Skip continuation cells
					runeCount += len(cell.Content)
					col++
				}
			}
		}
	} else {
		screenY := absY - scrollbackLen
		for x := 0; x < window.Terminal.Width(); x++ {
			cell := window.Terminal.CellAt(x, screenY)
			if runeCount >= runeIndex {
				break
			}
			if cell != nil && cell.Width > 0 { // Skip continuation cells
				runeCount += len(cell.Content)
				col++
			}
		}
	}

	return col
}

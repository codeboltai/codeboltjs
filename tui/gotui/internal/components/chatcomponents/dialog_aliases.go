package chatcomponents

import "gotui/internal/components/dialogs"

type (
	SlashCommand       = dialogs.SlashCommand
	ModelOption        = dialogs.ModelOption
	ModelPicker        = dialogs.ModelPicker
	CommandPaletteItem = dialogs.CommandPaletteItem
	CommandPalette     = dialogs.CommandPalette
)

var (
	NewModelPicker    = dialogs.NewModelPicker
	NewCommandPalette = dialogs.NewCommandPalette
)

package chatcomponents

import (
	"gotui/internal/components/dialogs"
	"gotui/internal/stores"
)

type (
	SlashCommand       = dialogs.SlashCommand
	ModelOption        = stores.ModelOption
	ModelPicker        = dialogs.ModelPicker
	CommandPaletteItem = dialogs.CommandPaletteItem
	CommandPalette     = dialogs.CommandPalette
)

var (
	NewModelPicker    = dialogs.NewModelPicker
	NewCommandPalette = dialogs.NewCommandPalette
)

package chatcomponents

import (
	"gotui/internal/components/dialogs"
	"gotui/internal/stores"
)

type (
	SlashCommand       = dialogs.SlashCommand
	ModelOption        = stores.ModelOption
	AgentOption        = stores.AgentOption
	ModelPicker        = dialogs.ModelPicker
	AgentPicker        = dialogs.AgentPicker
	CommandPaletteItem = dialogs.CommandPaletteItem
	CommandPalette     = dialogs.CommandPalette
)

var (
	NewModelPicker    = dialogs.NewModelPicker
	NewAgentPicker    = dialogs.NewAgentPicker
	NewCommandPalette = dialogs.NewCommandPalette
)

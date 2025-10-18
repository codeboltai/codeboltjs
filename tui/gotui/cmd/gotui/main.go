package main

import (
	"flag"
	"os"
	"strconv"
	"time"

	"gotui/internal/app"
	"gotui/internal/logging"
	"gotui/internal/stores"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/google/uuid"
	zone "github.com/lrstanley/bubblezone"
)

func main() {
	// Enable debugging
	if err := logging.ConfigureFile("/tmp/gotui-debug.log", true); err != nil {
		logging.Printf("Failed to configure debug log: %v", err)
	}
	defer logging.Close()

	logging.Printf("=== GOTUI DEBUG SESSION STARTED ===")
	logging.Printf("Time: %s", time.Now().Format("2006-01-02 15:04:05"))

	host := flag.String("host", "localhost", "Server host")
	port := flag.Int("port", 3001, "Server port")
	flag.Parse()

	hostValue := *host
	if envHost := os.Getenv("AGENT_SERVER_HOST"); envHost != "" {
		hostValue = envHost
	}

	portValue := *port
	if envPort := os.Getenv("AGENT_SERVER_PORT"); envPort != "" {
		if parsed, err := strconv.Atoi(envPort); err == nil {
			portValue = parsed
		}
	}

	protocol := os.Getenv("AGENT_SERVER_PROTOCOL")
	tuiID := os.Getenv("TUI_ID")
	if tuiID == "" {
		tuiID = uuid.NewString()
	}

	projectPath := os.Getenv("CURRENT_PROJECT_PATH")
	projectName := os.Getenv("CURRENT_PROJECT_NAME")
	projectType := os.Getenv("CURRENT_PROJECT_TYPE")

	agentSelection := stores.AgentSelection{
		ID:           os.Getenv("SELECTED_AGENT_ID"),
		Name:         os.Getenv("SELECTED_AGENT_NAME"),
		AgentType:    os.Getenv("SELECTED_AGENT_TYPE"),
		AgentDetails: os.Getenv("SELECTED_AGENT_DETAIL"),
	}

	modelSelection := stores.ModelOption{
		Name:     os.Getenv("SELECTED_MODEL_NAME"),
		Provider: os.Getenv("SELECTED_MODEL_PROVIDER"),
	}
	if modelSelection.Name == "" {
		modelSelection.Name = "gpt-4.1-mini"
	}
	if modelSelection.Provider == "" {
		modelSelection.Provider = "OpenAI"
	}

	cfg := app.Config{
		Host:        hostValue,
		Port:        portValue,
		Protocol:    protocol,
		TuiID:       tuiID,
		ProjectPath: projectPath,
		ProjectName: projectName,
		ProjectType: projectType,
		Agent:       agentSelection,
		Model:       modelSelection,
	}

	logging.Printf("Config: host=%s, port=%d, protocol=%s, tuiID=%s (client mode)", cfg.Host, cfg.Port, cfg.Protocol, cfg.TuiID)

	zone.NewGlobal()
	defer zone.Close()

	logging.Printf("Creating model...")
	m := app.NewModel(cfg)

	logging.Printf("Creating tea program...")

	// Create program with full screen options for better terminal usage
	var p *tea.Program

	logging.Printf("Creating program with full screen support...")
	// Use alt screen and mouse support for full terminal takeover
	p = tea.NewProgram(m,
		tea.WithAltScreen(),       // Use alternate screen buffer for full screen
		tea.WithMouseCellMotion(), // Enable mouse support
	)

	logging.Printf("Starting tea program with full screen...")
	if _, err := p.Run(); err != nil {
		logging.Printf("Tea program error with full screen: %v", err)

		// Try minimal fallback without alt screen
		logging.Printf("Retrying with minimal options...")
		p = tea.NewProgram(m)
		if _, err := p.Run(); err != nil {
			logging.Printf("Tea program error in fallback mode: %v", err)
			logging.Printf("Terminal error: %v", err)
			logging.Printf("Troubleshooting instructions:")
			logging.Printf("1. Try: TERM=xterm-256color ./gotui")
			logging.Printf("2. Check terminal size: echo $COLUMNS x $LINES")
			logging.Printf("3. See debug logs: tail -f /tmp/gotui-debug.log")
			os.Exit(1)
		}
	}

	logging.Printf("Tea program ended normally")
}

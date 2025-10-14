package main

import (
	"flag"
	"log"
	"os"
	"strconv"
	"time"

	"gotui/internal/app"
	"gotui/internal/wsclient"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/google/uuid"
	zone "github.com/lrstanley/bubblezone"
)

func main() {
	// Enable debugging
	debugFile, err := os.OpenFile("/tmp/gotui-debug.log", os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0644)
	if err == nil {
		log.SetOutput(debugFile)
		defer debugFile.Close()
	}

	log.Printf("=== GOTUI DEBUG SESSION STARTED ===")
	log.Printf("Time: %s", time.Now().Format("2006-01-02 15:04:05"))

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

	agentSelection := wsclient.AgentSelection{
		ID:           os.Getenv("SELECTED_AGENT_ID"),
		Name:         os.Getenv("SELECTED_AGENT_NAME"),
		AgentType:    os.Getenv("SELECTED_AGENT_TYPE"),
		AgentDetails: os.Getenv("SELECTED_AGENT_DETAIL"),
	}
	if agentSelection.Name == "" {
		agentSelection.Name = "Default Agent"
	}
	if agentSelection.AgentType == "" {
		agentSelection.AgentType = "local-path"
	}
	if agentSelection.AgentDetails == "" {
		agentSelection.AgentDetails = "./../../agents/CliTestAgent/dist"
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
	}

	log.Printf("Config: host=%s, port=%d, protocol=%s, tuiID=%s (client mode)", cfg.Host, cfg.Port, cfg.Protocol, cfg.TuiID)

	zone.NewGlobal()
	defer zone.Close()

	log.Printf("Creating model...")
	m := app.NewModel(cfg)

	log.Printf("Creating tea program...")

	// Create program with full screen options for better terminal usage
	var p *tea.Program

	log.Printf("Creating program with full screen support...")
	// Use alt screen and mouse support for full terminal takeover
	p = tea.NewProgram(m,
		tea.WithAltScreen(),       // Use alternate screen buffer for full screen
		tea.WithMouseCellMotion(), // Enable mouse support
	)

	log.Printf("Starting tea program with full screen...")
	if _, err := p.Run(); err != nil {
		log.Printf("Tea program error with full screen: %v", err)

		// Try minimal fallback without alt screen
		log.Printf("Retrying with minimal options...")
		p = tea.NewProgram(m)
		if _, err := p.Run(); err != nil {
			log.Printf("Tea program error in fallback mode: %v", err)
			log.Printf("Terminal error: %v", err)
			log.Printf("Troubleshooting instructions:")
			log.Printf("1. Try: TERM=xterm-256color ./gotui")
			log.Printf("2. Check terminal size: echo $COLUMNS x $LINES")
			log.Printf("3. See debug logs: tail -f /tmp/gotui-debug.log")
			os.Exit(1)
		}
	}

	log.Printf("Tea program ended normally")
}

package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"gotui/internal/app"

	tea "github.com/charmbracelet/bubbletea/v2"
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

	cfg := app.Config{
		Host: *host,
		Port: *port,
	}

	log.Printf("Config: host=%s, port=%d (client mode)", cfg.Host, cfg.Port)

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
			fmt.Printf("Terminal error: %v\n", err)
			fmt.Println("Troubleshooting:")
			fmt.Println("1. Try: TERM=xterm-256color ./gotui")
			fmt.Println("2. Check terminal size: echo $COLUMNS x $LINES")
			fmt.Println("3. See debug logs: tail -f /tmp/gotui-debug.log")
			os.Exit(1)
		}
	}

	log.Printf("Tea program ended normally")
}

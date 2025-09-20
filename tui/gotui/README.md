# Codebolt Go TUI

A modern terminal user interface for Codebolt built with [Charm](https://charm.sh/) ecosystem tools, featuring a chat-like interface inspired by modern development tools.

## Features

✨ **Modern Chat Interface**
- Built with Bubble Tea v2, Lipgloss v2, Bubbles v2, and Glamour
- Chat-style conversation flow with AI and system responses
- Scrollable message history with viewport component
- Real-time message rendering with markdown support
- Context-aware message styling (user, AI, system, error)

🎨 **Beautiful Design**
- Professional dark theme with carefully chosen colors
- Two-panel layout: main chat area + sidebar panels
- Responsive design that adapts to terminal size
- Elegant message bubbles with timestamps
- Rich text rendering for AI responses

🔧 **Advanced Features** 
- **📡 WebSocket Client**: Connects to external Codebolt server (started by `codebolt-code`)
- **🤖 Agent Process Management**: Automatically starts and monitors AI agent processes  
- **⚡ WebSocket connection**: Robust connection with intelligent auto-retry logic
- **📁 File Operations**: Read and write files through server (`read`, `write` commands)
- **🧠 AI Integration**: Direct AI communication through agent (`ask` command)
- **📊 Process Monitoring**: Real-time status monitoring with health checks
- **🗂️ Multiple Sidebar Panels**: Connection status, server logs, agent logs, general logs, notifications
- **🔄 Auto-retry Logic**: Exponential backoff for connection failures
- **🖥️ Production Ready**: Handles dev/production environments automatically

## Building & Running

```bash
cd packages/gotui
go mod tidy
go build ./cmd/gotui

# Connect to local server (default - server should be started by codebolt-code)
./gotui

# Connect to custom host/port
./gotui -host localhost -port 8080

# Connect to remote server
./gotui -host remote-server -port 3001
```

## ⚠️ Requirements

- **Terminal Size**: Minimum 50x15 characters recommended  
- **Terminal Type**: `xterm-256color` recommended (use `TERM=xterm-256color ./gotui` if issues)
- **Node.js**: Required for server/agent processes (TUI mode only)
- **Dependencies**: Built files in `packages/agentserver/dist/` and `packages/sampleagent/dist/`

## 🐛 Troubleshooting

If you see a **black screen** or **terminal errors**:

```bash
# Use proper terminal type
TERM=xterm-256color ./gotui -host localhost -port 3001

# Or set it globally
export TERM=xterm-256color
./gotui
```

**Debug mode**: Check `/tmp/gotui-debug.log` for detailed logs
**Full guide**: See `DEBUGGING.md` for comprehensive troubleshooting

## 🚀 Operating Modes

### 🖥️ **TUI Mode (Default)**
When run without arguments, the TUI will:
1. **Start local Node.js server** (packages/agentserver)
2. **Start AI agent** (packages/sampleagent) 
3. **Connect via WebSocket** to the local server
4. **Monitor all processes** with real-time status

```bash
./gotui  # Full TUI mode with local services
```

### 📡 **Client-Only Mode**
Connect to an existing server without starting local services:

```bash
./gotui -host localhost -port 3001  # Connect to existing local server
./gotui -host remote-host -port 8080  # Connect to remote server  
./gotui -no-server  # Explicit client-only mode
```

## Key Bindings

### Chat Interface
- `Enter` - Send message/command
- `Ctrl+J` - Add new line to message
- `Tab` - Toggle focus between chat input and message scroll
- `↑/↓ or k/j` - Scroll through message history (when not focused on input)

### Sidebar Panels
- `Ctrl+S` - Toggle connection status panel (shows host, connection state, retry info)
- `Ctrl+L` - Toggle general logs panel (WebSocket logs, system messages)
- `Ctrl+V` - Toggle server logs panel (backend server output)
- `Ctrl+A` - Toggle agent logs panel (AI agent logs)
- `Ctrl+N` - Toggle notifications panel (real-time notifications)

### Global Controls
- `Ctrl+R` - Retry server connection
- `?` or `Ctrl+H` - Toggle help bar
- `Ctrl+C` or `Ctrl+Q` - Quit application

## Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `read` or `r` | Read file contents | `read package.json` |
| `write` or `w` | Write to file | `write test.txt "Hello World"` |
| `ask` or `ai` | Ask AI a question | `ask "What is TypeScript?"` |
| `test` | Send test message to server | `test` |
| `help` or `h` | Show command help | `help` |
| `clear` | Clear current input | `clear` |

## UI Layout

```
┌─────────────────────────────────────┬──────────────────────┐
│                                     │  🔗 Connection       │
│  🚀 Chat History (Viewport)         │  ✅ Connected        │
│  ▶ You • 15:04:23                   │  Host: localhost:3001│
│    read package.json                │                      │
│                                     ├──────────────────────┤
│  🤖 AI • 15:04:24                   │  📋 General Logs     │
│    📄 **File: package.json**        │  [15:04:23] WS conn  │
│    ```json                          │  [15:04:24] Connected│
│    { "name": "project" }             │                      │
│    ```                              ├──────────────────────┤
│                                     │  🖥️ Server Logs     │
│  ℹ System • 15:04:25                │  (hidden)            │
│    ✅ Connected to server!           │                      │
│                                     ├──────────────────────┤
├─────────────────────────────────────┤  🔔 Notifications    │
│ > Type your message here...         │  (hidden)            │
│                                     │                      │
└─────────────────────────────────────┴──────────────────────┘
enter send • ctrl+j newline • tab focus • ? help • ctrl+c quit
```

## Architecture

The TUI uses a modern chat-based architecture:

- **Chat Component** - Main conversation interface with viewport and textarea
- **Sidebar Component** - Collapsible panels for status, logs, and notifications  
- **Help Bar** - Context-aware keyboard shortcuts display
- **Styles System** - Centralized theming with dark color scheme
- **WebSocket Client** - Real-time connection with automatic retry logic
- **Markdown Renderer** - Rich text formatting for AI responses using Glamour

## Theming

The TUI includes a sophisticated theming system with:
- Primary, secondary, and accent colors
- Semantic colors for success, warning, error states  
- Multiple surface levels for depth
- Consistent styling across all components

Colors can be customized by modifying the `DefaultTheme()` function in `internal/styles/theme.go`.

## Development

The codebase follows Go best practices with:
- Clear separation of concerns
- Interfaces for testability
- Comprehensive error handling
- Type-safe message passing
- Proper resource cleanup



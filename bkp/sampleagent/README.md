# Sample Agent

A sample agent implementation for the Codebolt server. This agent connects to the server via WebSocket and handles AI requests by generating mock responses.

## Features

- **WebSocket Connection**: Connects to Codebolt server as an agent
- **AI Request Handling**: Processes AI requests and generates mock responses
- **Heartbeat**: Maintains connection with regular heartbeat messages
- **Auto-reconnection**: Automatically reconnects if connection is lost
- **Graceful Shutdown**: Handles shutdown signals properly

## Installation

```bash
cd sampleagent
npm install
```

## Usage

### Build and Start

```bash
# Build the TypeScript code
npm run build

# Start the agent
npm start

# Or build and start in one command
npm run dev
```

### Command Line Options

```bash
# Connect to specific server
npm start -- --host localhost --port 3001

# Enable verbose logging
npm start -- --verbose

# Show help
npm start -- --help
```

## Configuration

The agent accepts the following command line arguments:

- `--host, -h`: Server host (default: localhost)
- `--port, -p`: Server port (default: 3001)
- `--verbose, -v`: Enable verbose logging
- `--help`: Show help

## How It Works

1. **Connection**: Agent connects to the server WebSocket endpoint
2. **Registration**: Registers itself as an "agent" type connection
3. **Message Handling**: Listens for incoming messages from the server
4. **AI Processing**: When receiving `askAI` messages, generates mock responses
5. **Response**: Sends responses back to the server with the original client ID

## Message Flow

```
Server -> Agent: {type: "askAI", prompt: "...", clientId: "..."}
Agent -> Server: {type: "response", success: true, data: "...", clientId: "..."}
```

## Mock AI Responses

The agent generates realistic-looking responses that include:
- Analysis of the question
- Numbered suggestions/recommendations
- Helpful conclusions

## Development

```bash
# Run in development mode with auto-restart
npm run dev

# Debug mode
npm run debug

# Lint code
npm run lint

# Type checking
npm run typecheck
```

## Integration with CLI

This agent is automatically started by the Codebolt CLI when needed. The CLI manages the agent lifecycle and can restart it if it crashes.

## Extending the Agent

To create a real AI agent, replace the `generateMockAIResponse` method with actual AI service calls (OpenAI, Anthropic, etc.).

```typescript
private async generateRealAIResponse(prompt: string): Promise<string> {
  // Call your AI service here
  const response = await aiService.generateResponse(prompt);
  return response;
}
```

# Docker Server

A WebSocket proxy server that acts as a bridge between client libraries and agents. The server provides direct handling for certain operations (like file I/O) and forwards other requests to connected agents.

## Features

- **WebSocket Server**: Real-time bidirectional communication
- **Express API**: RESTful endpoints for health checks and connection monitoring
- **Client Management**: Tracks multiple clients and agents
- **Message Routing**: Intelligent routing between clients and agents
- **File Operations**: Built-in support for reading and writing files
- **Security**: Path traversal protection for file operations

## Installation

```bash
cd packages/dockerserver
npm install
```

## Usage

### Build and Start

```bash
# Build the TypeScript code
npm run build

# Start the server
npm start

# Or build and start in one command
npm run dev
```

The server will start on port 3001 by default (configurable via `PORT` environment variable).

### API Endpoints

- `GET /health` - Health check with connection counts
- `GET /connections` - List of connected clients and agents

### WebSocket Protocol

#### Connection

Connect to the WebSocket server at `ws://localhost:3001`

#### Registration

First message must be a registration:

```json
{
  "type": "register",
  "clientType": "client" // or "agent"
}
```

#### Message Types

**Client to Server Messages:**

1. **Read File**
   ```json
   {
     "id": "unique-message-id",
     "type": "readfile",
     "filepath": "/absolute/path/to/file"
   }
   ```

2. **Write File**
   ```json
   {
     "id": "unique-message-id",
     "type": "writefile",
     "filepath": "/absolute/path/to/file",
     "content": "file content"
   }
   ```

3. **Ask AI** (forwarded to agent)
   ```json
   {
     "id": "unique-message-id",
     "type": "askAI",
     "prompt": "Your AI prompt"
   }
   ```

4. **Custom Messages** (forwarded to agent)
   ```json
   {
     "id": "unique-message-id",
     "type": "custom-operation",
     "data": "any custom data"
   }
   ```

**Agent to Server Messages:**

1. **Response** (forwarded to original client)
   ```json
   {
     "id": "original-message-id",
     "type": "response",
     "success": true,
     "data": "response data",
     "clientId": "original-client-id"
   }
   ```

**Server Responses:**

```json
{
  "id": "message-id",
  "type": "response",
  "success": true|false,
  "data": "response data", // on success
  "error": "error message" // on failure
}
```

## Architecture

1. **Client Libraries** connect and send requests
2. **Server** handles some requests directly (file I/O) and forwards others to agents
3. **Agents** process forwarded requests and send responses back
4. **Server** routes agent responses back to original clients

## Security

- Only absolute file paths are allowed (no relative paths with `..`)
- Path traversal attempts are blocked
- Each client connection is tracked with unique IDs

## Development

The server is built with:
- **Express.js** for HTTP endpoints
- **ws** for WebSocket handling
- **TypeScript** for type safety
- **uuid** for unique ID generation

## Environment Variables

- `PORT` - Server port (default: 3001)

## Graceful Shutdown

The server handles `SIGINT` and `SIGTERM` signals for graceful shutdown.
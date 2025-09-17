# Cloudflare Containers with WebSocket Support

This project demonstrates how to use Cloudflare Containers with WebSocket communication between the Durable Object (server) and containers (clients).

## Architecture

- **Durable Object**: Runs a WebSocket server that containers can connect to
- **Containers**: Node.js applications that act as WebSocket clients
- **Communication**: Containers connect to the Durable Object's WebSocket server for real-time communication

## Features

- WebSocket server running in the Durable Object
- Node.js containers that automatically connect to the WebSocket server
- Automatic reconnection with exponential backoff
- Message broadcasting between containers
- Health check endpoints for WebSocket status

## API Endpoints

### Worker Routes

- `GET /` - List all available endpoints
- `GET /container/:id` - Start a container for a specific ID
- `GET /lb` - Load balance requests across multiple containers
- `GET /error` - Start a container that errors (for testing error handling)
- `GET /singleton` - Get a single container instance
- `GET /connectws` - Get WebSocket connection details
- `GET /test-ws` - Test WebSocket functionality

### Container Routes

- `GET /` - Basic container info
- `GET /container` - Same as root
- `GET /error` - Trigger an error (for testing)
- `GET /ws-status` - Check WebSocket connection status
- `GET /ws-send` - Send a message via WebSocket
- `GET /ws-connect` - Manually connect to WebSocket server

## WebSocket Message Types

### From Container to Server
- `container-connect` - Initial connection message
- `container-message` - General message from container
- `container-pong` - Response to server ping

### From Server to Container
- `server-welcome` - Welcome message on connection
- `server-ack` - Acknowledgment of container connection
- `server-ping` - Keep-alive ping
- `server-echo` - Echo of container message
- `container-joined` - Broadcast when new container connects

## Usage

### 1. Deploy the Worker

```bash
npm run deploy
```

### 2. Get WebSocket Connection Details

```bash
curl https://your-worker.your-subdomain.workers.dev/connectws
```

### 3. Start a Container with WebSocket Connection

```bash
curl https://your-worker.your-subdomain.workers.dev/container/test-container
```

The container will automatically:
- Connect to the WebSocket server
- Send an initial connection message
- Respond to server pings
- Attempt to reconnect if disconnected

### 4. Check WebSocket Status

```bash
curl https://your-worker.your-subdomain.workers.dev/container/test-container/ws-status
```

### 5. Send a Message via WebSocket

```bash
curl https://your-worker.your-subdomain.workers.dev/container/test-container/ws-send
```

## Environment Variables

### Container Environment Variables
- `MESSAGE` - Custom message for the container
- `WS_SERVER_URL` - WebSocket server URL (automatically set by the Durable Object)

## Development

### Local Development

```bash
npm run dev
```

### Building the Container

The container uses Node.js with the following dependencies:
- `ws` - WebSocket client library

### Container Structure

```
container_src/
├── main.js          # Main container application
├── package.json     # Node.js dependencies
└── Dockerfile       # Container definition
```

## WebSocket Flow

1. **Container Start**: Container starts and checks for `WS_SERVER_URL` environment variable
2. **Connection**: Container connects to the WebSocket server running in the Durable Object
3. **Handshake**: Container sends `container-connect` message, server responds with `server-ack`
4. **Communication**: Containers can send messages and receive broadcasts
5. **Keep-alive**: Server sends periodic pings, containers respond with pongs
6. **Reconnection**: If connection is lost, container attempts to reconnect

## Error Handling

- Containers automatically attempt to reconnect if the WebSocket connection is lost
- Maximum of 5 reconnection attempts with 5-second delays
- Graceful shutdown handling for both containers and the WebSocket server

## Monitoring

- Use `/ws-status` endpoint to check connection status
- Container logs show WebSocket connection events
- Server logs show container connections and message handling

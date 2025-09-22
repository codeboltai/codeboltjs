const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const MESSAGE = process.env.MESSAGE || 'Default message';
const INSTANCE_ID = process.env.CLOUDFLARE_DEPLOYMENT_ID || 'unknown';
const WS_SERVER_URL = process.env.WS_SERVER_URL;

// Store WebSocket connection
let wsConnection = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 5000; // 5 seconds

// HTTP request handler
function handleRequest(req, res) {
  const url = req.url;
  
  if (url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Agent Runner Container - Instance ID: ${INSTANCE_ID}, Message: "${MESSAGE}"`);
  } else if (url === '/ws-status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      connected: wsConnection && wsConnection.readyState === WebSocket.OPEN,
      instanceId: INSTANCE_ID,
      reconnectAttempts: reconnectAttempts
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}

// Create HTTP server
const server = http.createServer(handleRequest);

// WebSocket client connection function
function connectToWebSocket(serverUrl) {
  console.log(`Attempting to connect to WebSocket server at: ${serverUrl}`);
  
  try {
    const ws = new WebSocket(serverUrl);
    
    ws.on('open', () => {
      console.log('WebSocket connection established');
      wsConnection = ws;
      reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      
      // Send initial connection message
      const initMessage = {
        type: 'container-connect',
        instanceId: INSTANCE_ID,
        message: MESSAGE,
        timestamp: new Date().toISOString()
      };
      ws.send(JSON.stringify(initMessage));
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received message from WebSocket server:', message);
        
        // Handle different message types
        if (message.type === 'server-ping') {
          const pongMessage = {
            type: 'container-pong',
            instanceId: INSTANCE_ID,
            timestamp: new Date().toISOString()
          };
          ws.send(JSON.stringify(pongMessage));
        } else if (message.type === 'server-welcome') {
          console.log('Received welcome message from server');
        } else if (message.type === 'server-ack') {
          console.log('Server acknowledged connection:', message.message);
        } else if (message.type === 'user-message') {
          // Echo the message back with "Container Echoed" prefix
          const echoMessage = {
            type: 'container-echo',
            originalMessage: message.content,
            echoedMessage: `Container Echoed: ${message.content}`,
            instanceId: INSTANCE_ID,
            timestamp: new Date().toISOString()
          };
          ws.send(JSON.stringify(echoMessage));
          console.log(`Echoed message: ${message.content}`);
        }
      } catch (error) {
        console.log('Received non-JSON message:', data.toString());
      }
    });
    
    ws.on('close', (code, reason) => {
      console.log(`WebSocket connection closed: ${code} - ${reason}`);
      wsConnection = null;
      
      // Attempt to reconnect if not at max attempts
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${RECONNECT_DELAY/1000} seconds...`);
        setTimeout(() => {
          connectToWebSocket(serverUrl);
        }, RECONNECT_DELAY);
      } else {
        console.log('Max reconnection attempts reached');
      }
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket connection error:', error);
      wsConnection = null;
    });
    
  } catch (error) {
    console.error('Failed to create WebSocket connection:', error);
  }
}

// Initialize WebSocket connection
function initializeWebSocketConnection() {
  if (WS_SERVER_URL) {
    console.log(`WebSocket server URL found in environment: ${WS_SERVER_URL}`);
    connectToWebSocket(WS_SERVER_URL);
  } else {
    console.log('No WebSocket server URL provided in environment');
  }
}

// Start the server
server.listen(PORT, () => {
  console.log(`Agent Runner Container listening on port ${PORT}`);
  console.log(`Instance ID: ${INSTANCE_ID}`);
  console.log(`Message: ${MESSAGE}`);
  console.log(`WebSocket Server URL: ${WS_SERVER_URL || 'Not set'}`);
  
  // Initialize WebSocket connection
  initializeWebSocketConnection();
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  if (wsConnection) {
    wsConnection.close();
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  if (wsConnection) {
    wsConnection.close();
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 
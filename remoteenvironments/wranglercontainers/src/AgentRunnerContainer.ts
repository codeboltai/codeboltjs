import { Container } from "@cloudflare/containers";

export class AgentRunnerContainer extends Container<Env> {
  // Port the container listens on (default: 8080)
  defaultPort = 8080;
  // Time before container sleeps due to inactivity (default: 30s)
  sleepAfter = "2m";
  // Environment variables passed to the container
  envVars: Record<string, string> = {
    MESSAGE: "I was passed in via the container class!",
  };

  // Optional lifecycle hooks
  override onStart() {
    console.log("AgentRunnerContainer successfully started");
  }

  override onStop() {
    console.log("AgentRunnerContainer successfully shut down");
  }

  override onError(error: unknown) {
    console.log("AgentRunnerContainer error:", error);
  }

  // Override the fetch method to handle WebSocket upgrade
  override async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle WebSocket upgrade
    if (url.pathname === '/ws') {
      const upgradeHeader = request.headers.get('Upgrade');
      if (!upgradeHeader || upgradeHeader !== 'websocket') {
        return new Response('Expected websocket', { status: 426 });
      }

      // Create WebSocket pair
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);
      
      // Use hibernatable WebSocket API - this is the key improvement!
      // This allows the Durable Object to hibernate while keeping connections open
      this.ctx.acceptWebSocket(server);
      
      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }
    
    // Handle regular HTTP requests
    return super.fetch(request);
  }

  // Hibernatable WebSocket message handler
  // This method is called when a WebSocket message is received
  async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
    try {
      const messageStr = typeof message === 'string' ? message : new TextDecoder().decode(message);
      const parsedMessage = JSON.parse(messageStr);
      
      console.log('Received message:', parsedMessage);
      
      // Handle different message types
      if (parsedMessage.type === 'container-connect') {
        const response = {
          type: 'server-ack',
          message: `Welcome container ${parsedMessage.instanceId}`,
          timestamp: new Date().toISOString()
        };
        ws.send(JSON.stringify(response));
        
        // Broadcast to other connections
        this.broadcastMessage({
          type: 'container-joined',
          instanceId: parsedMessage.instanceId,
          timestamp: new Date().toISOString()
        }, ws);
      } else if (parsedMessage.type === 'user-message') {
        // Echo the message back with "Container Echoed" prefix
        const echoMessage = {
          type: 'container-echo',
          originalMessage: parsedMessage.content,
          echoedMessage: `Container Echoed: ${parsedMessage.content}`,
          timestamp: new Date().toISOString()
        };
        ws.send(JSON.stringify(echoMessage));
        
        // Broadcast to other connections
        this.broadcastMessage({
          type: 'user-message-echoed',
          originalMessage: parsedMessage.content,
          echoedMessage: `Container Echoed: ${parsedMessage.content}`,
          timestamp: new Date().toISOString()
        }, ws);
      } else if (parsedMessage.type === 'container-message') {
        // Echo the message back
        const echoMessage = {
          type: 'server-echo',
          originalMessage: parsedMessage,
          timestamp: new Date().toISOString()
        };
        ws.send(JSON.stringify(echoMessage));
      } else if (parsedMessage.type === 'container-pong') {
        console.log(`Container ${parsedMessage.instanceId} responded to ping`);
      }
    } catch (error) {
      console.log('Received non-JSON message:', message);
      // Send welcome message for non-JSON messages
      const welcomeMessage = {
        type: 'server-welcome',
        message: 'Connected to AgentRunner WebSocket server',
        timestamp: new Date().toISOString()
      };
      ws.send(JSON.stringify(welcomeMessage));
    }
  }

  // Hibernatable WebSocket close handler
  // This method is called when a WebSocket connection is closed
  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
    console.log(`WebSocket connection closed: ${code} - ${reason}`);
    ws.close(code, 'AgentRunner Durable Object is closing WebSocket');
  }

  // Broadcast message to all connected clients (browsers and containers)
  private broadcastMessage(message: any, excludeConnection?: WebSocket) {
    const messageStr = JSON.stringify(message);
    const webSockets = this.ctx.getWebSockets();
    
    webSockets.forEach(connection => {
      if (connection !== excludeConnection) {
        try {
          connection.send(messageStr);
        } catch (error) {
          console.error('Error broadcasting message:', error);
        }
      }
    });
  }
} 
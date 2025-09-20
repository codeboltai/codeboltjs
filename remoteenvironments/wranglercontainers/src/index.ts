import { getContainer } from "@cloudflare/containers";
import { Hono } from "hono";
export { AgentRunnerContainer } from "./AgentRunnerContainer";

// Create Hono app with proper typing for Cloudflare Workers
const app = new Hono<{
  Bindings: Env;
}>();

// Home route with available endpoints
app.get("/", (c) => {
  return c.text(
    "Available endpoints:\n" +
      "GET /container/:id - Start a container for each ID\n" +
      "GET /connectws - Get WebSocket connection details\n" +
      "GET /chatagent - Chat interface to interact with containers\n" +
      "WebSocket /ws - WebSocket endpoint for real-time communication",
  );
});

// WebSocket endpoint - route to Durable Object
app.get("/ws", async (c) => {
  const upgradeHeader = c.req.header('Upgrade');
  if (!upgradeHeader || upgradeHeader !== 'websocket') {
    return new Response('Expected websocket', { status: 426 });
  }

  // Get the Durable Object instance for WebSocket handling
  const container = getContainer(c.env.AGENT_RUNNER_CONTAINER, "websocket-server");
  
  // Forward the WebSocket upgrade request to the Durable Object
  return await container.fetch(c.req.raw);
});

// Route requests to a specific container using the container ID
app.get("/container/:id", async (c) => {
  const id = c.req.param("id");
  const containerId = c.env.AGENT_RUNNER_CONTAINER.idFromName(`/container/${id}`);
  const container = c.env.AGENT_RUNNER_CONTAINER.get(containerId);
  return await container.fetch(c.req.raw);
});

// Get WebSocket connection details
app.get("/connectws", async (c) => {
  const container = getContainer(c.env.AGENT_RUNNER_CONTAINER, "websocket-server");
  
  // Construct the WebSocket URL
  const baseUrl = new URL(c.req.url);
  const wsUrl = `${baseUrl.protocol === 'https:' ? 'wss:' : 'ws:'}//${baseUrl.host}/ws`;
  
  return c.json({
    websocketUrl: wsUrl,
    message: "Use this URL to connect to the WebSocket server",
    endpoints: {
      status: "/ws-status - Check WebSocket connection status",
      send: "/ws-send - Send a message via WebSocket"
    }
  });
});

// Chat interface HTML page
app.get("/chatagent", async (c) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent Runner Chat</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .chat-container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .chat-header {
            background: #007bff;
            color: white;
            padding: 15px;
            text-align: center;
        }
        .chat-messages {
            height: 400px;
            overflow-y: auto;
            padding: 15px;
            background: #f8f9fa;
        }
        .message {
            margin-bottom: 10px;
            padding: 10px;
            border-radius: 5px;
            max-width: 70%;
        }
        .message.user {
            background: #007bff;
            color: white;
            margin-left: auto;
        }
        .message.server {
            background: #e9ecef;
            color: #333;
        }
        .message.container {
            background: #28a745;
            color: white;
        }
        .message.system {
            background: #ffc107;
            color: #333;
            font-style: italic;
        }
        .chat-input {
            display: flex;
            padding: 15px;
            background: white;
            border-top: 1px solid #dee2e6;
        }
        .chat-input input {
            flex: 1;
            padding: 10px;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            margin-right: 10px;
        }
        .chat-input button {
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        .chat-input button:hover {
            background: #0056b3;
        }
        .status {
            padding: 10px;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
            font-size: 12px;
            color: #6c757d;
        }
        .connected { color: #28a745; }
        .disconnected { color: #dc3545; }
        .container-btn {
            margin: 10px;
            padding: 8px 16px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
        }
        .container-btn:hover {
            background: #218838;
        }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="chat-header">
            <h2>Agent Runner Chat</h2>
            <div>
                <button class="container-btn" onclick="startContainer('agent-1')">Start Agent 1</button>
                <button class="container-btn" onclick="startContainer('agent-2')">Start Agent 2</button>
            </div>
        </div>
        <div class="status" id="status">
            <span id="connection-status" class="disconnected">Disconnected</span>
        </div>
        <div class="chat-messages" id="messages"></div>
        <div class="chat-input">
            <input type="text" id="messageInput" placeholder="Type your message..." />
            <button onclick="sendMessage()">Send</button>
        </div>
    </div>

    <script>
        let ws = null;
        const messagesDiv = document.getElementById('messages');
        const messageInput = document.getElementById('messageInput');
        const statusSpan = document.getElementById('connection-status');

        function connect() {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = protocol + '//' + window.location.host + '/ws';
            
            addMessage('System', 'Connecting to: ' + wsUrl, 'system');
            
            ws = new WebSocket(wsUrl);
            
            ws.onopen = function() {
                statusSpan.textContent = 'Connected';
                statusSpan.className = 'connected';
                addMessage('System', 'Connected to Agent Runner server', 'system');
            };
            
            ws.onmessage = function(event) {
                try {
                    const message = JSON.parse(event.data);
                    handleMessage(message);
                } catch (error) {
                    addMessage('System', 'Received non-JSON message: ' + event.data, 'system');
                }
            };
            
            ws.onclose = function() {
                statusSpan.textContent = 'Disconnected';
                statusSpan.className = 'disconnected';
                addMessage('System', 'Disconnected from server', 'system');
                
                // Try to reconnect after 5 seconds
                setTimeout(connect, 5000);
            };
            
            ws.onerror = function(error) {
                addMessage('System', 'WebSocket error: ' + error, 'system');
            };
        }

        function handleMessage(message) {
            switch(message.type) {
                case 'server-welcome':
                    addMessage('Server', message.message, 'server');
                    break;
                case 'container-echo':
                    addMessage('Container', message.echoedMessage, 'container');
                    break;
                case 'user-message-echoed':
                    addMessage('Container', message.echoedMessage, 'container');
                    break;
                case 'container-joined':
                    addMessage('System', 'Container ' + message.instanceId + ' joined', 'system');
                    break;
                case 'server-ping':
                    // Silently handle ping
                    break;
                default:
                    addMessage('Server', JSON.stringify(message), 'server');
            }
        }

        function sendMessage() {
            const content = messageInput.value.trim();
            if (!content || !ws || ws.readyState !== WebSocket.OPEN) return;
            
            const message = {
                type: 'user-message',
                content: content,
                timestamp: new Date().toISOString()
            };
            
            ws.send(JSON.stringify(message));
            addMessage('You', content, 'user');
            messageInput.value = '';
        }

        function startContainer(containerId) {
            fetch('/container/' + containerId)
                .then(response => response.text())
                .then(data => {
                    addMessage('System', 'Started container: ' + containerId, 'system');
                })
                .catch(error => {
                    addMessage('System', 'Error starting container: ' + error, 'system');
                });
        }

        function addMessage(sender, content, type) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ' + type;
            messageDiv.innerHTML = '<strong>' + sender + ':</strong> ' + content;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        // Handle Enter key
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Connect on page load
        connect();
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
});

export default app;

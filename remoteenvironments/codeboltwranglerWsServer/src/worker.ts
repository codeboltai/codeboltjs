import { Env } from './types';

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle WebSocket proxy connections - create Durable Object per appToken
    if (url.pathname.startsWith('/proxy/')) {
      if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response('Expected WebSocket upgrade', { status: 426 });
      }

      // Extract appToken from URL path
      const appToken = url.pathname.split('/')[2];
      if (!appToken) {
        return new Response('Missing appToken in URL path', { status: 400 });
      }

      const id = env.PROXY_HUB.idFromName(`proxy-${appToken}`);
      const stub = env.PROXY_HUB.get(id);
      return stub.fetch(request);
    }

    // Handle live monitoring page
    if (url.pathname.startsWith('/live/')) {
      const appToken = url.pathname.split('/')[2];
      if (!appToken) {
        return new Response('Missing appToken in URL', { status: 400 });
      }

      // Serve the HTML page for live monitoring
      return new Response(getLiveMonitoringHTML(appToken), {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache'
        }
      });
    }

    // Handle WebSocket for live monitoring
    if (url.pathname.startsWith('/ws-live/')) {
      if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response('Expected WebSocket upgrade', { status: 426 });
      }

      const appToken = url.pathname.split('/')[2];
      if (!appToken) {
        return new Response('Missing appToken in URL', { status: 400 });
      }

      const id = env.PROXY_HUB.idFromName(`proxy-${appToken}`);
      const stub = env.PROXY_HUB.get(id);
      
      // Add monitoring flag to the request
      const monitoringRequest = new Request(request, {
        headers: {
          ...Object.fromEntries(request.headers.entries()),
          'X-Monitoring-Client': 'true'
        }
      });
      
      return stub.fetch(monitoringRequest);
    }

    // Serve static assets for the monitoring page
    if (url.pathname === '/monitoring.js') {
      return new Response(getMonitoringJS(), {
        headers: {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'no-cache'
        }
      });
    }

    if (url.pathname === '/monitoring.css') {
      return new Response(getMonitoringCSS(), {
        headers: {
          'Content-Type': 'text/css',
          'Cache-Control': 'no-cache'
        }
      });
    }

    return new Response('Codebolt Wrangler WS Proxy', { status: 200 });
  }
};

export default worker;

function getLiveMonitoringHTML(appToken: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeBolt Live Monitor - ${appToken}</title>
    <link rel="stylesheet" href="/monitoring.css">
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel" src="/monitoring.js"></script>
</body>
</html>`;
}

function getMonitoringJS(): string {
  return `const { useState, useEffect, useRef } = React;

function MessageMonitor({ appToken }) {
  const [messages, setMessages] = useState([]);
  const [connectedAgents, setConnectedAgents] = useState(new Set());
  const [connectedApps, setConnectedApps] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = \`\${protocol}//\${window.location.host}/ws-live/\${appToken}\`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      console.log('Connected to monitoring WebSocket');
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message_log') {
          setMessages(prev => [...prev, {
            id: Date.now() + Math.random(),
            timestamp: data.timestamp,
            direction: data.direction,
            actor: data.actor,
            agentId: data.agentId,
            payload: data.payload,
            raw: data.raw
          }]);
        } else if (data.type === 'connection_update') {
          if (data.actor === 'agent' && data.agentId) {
            setConnectedAgents(prev => {
              const newSet = new Set(prev);
              if (data.connected) {
                newSet.add(data.agentId);
              } else {
                newSet.delete(data.agentId);
              }
              return newSet;
            });
          } else if (data.actor === 'app') {
            setConnectedApps(prev => {
              const newSet = new Set(prev);
              if (data.connected) {
                newSet.add(appToken);
              } else {
                newSet.delete(appToken);
              }
              return newSet;
            });
          }
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      console.log('Disconnected from monitoring WebSocket');
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [appToken]);

  const clearMessages = () => {
    setMessages([]);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getMessageColor = (direction) => {
    switch (direction) {
      case 'incoming': return '#e8f5e8';
      case 'outgoing': return '#fff3cd';
      case 'system': return '#f8d7da';
      default: return '#f8f9fa';
    }
  };

  const getDirectionIcon = (direction) => {
    switch (direction) {
      case 'incoming': return '⬇️';
      case 'outgoing': return '⬆️';
      case 'system': return '🔄';
      default: return '📝';
    }
  };

  return (
    <div className="monitor-container">
      <header className="monitor-header">
        <h1>🔍 CodeBolt Live Monitor</h1>
        <div className="status-bar">
          <div className="status-item">
            <span className="status-label">App Token:</span>
            <span className="status-value">{appToken}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Connection:</span>
            <span className={\`status-value \${isConnected ? 'connected' : 'disconnected'}\`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Agents:</span>
            <span className="status-value">{connectedAgents.size}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Apps:</span>
            <span className="status-value">{connectedApps.size}</span>
          </div>
          <button onClick={clearMessages} className="clear-btn">
            🗑️ Clear
          </button>
        </div>
      </header>

      <main className="monitor-main">
        <div className="connections-panel">
          <h3>🔗 Connected Clients</h3>
          <div className="connection-group">
            <h4>🤖 Agents ({connectedAgents.size})</h4>
            {Array.from(connectedAgents).map(agentId => (
              <div key={agentId} className="connection-item agent">
                🤖 {agentId}
              </div>
            ))}
            {connectedAgents.size === 0 && (
              <div className="no-connections">No agents connected</div>
            )}
          </div>
          <div className="connection-group">
            <h4>📱 Apps ({connectedApps.size})</h4>
            {Array.from(connectedApps).map(app => (
              <div key={app} className="connection-item app">
                📱 {app}
              </div>
            ))}
            {connectedApps.size === 0 && (
              <div className="no-connections">No apps connected</div>
            )}
          </div>
        </div>

        <div className="messages-panel">
          <h3>📨 Message Log</h3>
          <div className="messages-container">
            {messages.map(message => (
              <div
                key={message.id}
                className="message-item"
                style={{ backgroundColor: getMessageColor(message.direction) }}
              >
                <div className="message-header">
                  <span className="message-direction">
                    {getDirectionIcon(message.direction)}
                  </span>
                  <span className="message-time">
                    {formatTimestamp(message.timestamp)}
                  </span>
                  <span className="message-actor">
                    {message.actor === 'agent' ? '🤖' : '📱'} 
                    {message.actor}
                    {message.agentId && \` (\${message.agentId})\`}
                  </span>
                </div>
                <div className="message-content">
                  <details>
                    <summary>View Payload</summary>
                    <pre>{JSON.stringify(message.payload, null, 2)}</pre>
                  </details>
                  <details>
                    <summary>View Raw Message</summary>
                    <pre>{JSON.stringify(message.raw, null, 2)}</pre>
                  </details>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="no-messages">No messages yet. Waiting for connections...</div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>
    </div>
  );
}

// Initialize the React app
const root = ReactDOM.createRoot(document.getElementById('root'));
const appToken = window.location.pathname.split('/')[2];
root.render(<MessageMonitor appToken={appToken} />);`;
}

function getMonitoringCSS(): string {
  return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

.monitor-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.monitor-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.monitor-header h1 {
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.status-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-label {
  font-weight: 600;
  opacity: 0.9;
}

.status-value {
  background: rgba(255,255,255,0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
}

.status-value.connected {
  background: rgba(76, 175, 80, 0.3);
}

.status-value.disconnected {
  background: rgba(244, 67, 54, 0.3);
}

.clear-btn {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.clear-btn:hover {
  background: rgba(255,255,255,0.3);
}

.monitor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.connections-panel {
  width: 300px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 1rem;
  overflow-y: auto;
}

.connections-panel h3 {
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.1rem;
}

.connection-group {
  margin-bottom: 1.5rem;
}

.connection-group h4 {
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.connection-item {
  padding: 0.5rem;
  margin-bottom: 0.25rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.875rem;
}

.connection-item.agent {
  background: #e3f2fd;
  border-left: 3px solid #2196f3;
}

.connection-item.app {
  background: #f3e5f5;
  border-left: 3px solid #9c27b0;
}

.no-connections {
  color: #999;
  font-style: italic;
  padding: 0.5rem;
}

.messages-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.messages-panel h3 {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  color: #333;
  font-size: 1.1rem;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.message-item {
  margin-bottom: 1rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

.message-header {
  padding: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.message-direction {
  font-size: 1.2rem;
}

.message-time {
  color: #666;
  font-family: monospace;
}

.message-actor {
  font-weight: 600;
}

.message-content {
  padding: 0.75rem;
}

.message-content details {
  margin-bottom: 0.5rem;
}

.message-content summary {
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #1976d2;
}

.message-content pre {
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}

.no-messages {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 2rem;
}

@media (max-width: 768px) {
  .monitor-main {
    flex-direction: column;
  }
  
  .connections-panel {
    width: 100%;
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .status-bar {
    gap: 0.5rem;
  }
  
  .status-item {
    font-size: 0.875rem;
  }

}
}
}`;

}

/**
 * Sample Agent Implementation
 * Connects to Codebolt server and handles AI requests
 */

import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

interface Message {
  id?: string;
  type: string;
  [key: string]: any;
}

interface AskAIMessage extends Message {
  type: 'askAI';
  prompt: string;
  clientId: string;
}

class SampleAgent {
  private ws?: WebSocket;
  private serverUrl: string;
  private agentId: string;
  private connected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval?: NodeJS.Timeout;

  constructor(host = 'localhost', port = 3001) {
    this.serverUrl = `ws://${host}:${port}`;
    this.agentId = `agent-${uuidv4().slice(0, 8)}`;
  }

  /**
   * Connect to the server
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.log('Connecting to server...');
        this.ws = new WebSocket(this.serverUrl);

        this.ws.on('open', () => {
          this.log(`Connected to server at ${this.serverUrl}`);
          this.connected = true;
          this.reconnectAttempts = 0;
          
          // Register as agent
          this.send({
            type: 'register',
            clientType: 'agent',
            agentId: this.agentId,
          });

          this.startHeartbeat();
          resolve();
        });

        this.ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleMessage(message);
          } catch (error) {
            this.log(`Error parsing message: ${error}`);
          }
        });

        this.ws.on('close', () => {
          this.log('Disconnected from server');
          this.connected = false;
          this.stopHeartbeat();
          this.attemptReconnect();
        });

        this.ws.on('error', (error) => {
          this.log(`WebSocket error: ${error.message}`);
          if (!this.connected) {
            reject(error);
          }
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.ws) {
      this.stopHeartbeat();
      this.ws.close();
      this.ws = undefined;
    }
    this.connected = false;
  }

  /**
   * Send message to server
   */
  private send(message: Message): void {
    if (!this.connected || !this.ws) {
      this.log('Cannot send message: not connected');
      return;
    }

    if (!message.id) {
      message.id = uuidv4();
    }

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: any): void {
    this.log(`Received message: ${message.type}`);

    switch (message.type) {
      case 'connection':
        this.log(`Connection acknowledged: ${message.message}`);
        break;

      case 'askAI':
        this.handleAIRequest(message as AskAIMessage);
        break;

      case 'ping':
        // Respond to ping with pong
        this.send({
          type: 'pong',
          timestamp: Date.now(),
        });
        break;

      default:
        this.log(`Unknown message type: ${message.type}`);
        break;
    }
  }

  /**
   * Handle AI requests
   */
  private async handleAIRequest(message: AskAIMessage): Promise<void> {
    this.log(`Processing AI request: ${message.prompt.slice(0, 50)}...`);

    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Generate a mock AI response
      const response = this.generateMockAIResponse(message.prompt);

      // Send response back to server
      this.send({
        id: message.id,
        type: 'response',
        success: true,
        data: response,
        clientId: message.clientId,
      });

      this.log(`AI response sent for prompt: ${message.prompt.slice(0, 30)}...`);

    } catch (error) {
      this.log(`Error processing AI request: ${error}`);
      
      // Send error response
      this.send({
        id: message.id,
        type: 'response',
        success: false,
        error: `AI processing failed: ${error}`,
        clientId: message.clientId,
      });
    }
  }

  /**
   * Generate a mock AI response
   */
  private generateMockAIResponse(prompt: string): string {
    const responses = [
      `I understand you're asking about "${prompt}". Here's my analysis:`,
      `Based on your question "${prompt}", I can suggest:`,
      `Regarding "${prompt}", here are some thoughts:`,
      `To answer your question about "${prompt}":`,
    ];

    const suggestions = [
      "1. Consider breaking down the problem into smaller parts",
      "2. Review the documentation for best practices", 
      "3. Test your implementation incrementally",
      "4. Consider performance implications",
      "5. Ensure proper error handling",
    ];

    const conclusions = [
      "Hope this helps! Let me know if you need more details.",
      "Feel free to ask follow-up questions.",
      "This should give you a good starting point.",
      "Let me know if you'd like me to elaborate on any point.",
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const randomSuggestions = suggestions
      .sort(() => 0.5 - Math.random())
      .slice(0, 2 + Math.floor(Math.random() * 3));
    const randomConclusion = conclusions[Math.floor(Math.random() * conclusions.length)];

    return `${randomResponse}\n\n${randomSuggestions.join('\n')}\n\n${randomConclusion}`;
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.connected) {
        this.send({
          type: 'heartbeat',
          agentId: this.agentId,
          timestamp: Date.now(),
        });
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  /**
   * Attempt to reconnect to server
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.log('Max reconnection attempts reached. Exiting.');
      process.exit(1);
    }

    this.reconnectAttempts++;
    const delay = 1000 * Math.pow(2, this.reconnectAttempts); // Exponential backoff
    
    this.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch((error) => {
        this.log(`Reconnection failed: ${error.message}`);
      });
    }, delay);
  }

  /**
   * Log message with timestamp and agent ID
   */
  private log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] [${this.agentId}] ${message}`);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}

export async function main() {
  // Parse command line arguments
  const args = yargs(hideBin(process.argv))
    .option('host', {
      alias: 'h',
      type: 'string',
      description: 'Server host',
      default: 'localhost',
    })
    .option('port', {
      alias: 'p',
      type: 'number',
      description: 'Server port',
      default: 3001,
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Enable verbose logging',
      default: false,
    })
    .help()
    .parseSync();

  console.log('🤖 Starting Codebolt Sample Agent...');
  console.log(`Server: ${args.host}:${args.port}`);
  
  const agent = new SampleAgent(args.host, args.port);

  // Setup graceful shutdown
  const shutdown = () => {
    console.log('\n🔌 Shutting down agent...');
    agent.disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    agent.disconnect();
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    agent.disconnect();
    process.exit(1);
  });

  try {
    await agent.connect();
    console.log('✅ Agent connected and ready!');
    
    // Keep the process alive
    setInterval(() => {
      if (!agent.isConnected()) {
        console.log('❌ Agent disconnected. Exiting...');
        process.exit(1);
      }
    }, 5000);
    
  } catch (error) {
    console.error('❌ Failed to start agent:', error);
    process.exit(1);
  }
}

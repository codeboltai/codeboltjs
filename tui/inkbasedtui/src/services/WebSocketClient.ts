/**
 * WebSocket client for communicating with Codebolt server
 */

import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id?: string;
  type: string;
  [key: string]: any;
}

export interface NotificationMessage {
  type: 'notification';
  event: string;
  data?: any;
  timestamp: number;
}

export interface ResponseMessage {
  id: string;
  type: 'response';
  success: boolean;
  data?: any;
  error?: string;
}

export interface WebSocketClientEvents {
  'connected': () => void;
  'disconnected': () => void;
  'notification': (notification: NotificationMessage) => void;
  'response': (response: ResponseMessage) => void;
  'error': (error: Error) => void;
  'log': (message: string) => void;
}

export class WebSocketClient extends EventEmitter {
  private ws?: WebSocket;
  private url: string;
  private connected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pendingRequests = new Map<string, (response: ResponseMessage) => void>();

  constructor(host = 'localhost', port = 3001) {
    super();
    this.url = `ws://${host}:${port}`;
  }

  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.on('open', () => {
          this.emit('log', `Connected to server at ${this.url}`);
          this.connected = true;
          this.reconnectAttempts = 0;
          
          // Register as a client
          this.send({
            type: 'register',
            clientType: 'client',
          });

          this.emit('connected');
          resolve();
        });

        this.ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleMessage(message);
          } catch (error) {
            this.emit('error', new Error(`Failed to parse message: ${error}`));
          }
        });

        this.ws.on('close', () => {
          this.emit('log', 'Disconnected from server');
          this.connected = false;
          this.emit('disconnected');
          this.attemptReconnect();
        });

        this.ws.on('error', (error) => {
          this.emit('error', new Error(`WebSocket error: ${error.message}`));
          this.connected = false;
          
          // Safely clean up the WebSocket connection
          try {
            if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
              this.ws.terminate();
            }
          } catch (cleanupError) {
            // Ignore cleanup errors
          }
          
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
   * Disconnect from the server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
    this.connected = false;
  }

  /**
   * Send a message to the server
   */
  send(message: Message): void {
    if (!this.connected || !this.ws) {
      throw new Error('Not connected to server');
    }

    // Add message ID if not present
    if (!message.id) {
      message.id = uuidv4();
    }

    this.ws.send(JSON.stringify(message));
    this.emit('log', `Sent message: ${message.type}`);
  }

  /**
   * Send a request and wait for response
   */
  async request(message: Message): Promise<ResponseMessage> {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      const id = message.id || uuidv4();
      message.id = id;

      // Store the promise resolver
      this.pendingRequests.set(id, resolve);

      // Set timeout for request
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout for message ${id}`));
      }, 10000);

      // Clear timeout when request resolves
      const originalResolve = resolve;
      this.pendingRequests.set(id, (response) => {
        clearTimeout(timeout);
        originalResolve(response);
      });

      this.send(message);
    });
  }

  /**
   * Read a file from the server
   */
  async readFile(filepath: string): Promise<string> {
    const response = await this.request({
      type: 'readfile',
      filepath,
    });

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to read file');
    }
  }

  /**
   * Write a file to the server
   */
  async writeFile(filepath: string, content: string): Promise<void> {
    const response = await this.request({
      type: 'writefile',
      filepath,
      content,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to write file');
    }
  }

  /**
   * Ask AI via server/agent
   */
  async askAI(prompt: string): Promise<string> {
    const response = await this.request({
      type: 'askAI',
      prompt,
    });

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to get AI response');
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  private handleMessage(message: any): void {
    // Handle responses to pending requests
    if (message.type === 'response' && message.id) {
      const resolver = this.pendingRequests.get(message.id);
      if (resolver) {
        this.pendingRequests.delete(message.id);
        resolver(message);
        return;
      }
    }

    // Handle notifications
    if (message.type === 'notification') {
      this.emit('notification', message);
      return;
    }

    // Handle other message types
    this.emit('log', `Received message: ${JSON.stringify(message)}`);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('error', new Error('Max reconnection attempts reached'));
      return;
    }

    this.reconnectAttempts++;
    this.emit('log', `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.connect().catch((error) => {
        this.emit('error', new Error(`Reconnection failed: ${error.message}`));
      });
    }, this.reconnectDelay * this.reconnectAttempts);
  }
}

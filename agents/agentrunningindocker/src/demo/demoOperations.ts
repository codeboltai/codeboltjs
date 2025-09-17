import { v4 as uuidv4 } from 'uuid';
import * as os from 'os';
import * as path from 'path';
import {
  ReadFileMessage,
  WriteFileMessage,
  AskAIMessage,
  CustomOperationMessage,
  formatLogMessage
} from '@codebolt/shared-types';

/**
 * Demo operations for the sample client
 */
export class DemoOperations {
  private clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  /**
   * Create a file read demo operation
   */
  createReadFileDemo(): ReadFileMessage {
    console.log(formatLogMessage('info', 'Demo', 'Creating read file operation...'));
    
    // Try to read package.json from the client directory
    const filepath = path.join(__dirname, '../../package.json');
    
    return {
      id: uuidv4(),
      type: 'readfile',
      filepath: path.resolve(filepath)
    };
  }

  /**
   * Create a file write demo operation
   */
  createWriteFileDemo(): WriteFileMessage {
    console.log(formatLogMessage('info', 'Demo', 'Creating write file operation...'));
    
    // Write a test file to temp directory
    const tempDir = os.tmpdir();
    const filepath = path.join(tempDir, `codebolt-test-${Date.now()}.txt`);
    
    return {
      id: uuidv4(),
      type: 'writefile',
      filepath: filepath,
      content: `Hello from Codebolt Client!\nTimestamp: ${new Date().toISOString()}\nClient ID: ${this.clientId}`
    };
  }

  /**
   * Create an AI request demo operation
   */
  createAskAIDemo(): AskAIMessage {
    console.log(formatLogMessage('info', 'Demo', 'Creating AI request operation...'));
    
    const prompts = [
      'What is the purpose of this docker server?',
      'How can I optimize my TypeScript code?',
      'Explain the benefits of using WebSockets',
      'What are best practices for Docker containers?',
      'How does client-server architecture work?'
    ];
    
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    
    return {
      id: uuidv4(),
      type: 'askAI',
      prompt: randomPrompt
    };
  }

  /**
   * Create a custom operation demo
   */
  createCustomOperationDemo(): CustomOperationMessage {
    console.log(formatLogMessage('info', 'Demo', 'Creating custom operation...'));
    
    return {
      id: uuidv4(),
      type: 'custom-operation',
      operation: 'system-info',
      data: {
        platform: os.platform(),
        architecture: os.arch(),
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
        clientId: this.clientId
      }
    };
  }

  /**
   * Get all demo operations in sequence
   */
  getAllDemoOperations(): (ReadFileMessage | WriteFileMessage | AskAIMessage | CustomOperationMessage)[] {
    return [
      this.createReadFileDemo(),
      this.createWriteFileDemo(),
      this.createAskAIDemo(),
      this.createCustomOperationDemo()
    ];
  }
}
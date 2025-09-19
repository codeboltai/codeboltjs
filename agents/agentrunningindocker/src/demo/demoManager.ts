import { ClientConfig, formatLogMessage } from '@codebolt/types/remote';
import { DemoOperations } from './demoOperations';

/**
 * Manages demo operations for the client
 */
export class DemoManager {
  private demoInterval: NodeJS.Timeout | null = null;
  private operationCount = 0;
  private demoOperations: DemoOperations;

  constructor(
    private config: ClientConfig,
    private clientId: string,
    private sendMessage: (message: unknown) => void
  ) {
    this.demoOperations = new DemoOperations(clientId);
  }

  /**
   * Start demo operations
   */
  start(): void {
    if (!this.config.demoEnabled) {
      console.log(formatLogMessage('info', 'DemoManager', 'Demo operations disabled by configuration'));
      return;
    }

    console.log(formatLogMessage('info', 'DemoManager', 'Starting demo operations...'));
    
    this.demoInterval = setInterval(() => {
      this.operationCount++;
      
      const operations = this.demoOperations.getAllDemoOperations();
      const operation = operations[(this.operationCount - 1) % operations.length];
      
      console.log(formatLogMessage('info', 'DemoManager', `Executing demo operation ${this.operationCount}: ${operation.type}`));
      this.sendMessage(operation);
      
      // Stop demo after configured max operations
      if (this.operationCount >= (this.config.maxDemoOperations || 10)) {
        this.stop();
      }
    }, this.config.demoInterval || 5000);
  }

  /**
   * Stop demo operations
   */
  stop(): void {
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
      console.log(formatLogMessage('info', 'DemoManager', 'Demo operations stopped'));
    }
  }

  /**
   * Check if demo is running
   */
  isRunning(): boolean {
    return this.demoInterval !== null;
  }

  /**
   * Get demo statistics
   */
  getStats(): {
    operationCount: number;
    isRunning: boolean;
    maxOperations: number;
  } {
    return {
      operationCount: this.operationCount,
      isRunning: this.isRunning(),
      maxOperations: this.config.maxDemoOperations || 10
    };
  }
}
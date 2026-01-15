import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
}

export class Logger {
  private static instance: Logger;
  private logFilePath: string;
  private logLevel: LogLevel;
  private enableConsole: boolean;
  private enableFile: boolean;

  private applyRuntimeOptions(options?: {
    logFilePath?: string;
    logLevel?: LogLevel;
    enableConsole?: boolean;
    enableFile?: boolean;
  }): void {
    if (!options) {
      return;
    }

    if (options.logFilePath && options.logFilePath !== this.logFilePath) {
      this.logFilePath = options.logFilePath;
      this.ensureLogDirectory();
    }
    if (options.logLevel !== undefined) {
      this.logLevel = options.logLevel;
    }
    if (options.enableConsole !== undefined) {
      this.enableConsole = options.enableConsole;
    }
    if (options.enableFile !== undefined) {
      this.enableFile = options.enableFile;
    }
  }

  private constructor(options: {
    logFilePath?: string;
    logLevel?: LogLevel;
    enableConsole?: boolean;
    enableFile?: boolean;
  } = {}) {
    // Use multiple fallback paths with /tmp as primary
    const possiblePaths = [
      options.logFilePath,
      '/tmp/agent-server.log',
      path.join(process.env.HOME || process.env.USERPROFILE || '/tmp', 'agent-server.log'),
      path.join(process.cwd(), 'temp', 'agent-server.log')
    ].filter(Boolean);
    
    this.logFilePath = possiblePaths[0] || '/tmp/agent-server.log';
    this.logLevel = options.logLevel || LogLevel.INFO;
    this.enableConsole = options.enableConsole !== false;
    this.enableFile = options.enableFile !== false;

    // Ensure temp directory exists
    this.ensureLogDirectory();
    this.applyRuntimeOptions(options);
    
    // Log initialization
    if (this.enableFile) {
      this.writeToLogFile('Logger initialized', 'INFO');
    }
  }

  public static getInstance(options?: {
    logFilePath?: string;
    logLevel?: LogLevel;
    enableConsole?: boolean;
    enableFile?: boolean;
  }): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(options);
    } else if (options) {
      Logger.instance.applyRuntimeOptions(options);
    }
    return Logger.instance;
  }

  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.logFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private writeToLogFile(message: string, level: string): void {
    if (!this.enableFile) {
      return;
    }
    
    try {
      const timestamp = new Date().toISOString();
      const formattedMessage = `[${timestamp}] ${level}: ${message}`;
      fs.appendFileSync(this.logFilePath, formattedMessage + '\n');
    } catch (error) {
      // Fallback to console if file writing fails
      console.error(`Failed to write to log file ${this.logFilePath}:`, error);
    }
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      data,
    };

    const formattedMessage = `[${timestamp}] ${level}: ${message}`;
    if (data) {
      return `${formattedMessage}\n${JSON.stringify(data, null, 2)}`;
    }
    return formattedMessage;
  }

  private writeLog(level: LogLevel, levelName: string, message: string, data?: any): void {
    if (level < this.logLevel) {
      return;
    }

    const formattedMessage = this.formatMessage(levelName, message, data);

    // Console output
    if (this.enableConsole) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage);
          break;
      }
    }

    // File output
    if (this.enableFile) {
      try {
        fs.appendFileSync(this.logFilePath, formattedMessage + '\n\n');
      } catch (error) {
        console.error('Failed to write to log file:', error);
      }
    }
  }

  public debug(message: string, data?: any): void {
    this.writeLog(LogLevel.DEBUG, 'DEBUG', message, data);
  }

  public info(message: string, data?: any): void {
    this.writeLog(LogLevel.INFO, 'INFO', message, data);
  }

  public warn(message: string, data?: any): void {
    this.writeLog(LogLevel.WARN, 'WARN', message, data);
  }

  public error(message: string, data?: any): void {
    this.writeLog(LogLevel.ERROR, 'ERROR', message, data);
  }

  public logWebSocketMessage(direction: 'incoming' | 'outgoing', actor: string, message: any): void {
    const logData = {
      direction,
      actor,
      messageType: message.type || 'unknown',
      timestamp: new Date().toISOString(),
      message: message,
    };

    this.info(`WebSocket ${direction} message from ${actor}`, logData);
  }

  public logConnection(actor: string, action: 'connected' | 'disconnected', details?: any): void {
    const logData = {
      actor,
      action,
      timestamp: new Date().toISOString(),
      details,
    };

    this.info(`${actor} ${action}`, logData);
  }

  public logError(error: Error, context?: string): void {
    const logData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    };

    this.error(`Error${context ? ` in ${context}` : ''}: ${error.message}`, logData);
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public getLogFilePath(): string {
    return this.logFilePath;
  }

  public testLogWrite(): boolean {
    try {
      this.writeToLogFile('Test log entry', 'TEST');
      return fs.existsSync(this.logFilePath) && fs.statSync(this.logFilePath).size > 0;
    } catch (error) {
      console.error('Log write test failed:', error);
      return false;
    }
  }

  public clearLogFile(): void {
    try {
      fs.writeFileSync(this.logFilePath, '');
      this.info('Log file cleared');
    } catch (error) {
      this.error('Failed to clear log file', error);
    }
  }

  public getLogStats(): { size: number; lines: number } {
    try {
      if (!fs.existsSync(this.logFilePath)) {
        return { size: 0, lines: 0 };
      }

      const stats = fs.statSync(this.logFilePath);
      const content = fs.readFileSync(this.logFilePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim()).length;

      return {
        size: stats.size,
        lines,
      };
    } catch (error) {
      this.error('Failed to get log stats', error);
      return { size: 0, lines: 0 };
    }
  }
}

// Export a default logger instance
export const logger = Logger.getInstance();
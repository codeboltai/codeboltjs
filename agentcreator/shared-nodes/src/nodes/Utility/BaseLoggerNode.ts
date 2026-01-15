import { LGraphNode, LiteGraph } from '@codebolt/litegraph';

// Base Logger Node - shared metadata and structure
export class BaseLoggerNode extends LGraphNode {
  static metadata = {
    type: "basic/logger",
    title: "Logger",
    category: "basic",
    description: "Log messages and data for debugging",
    icon: "📝",
    color: "#607D8B"
  };

  constructor() {
    super(BaseLoggerNode.metadata.title, BaseLoggerNode.metadata.type);
    this.title = BaseLoggerNode.metadata.title;

    // Add inputs
    this.addInput("trigger", LiteGraph.ACTION);
    this.addInput("data", 0); // Accept any data type

    this.addOutput("onLogged", LiteGraph.EVENT);
    this.addOutput("data", 0); // Pass-through data

    // Add properties
    this.addProperty("prefix", "");
    this.addProperty("level", "info"); // debug, info, warn, error
    this.addProperty("console", true); // Whether to log to console
    this.addProperty("timestamp", true); // Whether to include timestamp

    this.size = [140, 100];
    this.mode = LiteGraph.ON_TRIGGER;

    // Store log history
    this.logs = [];
  }

  // Log entries storage
  protected logs: Array<{ timestamp: number; level: string; message: string }>;

  // Shared logging logic
  formatMessage(data: any, prefix: string, timestamp: boolean): string {
    const dataStr = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);

    let message = '';

    if (timestamp) {
      message += `[${new Date().toLocaleTimeString()}] `;
    }

    if (prefix) {
      message += `${prefix}: `;
    }

    message += dataStr;

    return message;
  }

  // Log to console with level
  logToConsole(level: string, message: string) {
    switch (level) {
      case 'debug':
        console.debug(message);
        break;
      case 'info':
        console.info(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'error':
        console.error(message);
        break;
      default:
        console.log(message);
    }
  }

  // Store log entry
  storeLog(level: string, message: string) {
    this.logs.push({
      timestamp: Date.now(),
      level,
      message
    });

    // Keep only last 100 log entries
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }
  }

  // Get recent logs
  getRecentLogs(count: number = 10): Array<{ timestamp: number; level: string; message: string }> {
    return this.logs.slice(-count);
  }

  // Clear log history
  clearLogs() {
    this.logs = [];
  }

  // Validate log level
  validateLevel(level: string): string {
    const validLevels = ['debug', 'info', 'warn', 'error'];
    return validLevels.includes(level) ? level : 'info';
  }

  // Shared property setter
  setProperty(name: string, value: any) {
    switch (name) {
      case 'prefix':
        this.properties.prefix = String(value || '');
        break;
      case 'level':
        this.properties.level = this.validateLevel(value);
        break;
      case 'console':
        this.properties.console = Boolean(value);
        break;
      case 'timestamp':
        this.properties.timestamp = Boolean(value);
        break;
      default:
        super.setProperty(name, value);
    }
  }
}
import { BaseLoggerNode } from '@agent-creator/shared-nodes';

// Backend-specific Logger Node - execution logic only
export class LoggerNode extends BaseLoggerNode {
  constructor() {
    super();
    // Backend doesn't need UI widgets
  }

  // Backend execution logic
  onExecute() {
    const data = this.getInputData(1);
    const prefix = this.properties.prefix;
    const level = this.properties.level;
    const useConsole = this.properties.console;
    const useTimestamp = this.properties.timestamp;

    // Skip if no data provided
    if (data === undefined || data === null) {
      // console.warn(`LoggerNode ${this.id}: no data to log`);
      return;
    }

    // Format message
    const message = this.formatMessage(data, prefix, useTimestamp);

    // Log to console if enabled
    if (useConsole) {
      this.logToConsole(level, message);
    }

    // Store in log history
    this.storeLog(level, message);

    // Pass through data and trigger event
    this.setOutputData(0, data);
    this.setOutputData(1, data);
    this.triggerSlot(0, null, null); // onLogged

    // Optional: Also log with node context
    // console.log(`LoggerNode ${this.id} [${level.toUpperCase()}]: ${message}`);
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 10) {
    return super.getRecentLogs(count);
  }

  // Clear log history
  clearLogs() {
    super.clearLogs();
    // console.log(`LoggerNode ${this.id}: log history cleared`);
  }
}
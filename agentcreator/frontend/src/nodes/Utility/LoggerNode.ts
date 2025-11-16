import { BaseLoggerNode } from '@agent-creator/shared-nodes';

// Frontend Logger Node - UI only
export class LoggerNode extends BaseLoggerNode {
  private prefixWidget: any;
  private levelWidget: any;
  private consoleWidget: any;
  private timestampWidget: any;
  private statusWidget: any;

  constructor() {
    super();
    // Frontend-specific widgets
    this.prefixWidget = this.addWidget("text", "prefix", this.properties.prefix as string, "prefix");
    this.levelWidget = this.addWidget("combo", "level", this.properties.level as string, "level", {
      values: ["debug", "info", "warn", "error"]
    });
    this.consoleWidget = this.addWidget("toggle", "console", this.properties.console as boolean, "console");
    this.timestampWidget = this.addWidget("toggle", "timestamp", this.properties.timestamp as boolean, "timestamp");
    this.statusWidget = this.addWidget("text", "logs", "0 entries", "status", {} as any);

    this.widgets_up = true;
    this.size = [180, 150];
  }

  // Frontend-specific property change handling
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    const result = super.onPropertyChanged?.(name, value, prev_value) ?? false;

    // Update widget values when properties change
    if (name === 'prefix' && this.prefixWidget) {
      this.prefixWidget.value = this.properties.prefix;
    } else if (name === 'level' && this.levelWidget) {
      this.levelWidget.value = this.properties.level;
    } else if (name === 'console' && this.consoleWidget) {
      this.consoleWidget.value = this.properties.console;
    } else if (name === 'timestamp' && this.timestampWidget) {
      this.timestampWidget.value = this.properties.timestamp;
    }

    return result;
  }

  // Update log count display
  updateLogCount() {
    if (this.statusWidget) {
      const recentLogs = this.getRecentLogs();
      const count = recentLogs.length;
      this.statusWidget.value = `${count} entr${count !== 1 ? 'ies' : 'y'}`;
    }
  }

  // Frontend display
  onExecute() {
    this.updateLogCount();
  }

  // Handle node configuration in the frontend
  onConfigure(info: any): void {
    super.onConfigure?.(info);

    // Restore widget values from properties
    if (this.prefixWidget) {
      this.prefixWidget.value = this.properties.prefix || "";
    }
    if (this.levelWidget) {
      this.levelWidget.value = this.properties.level || "info";
    }
    if (this.consoleWidget) {
      this.consoleWidget.value = this.properties.console !== undefined ? this.properties.console : true;
    }
    if (this.timestampWidget) {
      this.timestampWidget.value = this.properties.timestamp !== undefined ? this.properties.timestamp : true;
    }

    this.updateLogCount();
  }

  // Visual feedback for log level
  onDrawForeground(ctx: CanvasRenderingContext2D, _canvas: any) {
    if (this.flags.collapsed) return;

    const level = String(this.properties.level || 'info');
    const recentLogs = this.getRecentLogs();
    const logCount = recentLogs.length;

    // Set color based on log level
    const levelColors: Record<string, string> = {
      debug: "#607D8B",
      info: "#2196F3",
      warn: "#FF9800",
      error: "#F44336"
    };

    ctx.font = "10px Arial";
    ctx.fillStyle = levelColors[level] || "#666";
    ctx.fillText(`[${level.toUpperCase()}]`, 5, this.size[1] - 12);

    if (logCount > 0) {
      ctx.font = "9px Arial";
      ctx.fillStyle = "#888";
      ctx.fillText(`${logCount} logs`, 5, this.size[1] - 2);
    }
  }

  // Additional inputs for log management
  onGetInputs() {
    return [
      ["clear", "action"],
      ["showRecent", "action"],
      ...this.inputs.slice(1) // Keep existing inputs after trigger
    ];
  }

  // Handle clear action
  onActionClear() {
    this.clearLogs();
    this.updateLogCount();
  }

  // Handle showRecent action
  onActionShowRecent() {
    const recentLogs = this.getRecentLogs(5);
    if (recentLogs.length > 0) {
      console.log("Recent logs from LoggerNode:", recentLogs);
    } else {
      console.log("No recent logs in LoggerNode");
    }
  }

  // Override storeLog to update display
  storeLog(level: string, message: string) {
    super.storeLog(level, message);
    this.updateLogCount();
  }
}
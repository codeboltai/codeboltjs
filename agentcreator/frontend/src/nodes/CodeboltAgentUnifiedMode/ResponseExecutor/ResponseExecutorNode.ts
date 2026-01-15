import { BaseResponseExecutorNode } from '@codebolt/agent-shared-nodes';

// Frontend Response Executor Node - UI only
export class ResponseExecutorNode extends BaseResponseExecutorNode {
  constructor() {
    super();
  }

  // Update executor configuration when widget values change
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    const result = super.onPropertyChanged?.(name, value, prev_value) ?? false;

    // Update properties based on widget changes
    if (name === 'enableLogging') {
      this.properties.enableLogging = value as boolean;
    } else if (name === 'continueOnToolError') {
      this.properties.continueOnToolError = value as boolean;
    } else if (name === 'maxToolRetries') {
      this.properties.maxToolRetries = value as number;
    }

    return result;
  }

  // Handle node configuration in the frontend
  onConfigure(info: any): void {
    super.onConfigure?.(info);

    // Restore widget values from properties
    if (this.widgets) {
      this.widgets[0].value = this.properties.enableLogging !== undefined ? this.properties.enableLogging : true;
      this.widgets[1].value = this.properties.continueOnToolError !== undefined ? this.properties.continueOnToolError : true;
      this.widgets[2].value = this.properties.maxToolRetries || 3;
    }
  }
}
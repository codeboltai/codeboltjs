import { BaseAgentStepNode } from '@agent-creator/shared-nodes';

// Frontend Agent Step Node - UI only
export class AgentStepNode extends BaseAgentStepNode {
  constructor() {
    super();
  }

  // Update step configuration when widget values change
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    const result = super.onPropertyChanged(name, value, prev_value);

    // Update properties based on widget changes
    if (name === 'llmRole') {
      this.properties.llmRole = value as string;
    } else if (name === 'enableLogging') {
      this.properties.enableLogging = value as boolean;
    }

    return result;
  }

  // Handle node configuration in the frontend
  onConfigure(info: any): void {
    super.onConfigure(info);

    // Restore widget values from properties
    if (this.widgets) {
      this.widgets[0].value = this.properties.llmRole || 'assistant';
      this.widgets[1].value = this.properties.enableLogging !== undefined ? this.properties.enableLogging : true;
    }
  }
}
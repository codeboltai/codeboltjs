import { BaseAgentNode } from '@codebolt/agent-shared-nodes';

// Frontend Agent Node - UI only
export class AgentNode extends BaseAgentNode {
  constructor() {
    super();
  }

  // Update agent configuration when widget values change
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    const result = super.onPropertyChanged?.(name, value, prev_value) ?? false;

    // Update properties based on widget changes
    if (name === 'agentName') {
      this.properties.agentName = value as string;
      this.title = value as string || 'Agent';
    } else if (name === 'instructions') {
      this.properties.instructions = value as string;
    } else if (name === 'maxIterations') {
      this.properties.maxIterations = value as number;
    } else if (name === 'maxConversationLength') {
      this.properties.maxConversationLength = value as number;
    } else if (name === 'enableLogging') {
      this.properties.enableLogging = value as boolean;
    }

    return result;
  }

  // Handle node configuration in the frontend
  onConfigure(info: any): void {
    super.onConfigure?.(info);

    // Restore widget values from properties
    if (this.widgets) {
      this.widgets[0].value = this.properties.agentName || 'Agent';
      this.widgets[1].value = this.properties.instructions || 'You are a helpful assistant.';
      this.widgets[2].value = this.properties.maxIterations || 10;
      this.widgets[3].value = this.properties.maxConversationLength || 50;
      this.widgets[4].value = this.properties.enableLogging !== undefined ? this.properties.enableLogging : true;
    }
  }
}
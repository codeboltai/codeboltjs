import { BaseInitialPromptGeneratorNode } from '@codebolt/agent-shared-nodes';

// Frontend Initial Prompt Generator Node - UI only
export class InitialPromptGeneratorNode extends BaseInitialPromptGeneratorNode {
  constructor() {
    super();
  }

  // Update generator configuration when widget values change
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    const result = super.onPropertyChanged?.(name, value, prev_value) ?? false;

    // Update properties based on widget changes
    if (name === 'baseSystemPrompt') {
      this.properties.baseSystemPrompt = value as string;
    } else if (name === 'enableLogging') {
      this.properties.enableLogging = value as boolean;
    } else if (name === 'enableTemplating') {
      this.properties.enableTemplating = value as boolean;
    }

    return result;
  }

  // Handle node configuration in the frontend
  onConfigure(info: any): void {
    super.onConfigure?.(info);

    // Restore widget values from properties
    if (this.widgets) {
      this.widgets[0].value = this.properties.baseSystemPrompt || 'You are a helpful assistant.';
      this.widgets[1].value = this.properties.enableLogging !== undefined ? this.properties.enableLogging : true;
      this.widgets[2].value = this.properties.enableTemplating !== undefined ? this.properties.enableTemplating : true;
    }
  }
}
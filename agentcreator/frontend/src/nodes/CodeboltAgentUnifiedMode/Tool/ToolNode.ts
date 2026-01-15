import { BaseToolNode } from '@codebolt/agent-shared-nodes';

// Frontend Tool Node - UI only
export class ToolNode extends BaseToolNode {
  constructor() {
    super();
  }

  // Update tool configuration when widget values change
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    const result = super.onPropertyChanged?.(name, value, prev_value) ?? false;

    // Update properties based on widget changes
    if (name === 'toolId') {
      this.properties.toolId = value as string;
    } else if (name === 'toolDescription') {
      this.properties.toolDescription = value as string;
    } else if (name === 'enableValidation') {
      this.properties.enableValidation = value as boolean;
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
      this.widgets[0].value = this.properties.toolId || 'custom_tool';
      this.widgets[1].value = this.properties.toolDescription || 'A custom tool for specific tasks';
      this.widgets[2].value = this.properties.enableValidation !== undefined ? this.properties.enableValidation : true;
      this.widgets[3].value = this.properties.enableLogging !== undefined ? this.properties.enableLogging : true;
    }
  }
}
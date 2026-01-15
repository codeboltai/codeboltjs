import { BaseWorkflowNode } from '@codebolt/agent-shared-nodes';

// Frontend Workflow Node - UI only
export class WorkflowNode extends BaseWorkflowNode {
  constructor() {
    super();
  }

  // Update workflow configuration when widget values change
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    const result = super.onPropertyChanged?.(name, value, prev_value) ?? false;

    // Update properties based on widget changes
    if (name === 'workflowName') {
      this.properties.workflowName = value as string;
    } else if (name === 'enableValidation') {
      this.properties.enableValidation = value as boolean;
    } else if (name === 'enableLogging') {
      this.properties.enableLogging = value as boolean;
    } else if (name === 'maxExecutionTime') {
      this.properties.maxExecutionTime = value as number;
    } else if (name === 'continueOnError') {
      this.properties.continueOnError = value as boolean;
    }

    return result;
  }

  // Handle node configuration in the frontend
  onConfigure(info: any): void {
    super.onConfigure?.(info);

    // Restore widget values from properties
    if (this.widgets) {
      this.widgets[0].value = this.properties.workflowName || 'My Workflow';
      this.widgets[1].value = this.properties.enableValidation !== undefined ? this.properties.enableValidation : true;
      this.widgets[2].value = this.properties.enableLogging !== undefined ? this.properties.enableLogging : true;
      this.widgets[3].value = this.properties.maxExecutionTime || 300000;
      this.widgets[4].value = this.properties.continueOnError !== undefined ? this.properties.continueOnError : false;
    }
  }
}
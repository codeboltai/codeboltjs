import { BaseCodeboltAgentNode } from '@codebolt/agent-shared-nodes';

// Frontend CodeboltAgent Node - UI only
export class CodeboltAgentNode extends BaseCodeboltAgentNode {
    constructor() {
        super();
    }

    // Update agent configuration when widget values change
    onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
        const result = super.onPropertyChanged?.(name, value, prev_value) ?? false;

        // Update properties based on widget changes
        if (name === 'agentName') {
            this.properties.agentName = value as string;
            this.title = value as string || 'Codebolt Agent';
        } else if (name === 'instructions') {
            this.properties.instructions = value as string;
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
            this.widgets[0].value = this.properties.agentName || 'CodeboltAgent';
            this.widgets[1].value = this.properties.instructions || 'You are an AI coding assistant.';
            this.widgets[2].value = this.properties.enableLogging !== undefined ? this.properties.enableLogging : true;
        }
    }
}

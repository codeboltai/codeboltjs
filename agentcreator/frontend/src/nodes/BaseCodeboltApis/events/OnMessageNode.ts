import { BaseOnMessageNode } from '@agent-creator/shared-nodes';

// Frontend OnMessage Node - UI only
export class OnMessageNode extends BaseOnMessageNode {
  constructor() {
    super();
  }


  // Update message when widget value changes
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    const result = super.onPropertyChanged(name, value, prev_value);
    return result;
  }
}
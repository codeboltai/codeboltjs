import { BaseSequenceNode } from '@codebolt/agent-shared-nodes';

// Frontend Sequence Node - UI only
export class SequenceNode extends BaseSequenceNode {
  constructor() {
    super();

    // Add UI control for sequence editing
    this.addWidget("text", "sequence", this.properties.sequence as string, (value: any) => {
      if (typeof value === 'string') {
        this.setProperty("sequence", value);
      }
    });
  }

  onExecute() {
    // console.log(`SequenceNode ${this.id} - UI only, execution handled by backend`);
  }

  // Update sequence when property changes
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    if (name === "sequence" && typeof value === "string") {
      return true;
    }
    return super.onPropertyChanged?.(name, value, prev_value) ?? false;
  }
}

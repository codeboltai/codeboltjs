import { BaseSequenceNode } from '@agent-creator/shared-nodes';

// Frontend Sequence Node - UI only
export class SequenceNode extends BaseSequenceNode {
  private index = 0;
  private values: string[] = [];
  private current_sequence: string | null = null;

  constructor() {
    super();
    this.values = this.parseSequence(this.properties.sequence);

    // Add UI control for sequence editing
    this.addWidget("text", "sequence", this.properties.sequence, (value) => {
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
      this.values = this.parseSequence(value);
      return true;
    }
    return super.onPropertyChanged(name, value, prev_value);
  }

  // Handle property changes with UI updates
  setProperty(name: string, value: unknown): void {
    super.setProperty(name, value);
    // Update widgets if they exist
    const widget = this.widgets?.find(w => w.name === name);
    if (widget) {
      widget.value = value;
    }
  }
}

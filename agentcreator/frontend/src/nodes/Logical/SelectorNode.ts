import { BaseSelectorNode } from '@agent-creator/shared-nodes';

// Frontend Selector Node - UI only
export class SelectorNode extends BaseSelectorNode {
  private selected = 0;

  constructor() {
    super();
    // Add UI control for index
    this.addWidget("number", "index", this.properties.index, (value) => {
      this.setProperty("index", parseInt(value) || 0);
    });

    // Add initial inputs
    this.addInput("A", "");
    this.addInput("B", "");
    this.addInput("C", "");
    this.addInput("D", "");
  }

  onExecute() {
    // console.log(`SelectorNode ${this.id} - UI only, execution handled by backend`);
  }

  // Draw visual indicator for selected input
  onDrawBackground(ctx: any) {
    if (this.flags.collapsed) {
      return;
    }
    ctx.fillStyle = "#AFB";
    const y = (this.selected + 1) * 20 + 6; // Assuming NODE_SLOT_HEIGHT is 20
    ctx.beginPath();
    ctx.moveTo(50, y);
    ctx.lineTo(50, y + 20);
    ctx.lineTo(34, y + 10);
    ctx.fill();
  }

  // Support dynamic inputs
  onGetInputs(): string[][] {
    return [["E", 0], ["F", 0], ["G", 0], ["H", 0]];
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

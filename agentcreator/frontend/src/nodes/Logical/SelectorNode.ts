import { BaseSelectorNode } from '@codebolt/agent-shared-nodes';

// Frontend Selector Node - UI only
export class SelectorNode extends BaseSelectorNode {
  constructor() {
    super();
    // Add UI control for index
    this.addWidget("number", "index", this.properties.index as number, (value: any) => {
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
    const index = this.properties.index as number;
    const y = (index + 1) * 20 + 6; // Assuming NODE_SLOT_HEIGHT is 20
    ctx.beginPath();
    ctx.moveTo(50, y);
    ctx.lineTo(50, y + 20);
    ctx.lineTo(34, y + 10);
    ctx.fill();
  }

  // Support dynamic inputs
  onGetInputs(): string[][] {
    return [["E", ""], ["F", ""], ["G", ""], ["H", ""]];
  }
}

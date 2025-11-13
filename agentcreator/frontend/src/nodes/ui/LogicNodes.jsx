import { BaseOrNode, BaseNotNode, BaseSelectorNode } from '@agent-creator/shared-nodes';

// Frontend-specific OR Node - UI only
export class OrNode extends BaseOrNode {
  constructor() {
    super();
    // Add UI control for adding more inputs
    this.addWidget("button", "Add Input", null, () => {
      this.addInput(`in${this.inputs.length}`, "boolean");
    });
  }

  onExecute() {
    // console.log(`OrNode ${this.id} - UI only, execution handled by backend`);
  }

  // Support dynamic inputs
  onGetInputs() {
    return this.getDynamicInputs();
  }
}

// Frontend-specific NOT Node - UI only
export class NotNode extends BaseNotNode {
  onExecute() {
    // console.log(`NotNode ${this.id} - UI only, execution handled by backend`);
  }
}

// Frontend-specific Selector Node - UI only
export class SelectorNode extends BaseSelectorNode {
  constructor() {
    super();
    // Add UI control for index
    this.addWidget("number", "index", this.properties.index, (value) => {
      this.setProperty("index", parseInt(value) || 0);
    });
  }

  onExecute() {
    // console.log(`SelectorNode ${this.id} - UI only, execution handled by backend`);
  }

  // Handle property changes with UI updates
  setProperty(name, value) {
    super.setProperty(name, value);
    // Update widgets if they exist
    const widget = this.widgets?.find(w => w.name === name);
    if (widget) {
      widget.value = value;
    }
  }
}
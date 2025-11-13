import { BaseBypassNode, BaseToNumberNode, BaseRandNode, BaseAbsNode, BaseClampNode } from '@agent-creator/shared-nodes';

// Frontend-specific Bypass Node - UI only
export class BypassNode extends BaseBypassNode {
  onExecute() {
    // console.log(`BypassNode ${this.id} - UI only, execution handled by backend`);
  }
}

// Frontend-specific ToNumber Node - UI only
export class ToNumberNode extends BaseToNumberNode {
  onExecute() {
    // console.log(`ToNumberNode ${this.id} - UI only, execution handled by backend`);
  }
}

// Frontend-specific Rand Node - UI only
export class RandNode extends BaseRandNode {
  constructor() {
    super();
    // Add UI controls for min/max
    this.addWidget("number", "min", this.properties.min, (value) => {
      this.setProperty("min", value);
    });
    this.addWidget("number", "max", this.properties.max, (value) => {
      this.setProperty("max", value);
    });
  }

  onExecute() {
    // console.log(`RandNode ${this.id} - UI only, execution handled by backend`);
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

// Frontend-specific Abs Node - UI only
export class AbsNode extends BaseAbsNode {
  onExecute() {
    // console.log(`AbsNode ${this.id} - UI only, execution handled by backend`);
  }
}

// Frontend-specific Clamp Node - UI only
export class ClampNode extends BaseClampNode {
  constructor() {
    super();
    // Add UI controls for min/max
    this.addWidget("number", "min", this.properties.min, (value) => {
      this.setProperty("min", value);
    });
    this.addWidget("number", "max", this.properties.max, (value) => {
      this.setProperty("max", value);
    });
  }

  onExecute() {
    // console.log(`ClampNode ${this.id} - UI only, execution handled by backend`);
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
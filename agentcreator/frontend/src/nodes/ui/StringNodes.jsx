import { BaseToStringNode, BaseCompareNode, BaseToUpperCaseNode, BaseContainsNode } from '@agent-creator/shared-nodes';

// Frontend-specific ToString Node - UI only
export class ToStringNode extends BaseToStringNode {
  onExecute() {
    console.log(`ToStringNode ${this.id} - UI only, execution handled by backend`);
  }
}

// Frontend-specific Compare Node - UI only
export class CompareNode extends BaseCompareNode {
  constructor() {
    super();
    // Add UI control for case sensitivity
    this.addWidget("toggle", "case_sensitive", this.properties.case_sensitive, (value) => {
      this.setProperty("case_sensitive", value);
    });
  }

  onExecute() {
    // console.log(`CompareNode ${this.id} - UI only, execution handled by backend`);
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

// Frontend-specific ToUpperCase Node - UI only
export class ToUpperCaseNode extends BaseToUpperCaseNode {
  onExecute() {
    // console.log(`ToUpperCaseNode ${this.id} - UI only, execution handled by backend`);
  }
}

// Frontend-specific Contains Node - UI only
export class ContainsNode extends BaseContainsNode {
  constructor() {
    super();
    // Add UI control for case sensitivity
    this.addWidget("toggle", "case_sensitive", this.properties.case_sensitive, (value) => {
      this.setProperty("case_sensitive", value);
    });
  }

  onExecute() {
    // console.log(`ContainsNode ${this.id} - UI only, execution handled by backend`);
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
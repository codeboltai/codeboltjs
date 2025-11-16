import { BaseToStringNode, BaseCompareNode, BaseToUpperCaseNode, BaseContainsNode, BaseConcatenateNode, BaseSplitNode, BaseStringToTableNode, BaseToFixedNode } from '@agent-creator/shared-nodes';

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

// Frontend-specific Concatenate Node - UI only
export class ConcatenateNode extends BaseConcatenateNode {
  onExecute() {
    console.log(`ConcatenateNode ${this.id} - UI only, execution handled by backend`);
  }
}

// Frontend-specific Split Node - UI only
export class SplitNode extends BaseSplitNode {
  constructor() {
    super();
    // Add UI control for default separator
    this.addWidget("text", "separator", ",", (value) => {
      this.setProperty("separator", value);
    });
  }

  onExecute() {
    // console.log(`SplitNode ${this.id} - UI only, execution handled by backend`);
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

// Frontend-specific String to Table Node - UI only
export class StringToTableNode extends BaseStringToTableNode {
  constructor() {
    super();
    // Add UI control for delimiter
    this.addWidget("text", "delimiter", ",", (value) => {
      this.setProperty("delimiter", value);
    });
  }

  onExecute() {
    // console.log(`StringToTableNode ${this.id} - UI only, execution handled by backend`);
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

// Frontend-specific ToFixed Node - UI only
export class ToFixedNode extends BaseToFixedNode {
  constructor() {
    super();
    // Add UI control for decimals
    this.addWidget("number", "decimals", 2, (value) => {
      this.setProperty("decimals", value);
    }, { min: 0, max: 20, step: 1 });
  }

  onExecute() {
    // console.log(`ToFixedNode ${this.id} - UI only, execution handled by backend`);
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
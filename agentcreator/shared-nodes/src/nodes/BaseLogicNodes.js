import { LGraphNode } from '@comfyorg/litegraph';

// Base OR Node
export class BaseOrNode extends LGraphNode {
  static metadata = {
    type: "logic/OR",
    title: "OR",
    category: "logic",
    description: "Logical OR",
    icon: "∨",
    color: "#FF5722"
  };

  constructor() {
    super();
    this.title = BaseOrNode.metadata.title;
    this.properties = {};
    this.addInput("a", "boolean");
    this.addInput("b", "boolean");
    this.addOutput("out", "boolean");
  }

  // Shared logic calculation
  performLogicalOr(inputData) {
    let result = false;
    for (const inputKey in inputData) {
      if (inputData[inputKey]) {
        result = true;
        break;
      }
    }
    return result;
  }

  // Dynamic input support
  getDynamicInputs() {
    return [["or", "boolean"]];
  }
}

// Base NOT Node
export class BaseNotNode extends LGraphNode {
  static metadata = {
    type: "logic/NOT",
    title: "NOT",
    category: "logic",
    description: "Logical NOT",
    icon: "¬",
    color: "#FF5722"
  };

  constructor() {
    super();
    this.title = BaseNotNode.metadata.title;
    this.addInput("in", "boolean");
    this.addOutput("out", "boolean");
    this.size = [80, 30];
  }

  // Shared NOT logic
  performNot(value) {
    return !Boolean(value);
  }
}

// Base Selector Node
export class BaseSelectorNode extends LGraphNode {
  static metadata = {
    type: "logic/selector",
    title: "Selector",
    category: "logic",
    description: "Selects an output",
    icon: "⊞",
    color: "#00BCD4"
  };

  constructor() {
    super();
    this.title = BaseSelectorNode.metadata.title;
    this.addProperty("index", 0);
    this.addInput("sel", "number");
    this.addInput("in", "");
    this.addOutput("out", "");
    this.size = [80, 60];
  }

  // Shared selection logic
  selectInput(inputs, selectedIndex) {
    if (!inputs || inputs.length === 0) return null;
    const index = selectedIndex !== undefined ? selectedIndex : this.properties.index;
    return inputs[Math.min(Math.max(0, Math.floor(index)), inputs.length - 1)];
  }
}
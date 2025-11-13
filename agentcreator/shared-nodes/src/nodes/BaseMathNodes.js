import { LGraphNode } from '@comfyorg/litegraph';

// Base Bypass Node
export class BaseBypassNode extends LGraphNode {
  static metadata = {
    type: "math/bypass",
    title: "Bypass",
    category: "math",
    description: "Removes the type",
    icon: "→",
    color: "#9C27B0"
  };

  constructor() {
    super();
    this.title = BaseBypassNode.metadata.title;
    this.addInput("in", 0);
    this.addOutput("out", 0);
    this.size = [80, 30];
  }
}

// Base ToNumber Node
export class BaseToNumberNode extends LGraphNode {
  static metadata = {
    type: "math/to_number",
    title: "To Number",
    category: "math",
    description: "Cast to number",
    icon: "#",
    color: "#607D8B"
  };

  constructor() {
    super();
    this.title = BaseToNumberNode.metadata.title;
    this.addInput("in", "");
    this.addOutput("out", "number");
    this.size = [80, 30];
  }

  // Shared conversion logic
  convertToNumber(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    if (typeof value === 'boolean') return value ? 1 : 0;
    return 0;
  }
}

// Base Rand Node
export class BaseRandNode extends LGraphNode {
  static metadata = {
    type: "math/rand",
    title: "Random",
    category: "math",
    description: "Random number",
    icon: "?",
    color: "#E91E63"
  };

  constructor() {
    super();
    this.title = BaseRandNode.metadata.title;
    this.addProperty("min", 0);
    this.addProperty("max", 1);
    this.addInput("min", "number");
    this.addInput("max", "number");
    this.addOutput("out", "number");
    this.size = [120, 60];
  }

  // Shared random generation
  generateRandom(min, max) {
    const finalMin = min !== undefined ? min : this.properties.min;
    const finalMax = max !== undefined ? max : this.properties.max;
    return Math.random() * (finalMax - finalMin) + finalMin;
  }
}

// Base Abs Node
export class BaseAbsNode extends LGraphNode {
  static metadata = {
    type: "math/abs",
    title: "Abs",
    category: "math",
    description: "Absolute value",
    icon: "|x|",
    color: "#E91E63"
  };

  constructor() {
    super();
    this.title = BaseAbsNode.metadata.title;
    this.addInput("in", "number");
    this.addOutput("out", "number");
    this.size = [80, 30];
  }

  // Shared absolute value calculation
  calculateAbs(value) {
    return Math.abs(value || 0);
  }
}

// Base Clamp Node
export class BaseClampNode extends LGraphNode {
  static metadata = {
    type: "math/clamp",
    title: "Clamp",
    category: "math",
    description: "Clamp number between min and max",
    icon: "⬓",
    color: "#E91E63"
  };

  constructor() {
    super();
    this.title = BaseClampNode.metadata.title;
    this.addProperty("min", 0);
    this.addProperty("max", 1);
    this.addInput("in", "number");
    this.addInput("min", "number");
    this.addInput("max", "number");
    this.addOutput("out", "number");
    this.size = [120, 80];
  }

  // Shared clamp calculation
  calculateClamp(value, min, max) {
    const finalMin = min !== undefined ? min : this.properties.min;
    const finalMax = max !== undefined ? max : this.properties.max;
    return Math.max(finalMin, Math.min(finalMax, value || 0));
  }
}
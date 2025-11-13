import { LGraphNode } from '@comfyorg/litegraph';

// Base ToString Node
export class BaseToStringNode extends LGraphNode {
  static metadata = {
    type: "string/toString",
    title: "to String",
    category: "string",
    description: "Convert to string",
    icon: "S",
    color: "#9E9E9E"
  };

  constructor() {
    super();
    this.title = BaseToStringNode.metadata.title;
    this.addInput("in", "");
    this.addOutput("out", "string");
    this.size = [80, 30];
  }

  // Shared conversion logic
  convertToString(value) {
    if (value === null || value === undefined) return "";
    return String(value);
  }
}

// Base Compare Node
export class BaseCompareNode extends LGraphNode {
  static metadata = {
    type: "string/compare",
    title: "Compare",
    category: "string",
    description: "Compare two strings",
    icon: "==",
    color: "#9E9E9E"
  };

  constructor() {
    super();
    this.title = BaseCompareNode.metadata.title;
    this.addProperty("case_sensitive", true);
    this.addInput("a", "string");
    this.addInput("b", "string");
    this.addOutput("out", "boolean");
    this.size = [80, 50];
  }

  // Shared comparison logic
  compareStrings(a, b, caseSensitive = true) {
    const strA = a !== undefined ? String(a) : "";
    const strB = b !== undefined ? String(b) : "";

    if (caseSensitive) {
      return strA === strB;
    } else {
      return strA.toLowerCase() === strB.toLowerCase();
    }
  }
}

// Base ToUpperCase Node
export class BaseToUpperCaseNode extends LGraphNode {
  static metadata = {
    type: "string/toUpperCase",
    title: "to UpperCase",
    category: "string",
    description: "Convert to uppercase",
    icon: "↑",
    color: "#9E9E9E"
  };

  constructor() {
    super();
    this.title = BaseToUpperCaseNode.metadata.title;
    this.addInput("in", "string");
    this.addOutput("out", "string");
    this.size = [100, 30];
  }

  // Shared conversion logic
  toUpperCase(value) {
    const str = value !== undefined ? String(value) : "";
    return str.toUpperCase();
  }
}

// Base Contains Node
export class BaseContainsNode extends LGraphNode {
  static metadata = {
    type: "string/contains",
    title: "Contains",
    category: "string",
    description: "Check if contains substring",
    icon: "∈",
    color: "#9E9E9E"
  };

  constructor() {
    super();
    this.title = BaseContainsNode.metadata.title;
    this.addProperty("case_sensitive", true);
    this.addInput("string", "string");
    this.addInput("substring", "string");
    this.addOutput("out", "boolean");
    this.size = [100, 60];
  }

  // Shared contains logic
  containsSubstring(str, substr, caseSensitive = true) {
    const string = str !== undefined ? String(str) : "";
    const substring = substr !== undefined ? String(substr) : "";

    if (caseSensitive) {
      return string.includes(substring);
    } else {
      return string.toLowerCase().includes(substring.toLowerCase());
    }
  }
}
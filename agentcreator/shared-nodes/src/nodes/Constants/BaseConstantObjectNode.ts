import { LGraphNode } from '@codebolt/litegraph';

// Base Constant Object Node - shared metadata and structure
export class BaseConstantObjectNode extends LGraphNode {
  static metadata = {
    type: "basic/const_object",
    title: "Const Object",
    category: "basic",
    description: "Constant object with configurable data",
    icon: "{}",
    color: "#FF9800"
  };

  constructor() {
    super(BaseConstantObjectNode.metadata.title, BaseConstantObjectNode.metadata.type);
    this.addOutput("value", "object");
    this.addProperty("value", {});
    this.size = [180, 30];
  }

  // Shared validation for object values
  validateValue(value) {
    if (value === null || value === undefined) {
      return {};
    }
    if (typeof value === 'object') {
      return value;
    }
    // Try to parse JSON string
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }

  // Format object for display
  formatValue(value) {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  // Shared property setter with validation
  setProperty(name, value) {
    if (name === 'value') {
      this.properties.value = this.validateValue(value);
    } else {
      super.setProperty(name, value);
    }
  }

  // Execute method that outputs the object
  onExecute() {
    this.setOutputData(0, this.properties.value);
  }
}
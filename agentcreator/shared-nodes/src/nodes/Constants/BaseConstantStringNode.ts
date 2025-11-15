import { LGraphNode } from '@codebolt/litegraph';

// Base Constant String Node - shared metadata and structure
export class BaseConstantStringNode extends LGraphNode {
  static metadata = {
    type: "basic/const_string",
    title: "Const String",
    category: "basic",
    description: "Constant string with text input",
    icon: "S",
    color: "#FF9800"
  };

  constructor() {
    super(BaseConstantStringNode.metadata.title, BaseConstantStringNode.metadata.type);
    this.addOutput("value", "string");
    this.addProperty("value", "");
    this.size = [180, 30];
  }

  // Shared validation
  validateValue(value) {
    return String(value || "");
  }
}
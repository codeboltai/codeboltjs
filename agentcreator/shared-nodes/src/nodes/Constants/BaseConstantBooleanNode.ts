import { LGraphNode } from '@codebolt/litegraph';

// Base Constant Boolean Node - shared metadata and structure
export class BaseConstantBooleanNode extends LGraphNode {
  static metadata = {
    type: "basic/const_boolean",
    title: "Const Boolean",
    category: "basic",
    description: "Constant boolean with toggle",
    icon: "☑",
    color: "#FF9800"
  };

  constructor() {
    super(BaseConstantBooleanNode.metadata.title, BaseConstantBooleanNode.metadata.type);
    this.title = BaseConstantBooleanNode.metadata.title;
    this.addOutput("value", "boolean");
    this.addProperty("value", false);
    this.size = [120, 30];
  }

  // Shared validation
  validateValue(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return Boolean(value);
  }
}
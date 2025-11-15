import { LGraphNode } from '@codebolt/litegraph';

// Base Constant Node - shared metadata and structure
export class BaseConstNode extends LGraphNode {
  static metadata = {
    type: "basic/const",
    title: "Const",
    category: "basic",
    description: "Outputs a constant value",
    icon: "C",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseConstNode.metadata.title, BaseConstNode.metadata.type);
    this.title = BaseConstNode.metadata.title;
    this.properties = { value: 1 };
    this.addOutput("", "number");
  }

  // Shared validation logic
  validateValue(value) {
    return typeof value === 'number' ? value : parseFloat(value) || 0;
  }

  // Shared property setter
  setProperty(name, value) {
    if (name === 'value') {
      this.properties.value = this.validateValue(value);
    } else {
      super.setProperty(name, value);
    }
  }
}
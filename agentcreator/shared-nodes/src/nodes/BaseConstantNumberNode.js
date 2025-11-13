import { LGraphNode } from '@comfyorg/litegraph';

// Base Constant Number Node - shared metadata and structure
export class BaseConstantNumberNode extends LGraphNode {
  static metadata = {
    type: "basic/const_number",
    title: "Const Number",
    category: "basic",
    description: "Constant number with widget",
    icon: "#",
    color: "#FF9800"
  };

  constructor() {
    super();
    this.title = BaseConstantNumberNode.metadata.title;
    this.addOutput("value", "number");
    this.addProperty("value", 1.0);
    this.size = [180, 30];
  }

  // Shared validation and formatting
  validateValue(value) {
    return parseFloat(value) || 0;
  }

  formatValue(value, precision = 3) {
    return parseFloat(value).toFixed(precision);
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
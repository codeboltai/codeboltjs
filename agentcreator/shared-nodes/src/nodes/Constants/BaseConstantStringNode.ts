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

    // Ensure properties object exists and is properly initialized
    if (!this.properties) {
      this.properties = {};
    }
  }

  // Shared validation
  validateValue(value) {
    return String(value || "");
  }

  // Ensure properties are properly serialized
  serialize() {
    const data = super.serialize();
    // Make sure the value property is always included in serialization
    if (this.properties.value !== undefined) {
      data.properties.value = this.properties.value;
    }
    return data;
  }

  // Ensure properties are properly deserialized
  configure(data: any) {
    super.configure(data);
    // Ensure the value property is set during deserialization
    if (data.properties && data.properties.value !== undefined) {
      this.properties.value = data.properties.value;
    }
  }
}
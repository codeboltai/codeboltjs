import { NodeMetadata } from '../../types/NodeMetadata';
import { BaseStringVariableNode } from './BaseStringVariableNode';

export class BaseGetStringVariableNode extends BaseStringVariableNode {
  static metadata: NodeMetadata = {
    type: "variables/getString",
    title: "Get String Variable",
    category: "variables",
    description: "Read a string value from the graph variable store",
    icon: "S?",
    color: "#7E57C2"
  };

  constructor() {
    super(BaseGetStringVariableNode.metadata);
    this.addProperty("default_value", "");
    this.addOutput("value", "string");
    this.size = [200, 60];
  }

  protected resolveOutputValue(): string {
    const stored = this.readVariableValue();
    if (stored !== undefined) {
      return stored;
    }
    return this.coerceToString(this.properties?.default_value ?? "");
  }
}

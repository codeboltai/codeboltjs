import { NodeMetadata } from '../../types/NodeMetadata';
import { BaseStringVariableNode } from './BaseStringVariableNode';

export class BaseSetStringVariableNode extends BaseStringVariableNode {
  static metadata: NodeMetadata = {
    type: "variables/setString",
    title: "Set String Variable",
    category: "variables",
    description: "Store a string value in the graph variable store",
    icon: "S=",
    color: "#5E35B1"
  };

  constructor() {
    super(BaseSetStringVariableNode.metadata);
    this.addProperty("initial_value", "");
    this.addInput("value", "string");
    this.addOutput("value", "string");
    this.size = [220, 70];
  }

  protected persistValue(value: any): string {
    const normalized = this.coerceToString(
      value === undefined ? (this.properties?.initial_value ?? "") : value
    );
    this.writeVariableValue(normalized);
    return normalized;
  }
}

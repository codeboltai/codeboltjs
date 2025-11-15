import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types/NodeMetadata';

export class BaseOperationNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "math/operation",
    title: "Operation",
    category: "math",
    description: "Easy math operators (+, -, *, /, %, ^, max, min)",
    icon: "op",
    color: "#2196F3"
  };

  static operations = ["+", "-", "*", "/", "%", "^", "max", "min"];

  static operationFuncs: Record<string, (a: number, b: number) => number> = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => b !== 0 ? a / b : 0,
    "%": (a, b) => b !== 0 ? a % b : 0,
    "^": (a, b) => Math.pow(a, b),
    "max": (a, b) => Math.max(a, b),
    "min": (a, b) => Math.min(a, b)
  };

  constructor() {
    super(BaseOperationNode.metadata.title, BaseOperationNode.metadata.type);
    this.title = BaseOperationNode.metadata.title;
    this.addProperty("A", 0);
    this.addProperty("B", 0);
    this.addProperty("OP", "+", "enum", { values: BaseOperationNode.operations });
    this.addInput("A", "number,array,object");
    this.addInput("B", "number");
    this.addOutput("=", "number");
    this.size = [100, 60];

    // Properties used by frontend
    (this as any)._result = [];
    (this as any)._func = BaseOperationNode.operationFuncs[this.properties.OP];
  }

  // Shared operation logic
  performOperation(a: any, b: any, operation: string): any {
    const func = BaseOperationNode.operationFuncs[operation];
    if (!func) return 0;

    if (typeof a === 'number') {
      return func(a, typeof b === 'number' ? b : 0);
    } else if (Array.isArray(a)) {
      return a.map(item => func(typeof item === 'number' ? item : 0, typeof b === 'number' ? b : 0));
    } else if (typeof a === 'object' && a !== null) {
      const result: Record<string, number> = {};
      for (const key in a) {
        result[key] = func(typeof a[key] === 'number' ? a[key] : 0, typeof b === 'number' ? b : 0);
      }
      return result;
    }
    return 0;
  }

  onPropertyChanged(name, value): boolean {
    if (name != "OP") {
      return false;
    }
    (this as any)._func = BaseOperationNode.operationFuncs[this.properties.OP];
    if (!(this as any)._func) {
      console.warn("Unknown operation: " + this.properties.OP);
      (this as any)._func = function(A: number) { return A; };
    }
    return true;
  }

  getTitle() {
    if (this.properties.OP == "max" || this.properties.OP == "min")
      return this.properties.OP + "(A,B)";
    return "A " + this.properties.OP + " B";
  }
}
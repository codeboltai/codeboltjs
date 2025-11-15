import { LGraphNode } from '@codebolt/litegraph';

// Base Converter Node - shared metadata and structure
export class BaseConverterNode extends LGraphNode {
  static metadata = {
    type: "math/converter",
    title: "Converter",
    category: "math",
    description: "Type A to type B",
    icon: "⇄",
    color: "#FF9800"
  };

  constructor() {
    super(BaseConverterNode.metadata.title, BaseConverterNode.metadata.type);
    this.title = BaseConverterNode.metadata.title;
    this.addInput("in", 0);
    this.size = [80, 30];
  }

  // Shared conversion logic
  getDynamicOutputs() {
    return [
      ["number", "number"],
      ["vec2", "vec2"],
      ["vec3", "vec3"],
      ["vec4", "vec4"]
    ];
  }

  // Shared conversion methods
  convertToNumber(v) {
    return v.length ? v[0] : parseFloat(v);
  }

  convertToVector(v, count) {
    const result = new Float32Array(count);
    if (v.length) {
      for (let j = 0; j < v.length && j < result.length; j++) {
        result[j] = v[j];
      }
    } else {
      result[0] = parseFloat(v);
    }
    return result;
  }

  performConversion(v, outputName) {
    switch (outputName) {
      case "number":
        return this.convertToNumber(v);
      case "vec2":
      case "vec3":
      case "vec4":
        const count = parseInt(outputName.replace("vec", ""));
        return this.convertToVector(v, count);
      default:
        return null;
    }
  }
}
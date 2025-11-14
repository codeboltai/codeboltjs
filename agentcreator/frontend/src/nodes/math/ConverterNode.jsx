import { LGraphNode, LiteGraph } from '@codebolt/litegraph';

class ConverterNode extends LGraphNode {
  constructor() {
    super();
    this.addInput("in", 0);
    this.size = [80, 30];
  }

  onExecute() {
    var v = this.getInputData(0);
    if (v == null) {
      return;
    }

    if (this.outputs) {
      for (var i = 0; i < this.outputs.length; i++) {
        var output = this.outputs[i];
        if (!output.links || !output.links.length) {
          continue;
        }

        var outputResult = null;
        switch (output.name) {
          case "number":
            outputResult = v.length ? v[0] : parseFloat(v);
            break;
          case "vec2":
          case "vec3":
          case "vec4":
            var count = 1;
            switch (output.name) {
              case "vec2":
                count = 2;
                break;
              case "vec3":
                count = 3;
                break;
              case "vec4":
                count = 4;
                break;
            }

            outputResult = new Float32Array(count);
            if (v.length) {
              for (var j = 0; j < v.length && j < outputResult.length; j++) {
                outputResult[j] = v[j];
              }
            } else {
              outputResult[0] = parseFloat(v);
            }
            break;
        }
        this.setOutputData(i, outputResult);
      }
    }
  }

  onGetOutputs() {
    return [
      ["number", "number"],
      ["vec2", "vec2"],
      ["vec3", "vec3"],
      ["vec4", "vec4"]
    ];
  }
}

ConverterNode.title = "Converter";
ConverterNode.desc = "type A to type B";

export default ConverterNode;

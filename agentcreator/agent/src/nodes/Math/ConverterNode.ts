import { BaseConverterNode } from '@codebolt/agent-shared-nodes';

export class ConverterNode extends BaseConverterNode {
  constructor() {
    super();
    this.addInput("in", 0);
  }

  // Backend execution logic
  onExecute() {
    const value = this.getInputData(0);
    if (value == null) {
      return;
    }

    const isArrayLike = (val: unknown): val is ArrayLike<number> => {
      return Array.isArray(val) || ArrayBuffer.isView(val);
    };

    const toNumber = (val: unknown): number => {
      if (typeof val === 'number') {
        return val;
      }
      const parsed = parseFloat(String(val ?? 0));
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    const arrayValue = isArrayLike(value) ? Array.from(value) : undefined;

    if (this.outputs) {
      for (let i = 0; i < this.outputs.length; i++) {
        const output = this.outputs[i];
        if (!output.links || !output.links.length) {
          continue;
        }

        let outputResult: number | Float32Array | null = null;
        switch (output.name) {
          case "number":
            if (arrayValue && arrayValue.length) {
              outputResult = toNumber(arrayValue[0]);
            } else {
              outputResult = toNumber(value);
            }
            break;
          case "vec2":
          case "vec3":
          case "vec4":
            let count = 1;
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
            if (arrayValue && arrayValue.length) {
              for (let j = 0; j < arrayValue.length && j < outputResult.length; j++) {
                outputResult[j] = toNumber(arrayValue[j]);
              }
            } else {
              outputResult[0] = toNumber(value);
            }
            break;
        }
        this.setOutputData(i, outputResult as any);
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
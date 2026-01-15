import { AndNodeMetadata } from '../../shared/metadata';
import { AndNodeData } from '../../shared/types';
import { LGraphNode } from '@codebolt/litegraph';

export class AndNode extends LGraphNode {
  static metadata = AndNodeMetadata;

  constructor() {
    super("AND");

    this.properties = {};

    // Start with two inputs
    this.addInput("a", "boolean");
    this.addInput("b", "boolean");
    this.addOutput("out", "boolean");

    // Add UI control for adding more inputs
    this.addWidget("button", "Add Input", undefined, () => {
      const inputName = `and${this.inputs.length}`;
      this.addInput(inputName, "boolean");
    });

    this.size = [180, 100];
  }

  onExecute() {
    // Get all input values
    const inputValues: boolean[] = [];

    for (let i = 0; i < this.inputs.length; i++) {
      const value = this.getInputData(i);
      // Treat undefined as false for AND operation
      inputValues.push(value === true);
    }

    // If no inputs, return false
    if (inputValues.length === 0) {
      this.setOutputData(0, false);
      return;
    }

    // Perform logical AND operation
    const result = inputValues.every(val => val === true);
    this.setOutputData(0, result);
  }

  // Support dynamic inputs
  onGetInputs() {
    return [["and", "boolean"]];
  }

  // Custom serialization to support dynamic inputs
  onSerialize() {
    const data = super.onSerialize();
    data.inputCount = this.inputs.length;
    return data;
  }

  // Custom deserialization to restore dynamic inputs
  onConfigure(data: any) {
    super.onConfigure(data);

    // Restore input count
    if (data.inputCount && data.inputCount > 2) {
      const currentInputs = this.inputs.length;
      for (let i = currentInputs; i < data.inputCount; i++) {
        const inputName = `and${i}`;
        this.addInput(inputName, "boolean");
      }
    }
  }
}
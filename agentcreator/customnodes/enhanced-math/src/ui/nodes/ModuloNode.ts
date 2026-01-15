import { ModuloNodeMetadata } from '../../shared/metadata';
import { ModuloNodeData } from '../../shared/types';
import { LGraphNode } from '@codebolt/litegraph';

export class ModuloNode extends LGraphNode {
  static metadata = ModuloNodeMetadata;

  constructor() {
    super("Modulo");
    this.addInput("Dividend", "number");
    this.addInput("Divisor", "number");
    this.addOutput("Result", "number");

    this.properties = {
      dividend: 10,
      divisor: 3
    };

    this.addWidget("number", "Dividend", this.properties.dividend, "dividend");
    this.addWidget("number", "Divisor", this.properties.divisor, "divisor");

    this.size = [200, 100];
  }

  onExecute() {
    const dividend = this.getInputData(0) ?? this.properties.dividend;
    const divisor = this.getInputData(1) ?? this.properties.divisor;

    // Handle division by zero
    if (divisor === 0) {
      this.setOutputData(0, 0);
      console.warn("ModuloNode: Division by zero, result set to 0");
    } else {
      this.setOutputData(0, dividend % divisor);
    }
  }

  onPropertyChanged(name: string, value: any) {
    if (name === 'dividend' || name === 'divisor') {
      this.properties[name] = value;
      this.onExecute();
    }
  }
}
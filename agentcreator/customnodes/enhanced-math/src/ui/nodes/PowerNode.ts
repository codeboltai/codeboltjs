import { PowerNodeMetadata } from '../../shared/metadata';
import { PowerNodeData } from '../../shared/types';
import { LGraphNode } from '@codebolt/litegraph';

export class PowerNode extends LGraphNode {
  static metadata = PowerNodeMetadata;

  constructor() {
    super("Power");
    this.addInput("Base", "number");
    this.addInput("Exponent", "number");
    this.addOutput("Result", "number");

    this.properties = {
      base: 2,
      exponent: 3
    };

    this.addWidget("number", "Base", this.properties.base, "base");
    this.addWidget("number", "Exponent", this.properties.exponent, "exponent");

    this.size = [200, 100];
  }

  onExecute() {
    const base = this.getInputData(0) ?? this.properties.base;
    const exponent = this.getInputData(1) ?? this.properties.exponent;
    this.setOutputData(0, Math.pow(base, exponent));
  }

  onPropertyChanged(name: string, value: any) {
    if (name === 'base' || name === 'exponent') {
      this.properties[name] = value;
      this.onExecute();
    }
  }
}
import { RangeNodeMetadata } from '../../shared/metadata';
import { RangeNodeData } from '../../shared/types';
import { LGraphNode } from '@codebolt/litegraph';

export class RangeNode extends LGraphNode {
  static metadata = RangeNodeMetadata;

  constructor() {
    super("Range");
    this.addInput("Start", "number");
    this.addInput("End", "number");
    this.addInput("Step", "number");
    this.addOutput("Range", "array");

    this.properties = {
      start: 0,
      end: 10,
      step: 1
    };

    this.addWidget("number", "Start", this.properties.start, "start");
    this.addWidget("number", "End", this.properties.end, "end");
    this.addWidget("number", "Step", this.properties.step, "step");

    this.size = [200, 120];
  }

  onExecute() {
    const start = this.getInputData(0) ?? this.properties.start;
    const end = this.getInputData(1) ?? this.properties.end;
    const step = this.getInputData(2) ?? this.properties.step;

    // Handle invalid step
    if (step === 0) {
      this.setOutputData(0, []);
      console.warn("RangeNode: Step cannot be zero, result set to empty array");
    } else {
      const range = this.generateRange(start, end, step);
      this.setOutputData(0, range);
    }
  }

  generateRange(start: number, end: number, step: number): number[] {
    const range: number[] = [];

    if (step > 0) {
      for (let i = start; i <= end; i += step) {
        range.push(i);
      }
    } else if (step < 0) {
      for (let i = start; i >= end; i += step) {
        range.push(i);
      }
    }

    return range;
  }

  onPropertyChanged(name: string, value: any) {
    if (name === 'start' || name === 'end' || name === 'step') {
      this.properties[name] = value;
      this.onExecute();
    }
  }
}
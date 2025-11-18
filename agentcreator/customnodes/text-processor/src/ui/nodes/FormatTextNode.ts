import { FormatTextNodeMetadata } from '../../shared/metadata';
import { FormatTextNodeData } from '../../shared/types';
import { LGraphNode } from '@codebolt/litegraph';

export class FormatTextNode extends LGraphNode {
  static metadata = FormatTextNodeMetadata;

  constructor() {
    super("Format Text");
    this.addInput("Template", "string");
    this.addInput("Value 1", "number,string");
    this.addInput("Value 2", "number,string");
    this.addInput("Value 3", "number,string");
    this.addOutput("Result", "string");

    this.properties = {
      template: "Hello {0}, the answer is {1}",
      values: ["World", 42, ""]
    };

    this.addWidget("text", "Template", this.properties.template, "template");

    this.size = [240, 140];
  }

  onExecute() {
    const template = this.getInputData(0) ?? this.properties.template;
    const value1 = this.getInputData(1);
    const value2 = this.getInputData(2);
    const value3 = this.getInputData(3);

    if (typeof template !== 'string') {
      this.setOutputData(0, "");
      return;
    }

    // Get values from inputs or use properties
    const values = [
      value1 !== undefined ? value1 : this.properties.values[0],
      value2 !== undefined ? value2 : this.properties.values[1],
      value3 !== undefined ? value3 : this.properties.values[2]
    ];

    // Simple template replacement {0}, {1}, {2}, etc.
    let result = template;
    values.forEach((value, index) => {
      const placeholder = `{${index}}`;
      result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value));
    });

    this.setOutputData(0, result);
  }

  onPropertyChanged(name: string, value: any) {
    if (name === 'template') {
      this.properties[name] = value;
      this.onExecute();
    }
  }
}
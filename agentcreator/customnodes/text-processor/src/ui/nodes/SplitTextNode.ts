import { SplitTextNodeMetadata } from '../../shared/metadata';
import { SplitTextNodeData } from '../../shared/types';
import { LGraphNode } from '@codebolt/litegraph';

export class SplitTextNode extends LGraphNode {
  static metadata = SplitTextNodeMetadata;

  constructor() {
    super("Split Text");
    this.addInput("Text", "string");
    this.addInput("Delimiter", "string");
    this.addOutput("Array", "array");

    this.properties = {
      text: "hello world",
      delimiter: " "
    };

    this.addWidget("text", "Text", this.properties.text, "text");
    this.addWidget("text", "Delimiter", this.properties.delimiter, "delimiter");

    this.size = [220, 100];
  }

  onExecute() {
    const text = this.getInputData(0) ?? this.properties.text;
    const delimiter = this.getInputData(1) ?? this.properties.delimiter;

    if (typeof text !== 'string' || typeof delimiter !== 'string') {
      this.setOutputData(0, []);
      return;
    }

    const result = text.split(delimiter);
    this.setOutputData(0, result);
  }

  onPropertyChanged(name: string, value: any) {
    if (name === 'text' || name === 'delimiter') {
      this.properties[name] = value;
      this.onExecute();
    }
  }
}
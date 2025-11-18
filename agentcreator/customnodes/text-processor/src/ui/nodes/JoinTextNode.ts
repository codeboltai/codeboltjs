import { JoinTextNodeMetadata } from '../../shared/metadata';
import { JoinTextNodeData } from '../../shared/types';
import { LGraphNode } from '@codebolt/litegraph';

export class JoinTextNode extends LGraphNode {
  static metadata = JoinTextNodeMetadata;

  constructor() {
    super("Join Text");
    this.addInput("Strings", "array");
    this.addInput("Separator", "string");
    this.addOutput("Result", "string");

    this.properties = {
      strings: ["hello", "world"],
      separator: " "
    };

    this.addWidget("text", "Separator", this.properties.separator, "separator");

    this.size = [220, 80];
  }

  onExecute() {
    const strings = this.getInputData(0) ?? this.properties.strings;
    const separator = this.getInputData(1) ?? this.properties.separator;

    if (!Array.isArray(strings)) {
      this.setOutputData(0, "");
      return;
    }

    // Filter to ensure all elements are strings
    const stringArray = strings.filter(item => typeof item === 'string');

    if (typeof separator !== 'string') {
      this.setOutputData(0, stringArray.join(''));
      return;
    }

    const result = stringArray.join(separator);
    this.setOutputData(0, result);
  }

  onPropertyChanged(name: string, value: any) {
    if (name === 'separator') {
      this.properties[name] = value;
      this.onExecute();
    }
  }
}
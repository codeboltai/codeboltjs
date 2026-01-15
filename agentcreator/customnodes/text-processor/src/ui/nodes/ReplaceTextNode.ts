import { ReplaceTextNodeMetadata } from '../../shared/metadata';
import { ReplaceTextNodeData } from '../../shared/types';
import { LGraphNode } from '@codebolt/litegraph';

export class ReplaceTextNode extends LGraphNode {
  static metadata = ReplaceTextNodeMetadata;

  constructor() {
    super("Replace Text");
    this.addInput("Text", "string");
    this.addInput("Search", "string");
    this.addInput("Replace", "string");
    this.addOutput("Result", "string");

    this.properties = {
      text: "hello world",
      search: "world",
      replace: "universe",
      useRegex: false
    };

    this.addWidget("text", "Text", this.properties.text, "text");
    this.addWidget("text", "Search", this.properties.search, "search");
    this.addWidget("text", "Replace", this.properties.replace, "replace");
    this.addWidget("toggle", "Use Regex", this.properties.useRegex, "useRegex");

    this.size = [220, 120];
  }

  onExecute() {
    const text = this.getInputData(0) ?? this.properties.text;
    const search = this.getInputData(1) ?? this.properties.search;
    const replace = this.getInputData(2) ?? this.properties.replace;

    if (typeof text !== 'string' || typeof search !== 'string' || typeof replace !== 'string') {
      this.setOutputData(0, text ?? "");
      return;
    }

    let result: string;
    if (this.properties.useRegex) {
      try {
        const flags = 'g'; // Global replacement
        const regex = new RegExp(search, flags);
        result = text.replace(regex, replace);
      } catch (error) {
        console.error('ReplaceTextNode: Invalid regex pattern:', error);
        result = text; // Return original text if regex is invalid
      }
    } else {
      result = text.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
    }

    this.setOutputData(0, result);
  }

  onPropertyChanged(name: string, value: any) {
    if (['text', 'search', 'replace', 'useRegex'].includes(name)) {
      this.properties[name] = value;
      this.onExecute();
    }
  }
}
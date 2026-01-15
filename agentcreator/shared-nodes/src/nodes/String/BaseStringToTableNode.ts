import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types';

// Base String to Table Node - shared metadata and structure
export class BaseStringToTableNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "string/stringToTable",
    title: "String to Table",
    category: "string",
    description: "Convert a delimited string to a table format",
    icon: "📊",
    color: "#9E9E9E"
  };

  constructor() {
    super(BaseStringToTableNode.metadata.title, BaseStringToTableNode.metadata.type);
    this.title = BaseStringToTableNode.metadata.title;
    this.addInput("string", "string");
    this.addInput("delimiter", "string");
    this.addOutput("out", "table");
    this.size = [80, 30];
  }

  // Shared string to table conversion logic
  convertStringToTable(str: string, delimiter: string): any[] {
    if (str === undefined || str === null || str === "") return [];
    if (delimiter === undefined || delimiter === null || delimiter === "") return [[str]];

    const lines = str.split('\n');
    const table = [];

    for (const line of lines) {
      if (line.trim()) {
        const cells = line.split(delimiter);
        table.push(cells);
      }
    }

    return table.length > 0 ? table : [[str]];
  }
}
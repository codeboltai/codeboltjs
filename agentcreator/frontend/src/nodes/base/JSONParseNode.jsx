import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

class JSONParseNode extends LGraphNode {
  constructor() {
    super();
    this.addInput("parse", LiteGraph.ACTION);
    this.addInput("json", "string");
    this.addOutput("done", LiteGraph.EVENT);
    this.addOutput("object", "object");
    this.widget = this.addWidget("button", "parse", "", this.parse.bind(this));
    this._str = null;
    this._obj = null;
    this.size = [140, 60];
  }

  parse() {
    if (!this._str) {
      return;
    }

    try {
      this._str = this.getInputData(1);
      this._obj = JSON.parse(this._str);
      this.boxcolor = "#AEA";
      this.triggerSlot(0);
    } catch {
      this.boxcolor = "red";
    }
  }

  onExecute() {
    this._str = this.getInputData(1);
    this.setOutputData(1, this._obj);
  }

  onAction(name) {
    if (name == "parse") {
      this.parse();
    }
  }
}

JSONParseNode.title = "JSON Parse";
JSONParseNode.desc = "Parses JSON String into object";

export default JSONParseNode;

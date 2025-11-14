import { LGraphNode, LiteGraph } from '@codebolt/litegraph';

class SequenceNode extends LGraphNode {
  constructor() {
    super();
    this.properties = {
      sequence: "A,B,C"
    };
    this.addInput("index", "number");
    this.addInput("seq");
    this.addOutput("out");

    this.index = 0;
    this.values = this.properties.sequence.split(",");
  }

  onPropertyChanged(name, value) {
    if (name == "sequence") {
      this.values = value.split(",");
    }
  }

  onExecute() {
    var seq = this.getInputData(1);
    if (seq && seq != this.current_sequence) {
      this.values = seq.split(",");
      this.current_sequence = seq;
    }
    var index = this.getInputData(0);
    if (index == null) {
      index = 0;
    }
    this.index = index = Math.round(index) % this.values.length;

    this.setOutputData(0, this.values[index]);
  }
}

SequenceNode.title = "Sequence";
SequenceNode.desc = "select one element from a sequence from a string";

export default SequenceNode;

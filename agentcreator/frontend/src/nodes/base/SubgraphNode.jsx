import { LGraphNode, LiteGraph } from '@codebolt/litegraph';

class SubgraphNode extends LGraphNode {
  constructor() {
    super();
    this.size = [140, 80];
    this.properties = { enabled: true };
    this.enabled = true;

    //create inner graph
    this.subgraph = new LiteGraph.LGraph();
    this.subgraph._subgraph_node = this;
    this.subgraph._is_subgraph = true;

    this.subgraph.onTrigger = this.onSubgraphTrigger.bind(this);

    //nodes input node added inside
    this.subgraph.onInputAdded = this.onSubgraphNewInput.bind(this);
    this.subgraph.onInputRenamed = this.onSubgraphRenamedInput.bind(this);
    this.subgraph.onInputTypeChanged = this.onSubgraphTypeChangeInput.bind(this);
    this.subgraph.onInputRemoved = this.onSubgraphRemovedInput.bind(this);

    this.subgraph.onOutputAdded = this.onSubgraphNewOutput.bind(this);
    this.subgraph.onOutputRenamed = this.onSubgraphRenamedOutput.bind(this);
    this.subgraph.onOutputTypeChanged = this.onSubgraphTypeChangeOutput.bind(this);
    this.subgraph.onOutputRemoved = this.onSubgraphRemovedOutput.bind(this);
  }

  onGetInputs() {
    return [["enabled", "boolean"]];
  }

  onDblClick(e, pos, graphcanvas) {
    setTimeout(() => {
      graphcanvas.openSubgraph(this.subgraph);
    }, 10);
  }

  onAction(action, param) {
    this.subgraph.onAction(action, param);
  }

  onExecute() {
    this.enabled = this.getInputOrProperty("enabled");
    if (!this.enabled) {
      return;
    }

    //send inputs to subgraph global inputs
    if (this.inputs) {
      for (var j = 0; j < this.inputs.length; j++) {
        var input = this.inputs[j];
        var inputValue = this.getInputData(j);
        this.subgraph.setInputData(input.name, inputValue);
      }
    }

    //execute
    this.subgraph.runStep();

    //send subgraph global outputs to outputs
    if (this.outputs) {
      for (var i = 0; i < this.outputs.length; i++) {
        var output = this.outputs[i];
        var outputValue = this.subgraph.getOutputData(output.name);
        this.setOutputData(i, outputValue);
      }
    }
  }

  sendEventToAllNodes(eventname) {
    if (this.enabled) {
      this.subgraph.sendEventToAllNodes(eventname);
    }
  }

  //**** INPUTS ***********************************
  onSubgraphTrigger(event, param) {
    var slot = this.findOutputSlot(event);
    if (slot != -1) {
      this.triggerSlot(slot);
    }
  }

  onSubgraphNewInput(name, type) {
    var slot = this.findInputSlot(name);
    if (slot == -1) {
      //add input to the node
      this.addInput(name, type);
    }
  }

  onSubgraphRenamedInput(oldname, name) {
    var slot = this.findInputSlot(oldname);
    if (slot == -1) {
      return;
    }
    var info = this.getInputInfo(slot);
    info.name = name;
  }

  onSubgraphTypeChangeInput(name, type) {
    var slot = this.findInputSlot(name);
    if (slot == -1) {
      return;
    }
    var info = this.getInputInfo(slot);
    info.type = type;
  }

  onSubgraphRemovedInput(name) {
    var slot = this.findInputSlot(name);
    if (slot == -1) {
      return;
    }
    this.removeInput(slot);
  }

  //**** OUTPUTS ***********************************
  onSubgraphNewOutput(name, type) {
    var slot = this.findOutputSlot(name);
    if (slot == -1) {
      this.addOutput(name, type);
    }
  }

  onSubgraphRenamedOutput(oldname, name) {
    var slot = this.findOutputSlot(oldname);
    if (slot == -1) {
      return;
    }
    var info = this.getOutputInfo(slot);
    info.name = name;
  }

  onSubgraphTypeChangeOutput(name, type) {
    var slot = this.findOutputSlot(name);
    if (slot == -1) {
      return;
    }
    var info = this.getOutputInfo(slot);
    info.type = type;
  }

  onSubgraphRemovedOutput(name) {
    var slot = this.findOutputSlot(name);
    if (slot == -1) {
      return;
    }
    this.removeOutput(slot);
  }

  getExtraMenuOptions(graphcanvas) {
    return [
      {
        content: "Open",
        callback: () => {
          graphcanvas.openSubgraph(this.subgraph);
        }
      }
    ];
  }

  onResize(size) {
    size[1] += 20;
  }

  serialize() {
    var data = LiteGraph.LGraphNode.prototype.serialize.call(this);
    data.subgraph = this.subgraph.serialize();
    return data;
  }

  clone() {
    var node = LiteGraph.createNode(this.type);
    var data = this.serialize();
    delete data["id"];
    delete data["inputs"];
    delete data["outputs"];
    node.configure(data);
    return node;
  }
}

SubgraphNode.title = "Subgraph";
SubgraphNode.desc = "Graph inside a node";
SubgraphNode.title_color = "#334";

export default SubgraphNode;

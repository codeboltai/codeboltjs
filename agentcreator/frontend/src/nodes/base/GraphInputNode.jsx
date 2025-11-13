import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

class GraphInputNode extends LGraphNode {
  constructor() {
    super();
    this.addOutput("", "number");

    this.name_in_graph = "";
    this.properties = {
      name: "",
      type: "number",
      value: 0
    };

    this.name_widget = this.addWidget(
      "text",
      "Name",
      this.properties.name,
      (v) => {
        if (!v) {
          return;
        }
        this.setProperty("name", v);
      }
    );
    this.type_widget = this.addWidget(
      "text",
      "Type",
      this.properties.type,
      (v) => {
        this.setProperty("type", v);
      }
    );

    this.value_widget = this.addWidget(
      "number",
      "Value",
      this.properties.value,
      (v) => {
        this.setProperty("value", v);
      }
    );

    this.widgets_up = true;
    this.size = [180, 90];
  }

  onConfigure() {
    this.updateType();
  }

  //ensures the type in the node output and the type in the associated graph input are the same
  updateType() {
    var type = this.properties.type;
    this.type_widget.value = type;

    //update output
    if (this.outputs[0].type != type) {
      if (!LiteGraph.isValidConnection(this.outputs[0].type, type))
        this.disconnectOutput(0);
      this.outputs[0].type = type;
    }

    //update widget
    if (type == "number") {
      this.value_widget.type = "number";
      this.value_widget.value = 0;
    } else if (type == "boolean") {
      this.value_widget.type = "toggle";
      this.value_widget.value = true;
    } else if (type == "string") {
      this.value_widget.type = "text";
      this.value_widget.value = "";
    } else {
      this.value_widget.type = null;
      this.value_widget.value = null;
    }
    this.properties.value = this.value_widget.value;

    //update graph
    if (this.graph && this.name_in_graph) {
      this.graph.changeInputType(this.name_in_graph, type);
    }
  }

  //this is executed AFTER the property has changed
  onPropertyChanged(name, v) {
    if (name == "name") {
      if (v == "" || v == this.name_in_graph || v == "enabled") {
        return false;
      }
      if (this.graph) {
        if (this.name_in_graph) {
          //already added
          this.graph.renameInput(this.name_in_graph, v);
        } else {
          this.graph.addInput(v, this.properties.type);
        }
      } //what if not?!
      this.name_widget.value = v;
      this.name_in_graph = v;
    } else if (name == "type") {
      this.updateType();
    } else if (name == "value") {
      // Handle value change
    }
  }

  getTitle() {
    if (this.flags.collapsed) {
      return this.properties.name;
    }
    return this.title;
  }

  onAction(action, param) {
    if (this.properties.type == LiteGraph.EVENT) {
      this.triggerSlot(0, param);
    }
  }

  onExecute() {
    var name = this.properties.name;
    //read from global input
    var data = this.graph.inputs[name];
    if (!data) {
      this.setOutputData(0, this.properties.value);
      return;
    }

    this.setOutputData(0, data.value !== undefined ? data.value : this.properties.value);
  }

  onRemoved() {
    if (this.name_in_graph) {
      this.graph.removeInput(this.name_in_graph);
    }
  }
}

GraphInputNode.title = "Input";
GraphInputNode.desc = "Input of the graph";

export default GraphInputNode;

import { LGraphNode, LiteGraph } from '@codebolt/litegraph';

// Base SendMessage Node - Calls codebolt.chat.sendMessage
export class BaseSendMessageNode extends LGraphNode {
  static metadata = {
    type: "codebolt/chat/sendmessage",
    title: "Send Message",
    category: "codebolt",
    description: "Sends a message using codebolt.chat.sendMessage",
    icon: "💬",
    color: "#2196F3"
  };

  constructor() {
    super();
    this.title = BaseSendMessageNode.metadata.title;
    this.desc = "Sends a message using codebolt.chat.sendMessage";
    this.size = [220, 100];

    // this.properties = {
    //   message: "",
    //   response: null
    // };

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for the message to send
    this.addInput("message", "string");

    // Output for the response
    this.addOutput("response", "string");

    // Output for success status
    this.addOutput("success", "boolean");
  }


  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;


  // // Handle property changes
  // onPropertyChanged(name, value) {
  //   if (name === 'message') {
  //     this.properties.message = this.validateMessage(value);
  //   }
  // }
}
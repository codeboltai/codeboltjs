import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../utils';

// Base SendMessage Node - Calls codebolt.chat.sendMessage
export class BaseSendMessageNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/chat/sendmessage",
    title: "Send Message",
    category: "codebolt",
    description: "Sends a message using codebolt.chat.sendMessage",
    icon: "💬",
    color: "#2196F3"
  };

  constructor() {
    super(BaseSendMessageNode.metadata.title, BaseSendMessageNode.metadata.type);
    this.title = BaseSendMessageNode.metadata.title;
    this.size = [220, 100];

    // this.properties = {
    //   message: "",
    //   response: null
    // };

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for the message to send - accept both string and object
    this.addInput("message", 0 as any);

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
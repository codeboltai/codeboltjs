import { LGraphNode } from '@comfyorg/litegraph';

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

    this.properties = {
      message: "",
      response: null
    };

    // Input for the message to send
    this.addInput("message", "string");

    // Output for the response
    this.addOutput("response", "string");

    // Optional: Output for success status
    this.addOutput("success", "boolean");
  }

  // Validate message before sending
  validateMessage(message) {
    if (typeof message !== 'string') {
      message = String(message || '');
    }
    return message.trim();
  }

  // Execute method for backend
  async onExecute() {
    // const message = this.validateMessage(this.getInputData(0));

    // if (!message) {
    //   this.setOutputData(0, "Error: No message provided");
    //   this.setOutputData(1, false);
    //   return;
    // }

    // try {
    //   // This will be implemented in the backend node
    //   const response = await this.sendMessage(message);

    //   this.properties.response = response;
    //   this.setOutputData(0, response);
    //   this.setOutputData(1, true);

    //   // // console.log(`SendMessageNode ${this.id}: Message sent successfully: ${message.substring(0, 30)}...`);
    // } catch (error) {
    //   const errorMessage = `Error sending message: ${error.message}`;
    //   this.setOutputData(0, errorMessage);
    //   this.setOutputData(1, false);

    //   // console.error(`SendMessageNode ${this.id}: Error sending message:`, error);
    // }
  }

  // This method should be overridden by the backend implementation
  async sendMessage(message) {
    // throw new Error("sendMessage must be implemented by backend node");
  }

  // Handle property changes
  onPropertyChanged(name, value) {
    if (name === 'message') {
      this.properties.message = this.validateMessage(value);
    }
  }
}
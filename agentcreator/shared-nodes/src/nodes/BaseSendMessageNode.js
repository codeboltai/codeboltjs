import { LGraphNode, LiteGraph } from '@comfyorg/litegraph';

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

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);
    
    // Data input for the message to send
    this.addInput("message", "string");

    // Output for the response
    this.addOutput("response", "string");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Validate message before sending
  validateMessage(message) {
    if (typeof message !== 'string') {
      message = String(message || '');
    }
    return message.trim();
  }

  // Handle action trigger
  async onAction(action, param) {
    console.log('[BaseSendMessageNode] onAction called with action:', action, 'param:', param);
    if (action === 'onTrigger' || action === 'onMessage') {
      const message = param || this.getInputData(1) || this.properties.message;
      console.log('[BaseSendMessageNode] Processing message:', message);
      if (message) {
        await this.sendMessageWithData(message);
      }
    }
  }
  
  // Method to send message with the given data
  async sendMessageWithData(messageData) {
    const message = this.validateMessage(messageData);
    
    if (!message) {
      this.setOutputData(0, "Error: No message provided");
      this.setOutputData(1, false);
      return;
    }
    
    try {
      // Set loading state
      this.setOutputData(0, "Sending message...");
      this.setOutputData(1, false);
      
      // Call the actual sendMessage implementation (implemented in derived class)
      const response = await this.sendMessage(message);
      
      // Update outputs with results
      this.properties.response = response;
      this.setOutputData(0, response);
      this.setOutputData(1, true);
      
      return response;
    } catch (error) {
      const errorMessage = `Error sending message: ${error.message}`;
      this.setOutputData(0, errorMessage);
      this.setOutputData(1, false);
      console.error('SendMessageNode error:', error);
      return { success: false, error: errorMessage };
    }
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
  
  // Execute when triggered explicitly
  async onExecute(action, param) {
    console.log('[BaseSendMessageNode] onExecute called with action:', action, 'param:', param);
    // If graph triggers this node directly with an action named 'onTrigger' or legacy 'onMessage'
    if (action === 'onTrigger' || action === 'onMessage') {
      await this.onAction(action, param);
    }
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
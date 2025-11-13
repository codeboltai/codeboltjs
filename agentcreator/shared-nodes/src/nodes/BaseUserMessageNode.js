import { LGraphNode } from '@comfyorg/litegraph';

// Base class for UserMessage node
export class BaseUserMessageNode extends LGraphNode {
  constructor() {
    super();
    this.properties = {
      defaultMessage: ''
    };
    this.addInput("reqMessage", "string");
    this.addOutput("UserMessage", "object");
  }

  async onExecute() {
    const reqMessage = this.getInputData(0) || this.properties.defaultMessage;
    if (!reqMessage) {
      console.error('UserMessageNode: reqMessage input is required');
      return;
    }

    // Create UserMessage object
    const userMessage = {
      content: reqMessage,
      timestamp: new Date().toISOString(),
      type: 'user'
    };

    this.setOutputData(0, userMessage);
  }
}
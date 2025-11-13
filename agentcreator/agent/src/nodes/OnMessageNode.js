import { BaseOnMessageNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
// Backend-specific OnMessage Node - execution logic only
export class OnMessageNode extends BaseOnMessageNode {
  constructor() {
    super();
    // Backend doesn't need any additional UI widgets or setup
  }

  // Backend execution logic
  async onExecute() {
    try {

      let message = await codebolt.getMessage();
      console.log('[utkarsh1]: Agent: Received message:', message);  
      codebolt.chat.sendMessage("Executing OnMessageNode");

      this.setOutputData(0, message);
    } catch (error) {
      console.error('OnMessageNode: Error in onExecute:', error);
    }
    // // console.log(`OnMessageNode ${this.id}: Processing message: ${message ? message.substring(0, 50) + '...' : 'empty'}`);

    // This node is typically the entry point that triggers the flow
    // It should pass the message to downstream nodes like UserMessageNode
  }
}
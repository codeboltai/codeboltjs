import { BaseOnMessageNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class OnMessageNode extends BaseOnMessageNode {
  private _messageReceived = false;

  constructor() {
    super();
    this._messageReceived = false;
  }

  // Backend execution logic - waits for message and triggers event
  async onExecute() {
    if (this._messageReceived) {
      return;
    }

    this._messageReceived = true;

    try {
      const message = await codebolt.getMessage();

      if (this.properties.showSplitOutputs) {
        this.setOutputData(1, message.userMessage || "samplemessage");        // userMessage
        this.setOutputData(2, message.currentFile || "");        // currentFile
        this.setOutputData(3, message.selectedAgent || {});       // selectedAgent
        this.setOutputData(4, message.mentionedFiles || []);      // mentionedFiles
        this.setOutputData(5, message.mentionedFullPaths || []); // mentionedFullPaths
        this.setOutputData(6, message.mentionedFolders || []);   // mentionedFolders
        this.setOutputData(7, message.mentionedMultiFile || []); // mentionedMultiFile
        this.setOutputData(8, message.mentionedMCPs || []);      // mentionedMCPs
        this.setOutputData(9, message.uploadedImages || []);      // uploadedImages
        this.setOutputData(10, message.actions || []);            // actions
        this.setOutputData(11, message.mentionedAgents || []);    // mentionedAgents
        this.setOutputData(12, message.selection || null);        // selection
      } else {
        this.setOutputData(1, message);
      }

      try {
        this.triggerSlot(0, null, null);
      } catch (triggerError) {
        console.error('[OnMessageNode] triggerSlot failed:', triggerError);
      }
    } catch (error) {
      console.error('OnMessageNode: Error in message handling:', error);
    }
  }
}
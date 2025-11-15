import { BaseOnMessageNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
// Backend-specific OnMessage Node - execution logic only
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
      // Wait for a message
      const message = await codebolt.getMessage();
      console.log('[Utkarsh]: Received message:', message);
      // Store the message for both modes
      this.properties.message = message;
      console.log('[Utkarsh]: set to properties message:', this.properties.message);
      if (this.properties.showSplitOutputs) {
        console.log('[Utkarsh]: showSplitOutputs is true');
        // Set individual output data for split mode
        let outputIndex = 1; // Skip event output
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
        // Set the single message object as output
        this.setOutputData(1, message);
      }

      // Set output data for all slots BEFORE triggering
      console.log('[OnMessageNode] Setting output data...');

      // Trigger the event output at slot 0 (onTrigger) to trigger connected nodes
      console.log('[OnMessageNode] Triggering slot 0...');
      try {
        // triggerSlot triggers connected nodes but doesn't propagate data
        this.triggerSlot(0, message.userMessage, null);
        console.log('[OnMessageNode] triggerSlot completed successfully');

      } catch (triggerError) {
        console.error('[OnMessageNode] triggerSlot failed:', triggerError);
      }

    } catch (error) {
      console.error('OnMessageNode: Error in message handling:', error);
      // Still trigger with error
      // this.onMessage({ error: error.message });
    }
  }
}
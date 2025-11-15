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
        // Set individual output data for split mode
        let outputIndex = 1; // Skip event output
        this.setOutputData(outputIndex++, message.userMessage || "");        // userMessage
        this.setOutputData(outputIndex++, message.currentFile || "");        // currentFile
        this.setOutputData(outputIndex++, message.selectedAgent || {});       // selectedAgent
        this.setOutputData(outputIndex++, message.mentionedFiles || []);      // mentionedFiles
        this.setOutputData(outputIndex++, message.mentionedFullPaths || []); // mentionedFullPaths
        this.setOutputData(outputIndex++, message.mentionedFolders || []);   // mentionedFolders
        this.setOutputData(outputIndex++, message.mentionedMultiFile || []); // mentionedMultiFile
        this.setOutputData(outputIndex++, message.mentionedMCPs || []);      // mentionedMCPs
        this.setOutputData(outputIndex++, message.uploadedImages || []);      // uploadedImages
        this.setOutputData(outputIndex++, message.actions || []);            // actions
        this.setOutputData(outputIndex++, message.mentionedAgents || []);    // mentionedAgents
        this.setOutputData(outputIndex++, message.selection || null);        // selection
      } else {
        // Set the single message object as output
        this.setOutputData(1, message);
      }

      // Trigger the event output at slot 0 (onTrigger)
      console.log('[OnMessageNode] Triggering slot 0 with message:', message);
      console.log('[OnMessageNode] Output slots:', this.outputs);
      console.log('[OnMessageNode] Output slot 0:', this.outputs[0]);

      // Set output data first
      this.setOutputData(1, message.userMessage || message);

      try {
        // Correct triggerSlot call: slot_index, param, force_execution
        this.triggerSlot(0, message, null);
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
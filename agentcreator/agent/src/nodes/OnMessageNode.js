import { BaseOnMessageNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
// Backend-specific OnMessage Node - execution logic only
export class OnMessageNode extends BaseOnMessageNode {
  constructor() {
    super();
    this._messageReceived = false;
  }

  // Backend execution logic - waits for message and triggers event
  async onExecute() {
    // Only execute once - don't wait for message on every step
    if (this._messageReceived) {
      return;
    }

    this._messageReceived = true;

    try {
      // Wait for a message
      const message = await codebolt.getMessage();
      console.log('[Utkarsh]: Received message:', message);
      
      await codebolt.chat.sendMessage("Processing your message...");

      // Set individual output data for each property
      this.setOutputData(1, message.userMessage);                    // userMessage
      this.setOutputData(2, message.currentFile || "");              // currentFile
      this.setOutputData(3, message.selectedAgent);                  // selectedAgent
      this.setOutputData(4, message.mentionedFiles);                 // mentionedFiles
      this.setOutputData(5, message.mentionedFullPaths);             // mentionedFullPaths
      this.setOutputData(6, message.mentionedFolders);               // mentionedFolders
      this.setOutputData(7, message.mentionedMultiFile || []);       // mentionedMultiFile
      this.setOutputData(8, message.mentionedMCPs);                  // mentionedMCPs
      this.setOutputData(9, message.uploadedImages);                 // uploadedImages
      this.setOutputData(10, message.actions || []);                 // actions
      this.setOutputData(11, message.mentionedAgents);               // mentionedAgents
      this.setOutputData(12, message.mentionedDocs || []);           // mentionedDocs
      this.setOutputData(13, message.links || []);                   // links
      this.setOutputData(14, message.universalAgentLastMessage || ""); // universalAgentLastMessage
      this.setOutputData(15, message.selection);                     // selection
      this.setOutputData(16, message.controlFiles || []);            // controlFiles
      this.setOutputData(17, message.feedbackMessage || "");         // feedbackMessage
      this.setOutputData(18, message.terminalMessage || "");         // terminalMessage
      this.setOutputData(19, message.messageId);                     // messageId
      this.setOutputData(20, message.threadId);                      // threadId
      this.setOutputData(21, message.templateType || "");            // templateType
      this.setOutputData(22, message.processId || "");               // processId
      this.setOutputData(23, message.shadowGitHash || "");           // shadowGitHash
      this.setOutputData(24, message.remixPrompt);                   // remixPrompt
      this.setOutputData(25, message.activeFile || "");              // activeFile
      this.setOutputData(26, message.openedFiles || []);             // openedFiles

      // Trigger the event output at slot 0 (onTrigger)
      this.triggerSlot(0, message);

      // Send a confirmation message

    } catch (error) {
      console.error('OnMessageNode: Error in message handling:', error);
      // Still trigger with error
      // this.onMessage({ error: error.message });
    }
  }
}
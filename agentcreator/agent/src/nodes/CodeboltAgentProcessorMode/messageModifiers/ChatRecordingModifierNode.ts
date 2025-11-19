import { BaseChatRecordingModifierNode } from '@codebolt/agent-shared-nodes';
import { ChatRecordingModifier } from '@codebolt/agent/processor-pieces';
import * as fs from 'fs';
import * as path from 'path';

// Backend Chat Recording Modifier Node - actual implementation
export class ChatRecordingModifierNode extends BaseChatRecordingModifierNode {
  private modifier: ChatRecordingModifier;

  constructor() {
    super();
    this.modifier = new ChatRecordingModifier(this.getChatRecordingConfig() as any);
  }

  async onExecute() {
    const message = this.getInputData(0) as any;
    const customPath = this.getInputData(1) as string; // Optional custom path

    if (!message) {
      console.error('ChatRecordingModifierNode: No message input provided');
      this.setOutputData(1, false);
      return;
    }

    try {
      // Update modifier configuration with current node properties and custom path
      const config = this.getChatRecordingConfig();
      if (customPath) {
        config.recordingPath = customPath;
      }
      this.modifier = new ChatRecordingModifier(config as any);

      // Create a processed message object
      const processedMessage = {
        ...message,
        messages: message.messages || []
      };

      // Apply the modifier
      const result = await this.modifier.modify(message, processedMessage);

      // Determine the recording path and configuration
      const recordingPath = this.determineRecordingPath(config);
      const recordingConfig = {
        ...config,
        timestamp: new Date().toISOString(),
        messageRecorded: true
      };

      // Set outputs
      this.setOutputData(0, result);
      this.setOutputData(1, true);
      this.setOutputData(2, recordingPath);
      this.setOutputData(3, recordingConfig);

      // Trigger completion
      this.triggerSlot(0, null, null);

    } catch (error) {
      console.error('ChatRecordingModifierNode: Error recording message:', error);
      this.setOutputData(0, message); // Return original message on error
      this.setOutputData(1, false);
      this.setOutputData(2, null);
      this.setOutputData(3, null);
    }
  }

  // Determine the actual recording path
  private determineRecordingPath(config: any): string {
    const basePath = config.recordingPath;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    switch (config.recordingFormat) {
      case 'jsonl':
        return path.join(basePath, `chat-${timestamp}.jsonl`);
      case 'json':
        return path.join(basePath, `chat-${timestamp}.json`);
      case 'markdown':
        return path.join(basePath, `chat-${timestamp}.md`);
      default:
        return path.join(basePath, `chat-${timestamp}.jsonl`);
    }
  }
}
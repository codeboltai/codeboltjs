import { BaseAtFileProcessorModifierNode } from '@agent-creator/shared-nodes';
import { AtFileProcessorModifier } from '@codebolt/agent/processor-pieces';

// Backend @File Processor Modifier Node - actual implementation
export class AtFileProcessorModifierNode extends BaseAtFileProcessorModifierNode {
  private modifier: AtFileProcessorModifier;

  constructor() {
    super();
    this.modifier = new AtFileProcessorModifier(this.getAtFileProcessorConfig());
  }

  async onExecute() {
    const message = this.getInputData(0) as any;

    if (!message) {
      console.error('AtFileProcessorModifierNode: No message input provided');
      this.setOutputData(1, false);
      return;
    }

    try {
      // Update modifier configuration with current node properties
      this.modifier = new AtFileProcessorModifier(this.getAtFileProcessorConfig());

      // Create a processed message object
      const processedMessage = {
        ...message,
        messages: message.messages || []
      };

      // Apply the modifier
      const result = await this.modifier.modify(message, processedMessage);

      // Set outputs
      this.setOutputData(0, result);
      this.setOutputData(1, true);

      // Extract processed files information
      const { processedFiles, filePaths } = this.extractFileInformation(result);
      this.setOutputData(2, processedFiles);
      this.setOutputData(3, filePaths);

      // Trigger completion
      this.triggerSlot(0, null, null);

    } catch (error) {
      console.error('AtFileProcessorModifierNode: Error processing message:', error);
      this.setOutputData(0, message); // Return original message on error
      this.setOutputData(1, false);
      this.setOutputData(2, []);
      this.setOutputData(3, []);
    }
  }

  // Extract file processing information from the processed message
  private extractFileInformation(result: any): { processedFiles: any[]; filePaths: string[] } {
    try {
      const messages = result.messages || [];
      const fileContentMessages = messages.filter((msg: any) =>
        msg.role === 'system' && msg.content &&
        msg.content.includes('File Content:')
      );

      const processedFiles: any[] = [];
      const filePaths: string[] = [];

      for (const msg of fileContentMessages) {
        // Extract file path from content
        const pathMatch = msg.content.match(/File Content for:? (.+?)\n/);
        if (pathMatch && pathMatch[1]) {
          const filePath = pathMatch[1].trim();
          filePaths.push(filePath);

          // Extract file size estimation
          const contentLength = msg.content.length;
          const fileSizeBytes = contentLength; // Rough estimation

          processedFiles.push({
            path: filePath,
            content: msg.content,
            size: fileSizeBytes,
            timestamp: new Date().toISOString(),
            included: true
          });
        }
      }

      return {
        processedFiles: processedFiles,
        filePaths: filePaths
      };

    } catch (error) {
      console.error('Error extracting file information:', error);
      return {
        processedFiles: [],
        filePaths: []
      };
    }
  }
}
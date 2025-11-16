import { BaseDirectoryContextModifierNode } from '@agent-creator/shared-nodes';
import { DirectoryContextModifier } from '@codebolt/agent/processor-pieces';

// Backend Directory Context Modifier Node - actual implementation
export class DirectoryContextModifierNode extends BaseDirectoryContextModifierNode {
  private modifier: DirectoryContextModifier;

  constructor() {
    super();
    this.modifier = new DirectoryContextModifier(this.getDirectoryContextConfig());
  }

  async onExecute() {
    const message = this.getInputData(0) as any;

    if (!message) {
      console.error('DirectoryContextModifierNode: No message input provided');
      this.setOutputData(1, false);
      return;
    }

    try {
      // Update modifier configuration with current node properties
      this.modifier = new DirectoryContextModifier(this.getDirectoryContextConfig());

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

      // Extract directory structure and directories from the result
      const { directoryStructure, directories } = this.extractDirectoryInfo(result);
      this.setOutputData(2, directoryStructure);
      this.setOutputData(3, directories);

      // Trigger completion
      this.triggerSlot(0, null, null);

    } catch (error) {
      console.error('DirectoryContextModifierNode: Error processing message:', error);
      this.setOutputData(0, message); // Return original message on error
      this.setOutputData(1, false);
      this.setOutputData(2, null);
      this.setOutputData(3, []);
    }
  }

  // Extract directory information from the processed message
  private extractDirectoryInfo(result: any): { directoryStructure: any; directories: string[] } {
    try {
      const messages = result.messages || [];
      const contextMessage = messages.find((msg: any) =>
        msg.role === 'system' && msg.content &&
        msg.content.includes('Directory Structure:')
      );

      if (contextMessage && contextMessage.content) {
        // Extract directory structure from the content
        const content = contextMessage.content;
        const directories = this.extractDirectoryNames(content);

        return {
          directoryStructure: {
            content: content,
            timestamp: new Date().toISOString(),
            directories: directories
          },
          directories: directories
        };
      }

      return {
        directoryStructure: {
          content: 'No directory structure found',
          timestamp: new Date().toISOString(),
          directories: []
        },
        directories: []
      };

    } catch (error) {
      console.error('Error extracting directory info:', error);
      return {
        directoryStructure: {
          content: 'Error extracting directory structure',
          timestamp: new Date().toISOString(),
          directories: [],
          error: error
        },
        directories: []
      };
    }
  }

  // Extract directory names from the content
  private extractDirectoryNames(content: string): string[] {
    try {
      const lines = content.split('\n');
      const directories: string[] = [];

      for (const line of lines) {
        // Simple pattern matching for directory entries
        if (line.includes('├──') || line.includes('└──') || line.includes('│   ')) {
          const cleaned = line.replace(/[├─└│]/g, '').trim();
          if (cleaned && !cleaned.includes('.')) { // Likely a directory
            directories.push(cleaned);
          }
        }
      }

      return directories;

    } catch (error) {
      console.error('Error extracting directory names:', error);
      return [];
    }
  }
}
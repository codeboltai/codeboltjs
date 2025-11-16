import { BaseIdeContextModifierNode } from '@agent-creator/shared-nodes';
import { IdeContextModifier } from '@codebolt/agent/processor-pieces';

// Backend IDE Context Modifier Node - actual implementation
export class IdeContextModifierNode extends BaseIdeContextModifierNode {
  private modifier: IdeContextModifier;

  constructor() {
    super();
    this.modifier = new IdeContextModifier(this.getIdeContextConfig());
  }

  async onExecute() {
    const message = this.getInputData(0) as any;

    if (!message) {
      console.error('IdeContextModifierNode: No message input provided');
      this.setOutputData(1, false);
      return;
    }

    try {
      // Update modifier configuration with current node properties
      this.modifier = new IdeContextModifier(this.getIdeContextConfig());

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

      // Extract IDE context information
      const ideContext = this.extractIdeContext(result);
      this.setOutputData(2, ideContext);

      // Extract open files
      const openFiles = this.extractOpenFiles(result);
      this.setOutputData(3, openFiles);

      // Trigger completion
      this.triggerSlot(0, null, null);

    } catch (error) {
      console.error('IdeContextModifierNode: Error processing message:', error);
      this.setOutputData(0, message); // Return original message on error
      this.setOutputData(1, false);
      this.setOutputData(2, null);
      this.setOutputData(3, []);
    }
  }

  // Extract IDE context information from the processed message
  private extractIdeContext(result: any): any {
    try {
      const messages = result.messages || [];
      const contextMessage = messages.find((msg: any) =>
        msg.role === 'system' && msg.content &&
        msg.content.includes('IDE Context:')
      );

      if (contextMessage && contextMessage.content) {
        return {
          content: contextMessage.content,
          timestamp: new Date().toISOString(),
          includeOpenFiles: this.properties.includeOpenFiles,
          includeActiveFile: this.properties.includeActiveFile,
          includeCursorPosition: this.properties.includeCursorPosition,
          includeSelectedText: this.properties.includeSelectedText,
          maxOpenFiles: this.properties.maxOpenFiles
        };
      }

      return {
        content: 'No IDE context found',
        timestamp: new Date().toISOString(),
        includeOpenFiles: this.properties.includeOpenFiles,
        includeActiveFile: this.properties.includeActiveFile,
        includeCursorPosition: this.properties.includeCursorPosition,
        includeSelectedText: this.properties.includeSelectedText,
        maxOpenFiles: this.properties.maxOpenFiles
      };

    } catch (error) {
      console.error('Error extracting IDE context:', error);
      return {
        content: 'Error extracting IDE context',
        timestamp: new Date().toISOString(),
        error: error
      };
    }
  }

  // Extract open files from the processed message
  private extractOpenFiles(result: any): string[] {
    try {
      const messages = result.messages || [];
      const contextMessage = messages.find((msg: any) =>
        msg.role === 'system' && msg.content &&
        msg.content.includes('Open Files:')
      );

      if (contextMessage && contextMessage.content) {
        // Simple parsing to extract file paths from content
        const content = contextMessage.content;
        const fileMatches = content.match(/\b[\w\-\/\\]+\.(js|ts|jsx|tsx|py|java|cpp|c|h|cs|go|rs|php|rb|swift|kt|scala|md|txt|json|yaml|yml|xml|html|css|scss|less|sql|sh|bat|ps1)\b/gi);

        return fileMatches || [];
      }

      return [];

    } catch (error) {
      console.error('Error extracting open files:', error);
      return [];
    }
  }
}
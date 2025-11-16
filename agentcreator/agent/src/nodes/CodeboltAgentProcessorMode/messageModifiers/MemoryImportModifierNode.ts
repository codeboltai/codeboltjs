import { BaseMemoryImportModifierNode } from '@agent-creator/shared-nodes';
import { MemoryImportModifier } from '@codebolt/agent/processor-pieces';

// Backend Memory Import Modifier Node - actual implementation
export class MemoryImportModifierNode extends BaseMemoryImportModifierNode {
  private modifier: MemoryImportModifier;

  constructor() {
    super();
    this.modifier = new MemoryImportModifier(this.getMemoryImportConfig());
  }

  async onExecute() {
    const message = this.getInputData(0) as any;

    if (!message) {
      console.error('MemoryImportModifierNode: No message input provided');
      this.setOutputData(1, false);
      return;
    }

    try {
      // Update modifier configuration with current node properties
      this.modifier = new MemoryImportModifier(this.getMemoryImportConfig());

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

      // Extract memory import information
      const { importedMemories, memoryFiles } = this.extractMemoryInformation(result);
      this.setOutputData(2, importedMemories);
      this.setOutputData(3, memoryFiles);

      // Trigger completion
      this.triggerSlot(0, null, null);

    } catch (error) {
      console.error('MemoryImportModifierNode: Error processing message:', error);
      this.setOutputData(0, message); // Return original message on error
      this.setOutputData(1, false);
      this.setOutputData(2, []);
      this.setOutputData(3, []);
    }
  }

  // Extract memory import information from the processed message
  private extractMemoryInformation(result: any): { importedMemories: any[]; memoryFiles: string[] } {
    try {
      const messages = result.messages || [];
      const memoryMessages = messages.filter((msg: any) =>
        msg.role === 'system' && msg.content &&
        msg.content.includes('Memory Import:')
      );

      const importedMemories: any[] = [];
      const memoryFiles: string[] = [];

      for (const msg of memoryMessages) {
        // Extract file path from memory content
        const pathMatch = msg.content.match(/Memory Import from:? (.+?)\n/);
        if (pathMatch && pathMatch[1]) {
          const filePath = pathMatch[1].trim();
          memoryFiles.push(filePath);

          // Extract memory content size
          const contentLines = msg.content.split('\n');
          const actualContent = contentLines.slice(1).join('\n');

          importedMemories.push({
            path: filePath,
            content: actualContent,
            size: actualContent.length,
            timestamp: new Date().toISOString(),
            imported: true
          });
        }
      }

      return {
        importedMemories: importedMemories,
        memoryFiles: memoryFiles
      };

    } catch (error) {
      console.error('Error extracting memory information:', error);
      return {
        importedMemories: [],
        memoryFiles: []
      };
    }
  }
}
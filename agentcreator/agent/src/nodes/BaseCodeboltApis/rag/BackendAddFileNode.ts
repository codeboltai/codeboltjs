import { BaseAddFileNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class BackendAddFileNode extends BaseAddFileNode {
  constructor() {
    super();
  }

  async onAction() {
    try {
      const rawFilename = this.properties.filename ?? this.getInputData(1);
      const rawFilePath = this.properties.filePath ?? this.getInputData(2);

      const filename = typeof rawFilename === 'string' ? rawFilename.trim() : String(rawFilename ?? '').trim();
      const filePath = typeof rawFilePath === 'string' ? rawFilePath.trim() : String(rawFilePath ?? '').trim();

      if (!filename || !filePath) {
        throw new Error('Filename and filePath are required');
      }

      // Call the RAG API to add the file
      const result = await codebolt.rag.add_file(filename, filePath);

      // Set outputs
      this.setOutputData(1, result);
      this.setOutputData(2, true); // success
      this.triggerSlot(0, null, null); // Trigger completed output
    } catch (error) {
      console.error('Error in BackendAddFileNode:', error);
      this.setOutputData(1, { error: error.message });
      this.setOutputData(2, false); // failure
      this.triggerSlot(0, null, null); // Still trigger completed output
    }
  }
}

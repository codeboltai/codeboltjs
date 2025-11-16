import { BaseRetrieveRelatedKnowledgeNode } from '../../../../../shared-nodes/src/nodes/BaseCodeboltApis/rag/BaseRetrieveRelatedKnowledgeNode';

export class BackendRetrieveRelatedKnowledgeNode extends BaseRetrieveRelatedKnowledgeNode {
  constructor() {
    super();
  }

  async onAction() {
    try {
      const query = this.properties.query || this.getInputData(1);
      const filename = this.properties.filename || this.getInputData(2);
      const maxResults = this.properties.maxResults || 5;

      if (!query) {
        throw new Error('Query is required');
      }

      // Call the RAG API to retrieve related knowledge
      const result = await codebolt.rag.retrieve_related_knowledge(query, filename);
      
      // If maxResults is specified, limit the results
      const limitedResults = maxResults && result.length > maxResults 
        ? result.slice(0, maxResults) 
        : result;
      
      // Set outputs
      this.setOutputData(1, limitedResults);
      this.setOutputData(2, true); // success
      this.triggerSlot(0, null, null); // Trigger completed output
    } catch (error) {
      console.error('Error in BackendRetrieveRelatedKnowledgeNode:', error);
      this.setOutputData(1, { error: error.message });
      this.setOutputData(2, false); // failure
      this.triggerSlot(0, null, null); // Still trigger completed output
    }
  }
}

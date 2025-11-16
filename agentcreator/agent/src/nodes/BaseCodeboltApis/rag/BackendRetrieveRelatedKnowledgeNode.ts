import { BaseRetrieveRelatedKnowledgeNode } from  '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class BackendRetrieveRelatedKnowledgeNode extends BaseRetrieveRelatedKnowledgeNode {
  constructor() {
    super();
  }

  async onAction() {
    try {
      const rawQuery = this.properties.query ?? this.getInputData(1);
      const rawFilename = this.properties.filename ?? this.getInputData(2);
      const rawMaxResults = this.properties.maxResults ?? this.getInputData(3) ?? 5;

      const query = typeof rawQuery === 'string' ? rawQuery.trim() : String(rawQuery ?? '').trim();
      const filename = rawFilename === null || rawFilename === undefined
        ? undefined
        : (typeof rawFilename === 'string' ? rawFilename.trim() : String(rawFilename).trim());
      const maxResults = Number(rawMaxResults);

      if (!query) {
        throw new Error('Query is required');
      }

      // Call the RAG API to retrieve related knowledge
      const result = await codebolt.rag.retrieve_related_knowledge(query, filename);
      const resultsArray = Array.isArray(result) ? result : [];
      
      // If maxResults is specified, limit the results
      const limitedResults = Number.isFinite(maxResults) && maxResults > 0 && resultsArray.length > maxResults
        ? resultsArray.slice(0, maxResults)
        : resultsArray;
      
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

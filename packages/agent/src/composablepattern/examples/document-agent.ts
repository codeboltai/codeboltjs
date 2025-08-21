/**
 * @fileoverview Document Agent Example
 * @description Example showing how to create a document processing agent using the composable pattern
 */

import { 
  ComposableAgent, 
  createTool, 
  MDocument,
  createInMemoryMemory,
  z 
} from '../index';

// Create document processing tool
export const processDocumentTool = createTool({
  id: 'process-document',
  description: 'Process and analyze a document',
  inputSchema: z.object({
    content: z.string().describe('Document content to process'),
    operation: z.enum(['summarize', 'extract_keywords', 'chunk', 'analyze']).describe('Operation to perform')
  }),
  outputSchema: z.object({
    result: z.string(),
    metadata: z.record(z.any()).optional()
  }),
  execute: async ({ context }) => {
    const doc = MDocument.fromText(context.content);
    
    switch (context.operation) {
      case 'summarize':
        // Simple summarization (in real usage, you might use an LLM for this)
        const words = context.content.split(/\s+/);
        const summary = words.slice(0, 50).join(' ') + (words.length > 50 ? '...' : '');
        return {
          result: `Summary: ${summary}`,
          metadata: doc.getMetadata()
        };
        
      case 'extract_keywords':
        // Simple keyword extraction
        const keywordPattern = /\b[A-Z][a-z]+\b/g;
        const keywords = [...new Set(context.content.match(keywordPattern) || [])].slice(0, 10);
        return {
          result: `Keywords: ${keywords.join(', ')}`,
          metadata: { keywordCount: keywords.length }
        };
        
      case 'chunk':
        const chunks = doc.chunk({ size: 500, strategy: 'paragraph' });
        return {
          result: `Document chunked into ${chunks.length} pieces`,
          metadata: { chunkCount: chunks.length, chunks: chunks.slice(0, 3) }
        };
        
      case 'analyze':
        const metadata = doc.getMetadata();
        return {
          result: `Document analysis: ${metadata.wordCount} words, ${metadata.charCount} characters`,
          metadata
        };
        
      default:
        return { result: 'Unknown operation' };
    }
  },
});

// Create a document from sample text
const doc = MDocument.fromText(`
  Climate change poses significant challenges to global agriculture.
  Rising temperatures and changing precipitation patterns affect crop yields.
  Farmers worldwide are adapting their practices to mitigate these impacts.
  
  Sustainable farming techniques, including crop rotation and precision agriculture,
  are becoming increasingly important. Technology plays a crucial role in
  monitoring soil conditions and optimizing resource usage.
`);

// Create document agent
export const documentAgent = new ComposableAgent({
  name: 'Document Processing Agent',
  instructions: `
    You are a helpful document processing assistant that can analyze, summarize, and extract information from documents.
    
    Your capabilities include:
    - Summarizing document content
    - Extracting keywords and key topics
    - Chunking documents for processing
    - Analyzing document structure and metadata
    
    Use the process-document tool to perform these operations.
  `,
  model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
  tools: { processDocumentTool },
  memory: createInMemoryMemory()
});

// Example usage
export async function runDocumentExample() {
  try {
    console.log('Running document processing agent example...');
    
    const result = await documentAgent.execute(
      `Please analyze this document about climate change and agriculture: "${doc.getContent()}"`
    );
    
    if (result.success) {
      console.log('Agent response:', result.message);
    } else {
      console.error('Agent failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Example failed:', error);
    throw error;
  }
}

// Run example if this file is executed directly
if (require.main === module) {
  runDocumentExample().catch(console.error);
}

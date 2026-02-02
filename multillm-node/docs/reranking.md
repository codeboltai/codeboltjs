# Document Reranking

Reorder search results or documents by relevance to a query using a unified API.

## Overview

Multillm provides **consistent reranking** to improve search and retrieval results. The API works identically across providers.

### Supported Providers

| Provider | Model | Use Cases |
|----------|-------|-----------|
| CodeBolt AI | Various | RAG, search refinement |

## Quick Start

```typescript
import Multillm from '@arrowai/multillm';

const llm = new Multillm('codeboltai', null, null, process.env.CODEBOLT_API_KEY);

const response = await llm.rerank({
  query: 'machine learning algorithms',
  documents: [
    'Introduction to neural networks',
    'Random forests explained',
    'How to bake a cake',
    'Support vector machines tutorial'
  ],
  top_n: 3
});

console.log(response.results);
// Output:
// [
//   { index: 0, relevance_score: 0.95, document: { text: 'Introduction to neural networks' } },
//   { index: 1, relevance_score: 0.88, document: { text: 'Random forests explained' } },
//   { index: 3, relevance_score: 0.82, document: { text: 'Support vector machines tutorial' } }
// ]
// Notice: index 2 (cake recipe) is excluded - low relevance
```

## API Reference

### `rerank(options)`

Rerank documents by relevance to a query.

```typescript
interface RerankOptions {
  query: string;                                          // Required
  documents: string[] | Array<{ text: string; [key: string]: any }>;  // Required
  model?: string;                                       // Model name
  top_n?: number;                                        // Number of results
  return_documents?: boolean;                             // Include documents in response
  max_chunks_per_doc?: number;                           // Max chunks per document
}

interface RerankResponse {
  id?: string;                                           // Request ID
  results: RerankResult[];                               // Reranked results
  meta?: {
    api_version?: { version: string };
    billed_units?: { search_units: number };
  };
}

interface RerankResult {
  index: number;                                         // Original index in input array
  relevance_score: number;                                // 0-1, higher is more relevant
  document?: { text: string };                            // Document text (if return_documents: true)
}
```

## Basic Reranking

```typescript
const documents = [
  'Python is a programming language',
  'JavaScript runs in browsers',
  'Rust is a systems language',
  'Java is object-oriented'
];

const query = 'Which languages are good for web development?';

const response = await llm.rerank({
  query,
  documents,
  top_n: 2
});

response.results.forEach((result, i) => {
  console.log(`Rank ${i + 1}: Score ${result.relevance_score.toFixed(3)}`);
  console.log(`  ${documents[result.index]}`);
});
```

## RAG Pipeline Integration

Combine retrieval with reranking for better results:

```typescript
async function ragPipeline(query: string) {
  const llm = new Multillm('codeboltai', null, null, process.env.CODEBOLT_API_KEY);
  
  // Step 1: Retrieve documents (using vector DB, search API, etc.)
  const retrievedDocuments = await vectorDatabase.search(query, topK: 20);
  
  // Step 2: Rerank by relevance
  const reranked = await llm.rerank({
    query,
    documents: retrievedDocuments.map(d => d.text),
    top_n: 5  // Top 5 most relevant
  });
  
  // Step 3: Use reranked results for generation
  const context = reranked.results
    .map(r => retrievedDocuments[r.index].text)
    .join('\n\n');
  
  const chatLlm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);
  const response = await chatLlm.createCompletion({
    messages: [{
      role: 'system',
      content: 'Answer the question using the provided context.'
    }, {
      role: 'user',
      content: `Context:\n${context}\n\nQuestion: ${query}`
    }]
  });
  
  return {
    rerankedDocuments: reranked.results,
    answer: response.choices[0].message.content
  };
}
```

## Large Document Sets

Rerank many documents efficiently:

```typescript
// Generate synthetic documents
const documents = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  text: `Document ${i}: This is the content of document number ${i}. It contains various information about topic ${i % 10}.`
}));

const query = 'Which documents discuss topic 5?';

const response = await llm.rerank({
  query,
  documents: documents.map(d => d.text),
  top_n: 10
});

console.log('Top 10 relevant documents:');
response.results.forEach((result, i) => {
  console.log(`${i + 1}. Document ${result.index} - Score: ${result.relevance_score.toFixed(3)}`);
  console.log(`   ${documents[result.index].text}`);
});
```

## Returning Documents

Get full documents in response:

```typescript
const documents = [
  { text: 'First document', id: 'doc1', metadata: { category: 'tech' } },
  { text: 'Second document', id: 'doc2', metadata: { category: 'news' } },
  { text: 'Third document', id: 'doc3', metadata: { category: 'tech' } }
];

const response = await llm.rerank({
  query: 'technology news',
  documents,
  top_n: 2,
  return_documents: true  // Include full documents
});

response.results.forEach(result => {
  console.log('Document:', result.document);
  // Output: Full document object with metadata
});
```

## Document Objects

Use rich document objects:

```typescript
const documents = [
  {
    text: 'Python is great for data science',
    url: 'https://example.com/python',
    author: 'John Doe',
    date: '2024-01-01'
  },
  {
    text: 'JavaScript is essential for web development',
    url: 'https://example.com/javascript',
    author: 'Jane Smith',
    date: '2024-01-02'
  }
];

const query = 'Which language is best for web development?';

const response = await llm.rerank({
  query,
  documents: documents.map(d => d.text),
  top_n: 2
});

// Use original indices to get full data
const topResults = response.results.map(r => ({
  relevance: r.relevance_score,
  document: documents[r.index]
}));

console.log(topResults);
```

## Query Variations

Compare different query formulations:

```typescript
const documents = [
  'JavaScript framework comparison',
  'React vs Vue vs Angular',
  'Best frontend libraries',
  'Web development tools'
];

const queries = [
  'Which is the best JS framework?',
  'Compare React, Vue, and Angular',
  'Frontend framework recommendation'
];

const results = await Promise.all(
  queries.map(query =>
    llm.rerank({
      query,
      documents,
      top_n: 2
    }).then(response => ({
      query,
      topDoc: response.results[0]
    }))
  )
);

results.forEach(({ query, topDoc }) => {
  console.log(`Query: "${query}"`);
  console.log(`  Top result: ${documents[topDoc.index]}`);
  console.log(`  Score: ${topDoc.relevance_score.toFixed(3)}`);
});
```

## Hybrid Search

Combine keyword and semantic search:

```typescript
async function hybridSearch(query: string) {
  // Step 1: Keyword search
  const keywordResults = await fullTextSearch(query, limit: 50);
  
  // Step 2: Semantic search
  const queryEmbedding = await llm.createEmbedding({
    input: query,
    model: 'text-embedding-3-small'
  });
  const semanticResults = await vectorDatabase.search(
    queryEmbedding.data[0].embedding,
    topK: 50
  );
  
  // Step 3: Combine and deduplicate
  const combined = deduplicate([
    ...keywordResults,
    ...semanticResults
  ]);
  
  // Step 4: Rerank combined results
  const reranked = await llm.rerank({
    query,
    documents: combined.map(d => d.text),
    top_n: 10
  });
  
  return reranked.results.map(r => combined[r.index]);
}
```

## Use Cases

### 1. Search Engine

```typescript
async function searchEngine(query: string) {
  const llm = new Multillm('codeboltai', null, null, process.env.CODEBOLT_API_KEY);
  
  // Retrieve from index
  const allDocuments = await documentIndex.search(query, limit: 100);
  
  // Rerank by relevance
  const reranked = await llm.rerank({
    query,
    documents: allDocuments.map(d => d.text),
    top_n: 10
  });
  
  // Return reranked results with metadata
  return reranked.results.map(r => ({
    document: allDocuments[r.index],
    score: r.relevance_score
  }));
}
```

### 2. Code Search

```typescript
async function searchCode(query: string) {
  const llm = new Multillm('codeboltai', null, null, process.env.CODEBOLT_API_KEY);
  
  // Search code repository
  const codeSnippets = await codeIndex.search(query, limit: 50);
  
  // Rerank by relevance
  const reranked = await llm.rerank({
    query,
    documents: codeSnippets.map(s => `${s.function}: ${s.description}\n${s.code}`),
    top_n: 5
  });
  
  return reranked.results.map(r => codeSnippets[r.index]);
}
```

### 3. FAQ System

```typescript
const faqs = [
  'How do I reset my password?',
  'What is the refund policy?',
  'How can I contact support?',
  'Where can I find my order history?',
  // ... more FAQs
];

async function findAnswer(userQuery: string) {
  const llm = new Multillm('codeboltai', null, null, process.env.CODEBOLT_API_KEY);
  
  const reranked = await llm.rerank({
    query: userQuery,
    documents: faqs,
    top_n: 1  // Get single best match
  });
  
  const bestMatch = reranked.results[0];
  
  if (bestMatch.relevance_score > 0.7) {
    return {
      question: faqs[bestMatch.index],
      confidence: bestMatch.relevance_score,
      found: true
    };
  }
  
  return {
    question: null,
    confidence: bestMatch.relevance_score,
    found: false,
    message: 'No matching FAQ found'
  };
}
```

### 4. Document Similarity

```typescript
async function findSimilarDocuments(
  document: string,
  documentCollection: string[]
) {
  const llm = new Multillm('codeboltai', null, null, process.env.CODEBOLT_API_KEY);
  
  const response = await llm.rerank({
    query: document,
    documents: documentCollection,
    top_n: 5
  });
  
  return response.results.map(r => ({
    document: documentCollection[r.index],
    similarity: r.relevance_score
  }));
}
```

### 5. Multi-Turn Search Refinement

```typescript
async function refinedSearch(initialQuery: string) {
  const llm = new Multillm('codeboltai', null, null, process.env.CODEBOLT_API_KEY);
  
  let query = initialQuery;
  let results = [];
  
  for (let round = 0; round < 3; round++) {
    // Get initial results
    const retrieved = await searchIndex(query, limit: 50);
    
    // Rerank
    const reranked = await llm.rerank({
      query,
      documents: retrieved.map(d => d.text),
      top_n: 10
    });
    
    results = reranked.results;
    
    // Ask if user wants to refine
    const topDocs = reranked.results.slice(0, 3).map(r => retrieved[r.index].text);
    const refinement = await askUserRefinement(query, topDocs);
    
    if (!refinement) break;  // User satisfied
    
    query = refinement;  // Refine query
  }
  
  return results.map(r => ({
    document: retrieved[r.index],
    relevance_score: r.relevance_score
  }));
}
```

## Best Practices

1. **Context**: Provide enough context in queries
2. **Document Count**: Balance between recall and precision (top_n: 10-20)
3. **Quality**: Ensure documents are well-structured
4. **Testing**: Test different queries and top_n values
5. **Caching**: Cache reranking results for repeated queries
6. **Metrics**: Monitor reranking quality and performance

## Performance Optimization

```typescript
// Bad: Re-rerank on each user query
async function search(query: string) {
  const allDocs = await getAllDocuments();  // Expensive
  const reranked = await llm.rerank({
    query,
    documents: allDocs,
    top_n: 10
  });
  return reranked.results;
}

// Good: Pre-rerank, then filter
const cachedReranked = await preRerankDocuments();

async function search(query: string) {
  // Fast filter first
  const filtered = keywordSearch(query, cachedReranked);
  
  // Re-rank only filtered results
  const reranked = await llm.rerank({
    query,
    documents: filtered.map(d => d.text),
    top_n: 10
  });
  return reranked.results;
}
```

## Error Handling

```typescript
try {
  const response = await llm.rerank({
    query: 'Search query',
    documents: ['doc1', 'doc2'],
    top_n: 5
  });
} catch (error) {
  if (error.message.includes('empty_query')) {
    console.error('Query cannot be empty');
  } else if (error.message.includes('empty_documents')) {
    console.error('Documents array cannot be empty');
  } else if (error.message.includes('rate_limit')) {
    console.error('Rate limited, retrying...');
    // Implement retry logic
  } else if (error.message.includes('invalid_top_n')) {
    console.error('top_n must be between 1 and document count');
  }
}
```

## Cost Considerations

1. **Document Count**: Rerank larger batches for better cost efficiency
2. **top_n Selection**: Lower values = faster and cheaper
3. **Caching**: Cache reranking results for repeated queries
4. **Hybrid Approach**: Use keyword filtering to reduce document count before reranking

```typescript
// Cost-effective: Reduce document count before reranking
const keywordResults = await keywordSearch(query, limit: 50);  // Fast, cheap
const reranked = await llm.rerank({
  query,
  documents: keywordResults.map(d => d.text),
  top_n: 10
});
```

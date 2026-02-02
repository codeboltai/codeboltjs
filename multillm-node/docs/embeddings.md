# Embeddings

Convert text into vector representations (embeddings) for semantic understanding, similarity search, and clustering.

## Overview

Multillm provides a **unified embeddings API** that works identically across all supported providers. Simply switch providers by changing one parameter.

### Supported Providers

| Provider | Models | Dimensions | Input Limit |
|----------|---------|-------------|--------------|
| OpenAI | text-embedding-3-small/large, ada-002 | 3072/1536 | 8191 tokens |
| Mistral | mistral-embed | 1024 | 8k tokens |
| Ollama | nomic-embed-text, mxbai-embed-large | Varies | Varies |
| CodeBolt AI | Various | Varies | Varies |
| ZAi | Various | Varies | Varies |

## Quick Start

```typescript
import Multillm from '@arrowai/multillm';

// Works with any provider
const llm = new Multillm('openai', null, null, process.env.OPENAI_API_KEY);

const response = await llm.createEmbedding({
  input: 'Hello, world!',
  model: 'text-embedding-3-small'
});

console.log(response.data[0].embedding);
// Output: [0.0023, -0.0152, 0.0089, ...]
console.log(response.usage);
// Output: { prompt_tokens: 2, total_tokens: 2 }
```

## API Reference

### `createEmbedding(options)`

Create embeddings for text input.

```typescript
interface EmbeddingOptions {
  input: string | string[];        // Text or array of texts
  model?: string;                   // Model name (optional, uses provider default)
  encoding_format?: 'float' | 'base64';  // Output format
  dimensions?: number;               // Truncate to specific dimensions (if supported)
  user?: string;                   // User identifier (OpenAI)
}

interface EmbeddingResponse {
  object: 'list';
  data: Array<{
    index: number;
    embedding: number[] | string;  // Vector or base64 string
    object: 'embedding'
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}
```

## Single Text Embedding

```typescript
const response = await llm.createEmbedding({
  input: 'The quick brown fox',
  model: 'text-embedding-3-small'
});

const embedding = response.data[0].embedding;
console.log('Vector length:', embedding.length);  // 1536 for text-embedding-3-small
```

## Batch Embeddings

Process multiple texts efficiently:

```typescript
const response = await llm.createEmbedding({
  input: [
    'The cat sat on the mat',
    'The dog chased the cat',
    'Birds are flying'
  ],
  model: 'text-embedding-3-small'
});

console.log(response.data.length);  // 3 embeddings
console.log(response.data[0].index);  // 0
console.log(response.data[1].index);  // 1
console.log(response.data[2].index);  // 2
```

## Similarity Search

Calculate similarity between text using cosine similarity:

```typescript
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Get embeddings
const [emb1, emb2] = await Promise.all([
  llm.createEmbedding({ input: 'programming', model: 'text-embedding-3-small' }),
  llm.createEmbedding({ input: 'coding', model: 'text-embedding-3-small' })
]);

// Calculate similarity
const similarity = cosineSimilarity(
  emb1.data[0].embedding as number[],
  emb2.data[0].embedding as number[]
);

console.log('Similarity:', similarity);  // High value (>0.8) means very similar
```

## Semantic Search Pipeline

Build a semantic search system:

```typescript
import Multillm from '@arrowai/multillm';

class SemanticSearch {
  private llm: any;
  private documents: Array<{ text: string; embedding: number[] }> = [];

  constructor(apiKey: string) {
    this.llm = new Multillm('openai', null, null, apiKey);
  }

  // Add document and compute embedding
  async addDocument(text: string) {
    const response = await this.llm.createEmbedding({
      input: text,
      model: 'text-embedding-3-small'
    });
    
    this.documents.push({
      text,
      embedding: response.data[0].embedding as number[]
    });
  }

  // Find most similar documents
  async search(query: string, topK: number = 3) {
    const queryEmbedding = await this.llm.createEmbedding({
      input: query,
      model: 'text-embedding-3-small'
    });

    const similarities = this.documents.map(doc => ({
      doc,
      score: cosineSimilarity(
        queryEmbedding.data[0].embedding as number[],
        doc.embedding
      )
    }));

    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

// Usage
const search = new SemanticSearch(process.env.OPENAI_API_KEY);

// Index documents
await search.addDocument('JavaScript is a programming language');
await search.addDocument('Python is popular for data science');
await search.addDocument('Rust is a systems programming language');

// Search
const results = await search.search('Which language is for data science?');
results.forEach(result => {
  console.log(`Score: ${result.score.toFixed(3)} - ${result.doc.text}`);
});
// Output:
// Score: 0.856 - Python is popular for data science
// Score: 0.723 - JavaScript is a programming language
// Score: 0.612 - Rust is a systems programming language
```

## Custom Dimensions

Some providers support dimension reduction:

```typescript
const response = await llm.createEmbedding({
  input: 'Text to embed',
  model: 'text-embedding-3-large',
  dimensions: 512  // Truncate to 512 dimensions
});

console.log((response.data[0].embedding as number[]).length);  // 512
```

## Base64 Encoding

Use base64 for transmission or storage:

```typescript
const response = await llm.createEmbedding({
  input: 'Text to embed',
  encoding_format: 'base64'
});

const base64Embedding = response.data[0].embedding as string;
console.log(base64Embedding);
// Output: "AAAAIG0..." (base64 encoded float array)
```

## Switching Providers

Same code works with different providers:

```typescript
const texts = ['Hello world', 'Goodbye world'];

// OpenAI
const openai = new Multillm('openai', null, null, process.env.OPENAI_API_KEY);
const openaiEmbeddings = await openai.createEmbedding({
  input: texts,
  model: 'text-embedding-3-small'
});

// Mistral
const mistral = new Multillm('mistral', null, null, process.env.MISTRAL_API_KEY);
const mistralEmbeddings = await mistral.createEmbedding({
  input: texts,
  model: 'mistral-embed'
});

// Ollama (local!)
const ollama = new Multillm('ollama', null, null, null, 'http://localhost:11434');
const ollamaEmbeddings = await ollama.createEmbedding({
  input: texts,
  model: 'nomic-embed-text'
});

// All return the same structure
console.log(openaiEmbeddings.data[0].embedding);  // [0.1, 0.2, ...]
console.log(mistralEmbeddings.data[0].embedding);  // [0.3, 0.4, ...]
console.log(ollamaEmbeddings.data[0].embedding);   // [0.5, 0.6, ...]
```

## Provider-Specific Details

### OpenAI

**Models:**
- `text-embedding-3-small` - 1536 dimensions, fastest, cheapest
- `text-embedding-3-large` - 3072 dimensions, highest quality
- `text-embedding-ada-002` - 1536 dimensions, legacy

**Features:**
- Custom dimensions (truncate)
- Base64 encoding
- User tracking

### Mistral

**Models:**
- `mistral-embed` - 1024 dimensions

**Features:**
- Fast inference
- Lower cost

### Ollama

**Models:**
- `nomic-embed-text` - 768 dimensions
- `mxbai-embed-large` - 1024 dimensions
- Any embedding model you install

**Setup:**
```bash
# Install embedding model
ollama pull nomic-embed-text

# Run Ollama
ollama serve
```

### CodeBolt AI / ZAi

Custom embedding models with varying dimensions and features.

## Use Cases

### 1. Document Retrieval (RAG)

```typescript
// Embed query
const queryEmbedding = await llm.createEmbedding({
  input: userQuery,
  model: 'text-embedding-3-small'
});

// Find similar documents in vector database
const results = await vectorDatabase.search(
  queryEmbedding.data[0].embedding,
  topK: 5
);
```

### 2. Clustering

```typescript
const documents = ['text1', 'text2', 'text3', 'text4'];

// Get embeddings
const embeddings = await llm.createEmbedding({
  input: documents,
  model: 'text-embedding-3-small'
});

// Cluster using K-means or similar algorithm
const clusters = kMeans(
  embeddings.data.map(d => d.embedding),
  k: 2
);
```

### 3. Classification

```typescript
// Classify by nearest label
const labels = {
  'technical': await llm.createEmbedding({
    input: 'Technical documentation',
    model: 'text-embedding-3-small'
  }),
  'casual': await llm.createEmbedding({
    input: 'Casual conversation',
    model: 'text-embedding-3-small'
  })
};

const textEmbedding = await llm.createEmbedding({
  input: 'How do I fix this bug?',
  model: 'text-embedding-3-small'
});

// Find closest label
const closest = Object.entries(labels)
  .sort(([, a], [, b]) => {
    const simA = cosineSimilarity(
      textEmbedding.data[0].embedding as number[],
      a.data[0].embedding as number[]
    );
    const simB = cosineSimilarity(
      textEmbedding.data[0].embedding as number[],
      b.data[0].embedding as number[]
    );
    return simB - simA;
  })[0];

console.log('Classification:', closest[0]);  // 'technical'
```

### 4. Recommendations

```typescript
// User preferences as embedding
const userEmbedding = await llm.createEmbedding({
  input: 'I like sci-fi movies and indie games',
  model: 'text-embedding-3-small'
});

// Item descriptions as embeddings
const items = await Promise.all([
  llm.createEmbedding({ input: 'Cyberpunk 2077 - sci-fi RPG', model: 'text-embedding-3-small' }),
  llm.createEmbedding({ input: 'The Witness - puzzle game', model: 'text-embedding-3-small' }),
  llm.createEmbedding({ input: 'Call of Duty - shooter', model: 'text-embedding-3-small' })
]);

// Recommend most similar
const recommendations = items
  .map(item => ({
    item,
    score: cosineSimilarity(
      userEmbedding.data[0].embedding as number[],
      item.data[0].embedding as number[]
    )
  }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 3);

console.log('Recommended:', recommendations);
```

## Cost Optimization

1. **Batch Processing**: Process multiple texts in one call
2. **Smaller Models**: Use `text-embedding-3-small` instead of `large`
3. **Custom Dimensions**: Reduce dimensions if acceptable
4. **Caching**: Cache embeddings for static text
5. **Provider Selection**: Choose provider based on cost vs quality needs

```typescript
// Bad: Separate calls
const e1 = await llm.createEmbedding({ input: 'text1' });
const e2 = await llm.createEmbedding({ input: 'text2' });
const e3 = await llm.createEmbedding({ input: 'text3' });

// Good: Batch call
const response = await llm.createEmbedding({
  input: ['text1', 'text2', 'text3']
});
```

## Best Practices

1. **Consistent Models**: Use the same model for all embeddings in a system
2. **Preprocessing**: Clean text (lowercase, remove special chars) for consistency
3. **Normalization**: Normalize vectors before comparison
4. **Batch Size**: Process 100-1000 texts per batch for efficiency
5. **Dimension Choice**: Balance between quality and storage cost
6. **Monitoring**: Track embedding generation costs and latency

## Error Handling

```typescript
try {
  const response = await llm.createEmbedding({
    input: 'Text to embed'
  });
} catch (error) {
  if (error.message.includes('context_length')) {
    // Text too long, split and batch
    console.error('Input too long, split into smaller chunks');
  } else if (error.message.includes('rate_limit')) {
    // Rate limited, retry with backoff
    console.error('Rate limited, retrying...');
  }
}
```

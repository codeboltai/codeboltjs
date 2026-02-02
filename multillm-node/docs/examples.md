# Code Examples

Comprehensive examples for all Multillm features.

## Table of Contents

- [Getting Started](#getting-started)
- [Chat Completions](#chat-completions)
- [Streaming](#streaming)
- [Tool Calling](#tool-calling)
- [Embeddings](#embeddings)
- [Image Generation](#image-generation)
- [Speech Generation](#speech-generation)
- [Audio Transcription](#audio-transcription)
- [Multimodal Content](#multimodal-content)
- [Reasoning Models](#reasoning-models)
- [Document Reranking](#document-reranking)
- [Caching](#caching)
- [Error Handling](#error-handling)
- [UI Streaming](#ui-streaming)

---

## Getting Started

### Installation & Setup

```bash
# Install
npm install @arrowai/multillm

# Create .env file
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DEEPSEEK_API_KEY=sk-...
# ... see .env.example
```

### Basic Completion

```typescript
import Multillm from '@arrowai/multillm';

const llm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Hello, world!' }]
});

console.log(response.choices[0].message.content);
```

### Multi-turn Conversation

```typescript
const messages = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'What is 2+2?' },
  { role: 'assistant', content: '2+2 equals 4.' },
  { role: 'user', content: 'What about 3+3?' }
];

const response = await llm.createCompletion({ messages });
console.log(response.choices[0].message.content);
// Output: "3+3 equals 6."
```

---

## Chat Completions

### System Prompt

```typescript
const response = await llm.createCompletion({
  messages: [
    {
      role: 'system',
      content: 'You are a coding assistant. Provide clean, well-commented code.'
    },
    {
      role: 'user',
      content: 'Write a function to reverse a string in JavaScript.'
    }
  ]
});
```

### Temperature Control

```typescript
const responses = await Promise.all([
  llm.createCompletion({
    messages: [{ role: 'user', content: 'Random word' }],
    temperature: 0.0  // More deterministic
  }),
  llm.createCompletion({
    messages: [{ role: 'user', content: 'Random word' }],
    temperature: 1.0  // More creative
  })
]);

console.log('Low temp:', responses[0].choices[0].message.content);
console.log('High temp:', responses[1].choices[0].message.content);
```

### Max Tokens Limit

```typescript
const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Write a short summary' }],
  max_tokens: 50  // Limit response length
});

console.log(response.choices[0].message.content);
```

### Different Models

```typescript
// Try different models for same prompt
const models = ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];
const prompt = 'Explain quantum computing.';

for (const model of models) {
  const llm = new Multillm('openai', model, null, process.env.OPENAI_API_KEY);
  const response = await llm.createCompletion({
    messages: [{ role: 'user', content: prompt }]
  });
  
  console.log(`\n${model}:`);
  console.log(response.choices[0].message.content);
}
```

---

## Streaming

### Callback-based Streaming

```typescript
const response = await llm.createCompletionStream({
  messages: [{ role: 'user', content: 'Write a short story' }],
  onChunk: (chunk) => {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      process.stdout.write(content);
    }
  },
  onComplete: (response) => {
    console.log('\n\nComplete!');
    console.log('Tokens used:', response.usage.total_tokens);
  },
  onError: (error) => {
    console.error('Error:', error.message);
  }
});
```

### Async Generator Streaming

```typescript
async function streamResponse(prompt: string) {
  const llm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);

  let fullContent = '';
  for await (const chunk of llm.streamCompletion({
    messages: [{ role: 'user', content: prompt }]
  })) {
    const content = chunk.choices[0]?.delta?.content || '';
    fullContent += content;
    process.stdout.write(content);
  }

  return fullContent;
}

await streamResponse('Count from 1 to 10');
```

### Streaming with Abort

```typescript
const controller = new AbortController();

const stream = llm.streamCompletion({
  messages: [{ role: 'user', content: 'Generate a long text...' }],
  signal: controller.signal
});

// Abort after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
  }
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Stream was aborted');
  }
}
```

---

## Tool Calling

### Simple Tool Call

```typescript
const tools = [{
  type: 'function',
  function: {
    name: 'get_current_time',
    description: 'Get the current time',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  }
}];

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'What time is it?' }],
  tools
});

if (response.choices[0].message.tool_calls) {
  const toolCall = response.choices[0].message.tool_calls[0];
  console.log('Tool:', toolCall.function.name);
  console.log('Args:', toolCall.function.arguments);
}
```

### Complete Tool Loop

```typescript
async function runWithTools(userMessage: string) {
  const tools = [{
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get current weather for a location',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string' }
        },
        required: ['location']
      }
    }
  }];

  let messages = [{ role: 'user', content: userMessage }];

  while (true) {
    const response = await llm.createCompletion({ messages, tools });
    const message = response.choices[0].message;
    messages.push(message);

    if (!message.tool_calls) {
      return message.content;  // Final answer
    }

    // Execute tools
    for (const toolCall of message.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments);
      const result = await executeTool(toolCall.function.name, args);
      
      messages.push({
        role: 'tool',
        content: JSON.stringify(result),
        tool_call_id: toolCall.id
      });
    }
  }
}

async function executeTool(name: string, args: any) {
  if (name === 'get_weather') {
    return { temp: 22, condition: 'sunny', location: args.location };
  }
  throw new Error(`Unknown tool: ${name}`);
}

// Usage
const answer = await runWithTools('What is the weather in London?');
console.log(answer);
```

### Multiple Tools

```typescript
const tools = [
  {
    type: 'function',
    function: {
      name: 'search_web',
      description: 'Search the web',
      parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] }
    }
  },
  {
    type: 'function',
    function: {
      name: 'calculate',
      description: 'Perform calculations',
      parameters: { type: 'object', properties: { expression: { type: 'string' } }, required: ['expression'] }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_time',
      description: 'Get current time',
      parameters: { type: 'object', properties: {}, required: [] }
    }
  }
];

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Search, calculate time, and weather' }],
  tools
});

// Model will call one or more tools based on the request
```

### Parallel Tool Calls

```typescript
const tools = [{
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Get weather for location',
    parameters: { type: 'object', properties: { location: { type: 'string' } }, required: ['location'] }
  }
}];

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Weather in London, Tokyo, and Paris?' }],
  tools
});

// Response will have 3 tool_calls in one message
console.log('Tool calls:', response.choices[0].message.tool_calls);
// Output: [ {id: '1', function: 'get_weather', arguments: '{"location":"London"}'},
//            {id: '2', function: 'get_weather', arguments: '{"location":"Tokyo"}'},
//            {id: '3', function: 'get_weather', arguments: '{"location":"Paris"}'} ]
```

---

## Embeddings

### Single Text Embedding

```typescript
const response = await llm.createEmbedding({
  input: 'Machine learning is fascinating',
  model: 'text-embedding-3-small'
});

const embedding = response.data[0].embedding;
console.log('Embedding dimension:', embedding.length);  // 1536
```

### Batch Embeddings

```typescript
const texts = [
  'The cat sat on the mat',
  'The dog chased the cat',
  'Birds are flying high'
];

const response = await llm.createEmbedding({
  input: texts,
  model: 'text-embedding-3-small'
});

console.log('Embeddings:', response.data.map(d => d.embedding.length));
// Output: [1536, 1536, 1536]
```

### Cosine Similarity

```typescript
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

const [emb1, emb2] = await Promise.all([
  llm.createEmbedding({ input: 'programming', model: 'text-embedding-3-small' }),
  llm.createEmbedding({ input: 'coding', model: 'text-embedding-3-small' })
]);

const similarity = cosineSimilarity(
  emb1.data[0].embedding as number[],
  emb2.data[0].embedding as number[]
);

console.log('Similarity:', similarity);  // High value (>0.8) = similar
```

### Semantic Search

```typescript
class SemanticSearch {
  private documents: Array<{ text: string; embedding: number[] }> = [];

  async indexDocuments(texts: string[]) {
    for (const text of texts) {
      const response = await llm.createEmbedding({
        input: text,
        model: 'text-embedding-3-small'
      });
      this.documents.push({
        text,
        embedding: response.data[0].embedding as number[]
      });
    }
  }

  async search(query: string, topK: number = 3) {
    const queryResponse = await llm.createEmbedding({
      input: query,
      model: 'text-embedding-3-small'
    });

    const similarities = this.documents.map(doc => ({
      doc,
      score: cosineSimilarity(queryResponse.data[0].embedding as number[], doc.embedding)
    }));

    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

// Usage
const search = new SemanticSearch();
await search.indexDocuments([
  'Python is a programming language',
  'JavaScript runs in browsers',
  'Java is object-oriented'
]);

const results = await search.search('Which language is for web development?');
results.forEach((result, i) => {
  console.log(`${i + 1}. ${result.doc.text} (score: ${result.score.toFixed(3)})`);
});
```

### Custom Dimensions

```typescript
const response = await llm.createEmbedding({
  input: 'Test text',
  model: 'text-embedding-3-large',
  dimensions: 512  // Truncate to 512 dimensions
});

console.log('Reduced dimension:', (response.data[0].embedding as number[]).length);
// Output: 512
```

---

## Image Generation

### Basic Image Generation

```typescript
const llm = new Multillm('openai', 'dall-e-3', null, process.env.OPENAI_API_KEY);

const response = await llm.createImage({
  prompt: 'A futuristic cyberpunk city at night with neon lights',
  size: '1024x1024',
  n: 1
});

console.log('Image URL:', response.data[0].url);
```

### Multiple Images

```typescript
const response = await llm.createImage({
  prompt: 'A cute cat',
  size: '512x512',
  n: 4  // Generate 4 variations
});

response.data.forEach((image, index) => {
  console.log(`Image ${index + 1}:`, image.url);
});
```

### Different Image Sizes

```typescript
const sizes = ['256x256', '512x512', '1024x1024', '1792x1024'];

for (const size of sizes) {
  const response = await llm.createImage({
    prompt: 'A simple blue circle',
    size: size as any
  });
  console.log(`Size ${size}:`, response.data[0].url);
}
```

### High Quality Images

```typescript
const response = await llm.createImage({
  prompt: 'A detailed landscape painting',
  size: '1024x1024',
  quality: 'hd',  // Higher quality (slower, more expensive)
  n: 1
});

console.log('HD Image:', response.data[0].url);
```

### Base64 Response

```typescript
const response = await llm.createImage({
  prompt: 'A red square',
  size: '256x256',
  response_format: 'b64_json'
});

const base64Image = response.data[0].b64_json;

// Use in HTML
const imgTag = `<img src="data:image/png;base64,${base64Image}" />`;

// Or save to file
import fs from 'fs';
fs.writeFileSync('output.png', Buffer.from(base64Image, 'base64'));
```

### Prompt Engineering

```typescript
// Vague prompt
const badResponse = await llm.createImage({
  prompt: 'A dog'
});

// Better prompt with details
const goodResponse = await llm.createImage({
  prompt: 'A golden retriever dog sitting on a grassy hill, late afternoon sunlight, soft focus, 8k resolution, photorealistic'
});

console.log('Better image:', goodResponse.data[0].url);
```

---

## Speech Generation

### Basic Speech

```typescript
const llm = new Multillm('openai', 'tts-1', null, process.env.OPENAI_API_KEY);

const response = await llm.createSpeech({
  input: 'Hello, world! How are you today?',
  voice: 'alloy'
});

import fs from 'fs';
fs.writeFileSync('speech.mp3', Buffer.from(response.audio));
console.log('Saved to speech.mp3');
```

### All Voices

```typescript
const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
const text = 'This is a test of different voices.';

for (const voice of voices) {
  const response = await llm.createSpeech({
    input: text,
    voice: voice as any
  });
  
  fs.writeFileSync(`speech-${voice}.mp3`, Buffer.from(response.audio));
  console.log(`Created: speech-${voice}.mp3`);
}
```

### Different Audio Formats

```typescript
const formats = [
  { format: 'mp3', extension: 'mp3' },
  { format: 'opus', extension: 'opus' },
  { format: 'wav', extension: 'wav' }
];

for (const { format, extension } of formats) {
  const response = await llm.createSpeech({
    input: 'Test speech',
    voice: 'alloy',
    response_format: format as any
  });
  
  fs.writeFileSync(`speech.${extension}`, Buffer.from(response.audio));
  console.log(`Created: speech.${extension}`);
}
```

### Speed Control

```typescript
const speeds = [0.5, 1.0, 1.5, 2.0];

for (const speed of speeds) {
  const response = await llm.createSpeech({
    input: 'This is a test of speech speed control.',
    voice: 'nova',
    speed
  });
  
  fs.writeFileSync(`speech-speed-${speed}.mp3`, Buffer.from(response.audio));
  console.log(`Created speed ${speed}`);
}
```

### High Quality (HD)

```typescript
const response = await llm.createSpeech({
  input: 'Welcome to our premium service. We are dedicated to providing you with the best possible experience.',
  model: 'tts-1-hd',  // Higher quality
  voice: 'nova',
  response_format: 'wav'  // Lossless
});

fs.writeFileSync('premium-speech.wav', Buffer.from(response.audio));
console.log('Created premium speech');
```

---

## Audio Transcription

### Basic Transcription

```typescript
const llm = new Multillm('openai', 'whisper-1', null, process.env.OPENAI_API_KEY);

const response = await llm.createTranscription({
  audio: fs.readFileSync('recording.mp3'),
  model: 'whisper-1'
});

console.log('Transcription:', response.text);
console.log('Language:', response.language);
console.log('Duration:', response.duration);
```

### Different Formats

```typescript
const audioFile = fs.readFileSync('recording.mp3');

// SRT subtitles
const srt = await llm.createTranscription({
  audio: audioFile,
  response_format: 'srt'
});

fs.writeFileSync('captions.srt', srt.text);

// VTT subtitles
const vtt = await llm.createTranscription({
  audio: audioFile,
  response_format: 'vtt'
});

fs.writeFileSync('captions.vtt', vtt.text);

// Verbose JSON with timestamps
const verbose = await llm.createTranscription({
  audio: audioFile,
  response_format: 'verbose_json',
  timestamp_granularities: ['word']
});

fs.writeFileSync('verbose.json', JSON.stringify(verbose));
```

### Language Specification

```typescript
const languages = ['en', 'es', 'fr', 'de', 'ja'];

for (const lang of languages) {
  const response = await llm.createTranscription({
    audio: fs.readFileSync('recording.mp3'),
    language: lang
  });
  
  console.log(`${lang}:`, response.text);
}
```

### Word Timestamps

```typescript
const response = await llm.createTranscription({
  audio: fs.readFileSync('recording.mp3'),
  response_format: 'verbose_json',
  timestamp_granularities: ['word']
});

if (response.words) {
  response.words.forEach(word => {
    console.log(`[${word.start.toFixed(2)}s - ${word.end.toFixed(2)}s] ${word.word}`);
  });
}
```

---

## Multimodal Content

### Image Analysis

```typescript
const response = await llm.createCompletion({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Describe this image in detail.' },
      {
        type: 'image',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/1200px-Camponotus_flavomarginatus_ant.jpg'
      }
    ]
  }]
});

console.log('Description:', response.choices[0].message.content);
```

### Multiple Images

```typescript
const response = await llm.createCompletion({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Compare these two images.' },
      { type: 'image', image: 'https://example.com/image1.jpg' },
      { type: 'image', image: 'https://example.com/image2.jpg' }
    ]
  }]
});

console.log('Comparison:', response.choices[0].message.content);
```

### Image from Base64

```typescript
import fs from 'fs';
const imageBase64 = fs.readFileSync('./photo.jpg').toString('base64');

const response = await llm.createCompletion({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'What objects can you see?' },
      {
        type: 'image',
        image: imageBase64,
        mimeType: 'image/jpeg'
      }
    ]
  }]
});
```

### PDF Analysis (Anthropic)

```typescript
const pdfBase64 = fs.readFileSync('./document.pdf').toString('base64');

const response = await llm.createCompletion({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Summarize this document.' },
      {
        type: 'file',
        file: pdfBase64,
        mimeType: 'application/pdf',
        filename: 'report.pdf'
      }
    ]
  }]
});

console.log('Summary:', response.choices[0].message.content);
```

### Image with Detail Level (OpenAI)

```typescript
const response = await llm.createCompletion({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Read all the text in this image.' },
      {
        type: 'image',
        image: 'https://example.com/document.jpg',
        detail: 'high'  // High detail for text extraction
      }
    ]
  }]
});
```

---

## Reasoning Models

### OpenAI o1

```typescript
const llm = new Multillm('openai', 'o1', null, process.env.OPENAI_API_KEY);

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Solve: If x + 5 = 12, what is x?' }],
  reasoning: {
    thinkingBudget: 50000,
    reasoningEffort: 'high'
  }
});

console.log('Answer:', response.choices[0].message.content);
console.log('Reasoning tokens:', response.usage.reasoning_tokens);
```

### Anthropic Extended Thinking

```typescript
const llm = new Multillm('anthropic', 'claude-3-7-sonnet-20250219', null, process.env.ANTHROPIC_API_KEY);

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Explain recursion step by step.' }],
  reasoning: {
    thinkingBudget: 10000,
    includeReasoning: true
  }
});

console.log('Thinking:', response.choices[0].message.reasoning?.thinking);
console.log('Answer:', response.choices[0].message.content);
```

### DeepSeek Reasoner

```typescript
const llm = new Multillm('deepseek', 'deepseek-reasoner', null, process.env.DEEPSEEK_API_KEY);

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Solve this step by step: x^2 + 5x + 6 = 0' }]
});

console.log('Answer:', response.choices[0].message.content);
console.log('Reasoning:', response.choices[0].message.reasoning?.thinking);
console.log('Reasoning tokens:', response.usage.reasoning_tokens);
```

### Reasoning Streaming

```typescript
const llm = new Multillm('openai', 'o1', null, process.env.OPENAI_API_KEY);

const response = await llm.createCompletionStream({
  messages: [{ role: 'user', content: 'Solve: 234 × 567' }],
  reasoning: {
    thinkingBudget: 30000,
    reasoningEffort: 'medium'
  },
  onChunk: (chunk) => {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      process.stdout.write(content);
    }
  }
});

console.log('Final answer:', response.choices[0].message.content);
console.log('Reasoning tokens:', response.usage.reasoning_tokens);
```

---

## Document Reranking

### Basic Reranking

```typescript
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

console.log('Reranked results:');
response.results.forEach((result, i) => {
  console.log(`${i + 1}. Score: ${result.relevance_score.toFixed(3)}`);
  console.log(`   Document ${result.index}:`, ['doc1', 'doc2', 'doc3', 'doc4'][result.index]);
});
```

### RAG Pipeline

```typescript
async function ragPipeline(query: string) {
  // Step 1: Retrieve from vector DB
  const retrievedDocuments = await vectorDB.search(query, topK: 50);

  // Step 2: Rerank
  const reranked = await llm.rerank({
    query,
    documents: retrievedDocuments.map(d => d.text),
    top_n: 5
  });

  // Step 3: Use reranked context for generation
  const context = reranked.results
    .map(r => retrievedDocuments[r.index].text)
    .join('\n\n');

  const chatLlm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);
  const answer = await chatLlm.createCompletion({
    messages: [{
      role: 'system',
      content: 'Answer using the following context:'
    }, {
      role: 'user',
      content: `${context}\n\nQuestion: ${query}`
    }]
  });

  return answer;
}
```

---

## Caching

### OpenAI Automatic Caching

```typescript
const systemPrompt = 'You are an expert in: ' + 'A'.repeat(1000);

const response1 = await llm.createCompletion({
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: 'Question 1' }
  ]
});

const response2 = await llm.createCompletion({
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: 'Question 2' }
  ]
});

console.log('Cache creation:', response1.usage.cache_creation_tokens);
console.log('Cache read:', response2.usage.cached_tokens);
```

### Anthropic Explicit Caching

```typescript
const response = await llm.createCompletion({
  messages: [
    {
      role: 'system',
      content: 'You are a documentation assistant.',
      cache_control: { type: 'ephemeral' }
    },
    { role: 'user', content: 'Explain API caching.' }
  ],
  enableCaching: true,
  systemCacheControl: { type: 'ephemeral' }
});

console.log('Cache tokens:', response.usage.cache_creation_tokens);
```

### Cost Savings Tracking

```typescript
const responses = await Promise.all([
  llm.createCompletion({
    messages: [{ role: 'system', content: largePrompt }, { role: 'user', content: 'Q1' }],
    enableCaching: true
  }),
  llm.createCompletion({
    messages: [{ role: 'system', content: largePrompt }, { role: 'user', content: 'Q2' }],
    enableCaching: true
  }),
  llm.createCompletion({
    messages: [{ role: 'system', content: largePrompt }, { role: 'user', content: 'Q3' }],
    enableCaching: true
  })
]);

const totalTokens = responses.reduce((sum, r) => sum + r.usage.total_tokens, 0);
const cachedTokens = responses.reduce((sum, r) => sum + (r.usage.cached_tokens || 0), 0);
const savings = ((totalTokens - cachedTokens) / totalTokens) * 100;

console.log(`Total tokens: ${totalTokens}`);
console.log(`Cached tokens: ${cachedTokens}`);
console.log(`Savings: ${savings.toFixed(1)}%`);
```

---

## Error Handling

### Retry with Backoff

```typescript
import { withRetry } from '@arrowai/multillm';

const response = await withRetry(
  () => llm.createCompletion({
    messages: [{ role: 'user', content: 'Test' }]
  }),
  {
    maxRetries: 3,
    initialBackoff: 1000,
    maxBackoff: 10000,
    backoffMultiplier: 2,
    onRetry: (error, attempt, delay) => {
      console.log(`Retry ${attempt}: ${error.message}`);
      console.log(`Waiting ${delay}ms...`);
    }
  }
);
```

### Graceful Error Messages

```typescript
try {
  const response = await llm.createCompletion({ messages });
} catch (error) {
  if (error.message.includes('rate_limit')) {
    console.error('Rate limited. Please wait a moment and try again.');
  } else if (error.message.includes('authentication')) {
    console.error('Invalid API key. Please check your configuration.');
  } else if (error.message.includes('context_length')) {
    console.error('Input is too long. Please shorten your message.');
  } else {
    console.error('An error occurred. Please try again.');
  }
}
```

### Provider Fallback

```typescript
async function withFallback(request: () => Promise<any>) {
  const providers = [
    new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY),
    new Multillm('anthropic', 'claude-3-5-sonnet-20241022', null, process.env.ANTHROPIC_API_KEY),
    new Multillm('deepseek', 'deepseek-chat', null, process.env.DEEPSEEK_API_KEY)
  ];

  for (const provider of providers) {
    try {
      return await request();
    } catch (error) {
      console.log(`${provider.provider} failed:`, error.message);
    }
  }

  throw new Error('All providers failed');
}

const response = await withFallback(() => 
  llm.createCompletion({ messages: [{ role: 'user', content: 'Hello' }] })
);
```

---

## UI Streaming

### Basic Stream Response

```typescript
import { createUIMessageStreamResponse } from '@arrowai/multillm/ui-stream';

export async function POST(req: Request) {
  const llm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);

  return createUIMessageStreamResponse(async ({ writer, messageId }) => {
    writer.write({ type: 'message-start', messageId, model: 'gpt-4o' });
    writer.write({ type: 'text-start' });

    for await (const chunk of llm.streamCompletion({
      messages: [{ role: 'user', content: 'Tell me a story' }]
    })) {
      if (chunk.choices[0]?.delta?.content) {
        writer.write({
          type: 'text-delta',
          content: chunk.choices[0].delta.content,
          messageId
        });
      }
    }

    writer.write({ type: 'text-end' });
    writer.write({
      type: 'message-end',
      messageId,
      finishReason: 'stop',
      usage: {
        promptTokens: 10,
        completionTokens: 50,
        totalTokens: 60
      }
    });
  });
}
```

### Streaming with Tools

```typescript
export async function POST(req: Request) {
  const { messages, tools } = await req.json();
  const llm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);

  return createUIMessageStreamResponse(async ({ writer, messageId }) => {
    writer.write({ type: 'message-start', messageId });

    let toolCalls: any[] = [];

    for await (const chunk of llm.streamCompletion({ messages, tools })) {
      if (chunk.choices[0]?.delta?.tool_calls) {
        for (const toolCall of chunk.choices[0].delta.tool_calls) {
          toolCalls.push(toolCall);
          writer.write({
            type: 'tool-call-start',
            toolCallId: toolCall.id,
            toolName: toolCall.function.name,
            messageId
          });
        }
      }
    }

    // Execute tools and stream results
    for (const toolCall of toolCalls) {
      const result = await executeTool(toolCall.function.name, JSON.parse(toolCall.function.arguments));
      writer.write({
        type: 'tool-result',
        toolCallId: toolCall.id,
        result,
        messageId
      });
    }

    writer.write({ type: 'message-end', messageId, finishReason: 'tool_calls' });
  });
}

async function executeTool(name: string, args: any) {
  if (name === 'get_time') {
    return { time: new Date().toISOString() };
  }
  return null;
}
```

### Error Handling in Stream

```typescript
return createUIMessageStreamResponse(async ({ writer, messageId }) => {
  try {
    for await (const chunk of llm.streamCompletion({ messages })) {
      if (chunk.choices[0]?.delta?.content) {
        writer.write({
          type: 'text-delta',
          content: chunk.choices[0].delta.content,
          messageId
        });
      }
    }
    writer.write({ type: 'text-end' });
    writer.write({ type: 'message-end', messageId, finishReason: 'stop' });
  } catch (error: any) {
    writer.write({
      type: 'error',
      error: error.message,
      code: error.code || 'UNKNOWN',
      messageId
    });
  }
});
```

---

## Complete Examples

### Chatbot with Streaming

```typescript
import { createUIMessageStreamResponse } from '@arrowai/multillm/ui-stream';

export async function chatApiRoute(req: Request) {
  const llm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);

  return createUIMessageStreamResponse(async ({ writer }) => {
    writer.write({ type: 'message-start', messageId: 'msg-1' });
    writer.write({ type: 'text-start' });

    let fullContent = '';

    for await (const chunk of llm.streamCompletion({
      messages: [{ role: 'user', content: await req.json().message }]
    })) {
      if (chunk.choices[0]?.delta?.content) {
        const content = chunk.choices[0].delta.content;
        fullContent += content;
        writer.write({
          type: 'text-delta',
          content,
          messageId: 'msg-1'
        });
      }
    }

    writer.write({ type: 'text-end' });
    writer.write({
      type: 'message-end',
      messageId: 'msg-1',
      finishReason: 'stop',
      usage: {
        promptTokens: fullContent.length,
        completionTokens: fullContent.length,
        totalTokens: fullContent.length * 2
      }
    });
  });
}
```

### RAG Application

```typescript
async function ragSearch(query: string) {
  const llm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);

  // Get query embedding
  const queryEmbedding = await llm.createEmbedding({
    input: query,
    model: 'text-embedding-3-small'
  });

  // Search vector database
  const similarDocs = await vectorDB.search(
    queryEmbedding.data[0].embedding as number[],
    topK: 5
  );

  // Rerank results
  const reranked = await llm.rerank({
    query,
    documents: similarDocs.map(d => d.content),
    top_n: 3
  });

  // Generate answer using reranked context
  const context = reranked.results.map(r => similarDocs[r.index].content).join('\n\n');
  const answer = await llm.createCompletion({
    messages: [
      {
        role: 'system',
        content: 'Use the following context to answer questions:'
      },
      {
        role: 'user',
        content: `${context}\n\nQuestion: ${query}`
      }
    ]
  });

  return {
    answer: answer.choices[0].message.content,
    sources: reranked.results.map(r => similarDocs[r.index])
  };
}
```

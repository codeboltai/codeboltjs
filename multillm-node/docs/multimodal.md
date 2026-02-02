# Multimodal Content Support

Multillm provides full support for sending images and files in chat messages, following patterns similar to the Vercel AI SDK.

## Overview

Multimodal content allows you to include images and files (like PDFs) alongside text in your messages. This is essential for vision models and document analysis.

## Supported Providers

| Provider | Images | PDFs | Audio | Input Formats |
|----------|--------|------|-------|---------------|
| OpenAI | ✅ | ❌ | ❌ | URL, base64, data URL |
| Anthropic | ✅ | ✅ | ❌ | base64 only (auto-fetched from URLs) |
| Gemini | ✅ | ❌ | ❌ | base64 (inlineData) |
| Ollama | ✅ | ❌ | ❌ | base64 (images array) |

## Content Types

### TextContentPart

Plain text content in a message.

```typescript
interface TextContentPart {
  type: 'text';
  text: string;
}
```

### ImageContentPart

Image content for vision models.

```typescript
interface ImageContentPart {
  type: 'image';
  image: string | URL | ArrayBuffer | Uint8Array;
  mimeType?: string;      // e.g., 'image/jpeg', 'image/png'
  detail?: 'auto' | 'low' | 'high';  // OpenAI-specific
}
```

### FileContentPart

File content (currently PDFs for Anthropic).

```typescript
interface FileContentPart {
  type: 'file';
  file: string | URL | ArrayBuffer | Uint8Array;
  mimeType: string;       // Required, e.g., 'application/pdf'
  filename?: string;      // Optional display name
}
```

## Usage Examples

### Basic Image from URL

```typescript
import Multillm from '@arrowai/multillm';

const llm = new Multillm('openai', 'gpt-4o', null, apiKey);

const response = await llm.createCompletion({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Describe this image in detail.' },
      {
        type: 'image',
        image: 'https://example.com/photo.jpg'
      }
    ]
  }]
});

console.log(response.choices[0].message.content);
```

### Image from Base64

```typescript
import { readFileSync } from 'fs';

// Read image as base64
const imageData = readFileSync('./image.png').toString('base64');

const response = await llm.createCompletion({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'What is in this image?' },
      {
        type: 'image',
        image: imageData,
        mimeType: 'image/png'
      }
    ]
  }]
});
```

### Image from Data URL

```typescript
const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAE...';

const response = await llm.createCompletion({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Analyze this chart.' },
      { type: 'image', image: dataUrl }
    ]
  }]
});
```

### Image from ArrayBuffer

```typescript
// Fetch image as ArrayBuffer
const imageBuffer = await fetch('https://example.com/image.jpg')
  .then(res => res.arrayBuffer());

const response = await llm.createCompletion({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'What is this?' },
      {
        type: 'image',
        image: imageBuffer,
        mimeType: 'image/jpeg'
      }
    ]
  }]
});
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
```

### PDF Analysis (Anthropic)

```typescript
import { readFileSync } from 'fs';

const llm = new Multillm('anthropic', 'claude-3-opus-20240229', null, apiKey);

const pdfData = readFileSync('./document.pdf').toString('base64');

const response = await llm.createCompletion({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Summarize this document.' },
      {
        type: 'file',
        file: pdfData,
        mimeType: 'application/pdf',
        filename: 'document.pdf'
      }
    ]
  }]
});
```

### OpenAI Detail Level

OpenAI's vision models support detail level for image analysis:

```typescript
const response = await llm.createCompletion({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Read all the text in this image.' },
      {
        type: 'image',
        image: 'https://example.com/document.jpg',
        detail: 'high'  // 'auto' | 'low' | 'high'
      }
    ]
  }]
});
```

- `auto` - Model decides based on image size
- `low` - Fixed 512x512 resolution, faster and cheaper
- `high` - High resolution processing, better for text and details

## Provider-Specific Behavior

### OpenAI
- URLs are passed directly to the API
- Base64 images are wrapped in data URLs
- Supports `detail` parameter for image analysis level
- Does not support files/PDFs directly in chat messages

### Anthropic
- All images are converted to base64 (URLs are fetched automatically)
- Supports PDF documents via the `document` content type
- Requires `media_type` (mimeType) for all images

### Gemini
- All images are converted to base64 `inlineData` format
- Does not support PDFs
- Automatically fetches URL images and converts to base64

### Ollama
- Uses separate `images` array in request
- All images are base64 encoded (no data URL prefix)
- Vision support depends on the model (e.g., llava, bakllava)

## Utility Functions

The library provides helper functions for working with multimodal content:

```typescript
import {
  isMultimodalContent,
  extractTextContent,
  transformContentForOpenAI,
  transformContentForAnthropic,
  transformContentForGemini,
  transformContentForOllama
} from '@arrowai/multillm/utils/contentTransformer';

// Check if content is multimodal
if (isMultimodalContent(message.content)) {
  // Content is an array of ContentPart
}

// Extract text from any content type
const text = extractTextContent(message.content);
// Returns concatenated text from all text parts

// Transform for specific providers
const openAIParts = await transformContentForOpenAI(content);
const anthropicParts = await transformContentForAnthropic(content);
const geminiParts = await transformContentForGemini(content);
const ollamaParts = await transformContentForOllama(content);
```

## Backward Compatibility

Multimodal support is fully backward compatible. Existing code using string content continues to work:

```typescript
// Old format - still works
const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'Hello!' }]
});

// New format - multimodal
const response = await llm.createCompletion({
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Hello!' }
    ]
  }]
});
```

The `MessageContent` type is defined as:
```typescript
type MessageContent = string | null | ContentPart[];
```

This allows all three formats: string, null, or array of content parts.

## Error Handling

```typescript
try {
  const response = await llm.createCompletion({
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'What is this?' },
        { type: 'image', image: 'invalid-url' }
      ]
    }]
  });
} catch (error) {
  if (error.message.includes('Unsupported image format')) {
    console.error('Invalid image format');
  }
}
```

## Best Practices

1. **Always specify mimeType** for base64 images when possible
2. **Use URLs** for large images when the provider supports it (OpenAI)
3. **Check provider capabilities** before using multimodal:
   ```typescript
   const caps = llm.getCapabilities();
   if (caps.supportsMultimodal) {
     // Safe to use multimodal content
   }
   ```
4. **Handle image fetching errors** when URLs are used
5. **Consider image size** - large images may increase latency and cost

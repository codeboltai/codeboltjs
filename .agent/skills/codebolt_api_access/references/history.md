# codebolt.history - Chat History Summarization

The history module provides functionality to summarize chat history for the Codebolt agent. It allows you to get summaries of entire conversations or specific parts of the conversation history.

## Response Types

### BaseHistorySDKResponse

All responses extend this base response with common fields:

```typescript
interface BaseHistorySDKResponse {
  success?: boolean;  // Whether the operation succeeded
  message?: string;   // Optional status message
  error?: string;     // Error details if operation failed
}
```

### GetSummarizeAllResponse

Used when summarizing the entire chat history.

```typescript
interface GetSummarizeAllResponse {
  success?: boolean;   // Whether the operation succeeded
  message?: string;    // Optional status message
  error?: string;      // Error details if operation failed
  payload?: string;    // The original messages payload
  summary?: string;    // The generated summary of all messages
}
```

### GetSummarizeResponse

Used when summarizing a specific part of the chat history.

```typescript
interface GetSummarizeResponse {
  success?: boolean;   // Whether the operation succeeded
  message?: string;    // Optional status message
  error?: string;      // Error details if operation failed
  payload?: string;    // The original messages payload
  summary?: string;    // The generated summary of the messages
  depth?: number;      // The depth value that was used for summarization
}
```

## Methods

### `summarizeAll()`

Summarizes the entire chat history into a concise summary.

**Parameters:** None

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  payload?: string;
  summary?: string;
}
```

```typescript
const result = await codebolt.history.summarizeAll();
if (result.success) {
  console.log('Summary:', result.summary);
}
```

---

### `summarize(messages, depth)`

Summarizes a specific part of the chat history.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| messages | Array<{role: string, content: string}> | Yes | Array of message objects to summarize, each with role and content |
| depth | number | Yes | How far back in history to consider for the summarization |

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  payload?: string;
  summary?: string;
  depth?: number;
}
```

```typescript
const result = await codebolt.history.summarize([
  { role: 'user', content: 'What is JavaScript?' },
  { role: 'assistant', content: 'JavaScript is a programming language...' }
], 5);
if (result.success) {
  console.log('Summary:', result.summary);
}
```

## Examples

### Get Full Conversation Summary

```typescript
const result = await codebolt.history.summarizeAll();
if (result.success) {
  console.log('Conversation Summary:');
  console.log(result.summary);
} else {
  console.error('Failed to get summary:', result.error);
}
```

### Summarize Recent Messages

```typescript
const recentMessages = [
  { role: 'user', content: 'Help me write a function' },
  { role: 'assistant', content: 'Here is how you can write a function...' },
  { role: 'user', content: 'How do I call it?' }
];

const result = await codebolt.history.summarize(recentMessages, 3);
if (result.summary) {
  console.log('Summary of recent messages:', result.summary);
}
```

### Check History Summary Availability

```typescript
const result = await codebolt.history.summarizeAll();
if (result.success && result.summary) {
  console.log('Summary available:', result.summary.length, 'characters');
} else if (!result.success) {
  console.log('Could not generate summary:', result.error);
} else {
  console.log('No summary generated yet');
}
```

### Summarize with Depth Control

```typescript
const messages = [
  { role: 'user', content: 'First question' },
  { role: 'assistant', content: 'First answer' },
  { role: 'user', content: 'Second question' },
  { role: 'assistant', content: 'Second answer' },
  { role: 'user', content: 'Third question' },
  { role: 'assistant', content: 'Third answer' }
];

const result = await codebolt.history.summarize(messages, 2);
if (result.success) {
  console.log(`Summary with depth ${result.depth}:`, result.summary);
}
```

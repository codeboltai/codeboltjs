# codebolt.rag - Retrieval Augmented Generation

This module provides functionality for managing files within the CodeBolt File System and retrieving related knowledge using RAG (Retrieval Augmented Generation) techniques.

## Response Types

All responses extend a base response with common fields:

```typescript
interface BaseRagResponse {
  success: boolean;  // Whether the operation succeeded
  message?: string;   // Optional status message
  error?: string;     // Error details if operation failed
}
```

## Methods

### `init()`

Initializes the CodeBolt File System Module.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| - | - | - | No parameters |

**Response:**
```typescript
{
  success: boolean;
  message?: string;  // Initialization status message
}
```

```typescript
const result = await codebolt.rag.init();
if (result.success) {
  console.log('RAG module initialized');
}
```

---

### `add_file(filename, file_path)`

Adds a file to the CodeBolt File System.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filename | string | Yes | The name of the file to add |
| file_path | string | Yes | The path where the file should be added |

**Response:**
```typescript
{
  success: boolean;
  filename?: string;  // Name of the file added
  file_path?: string; // Path where file was added
  message?: string;   // Status message
}
```

```typescript
const result = await codebolt.rag.add_file('document.pdf', '/knowledge/docs');
if (result.success) {
  console.log(`File ${result.filename} added to ${result.file_path}`);
}
```

---

### `retrieve_related_knowledge(query, filename)`

Retrieves related knowledge for a given query and filename using RAG techniques.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | The query to retrieve related knowledge for |
| filename | string | Yes | The name of the file associated with the query |

**Response:**
```typescript
{
  success: boolean;
  query?: string;  // The query that was processed
  filename?: string; // The file used for retrieval
  knowledge?: string; // Retrieved knowledge content
  message?: string; // Status message
}
```

```typescript
const result = await codebolt.rag.retrieve_related_knowledge('How to authenticate users?', 'auth-guide.pdf');
if (result.success) {
  console.log('Related knowledge:', result.knowledge);
}
```

## Examples

### Adding Multiple Documents to RAG System

```typescript
// Initialize RAG module
await codebolt.rag.init();

// Add multiple knowledge base documents
const documents = [
  { filename: 'api-reference.pdf', path: '/docs/api' },
  { filename: 'user-guide.md', path: '/docs/guides' },
  { filename: 'troubleshooting.txt', path: '/docs/support' }
];

for (const doc of documents) {
  const result = await codebolt.rag.add_file(doc.filename, doc.path);
  if (result.success) {
    console.log(`Added ${doc.filename} to RAG system`);
  }
}
```

### Querying for Related Information

```typescript
// Search for relevant documentation
const query = 'How to reset user password?';
const filename = 'user-guide.md';

const result = await codebolt.rag.retrieve_related_knowledge(query, filename);

if (result.success && result.knowledge) {
  console.log('Found relevant information:');
  console.log(result.knowledge);
} else {
  console.log('No relevant information found');
}
```

### Building a Knowledge Base for a Project

```typescript
// Initialize and populate knowledge base
async function setupProjectKnowledge() {
  await codebolt.rag.init();

  // Add project documentation
  const projectDocs = [
    { name: 'README.md', path: '/project' },
    { name: 'architecture.md', path: '/project/docs' },
    { name: 'api-spec.yaml', path: '/project/specs' }
  ];

  for (const doc of projectDocs) {
    await codebolt.rag.add_file(doc.name, doc.path);
  }

  console.log('Knowledge base setup complete');
}

// Query the knowledge base
async function queryKnowledge(question: string) {
  const result = await codebolt.rag.retrieve_related_knowledge(question, 'README.md');
  return result.knowledge || 'No relevant information found';
}
```

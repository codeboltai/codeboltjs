# codebolt.vectordb - Vector Database Module

The vector database module provides operations for storing, retrieving, and querying vectors and their associated metadata in a vector database. This is useful for semantic search, embeddings-based operations, and AI-powered feature extraction.

## Response Types

All responses extend a base response with common fields:

```typescript
interface BaseVectorDBResponse {
  success?: boolean;  // Whether the operation succeeded
  message?: string;   // Optional status message
  error?: string;     // Error details if operation failed
}
```

### AddVectorItemResponse

Response returned when adding a new vector item to the database.

```typescript
interface AddVectorItemResponse extends BaseVectorDBResponse {
  item?: any;  // The added vector item with metadata
}
```

### GetVectorResponse

Response returned when retrieving a vector by its key.

```typescript
interface GetVectorResponse extends BaseVectorDBResponse {
  vector?: number[];  // The retrieved vector as an array of numbers
  item?: any;        // Associated metadata for the vector
}
```

### QueryVectorItemResponse

Response returned when querying for vector items.

```typescript
interface QueryVectorItemResponse extends BaseVectorDBResponse {
  item?: any;   // The queried vector item with metadata
  results?: any;  // Query results containing matching vectors
}
```

### QueryVectorItemsResponse

Response returned when querying multiple vector items.

```typescript
interface QueryVectorItemsResponse extends BaseVectorDBResponse {
  items?: any[];  // Array of vector items with metadata
  results?: any;  // Query results containing matching vectors
}
```

## Methods

### `getVector(key)`

Retrieves a vector from the vector database based on the provided key.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| key | string | Yes | The key of the vector to retrieve |

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  vector?: number[];  // The retrieved vector as an array of numbers
  item?: any;        // Associated metadata for the vector
}
```

```typescript
const result = await codebolt.vectordb.getVector('user_embeddings_123');
if (result.success) {
  console.log('Vector:', result.vector);
  console.log('Metadata:', result.item);
}
```

---

### `addVectorItem(item)`

Adds a new vector item to the vector database.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| item | any | Yes | The item to add to the vector (includes vector data and metadata) |

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  item?: any;  // The added vector item with metadata
}
```

```typescript
const newItem = {
  vector: [0.1, 0.2, 0.3, 0.4],
  metadata: {
    type: 'document',
    id: 'doc_123',
    title: 'Sample Document'
  }
};
const result = await codebolt.vectordb.addVectorItem(newItem);
if (result.success) {
  console.log('Item added:', result.item);
}
```

---

### `queryVectorItem(key)`

Queries a vector item from the vector database based on the provided key.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| key | string | Yes | The key of the vector to query |

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  item?: any;   // The queried vector item with metadata
  results?: any;  // Query results containing matching vectors
}
```

```typescript
const result = await codebolt.vectordb.queryVectorItem('user_123');
if (result.success) {
  console.log('Query result:', result.item);
  console.log('Results:', result.results);
}
```

---

### `queryVectorItems(items, dbPath)`

Queries multiple vector items from the vector database.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| items | array | Yes | Array of items to query |
| dbPath | string | Yes | Database path to query from |

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  items?: any[];  // Array of vector items with metadata
  results?: any;  // Query results containing matching vectors
}
```

```typescript
const itemsToQuery = ['item1', 'item2', 'item3'];
const result = await codebolt.vectordb.queryVectorItems(itemsToQuery, '/path/to/vectordb');
if (result.success) {
  console.log('Found items:', result.items);
  console.log('Query results:', result.results);
}
```

## Examples

### Store and Retrieve Document Embeddings

```typescript
// Add a document embedding with metadata
const docEmbedding = {
  vector: [0.123, 0.456, 0.789, ...],
  metadata: {
    title: 'Introduction to Machine Learning',
    author: 'John Doe',
    category: 'AI/ML'
  }
};

const addResult = await codebolt.vectordb.addVectorItem(docEmbedding);
if (addResult.success) {
  console.log('Document embedding stored');
}
```

### Query Vector by Key

```typescript
// Retrieve a specific vector by key
const vectorResult = await codebolt.vectordb.getVector('doc_ml_intro');
if (vectorResult.success && vectorResult.vector) {
  console.log('Embedding dimensions:', vectorResult.vector.length);
  console.log('Metadata:', vectorResult.item);
} else {
  console.log('Vector not found:', vectorResult.error);
}
```

### Batch Query Multiple Vectors

```typescript
// Query multiple items from a specific database
const itemKeys = ['user_1', 'user_2', 'user_3'];
const queryResult = await codebolt.vectordb.queryVectorItems(
  itemKeys,
  '/users/vectordb'
);

if (queryResult.success) {
  queryResult.items?.forEach((item, index) => {
    console.log(`Item ${index}:`, item);
  });
}
```

### Error Handling for Vector Operations

```typescript
// Proper error handling for vector operations
try {
  const result = await codebolt.vectordb.addVectorItem(vectorData);
  
  if (result.success) {
    console.log('Operation successful');
  } else {
    console.error('Operation failed:', result.error || result.message);
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

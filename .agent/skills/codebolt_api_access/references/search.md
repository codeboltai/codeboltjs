# codebolt.search - Search Operations

A module for handling web search operations with configurable search engines.

## Response Types

All responses are returned as Promise<string> containing the search result data.

### SearchResult

Raw search results text from the configured search engine.

### FirstLinkResult

The first URL found in the search results.

## Methods

### `init(engine?)`

Initializes the search module with the specified search engine.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| engine | string | No | The search engine to use (default: "bing") |

**Response:** `void`

```typescript
codebolt.search.init('bing');
```

---

### `search(query)`

Performs a search operation for the given query.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | The search query string |

**Response:**
```typescript
Promise<string>
// Returns raw search results as a string
```

```typescript
const results = await codebolt.search.search('TypeScript documentation');
console.log(results);
```

---

### `get_first_link(query)`

Retrieves the first link from the search results for the given query.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | The search query string |

**Response:**
```typescript
Promise<string>
// Returns the first URL from search results as a string
```

```typescript
const firstLink = await codebolt.search.get_first_link('react tutorial');
if (firstLink) {
  console.log('First result:', firstLink);
}
```

## Examples

### Basic Web Search

```typescript
// Initialize with default search engine
codebolt.search.init();

// Perform a search
const results = await codebolt.search.search('JavaScript array methods');
console.log(results);
```

### Getting the First Result URL

```typescript
// Quick way to get the top result link
const url = await codebolt.search.get_first_link('best npm packages 2024');
console.log('Top result URL:', url);
```

### Using Different Search Engines

```typescript
// Initialize with a specific search engine
codebolt.search.init('google');

const query = 'how to debug Node.js';
const results = await codebolt.search.search(query);
const topLink = await codebolt.search.get_first_link(query);

console.log('All results:', results);
console.log('Top link:', topLink);
```

### Multiple Sequential Searches

```typescript
codebolt.search.init('bing');

const queries = ['react hooks tutorial', 'typescript best practices', 'node.js performance'];

for (const query of queries) {
  const firstLink = await codebolt.search.get_first_link(query);
  console.log(`Top link for "${query}":`, firstLink);
}
```

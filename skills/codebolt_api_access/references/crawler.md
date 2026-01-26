# codebolt.crawler - Web Crawler Automation

This module provides functionality to control a web crawler through WebSocket messages, enabling navigation, screenshots, scrolling, and element interaction.

## Response Types

All responses extend a base response with common fields:

```typescript
interface BaseCrawlerResponse {
  success?: boolean;  // Whether the operation succeeded
  message?: string;   // Optional status message
  error?: string;     // Error details if operation failed
}
```

### CrawlerResponse

Used for click operations:

```typescript
interface CrawlerResponse {
  type: 'crawlerResponse';
  url?: string;  // Current page URL
  content?: string;  // Page content
  links?: string[];  // Array of links found on the page
  metadata?: {
    title?: string;  // Page title
    description?: string;  // Page description
    images?: string[];  // Array of image URLs
  };
}
```

## Methods

### `start()`

Starts the crawler.

**Response:** `void` (fire-and-forget operation)

```typescript
codebolt.crawler.start();
```

---

### `screenshot()`

Takes a screenshot using the crawler.

**Response:** `void` (fire-and-forget operation)

```typescript
codebolt.crawler.screenshot();
```

---

### `goToPage(url)`

Directs the crawler to navigate to a specified URL.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| url | string | Yes | The URL for the crawler to navigate to |

**Response:** `void` (fire-and-forget operation)

```typescript
codebolt.crawler.goToPage('https://example.com');
```

---

### `scroll(direction)`

Scrolls the crawler in a specified direction.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| direction | string | Yes | The direction to scroll: 'up', 'down', 'left', 'right' |

**Response:** `void` (fire-and-forget operation)

```typescript
codebolt.crawler.scroll('down');
```

---

### `click(id)`

Simulates a click event on an element with the specified ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | The ID of the element to be clicked |

**Response:**
```typescript
{
  type: 'crawlerResponse';
  success?: boolean;
  url?: string;  // Current page URL
  content?: string;  // Page content
  links?: string[];  // Array of links found on the page
  metadata?: {
    title?: string;  // Page title
    description?: string;  // Page description
    images?: string[];  // Array of image URLs
  };
  message?: string;
  error?: string;
}
```

```typescript
const result = await codebolt.crawler.click('submit-button');
if (result.success) {
  console.log(`Clicked successfully. Current URL: ${result.url}`);
  if (result.metadata?.title) {
    console.log(`Page title: ${result.metadata.title}`);
  }
}
```

## Examples

### Basic Page Navigation

```typescript
// Start the crawler
codebolt.crawler.start();

// Navigate to a page
codebolt.crawler.goToPage('https://example.com');

// Scroll down to view more content
codebolt.crawler.scroll('down');
```

### Screenshot Capture Workflow

```typescript
// Start and navigate
codebolt.crawler.start();
codebolt.crawler.goToPage('https://example.com');

// Take a screenshot
codebolt.crawler.screenshot();
console.log('Screenshot captured');
```

### Interactive Page Interaction

```typescript
// Navigate to a page
codebolt.crawler.start();
codebolt.crawler.goToPage('https://example.com');

// Click on an element
const result = await codebolt.crawler.click('login-button');
if (result.success) {
  console.log('Clicked successfully');
  console.log(`Page title: ${result.metadata?.title}`);
} else {
  console.error(`Click failed: ${result.error}`);
}
```

### Multi-Direction Scrolling

```typescript
codebolt.crawler.start();
codebolt.crawler.goToPage('https://example.com/long-page');

// Scroll down to see more content
codebolt.crawler.scroll('down');

// Scroll back up
codebolt.crawler.scroll('up');

// Scroll horizontally
codebolt.crawler.scroll('right');
codebolt.crawler.scroll('left');
```

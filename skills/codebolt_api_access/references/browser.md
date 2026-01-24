# codebolt.browser - Browser Automation

This module provides functionality to interact with a browser through WebSockets, enabling navigation, content extraction, screenshots, and DOM interactions.

## Response Types

All responses extend a base response with common fields:

```typescript
interface BaseBrowserResponse {
  success?: boolean;  // Whether the operation succeeded
  message?: string;   // Optional status message
  error?: string;     // Error details if operation failed
}
```

### BrowserViewportInfo

Used in browser info responses:

```typescript
interface BrowserViewportInfo {
  width: number;           // Viewport width
  height: number;          // Viewport height
  devicePixelRatio: number;
  scrollX: number;         // Horizontal scroll position
  scrollY: number;         // Vertical scroll position
  pageXOffset: number;
  pageYOffset: number;
  windowWidth: number;     // Window width
  windowHeight: number;    // Window height
  offsetHeight: number;
  scrollHeight: number;    // Total scrollable height
}
```

### BrowserInstanceInfo

Used for instance management:

```typescript
interface BrowserInstanceInfo {
  instanceId: string;    // Unique instance identifier
  isActive: boolean;     // Whether this is the active instance
  isReady: boolean;      // Whether instance is ready for use
  currentUrl: string;    // Current page URL
  createdAt: string;     // ISO timestamp of creation
  title: string;         // Page title
}
```

## Methods

### `newPage(options?)`

Opens a new page in the browser.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| options.instanceId | string | No | Specific browser instance ID to use |

**Response:**
```typescript
{
  success?: boolean;
  action?: string;   // 'newPage'
  message?: string;
}
```

```typescript
const result = await codebolt.browser.newPage();
if (result.success) {
  console.log('New page opened');
}
```

---

### `goToPage(url, options?)`

Navigates to a specified URL.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| url | string | Yes | The URL to navigate to |
| options.instanceId | string | No | Specific browser instance ID |

**Response:**
```typescript
{
  success?: boolean;
  url?: string;  // The URL navigated to
}
```

```typescript
const result = await codebolt.browser.goToPage('https://example.com');
if (result.success) {
  console.log(`Navigated to: ${result.url}`);
}
```

---

### `getUrl(options?)`

Retrieves the current URL of the browser's active page.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| options.instanceId | string | No | Specific browser instance ID |

**Response:**
```typescript
{
  success?: boolean;
  url?: string;        // Current URL
  currentUrl?: string; // Alternative field for current URL
}
```

```typescript
const result = await codebolt.browser.getUrl();
console.log(`Current URL: ${result.url || result.currentUrl}`);
```

---

### `screenshot(options?)`

Takes a screenshot of the current page.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| options.instanceId | string | No | Specific browser instance ID |
| options.fullPage | boolean | No | Capture full page or just viewport |
| options.quality | number | No | Image quality (0-100) |
| options.format | string | No | Image format ('png' or 'jpeg') |

**Response:**
```typescript
{
  success?: boolean;
  screenshot?: string; // Base64-encoded image data
  fullPage?: boolean;  // Whether full page was captured
}
```

```typescript
const result = await codebolt.browser.screenshot({ fullPage: true, format: 'png' });
if (result.success && result.screenshot) {
  // result.screenshot is base64-encoded image
  console.log(`Screenshot captured (full page: ${result.fullPage})`);
}
```

---

### `getHTML(options?)`

Retrieves the HTML content of the current page.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| options.instanceId | string | No | Specific browser instance ID |

**Response:**
```typescript
{
  success?: boolean;
  html?: string;    // Full HTML content
  content?: string; // Alternative field for content
}
```

```typescript
const result = await codebolt.browser.getHTML();
if (result.success) {
  const html = result.html || result.content;
  console.log(`HTML length: ${html?.length} chars`);
}
```

---

### `getMarkdown(options?)`

Retrieves the Markdown content of the current page.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| options.instanceId | string | No | Specific browser instance ID |

**Response:**
```typescript
{
  success?: boolean;
  markdown?: string; // Converted markdown content
  content?: string;  // Alternative field for content
}
```

```typescript
const result = await codebolt.browser.getMarkdown();
if (result.success) {
  const md = result.markdown || result.content;
  console.log(md);
}
```

---

### `getContent(options?)`

Retrieves the content of the current page in multiple formats.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| options.instanceId | string | No | Specific browser instance ID |

**Response:**
```typescript
{
  success?: boolean;
  content?: string; // Page content
  html?: string;    // HTML content
  text?: string;    // Plain text content
}
```

```typescript
const result = await codebolt.browser.getContent();
if (result.success) {
  console.log('HTML:', result.html?.substring(0, 100));
  console.log('Text:', result.text?.substring(0, 100));
}
```

---

### `getSnapShot(options?)`

Retrieves a DOM snapshot of the current page state.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| options.instanceId | string | No | Specific browser instance ID |

**Response:**
```typescript
{
  success?: boolean;
  tree?: {
    strings: string[];
    documents: Array<{
      nodes: {
        backendNodeId: number[];
        attributes: Array<{ name: string; value: string }>;
        nodeValue: string[];
        parentIndex: number[];
        nodeType: number[];
        nodeName: string[];
        isClickable: { index: number[] };
        textValue: { index: number[]; value: string[] };
        inputValue: { index: number[]; value: string[] };
        inputChecked: { index: number[] };
      };
    }>;
  };
}
```

```typescript
const result = await codebolt.browser.getSnapShot();
if (result.success && result.tree) {
  console.log(`Snapshot has ${result.tree.documents.length} documents`);
}
```

---

### `extractText(options?)`

Extracts text from the current page.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| options.instanceId | string | No | Specific browser instance ID |

**Response:**
```typescript
{
  success?: boolean;
  text?: string;    // Extracted plain text
  content?: string; // Alternative field
}
```

```typescript
const result = await codebolt.browser.extractText();
if (result.success) {
  const text = result.text || result.content;
  console.log(`Extracted ${text?.length} characters`);
}
```

---

### `getBrowserInfo(options?)`

Retrieves browser viewport and scroll information.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| options.instanceId | string | No | Specific browser instance ID |

**Response:**
```typescript
{
  success?: boolean;
  info?: BrowserViewportInfo;
  viewport?: BrowserViewportInfo;
}
```

```typescript
const result = await codebolt.browser.getBrowserInfo();
if (result.success) {
  const info = result.info || result.viewport;
  console.log(`Viewport: ${info?.width}x${info?.height}`);
  console.log(`Scroll position: (${info?.scrollX}, ${info?.scrollY})`);
  console.log(`Total height: ${info?.scrollHeight}`);
}
```

---

### `close(options?)`

Closes the current page.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| options.instanceId | string | No | Specific browser instance ID |

**Response:** `Promise<void>`

```typescript
await codebolt.browser.close();
console.log('Browser page closed');
```

---

### `scroll(direction, pixels, options?)`

Scrolls the current page in a specified direction.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| direction | string | Yes | Direction: 'up', 'down', 'left', 'right' |
| pixels | string | Yes | Number of pixels to scroll |
| options.instanceId | string | No | Specific browser instance ID |

**Response:**
```typescript
{
  success?: boolean;
  action?: string;  // 'scroll'
  message?: string;
}
```

```typescript
const result = await codebolt.browser.scroll('down', '500');
if (result.success) {
  console.log('Scrolled 500px down');
}
```

---

### `type(elementid, text, options?)`

Types text into a specified element on the page.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| elementid | string | Yes | The ID of the element to type into |
| text | string | Yes | The text to type |
| options.instanceId | string | No | Specific browser instance ID |

**Response:**
```typescript
{
  success?: boolean;
  action?: string;  // 'type'
  message?: string;
}
```

```typescript
const result = await codebolt.browser.type('search-input', 'hello world');
if (result.success) {
  console.log('Text typed successfully');
}
```

---

### `click(elementid, options?)`

Clicks on a specified element on the page.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| elementid | string | Yes | The ID of the element to click |
| options.instanceId | string | No | Specific browser instance ID |

**Response:**
```typescript
{
  success?: boolean;
  action?: string;  // 'click'
  message?: string;
}
```

```typescript
const result = await codebolt.browser.click('submit-button');
if (result.success) {
  console.log('Element clicked');
}
```

---

### `enter(options?)`

Simulates the Enter key press on the current page.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| options.instanceId | string | No | Specific browser instance ID |

**Response:**
```typescript
{
  success?: boolean;
  action?: string;  // 'enter'
  message?: string;
}
```

```typescript
const result = await codebolt.browser.enter();
if (result.success) {
  console.log('Enter key pressed');
}
```

---

### `search(elementid, query, options?)`

Performs a search on the current page using a specified query.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| elementid | string | Yes | The ID of the search element |
| query | string | Yes | The search query |
| options.instanceId | string | No | Specific browser instance ID |

**Response:**
```typescript
{
  success?: boolean;
  action?: string;  // 'search'
  message?: string;
}
```

```typescript
const result = await codebolt.browser.search('search-box', 'codebolt documentation');
if (result.success) {
  console.log('Search performed');
}
```

---

## Browser Instance Management

### `listBrowserInstances()`

Lists all open browser instances.

**Response:**
```typescript
Array<{
  instanceId: string;
  isActive: boolean;
  isReady: boolean;
  currentUrl: string;
  createdAt: string;  // ISO timestamp
  title: string;
}>
```

```typescript
const instances = await codebolt.browser.listBrowserInstances();
console.log(`${instances.length} browser instances open`);
instances.forEach(inst => {
  const status = inst.isActive ? '(active)' : '';
  console.log(`  ${inst.instanceId} ${status}: ${inst.currentUrl}`);
});
```

---

### `getBrowserInstance(instanceId)`

Gets a specific browser instance by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instanceId | string | Yes | The instance ID to get |

**Response:** `BrowserInstanceInfo | null`

```typescript
const instance = await codebolt.browser.getBrowserInstance('browser-123');
if (instance) {
  console.log(`Instance URL: ${instance.currentUrl}`);
  console.log(`Active: ${instance.isActive}`);
} else {
  console.log('Instance not found');
}
```

---

### `setActiveBrowserInstance(instanceId)`

Sets the active browser instance.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instanceId | string | Yes | The instance ID to set as active |

**Response:** `boolean` - true if successful

```typescript
const success = await codebolt.browser.setActiveBrowserInstance('browser-123');
if (success) {
  console.log('Active instance changed');
}
```

---

### `openNewBrowserInstance(options?)`

Opens a new browser instance.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| options.instanceId | string | No | Custom instance ID (auto-generated if omitted) |
| options.setActive | boolean | No | Set as active instance (default: true) |

**Response:**
```typescript
{
  instanceId: string;  // The new instance ID
}
```

```typescript
const result = await codebolt.browser.openNewBrowserInstance();
console.log(`Created instance: ${result.instanceId}`);
```

---

### `closeBrowserInstance(instanceId)`

Closes a browser instance.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instanceId | string | Yes | The instance ID to close |

**Response:** `boolean` - true if successful

```typescript
const success = await codebolt.browser.closeBrowserInstance('browser-123');
if (success) {
  console.log('Instance closed');
}
```

---

### `executeOnInstance(instanceId, operation, params)`

Executes an action on a specific browser instance.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instanceId | string | Yes | The instance ID to execute on |
| operation | string | Yes | Operation: 'goToPage', 'screenshot', 'getContent' |
| params | any | Yes | Parameters for the operation |

**Response:** Varies based on operation

```typescript
const result = await codebolt.browser.executeOnInstance(
  'browser-123',
  'goToPage',
  { url: 'https://example.com' }
);
```

## Examples

### Basic Web Scraping

```typescript
// Navigate and extract content
await codebolt.browser.newPage();
const navResult = await codebolt.browser.goToPage('https://example.com');

if (navResult.success) {
  // Get content in multiple formats
  const htmlResult = await codebolt.browser.getHTML();
  const markdownResult = await codebolt.browser.getMarkdown();
  const textResult = await codebolt.browser.extractText();

  console.log('HTML length:', htmlResult.html?.length);
  console.log('Markdown:', markdownResult.markdown?.substring(0, 200));
  console.log('Text:', textResult.text?.substring(0, 200));

  // Take a screenshot
  const screenshot = await codebolt.browser.screenshot({ fullPage: true });
  console.log('Screenshot captured:', !!screenshot.screenshot);
}

// Clean up
await codebolt.browser.close();
```

### Form Interaction

```typescript
await codebolt.browser.newPage();
await codebolt.browser.goToPage('https://example.com/login');

// Fill in form fields
await codebolt.browser.type('username-input', 'myuser');
await codebolt.browser.type('password-input', 'mypassword');

// Submit form
const clickResult = await codebolt.browser.click('login-button');
if (clickResult.success) {
  console.log('Form submitted');

  // Wait and check URL
  const urlResult = await codebolt.browser.getUrl();
  console.log('Redirected to:', urlResult.url);
}
```

### Multi-Instance Parallel Browsing

```typescript
// Open multiple browser instances
const { instanceId: browser1 } = await codebolt.browser.openNewBrowserInstance();
const { instanceId: browser2 } = await codebolt.browser.openNewBrowserInstance();

console.log(`Browser 1: ${browser1}`);
console.log(`Browser 2: ${browser2}`);

// Navigate each to different pages
await codebolt.browser.goToPage('https://site1.com', { instanceId: browser1 });
await codebolt.browser.goToPage('https://site2.com', { instanceId: browser2 });

// Get content from each
const content1 = await codebolt.browser.getMarkdown({ instanceId: browser1 });
const content2 = await codebolt.browser.getMarkdown({ instanceId: browser2 });

console.log('Site 1 content length:', content1.markdown?.length);
console.log('Site 2 content length:', content2.markdown?.length);

// List all instances
const instances = await codebolt.browser.listBrowserInstances();
console.log(`Total instances: ${instances.length}`);

// Clean up
await codebolt.browser.closeBrowserInstance(browser1);
await codebolt.browser.closeBrowserInstance(browser2);
```

### Scrolling and Information Gathering

```typescript
await codebolt.browser.newPage();
await codebolt.browser.goToPage('https://example.com/long-page');

// Get initial browser info
let info = await codebolt.browser.getBrowserInfo();
const viewport = info.info || info.viewport;
console.log(`Viewport: ${viewport?.width}x${viewport?.height}`);
console.log(`Total scroll height: ${viewport?.scrollHeight}`);

// Scroll through the page
let scrollPosition = 0;
while (scrollPosition < (viewport?.scrollHeight || 0)) {
  await codebolt.browser.scroll('down', '500');
  scrollPosition += 500;

  // Check new position
  info = await codebolt.browser.getBrowserInfo();
  console.log(`Scrolled to: ${info.info?.scrollY || info.viewport?.scrollY}`);
}

// Take final screenshot
const screenshot = await codebolt.browser.screenshot();
console.log('Final screenshot taken');
```

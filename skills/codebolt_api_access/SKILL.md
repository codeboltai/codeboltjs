---
name: codebolt-api-access
description: Direct TypeScript SDK API reference for codebolt modules (fs, browser, terminal)
---

# Codebolt API Access

This skill provides reference documentation for direct TypeScript SDK calls to codebolt modules.

## Key Distinction from codebolt-mcp-access

| Aspect | codebolt-mcp-access | codebolt-api-access |
|--------|---------------------|---------------------|
| Access Pattern | `codebolt.tools.executeTool("codebolt.fs", "read_file", {...})` | `codebolt.fs.readFile(path)` |
| Use Case | MCP tool execution | Direct TypeScript SDK calls |

## Quick Start

### File System Operations
```typescript
import codebolt from '@anthropic/codeboltjs';

// Read a file
const content = await codebolt.fs.readFile('/path/to/file.ts');

// Create a file
await codebolt.fs.createFile('newfile.ts', 'const x = 1;', '/path/to/dir');

// Search files with grep
const results = await codebolt.fs.grepSearch('/src', 'function', '*.ts');
```

### Browser Automation
```typescript
import codebolt from '@anthropic/codeboltjs';

// Navigate to a page
await codebolt.browser.goToPage('https://example.com');

// Take a screenshot
const screenshot = await codebolt.browser.screenshot();

// Get page content
const markdown = await codebolt.browser.getMarkdown();
```

### Terminal Commands
```typescript
import codebolt from '@anthropic/codeboltjs';

// Execute a command
const result = await codebolt.terminal.executeCommand('npm install');

// Execute with streaming output
const stream = codebolt.terminal.executeCommandWithStream('npm run dev');
stream.on('commandOutput', (data) => console.log(data));
```

## Module Reference

| Module | Description | Reference |
|--------|-------------|-----------|
| `codebolt.fs` | File system operations (read, write, search, diff) | [fs.md](references/fs.md) |
| `codebolt.browser` | Browser automation (navigation, screenshots, DOM) | [browser.md](references/browser.md) |
| `codebolt.terminal` | Command execution (sync, async, streaming) | [terminal.md](references/terminal.md) |

## Common Patterns

### Reading and Modifying Files
```typescript
// Read file content
const { content } = await codebolt.fs.readFile('/path/to/file.ts');

// Update with new content
await codebolt.fs.updateFile('file.ts', '/path/to', newContent);

// Or use writeToFile for relative paths
await codebolt.fs.writeToFile('src/file.ts', newContent);
```

### Browser Scraping Workflow
```typescript
// Open and navigate
await codebolt.browser.newPage();
await codebolt.browser.goToPage('https://example.com');

// Get content in different formats
const html = await codebolt.browser.getHTML();
const markdown = await codebolt.browser.getMarkdown();
const text = await codebolt.browser.extractText();

// Take screenshot
const screenshot = await codebolt.browser.screenshot({ fullPage: true });

// Clean up
await codebolt.browser.close();
```

### Multi-Instance Browser Management
```typescript
// Open multiple browser instances
const { instanceId: browser1 } = await codebolt.browser.openNewBrowserInstance();
const { instanceId: browser2 } = await codebolt.browser.openNewBrowserInstance();

// Execute on specific instance
await codebolt.browser.goToPage('https://site1.com', { instanceId: browser1 });
await codebolt.browser.goToPage('https://site2.com', { instanceId: browser2 });

// List all instances
const instances = await codebolt.browser.listBrowserInstances();

// Close specific instance
await codebolt.browser.closeBrowserInstance(browser1);
```

### Long-Running Command Execution
```typescript
// Run until error (useful for dev servers)
const error = await codebolt.terminal.executeCommandRunUntilError('npm run dev');

// Run until manually interrupted
const result = await codebolt.terminal.executeCommandRunUntilInterrupt('npm run watch');

// Send interrupt signal
await codebolt.terminal.sendManualInterrupt();
```

### Streaming Command Output
```typescript
const stream = codebolt.terminal.executeCommandWithStream('npm test');

stream.on('commandOutput', (data) => {
    console.log('Output:', data);
});

stream.on('commandError', (data) => {
    console.error('Error:', data);
});

stream.on('commandFinish', (data) => {
    console.log('Finished:', data);
    stream.cleanup?.(); // Clean up listeners
});
```

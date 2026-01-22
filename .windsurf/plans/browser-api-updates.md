# Browser API Updates Plan

This plan outlines the necessary updates to sync the codeboltjs package and documentation with the new Browser API changes from src/main/server/cliLib.

## Key Changes Identified

The Browser API has been updated to support multi-instance management with the following key changes:

### 1. Instance Management
- All browser operations now require an `instanceId` parameter
- New browser instance management APIs have been added
- Support for multiple concurrent browser instances

### 2. New Instance Management APIs
- `listBrowserInstances()` - List all open browser instances
- `getBrowserInstance(instanceId)` - Get specific instance details
- `setActiveBrowserInstance(instanceId)` - Set active instance
- `openNewBrowserInstance()` - Create new browser instance
- `closeBrowserInstance(instanceId)` - Close specific instance
- `executeOnInstance(instanceId, operation, params)` - Execute on specific instance

## Required Updates

### 1. codeboltjs Package Updates

#### A. Browser Module (`src/modules/browser.ts`)
- Update all existing browser functions to accept optional `instanceId` parameter
- Add active instance management logic
- Add new instance management functions
- Implement automatic active instance creation and tracking
- Update function signatures to support both patterns

#### B. Type Definitions (`src/types/libFunctionTypes.ts`)
- Add new browser instance management types
- Update existing browser API types to make instanceId optional
- Add BrowserInstanceInfo and related types
- Update BrowserNavigationOptions, BrowserScreenshotOptions, etc. to include optional instanceId

#### C. Main Exports (`src/index.ts`)
- Export new browser instance management functions
- Export new browser-related types
- Ensure proper integration with existing API

### 2. Documentation Updates

#### A. Browser API Documentation (`docs/5_api/ApiAccess/browser/`)
- Update main index.md to show both active and explicit instance patterns
- Add new documentation pages for instance management APIs:
  - `listInstances.md`
  - `getInstance.md`
  - `setActiveInstance.md`
  - `openNewInstance.md`
  - `closeInstance.md`
  - `executeOnInstance.md`
- Update existing function documentation to show optional instanceId parameter
- Add sections on active instance management for LLM usage

#### B. API Access Main Documentation
- Update browser section to reflect new multi-instance capabilities
- Add examples showing instance management workflows
- Update quick start guides

## Implementation Strategy

### Phase 1: Type Updates
1. Add new browser instance types to `libFunctionTypes.ts`
2. Import and export new types in `index.ts`

### Phase 2: Module Updates
1. Update browser module with instance management
2. Update all existing functions to require instanceId parameter
3. Add new instance management functions

### Phase 3: Documentation Updates
1. Update existing browser API documentation
2. Add new instance management documentation
3. Update all examples to use instanceId pattern

### Phase 4: Testing and Validation
1. Validate new instance management features
2. Test all updated examples

## API Changes

Browser functions support both explicit and implicit instance management:

### Active Instance Pattern (Recommended for LLM calls)
```js
// No instanceId needed - uses active instance or creates one
await codebolt.browser.goToPage('https://example.com');
const content = await codebolt.browser.getContent();
```

### Explicit Instance Pattern (For multi-instance control)
```js
// Create and manage specific instances
const instance = await codebolt.browser.openNewBrowserInstance();
await codebolt.browser.goToPage('https://example.com', { 
  instanceId: instance.instanceId 
});
```

### Active Instance Management
- `instanceId` is optional in all browser functions
- If no `instanceId` provided: uses active instance or creates new one
- If `instanceId` provided: uses that specific instance
- Active instance is tracked per agent/session
- First browser operation automatically creates active instance

## New Features to Highlight

1. **Multi-Instance Support**: Run multiple browser instances simultaneously
2. **Instance Management**: Full lifecycle management of browser instances
3. **Enhanced Control**: Better resource management and cleanup
4. **Improved Error Handling**: Instance-specific error reporting

## Example Usage Patterns

### Simple LLM Usage (Active Instance Pattern)
```js
// LLM can call browser API without worrying about instances
await codebolt.browser.goToPage('https://example.com');
const content = await codebolt.browser.getContent();
await codebolt.browser.screenshot();
// Active instance is automatically managed
```

### Advanced Multi-Instance Control
```js
// Create multiple instances for complex workflows
const instance1 = await codebolt.browser.openNewBrowserInstance();
const instance2 = await codebolt.browser.openNewBrowserInstance();

// Control specific instances
await codebolt.browser.goToPage('https://example.com', { 
  instanceId: instance1.instanceId 
});
await codebolt.browser.goToPage('https://google.com', { 
  instanceId: instance2.instanceId 
});

// List all instances
const instances = codebolt.browser.listBrowserInstances();
console.log('Active instances:', instances);

// Set active instance (affects subsequent calls without instanceId)
codebolt.browser.setActiveBrowserInstance(instance1.instanceId);
await codebolt.browser.getContent(); // Uses instance1

// Cleanup
await codebolt.browser.closeBrowserInstance(instance1.instanceId);
await codebolt.browser.closeBrowserInstance(instance2.instanceId);
```

### Mixed Pattern Usage
```js
// Start with simple active instance usage
await codebolt.browser.goToPage('https://example.com');
const content = await codebolt.browser.getContent();

// Create separate instance for specific task
const researchInstance = await codebolt.browser.openNewBrowserInstance();
await codebolt.browser.goToPage('https://research-site.com', { 
  instanceId: researchInstance.instanceId 
});

// Active instance remains unchanged
await codebolt.browser.goToPage('https://another-site.com'); // Uses active instance

// Cleanup specific instance
await codebolt.browser.closeBrowserInstance(researchInstance.instanceId);
```

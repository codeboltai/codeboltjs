# Browser API Implementation Details

## Phase 1: Type Updates

### 1.1 Add Browser Instance Types to `libFunctionTypes.ts`

Add these interfaces after the existing Browser API types (around line 842):

```typescript
// Browser Instance Management Types
export interface BrowserInstanceInfo {
  /** Unique identifier for the browser instance */
  instanceId: string;
  /** Whether the instance is currently active */
  isActive: boolean;
  /** Whether the instance is ready for operations */
  isReady: boolean;
  /** Current URL of the browser instance */
  currentUrl?: string;
  /** When the instance was created */
  createdAt: string;
  /** Page title */
  title?: string;
}

export interface BrowserInstanceOptions {
  /** Optional instance ID (if not provided, will be generated) */
  instanceId?: string;
  /** Whether to set this as the active instance */
  setActive?: boolean;
}

export interface BrowserOperationOptions {
  /** Browser instance ID (optional - uses active instance if not provided) */
  instanceId?: string;
  /** Additional operation-specific options */
  [key: string]: any;
}
```

### 1.2 Update Existing Browser Types

Update the existing browser types to include optional instanceId:

```typescript
export interface BrowserNavigationOptions extends BrowserOperationOptions {
  /** URL to navigate to */
  url: string;
  /** Wait for page load (default: true) */
  waitForLoad?: boolean;
  /** Timeout in milliseconds */
  timeout?: number;
}

export interface BrowserScreenshotOptions extends BrowserOperationOptions {
  /** Take full page screenshot */
  fullPage?: boolean;
  /** Image quality (0-100) */
  quality?: number;
  /** Image format */
  format?: 'png' | 'jpeg';
}

export interface BrowserElementSelector extends BrowserOperationOptions {
  /** CSS selector */
  selector: string;
  /** Whether to wait for element */
  waitFor?: boolean;
  /** Timeout for waiting */
  timeout?: number;
}
```

## Phase 2: Browser Module Updates

### 2.1 Update Browser Module (`src/modules/browser.ts`)

Add active instance management at the top of the file:

```typescript
// Active instance management
let activeInstanceId: string | null = null;

// Helper function to get or create active instance
const getOrCreateActiveInstance = async (): Promise<string> => {
  if (activeInstanceId) {
    // Check if active instance still exists
    const instances = cbbrowser.listBrowserInstances();
    const activeInstance = instances.find(inst => inst.instanceId === activeInstanceId);
    if (activeInstance && activeInstance.isActive) {
      return activeInstanceId;
    }
  }
  
  // Create new instance and set as active
  const newInstance = await cbbrowser.openNewBrowserInstance();
  activeInstanceId = newInstance.instanceId;
  return activeInstanceId;
};

// Helper function to resolve instance ID
const resolveInstanceId = async (options?: BrowserOperationOptions): Promise<string> => {
  if (options?.instanceId) {
    return options.instanceId;
  }
  return await getOrCreateActiveInstance();
};
```

### 2.2 Update All Browser Functions

Update each existing browser function to accept optional instanceId:

```typescript
// Example for newPage
newPage: async (options?: BrowserInstanceOptions): Promise<BrowserActionResponseData> => {
  const instanceId = options?.instanceId || await getOrCreateActiveInstance();
  
  const response = await cbws.messageManager.sendAndWaitForResponse(
    {
      "type": EventType.BROWSER_EVENT,
      action: BrowserAction.NEW_PAGE,
      instanceId
    },
    BrowserResponseType.NEW_PAGE_RESPONSE
  );
  
  if (options?.setActive !== false) {
    activeInstanceId = instanceId;
  }
  
  return response;
},

// Example for goToPage
goToPage: async (url: string, options?: BrowserOperationOptions): Promise<GoToPageResponse> => {
  const instanceId = await resolveInstanceId(options);
  
  return cbws.messageManager.sendAndWaitForResponse(
    {
      "type": EventType.BROWSER_EVENT,
      action: BrowserAction.GO_TO_PAGE,
      url,
      instanceId
    },
    BrowserResponseType.GO_TO_PAGE_RESPONSE
  );
},

// Example for screenshot
screenshot: async (options?: BrowserScreenshotOptions): Promise<BrowserScreenshotResponse> => {
  const instanceId = await resolveInstanceId(options);
  
  return cbws.messageManager.sendAndWaitForResponse(
    {
      "type": EventType.BROWSER_EVENT,
      action: BrowserAction.SCREENSHOT,
      instanceId,
      // Pass through other options
      ...options
    },
    BrowserResponseType.SCREENSHOT_RESPONSE
  );
},
```

### 2.3 Add New Instance Management Functions

Add these new functions to the browser module:

```typescript
// Instance Management Functions
listBrowserInstances: (): BrowserInstanceInfo[] => {
  return cbws.messageManager.sendAndWaitForResponse(
    {
      "type": EventType.BROWSER_EVENT,
      action: "LIST_INSTANCES"
    },
    "INSTANCES_RESPONSE"
  );
},

getBrowserInstance: (instanceId: string): BrowserInstanceInfo | null => {
  return cbws.messageManager.sendAndWaitForResponse(
    {
      "type": EventType.BROWSER_EVENT,
      action: "GET_INSTANCE",
      instanceId
    },
    "INSTANCE_RESPONSE"
  );
},

setActiveBrowserInstance: (instanceId: string): boolean => {
  const success = cbws.messageManager.sendAndWaitForResponse(
    {
      "type": EventType.BROWSER_EVENT,
      action: "SET_ACTIVE",
      instanceId
    },
    "SET_ACTIVE_RESPONSE"
  );
  
  if (success) {
    activeInstanceId = instanceId;
  }
  return success;
},

openNewBrowserInstance: async (options?: BrowserInstanceOptions): Promise<{ instanceId: string }> => {
  const response = await cbws.messageManager.sendAndWaitForResponse(
    {
      "type": EventType.BROWSER_EVENT,
      action: "OPEN_NEW_INSTANCE",
      instanceId: options?.instanceId
    },
    "NEW_INSTANCE_RESPONSE"
  );
  
  if (options?.setActive !== false) {
    activeInstanceId = response.instanceId;
  }
  
  return response;
},

closeBrowserInstance: async (instanceId: string): Promise<boolean> => {
  const response = await cbws.messageManager.sendAndWaitForResponse(
    {
      "type": EventType.BROWSER_EVENT,
      action: BrowserAction.CLOSE,
      instanceId
    },
    BrowserResponseType.CLOSE_RESPONSE
  );
  
  if (instanceId === activeInstanceId) {
    activeInstanceId = null;
  }
  
  return response;
},

executeOnInstance: async (
  instanceId: string,
  operation: string,
  params: any,
  finalMessage: any
): Promise<any> => {
  return cbws.messageManager.sendAndWaitForResponse(
    {
      "type": EventType.BROWSER_EVENT,
      action: operation,
      instanceId,
      ...params
    },
    "EXECUTE_ON_INSTANCE_RESPONSE"
  );
},
```

## Phase 3: Update Main Exports

### 3.1 Update `src/index.ts`

Add the new browser instance management exports around line 38-42:

```typescript
    // Browser API Types
    BrowserNavigationOptions,
    BrowserScreenshotOptions,
    BrowserElementSelector,
    BrowserInstanceInfo,
    BrowserInstanceOptions,
    BrowserOperationOptions,
```

Add the new browser function exports around line 520 (after the existing browser exports):

```typescript
// Browser instance management functions
export {
    listBrowserInstances,
    getBrowserInstance,
    setActiveBrowserInstance,
    openNewBrowserInstance,
    closeBrowserInstance,
    executeOnInstance
} from './modules/browser';
```

## Phase 4: Documentation Updates

### 4.1 Update Main Browser Documentation

Update `docs/5_api/ApiAccess/browser/index.md`:

1. Update the frontmatter to include new instance management functions
2. Add sections explaining active instance pattern
3. Update all examples to show both patterns
4. Add migration notes

### 4.2 Create New Instance Management Documentation

Create these new documentation files:

- `listInstances.md` - Documentation for listing browser instances
- `getInstance.md` - Documentation for getting specific instance details
- `setActiveInstance.md` - Documentation for setting active instance
- `openNewInstance.md` - Documentation for creating new instances
- `closeInstance.md` - Documentation for closing instances
- `executeOnInstance.md` - Documentation for executing on specific instances

### 4.3 Update Existing Function Documentation

Update all existing browser function documentation to:
- Show optional instanceId parameter
- Provide examples for both active and explicit patterns
- Explain when to use each pattern

## Implementation Notes

### WebSocket Message Updates

The browser module will need to send instanceId in all WebSocket messages. The message structure will be:

```typescript
{
  "type": EventType.BROWSER_EVENT,
  "action": BrowserAction.SOME_ACTION,
  "instanceId": "browser-uuid-string",
  // ... other parameters
}
```

### Error Handling

Add proper error handling for:
- Invalid instance IDs
- Instance not found
- Instance connection issues
- Active instance cleanup

### Testing Strategy

1. Test active instance creation and management
2. Test explicit instance management
3. Test mixed usage patterns
4. Test error scenarios
5. Test cleanup and resource management

## Files to Modify

1. `/packages/codeboltjs/src/types/libFunctionTypes.ts` - Add new types
2. `/packages/codeboltjs/src/modules/browser.ts` - Update browser functions
3. `/packages/codeboltjs/src/index.ts` - Update exports
4. `/documentation/mainfolder/docs/5_api/ApiAccess/browser/index.md` - Update main docs
5. Create new documentation files for instance management functions

This implementation provides a clean, backward-compatible API that supports both simple LLM usage and advanced multi-instance control.

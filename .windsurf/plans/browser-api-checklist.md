# Browser API Implementation Checklist

## Ready to Implement

The implementation plan is complete and ready to execute. Here's the step-by-step checklist:

### Phase 1: Type Updates ✅ Ready
- [ ] Add BrowserInstanceInfo interface to libFunctionTypes.ts
- [ ] Add BrowserInstanceOptions interface to libFunctionTypes.ts  
- [ ] Add BrowserOperationOptions interface to libFunctionTypes.ts
- [ ] Update BrowserNavigationOptions to extend BrowserOperationOptions
- [ ] Update BrowserScreenshotOptions to extend BrowserOperationOptions
- [ ] Update BrowserElementSelector to extend BrowserOperationOptions

### Phase 2: Browser Module Updates ✅ Ready
- [ ] Add active instance management variables to browser.ts
- [ ] Add getOrCreateActiveInstance() helper function
- [ ] Add resolveInstanceId() helper function
- [ ] Update newPage() function to accept optional instanceId
- [ ] Update goToPage() function to accept optional instanceId
- [ ] Update screenshot() function to accept optional instanceId
- [ ] Update getHTML() function to accept optional instanceId
- [ ] Update getMarkdown() function to accept optional instanceId
- [ ] Update getContent() function to accept optional instanceId
- [ ] Update getUrl() function to accept optional instanceId
- [ ] Update scroll() function to accept optional instanceId
- [ ] Update type() function to accept optional instanceId
- [ ] Update click() function to accept optional instanceId
- [ ] Update enter() function to accept optional instanceId
- [ ] Update search() function to accept optional instanceId
- [ ] Update close() function to accept optional instanceId
- [ ] Update extractText() function to accept optional instanceId
- [ ] Update getSnapShot() function to accept optional instanceId
- [ ] Update getBrowserInfo() function to accept optional instanceId
- [ ] Update getPDF() function to accept optional instanceId
- [ ] Update pdfToText() function to accept optional instanceId

### Phase 3: New Instance Management Functions ✅ Ready
- [ ] Add listBrowserInstances() function
- [ ] Add getBrowserInstance() function
- [ ] Add setActiveBrowserInstance() function
- [ ] Add openNewBrowserInstance() function
- [ ] Add closeBrowserInstance() function
- [ ] Add executeOnInstance() function

### Phase 4: Main Exports Update ✅ Ready
- [ ] Export new browser instance types in index.ts
- [ ] Export new browser instance management functions in index.ts

### Phase 5: Documentation Updates ✅ Ready
- [ ] Update browser/index.md with new API patterns
- [ ] Create listInstances.md documentation
- [ ] Create getInstance.md documentation
- [ ] Create setActiveInstance.md documentation
- [ ] Create openNewInstance.md documentation
- [ ] Create closeInstance.md documentation
- [ ] Create executeOnInstance.md documentation
- [ ] Update all existing browser function documentation

## Implementation Order

1. **Type Definitions First** - Add all new types to libFunctionTypes.ts
2. **Browser Module Second** - Update browser.ts with new functions and active instance management
3. **Exports Third** - Update index.ts to export new functionality
4. **Documentation Last** - Update all documentation files

## Key Implementation Details

### Active Instance Pattern
```typescript
// Simple usage - no instanceId needed
await codebolt.browser.goToPage('https://example.com');
```

### Explicit Instance Pattern  
```typescript
// Multi-instance control
const instance = await codebolt.browser.openNewBrowserInstance();
await codebolt.browser.goToPage('https://example.com', { 
  instanceId: instance.instanceId 
});
```

### WebSocket Message Structure
All browser messages will include instanceId:
```typescript
{
  "type": EventType.BROWSER_EVENT,
  "action": BrowserAction.SOME_ACTION,
  "instanceId": "browser-uuid-string",
  // ... other parameters
}
```

## Files to Modify

1. `/packages/codeboltjs/src/types/libFunctionTypes.ts`
2. `/packages/codeboltjs/src/modules/browser.ts`
3. `/packages/codeboltjs/src/index.ts`
4. `/documentation/mainfolder/docs/5_api/ApiAccess/browser/index.md`
5. Create 6 new documentation files for instance management

## Ready for Implementation

All planning is complete. The implementation can proceed with the detailed specifications provided in the implementation plan document.

**Next Step**: Begin with Phase 1 - Type Updates in libFunctionTypes.ts

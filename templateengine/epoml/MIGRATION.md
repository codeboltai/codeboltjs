# Migration Guide: From Epoml Namespace to Direct Functions

## Overview

EPOML (Enhanced Prompt Orchestration Markup Language) has been refactored to use direct function exports instead of the `Epoml` namespace wrapper. This provides better tree-shaking, follows React-like patterns, and improves developer experience.

## What Changed

### Before (Deprecated)
```typescript
import { Epoml } from 'epoml';

function MyComponent() {
  return Epoml.createElement('div', {}, 
    Epoml.createElement('p', {}, 'Hello World')
  );
}
```

### After (Recommended)
```typescript
import { createElement } from 'epoml';

function MyComponent() {
  return createElement('div', {}, 
    createElement('p', {}, 'Hello World')
  );
}
```

## Breaking Changes

1. **Direct function exports**: Use `createElement` and `Fragment` directly instead of `Epoml.createElement` and `Epoml.Fragment`
2. **JSX pragma updated**: TypeScript config now uses `createElement` instead of `Epoml.createElement`
3. **Component imports**: Import `createElement` directly for custom components

## Migration Steps

### 1. Update imports
```diff
- import { Epoml, registerComponent } from 'epoml';
+ import { createElement, Fragment, registerComponent } from 'epoml';
```

### 2. Replace function calls
```diff
- Epoml.createElement('div', {}, 'content')
+ createElement('div', {}, 'content')

- Epoml.Fragment
+ Fragment
```

### 3. Update TypeScript config (if using JSX)
```diff
{
  "compilerOptions": {
-   "jsxFactory": "Epoml.createElement",
-   "jsxFragmentFactory": "Epoml.Fragment"
+   "jsxFactory": "createElement",
+   "jsxFragmentFactory": "Fragment"
  }
}
```

## Backward Compatibility

⚠️ **Breaking Change**: The `Epoml` namespace has been completely removed. You must update your code to use the direct function exports.

## Benefits

- **Better tree-shaking**: Only import what you need
- **React-like patterns**: Familiar API for React developers  
- **Cleaner code**: Less verbose function calls
- **Improved performance**: Direct function calls instead of namespace lookups
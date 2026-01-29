---
title: CODEPARSERS_MIGRATION
---

# CodeParsers Migration Guide

## Overview

The `codeparsers` functions have been migrated from the `@codebolt/codeboltjs` package to the `@codebolt/codeparser` package to resolve import conflicts and improve modular design.

## What Changed

### Before Migration
```javascript
import codebolt from '@codebolt/codeboltjs';

// Using codeparsers through the main codebolt instance
const classes = await codebolt.codeparsers.getClassesInFile('file.js');
const functions = await codebolt.codeparsers.getFunctionsinClass('file.js', 'ClassName');
const ast = await codebolt.codeparsers.getAstTreeInFile('file.js');
```

### After Migration
```javascript
// Option 1: Continue using through the main codebolt instance (recommended for existing code)
import codebolt from '@codebolt/codeboltjs';

const classes = await codebolt.codeparsers.getClassesInFile('file.js');
const functions = await codebolt.codeparsers.getFunctionsinClass('file.js', 'ClassName');
const ast = await codebolt.codeparsers.getAstTreeInFile('file.js');

// Option 2: Import directly from the codeparser package (for new projects)
import { cbcodeparsers } from '@codebolt/codeparser';

const classes = await cbcodeparsers.getClassesInFile('file.js');
const functions = await cbcodeparsers.getFunctionsinClass('file.js', 'ClassName');
const ast = await cbcodeparsers.getAstTreeInFile('file.js');
```

## Benefits of Migration

1. **Resolves Import Conflicts**: Eliminates conflicts between `@codebolt/codeboltjs` and `@codebolt/codeparser` imports
2. **Better Modularity**: Users can now import just the codeparser functionality without the full codebolt package
3. **Cleaner Dependencies**: Reduces circular dependencies and improves build performance
4. **Direct Access**: Users can access advanced codeparser features directly

## Available Functions

The following functions are available through both approaches:

- `getClassesInFile(file: string)` - Retrieves classes in a given file
- `getFunctionsinClass(file: string, className: string)` - Retrieves functions in a given class
- `getAstTreeInFile(file: string, className?: string)` - Generates AST for a file or specific class

## Type Compatibility

The `ASTNode` type has been updated to maintain compatibility. Both formats are supported:

```typescript
// @codebolt/codeparser format (new)
interface ASTNode {
  type: string;
  start?: number;
  end?: number;
  line?: number;
  column?: number;
  children?: ASTNode[];
  value?: any;
  [key: string]: any;
}

// @codebolt/codeboltjs compatible format
interface CodeboltASTNode {
  type: string;
  text: string;
  startPosition: { row: number; column: number };
  endPosition: { row: number; column: number };
  children: CodeboltASTNode[];
}
```

## Backward Compatibility

- **Existing Code**: No changes required. The `codebolt.codeparsers` interface remains unchanged.
- **New Projects**: Can choose to import directly from `@codebolt/codeparser` for better modularity.

## Migration Timeline

- **Immediate**: The migration is already complete and functional
- **Existing Code**: No breaking changes, continue using `codebolt.codeparsers`
- **Future**: Consider using direct imports for new projects and features

## Support

If you encounter any issues with the migration, please:

1. Ensure you're using the latest version of both packages
2. Check that your imports are correct
3. Run `npm install` to ensure workspace dependencies are properly linked
4. Report issues in the GitHub repository

## Testing

A comprehensive test suite verifies that all functions work correctly in both usage patterns. See `codeparsers-migration-test.js` for examples.
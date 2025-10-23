# Codebolt Utilities

This directory contains utility functions extracted from the Codebolt tools to provide modular, reusable functionality.

## Structure

### Search Utilities (`/search`)
- `GlobSearch.ts` - File pattern matching utilities
- `GrepSearch.ts` - Text search utilities within files
- Supporting files for search operations

### File System Utilities (`/fileSystem`)
- `ListDirectory.ts` - Directory listing utilities
- `ReadFile.ts` - File reading utilities
- `WriteFile.ts` - File writing utilities

### Terminal Utilities (`/terminal`)
- `ExecuteCommand.ts` - Shell command execution utilities
- `GitAction.ts` - Git operation utilities

## Usage

Each utility directory contains an `index.ts` file that exports all functions for easy importing:

```typescript
// Import search utilities
import { executeGlobSearch, executeGrepSearch } from '../utils/search';

// Import file system utilities
import { executeListDirectory, executeReadFile, executeWriteFile } from '../utils/fileSystem';

// Import terminal utilities
import { executeCommand, executeGitAction } from '../utils/terminal';
```

## Benefits

1. **Modularity**: Each utility is self-contained and can be used independently
2. **Reusability**: Functions can be imported and used in multiple places
3. **Maintainability**: Changes to utility functions only need to be made in one place
4. **Testability**: Each utility can be tested independently
# Git WorkTree Provider - Interface Documentation

## Overview

The Git WorkTree Provider has been refactored to use a clean interface-based architecture that provides better type safety, maintainability, and testability.

## Architecture

### Interface Structure

```
src/
├── interfaces/
│   ├── IProviderService.ts    # Main provider interface
│   └── index.ts              # Interface exports
├── services/
│   ├── GitWorktreeProviderService.ts  # Implementation
│   └── index.ts              # Service exports
├── examples/
│   └── usage.ts              # Usage examples
└── index.ts                  # Main entry point
```

## Core Interface: `IProviderService`

The main interface that defines the contract for the Git WorkTree Provider:

```typescript
interface IProviderService {
  // Core provider lifecycle methods
  onProviderStart(initvars: ProviderInitVars): Promise<ProviderStartResult>;
  onProviderAgentStart(initvars: any): void | Promise<void>;
  onGetDiffFiles(): Promise<DiffResult>;
  onCloseSignal(): Promise<void>;
  onCreatePatchRequest(): void | Promise<void>;
  onCreatePullRequestRequest(): void | Promise<void>;

  // Agent server management
  startAgentServer(): Promise<void>;
  connectToAgentServer(worktreePath: string, environmentName: string): Promise<void>;
  stopAgentServer(): Promise<boolean>;

  // Worktree management
  createWorktree(projectPath: string, environmentName: string): Promise<WorktreeInfo>;
  removeWorktree(projectPath: string): Promise<boolean>;

  // Utility methods
  getWorktreeInfo(): WorktreeInfo;
  getAgentServerConnection(): AgentServerConnection;
  isInitialized(): boolean;
}
```

## Type Definitions

### Core Types

```typescript
interface ProviderInitVars {
  environmentName: string;
}

interface ProviderStartResult {
  success: boolean;
  worktreePath: string;
  environmentName: string;
  agentServerUrl: string;
}

interface DiffFile {
  file: string;
  changes: number;
  insertions: number;
  deletions: number;
  binary: boolean;
  status?: 'added' | 'modified' | 'deleted' | 'renamed' | 'copied';
  oldFile?: string;
  diff?: string;
}

interface DiffResult {
  files: DiffFile[];
  insertions: number;
  deletions: number;
  changed: number;
  rawDiff?: string;
}
```

### Configuration Types

```typescript
interface ProviderConfig {
  agentServerPath?: string;
  agentServerPort?: number;
  agentServerHost?: string;
  worktreeBaseDir?: string;
  timeouts?: {
    agentServerStartup?: number;
    wsConnection?: number;
    gitOperations?: number;
    cleanup?: number;
  };
}
```

### State Management Types

```typescript
interface WorktreeInfo {
  path: string | null;
  branch: string | null;
  isCreated: boolean;
}

interface AgentServerConnection {
  process: ChildProcess | null;
  wsConnection: WebSocket | null;
  serverUrl: string;
  isConnected: boolean;
}
```

## Implementation: `GitWorktreeProviderService`

The main service class that implements the `IProviderService` interface:

### Key Features

1. **Type Safety**: All methods are properly typed with interfaces
2. **State Management**: Encapsulated state for worktree and agent server
3. **Configuration**: Flexible configuration system with defaults
4. **Error Handling**: Comprehensive error handling and logging
5. **Resource Management**: Proper cleanup of processes and connections

### Default Configuration

```typescript
{
  agentServerPort: 3001,
  agentServerHost: 'localhost',
  worktreeBaseDir: '.worktree',
  timeouts: {
    agentServerStartup: 30000,
    wsConnection: 10000,
    gitOperations: 30000,
    cleanup: 15000
  }
}
```

## Usage Examples

### Basic Usage

```typescript
import { GitWorktreeProviderService } from './services/GitWorktreeProviderService';
import { IProviderService } from './interfaces/IProviderService';

const provider: IProviderService = new GitWorktreeProviderService();

// Start the provider
const result = await provider.onProviderStart({
  environmentName: 'my-feature'
});

// Check status
console.log('Initialized:', provider.isInitialized());
console.log('Worktree info:', provider.getWorktreeInfo());

// Cleanup
await provider.onCloseSignal();
```

### Custom Configuration

```typescript
import { GitWorktreeProviderService } from './services/GitWorktreeProviderService';
import { ProviderConfig } from './interfaces/IProviderService';

const config: ProviderConfig = {
  agentServerPort: 3002,
  worktreeBaseDir: '.custom-worktree',
  timeouts: {
    agentServerStartup: 45000,
    wsConnection: 15000
  }
};

const provider = new GitWorktreeProviderService(config);
```

## Benefits of Interface-Based Architecture

### 1. Type Safety
- Compile-time type checking
- IntelliSense support in IDEs
- Prevents runtime type errors

### 2. Maintainability
- Clear separation of concerns
- Easier to understand and modify
- Better code organization

### 3. Testability
- Easy to mock interfaces for unit tests
- Clear contracts for testing
- Isolated testing of components

### 4. Extensibility
- Easy to add new implementations
- Plugin architecture support
- Future-proof design

### 5. Documentation
- Self-documenting code through types
- Clear API contracts
- Better developer experience

## Migration from Legacy Code

The refactoring maintains backward compatibility while providing the new interface-based architecture:

### Before (Legacy)
```typescript
// Global variables and functions
let createdWorktreePath: string | null = null;
async function startAgentServer(): Promise<void> { ... }
```

### After (Interface-based)
```typescript
// Encapsulated service with interface
const provider: IProviderService = new GitWorktreeProviderService();
await provider.startAgentServer();
```

## Future Enhancements

The interface-based architecture enables future enhancements:

1. **Multiple Implementations**: Different provider strategies
2. **Plugin System**: Extensible functionality
3. **Better Testing**: Mock implementations for testing
4. **Configuration Management**: Advanced configuration options
5. **Monitoring**: Built-in metrics and health checks

## API Reference

See the interface definitions in `src/interfaces/IProviderService.ts` for complete API documentation with TypeScript types and JSDoc comments.

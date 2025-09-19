# E2B Sandbox Module

This module provides sandbox functionality for the E2B provider, allowing for isolated code execution in remote environments. The module is organized using a modular TypeScript architecture with proper separation of concerns.

## Architecture

The sandbox module is now properly organized in the `src/` directory structure:

```
src/
├── types/
│   ├── sandbox.ts        # Sandbox interfaces and type definitions
│   ├── provider.ts       # Provider configuration types
│   └── index.ts          # Type exports
├── utils/
│   ├── sandboxManager.ts # Sandbox implementations and manager
│   ├── messageHelpers.ts # Notification system
│   └── index.ts          # Utility exports
├── handlers/
│   ├── lifecycle.ts      # Provider lifecycle handlers
│   ├── agent.ts          # Agent processing handlers
│   └── index.ts          # Handler exports
├── index.ts              # Main entry point
└── sandbox.ts            # Clean sandbox interface
```

## Components

### 1. E2BSandbox Interface (`src/types/sandbox.ts`)

Defines the contract for sandbox operations:

```typescript
interface E2BSandbox {
  id: string;
  create(): Promise<void>;
  destroy(): Promise<void>;
  filesystem: {
    write(path: string, content: string): Promise<void>;
    read(path: string): Promise<string>;
    exists(path: string): Promise<boolean>;
    list(path: string): Promise<string[]>;
    mkdir(path: string): Promise<void>;
    rm(path: string, recursive?: boolean): Promise<void>;
  };
  git: {
    getDiff(): Promise<string>;
    status(): Promise<GitStatus>;
    add(files: string[]): Promise<void>;
    commit(message: string): Promise<void>;
    push(): Promise<void>;
    pull(): Promise<void>;
  };
  terminal: {
    run(command: string): Promise<TerminalResult>;
  };
}
```

### 2. MockE2BSandbox Class (`src/utils/sandboxManager.ts`)

A mock implementation for development and testing:

```typescript
import { createE2BSandbox } from '@codebolt/e2b-provider';

const sandbox = createE2BSandbox();
await sandbox.create();
await sandbox.filesystem.write('test.js', 'console.log("Hello");');
await sandbox.destroy();
```

### 3. SandboxManager Class (`src/utils/sandboxManager.ts`)

Manages multiple sandbox instances:

```typescript
import { SandboxManager } from '@codebolt/e2b-provider';

const manager = new SandboxManager();
const sandbox1 = await manager.createSandbox();
const sandbox2 = await manager.createSandbox();

console.log(manager.getActiveSandboxIds()); // ['sandbox-123', 'sandbox-456']

await manager.destroySandbox(sandbox1.id);
await manager.destroyAll();
```

### 4. Factory Functions (`src/utils/sandboxManager.ts`)

Convenient functions for creating sandboxes:

```typescript
import { createE2BSandbox, defaultSandboxManager } from '@codebolt/e2b-provider';

// Create a single sandbox
const sandbox = createE2BSandbox();

// Use default manager
const managedSandbox = await defaultSandboxManager.createSandbox();
```

## Usage Patterns

### Basic Usage

```typescript
import { createE2BSandbox } from '@codebolt/e2b-provider';

const sandbox = createE2BSandbox();
await sandbox.create();

// File operations
await sandbox.filesystem.write('app.js', 'console.log("Hello World");');
const content = await sandbox.filesystem.read('app.js');
const files = await sandbox.filesystem.list('/');

// Terminal operations
const result = await sandbox.terminal.run('node app.js');
console.log(result.stdout);

// Git operations
const status = await sandbox.git.status();
const diff = await sandbox.git.getDiff();

await sandbox.destroy();
```

### Advanced Management

```typescript
import { SandboxManager, SandboxConfig } from '@codebolt/e2b-provider';

const manager = new SandboxManager();

// Create multiple sandboxes for different tasks with configuration
const devConfig: SandboxConfig = { template: 'node-dev', timeout: 30000 };
const testConfig: SandboxConfig = { template: 'node-test', timeout: 15000 };

const devSandbox = await manager.createSandbox(devConfig);
const testSandbox = await manager.createSandbox(testConfig);

// Use them independently
await devSandbox.filesystem.write('src/index.js', 'console.log("Dev");');
await testSandbox.filesystem.write('test/spec.js', 'console.log("Test");');

// Clean up specific sandbox
await manager.destroySandbox(devSandbox.id);

// Or clean up all at once
await manager.destroyAll();
```

### Integration with Handlers

```typescript
import { getCurrentSandbox, getIsInitialized } from '@codebolt/e2b-provider';

// Access the current sandbox from handlers
const currentSandbox = getCurrentSandbox();
const isReady = getIsInitialized();

if (currentSandbox && isReady) {
  const files = await currentSandbox.filesystem.list('/');
  console.log('Sandbox files:', files);
}
```

## File System Operations

The sandbox filesystem provides isolated file operations:

```typescript
import type { FilesystemOptions } from '@codebolt/e2b-provider';

// Create files and directories
await sandbox.filesystem.mkdir('/project');
await sandbox.filesystem.write('/project/app.js', 'console.log("Hello");');

// Read and check files
const exists = await sandbox.filesystem.exists('/project/app.js');
const content = await sandbox.filesystem.read('/project/app.js');
const files = await sandbox.filesystem.list('/project');

// Clean up
await sandbox.filesystem.rm('/project/app.js');
await sandbox.filesystem.rm('/project', true); // recursive
```

## Git Operations

Sandbox git operations work on the sandbox's isolated repository:

```typescript
import type { GitStatus } from '@codebolt/e2b-provider';

// Check status and get diffs
const status: GitStatus = await sandbox.git.status();
const diff = await sandbox.git.getDiff();

console.log('Modified files:', status.modified);
console.log('Added files:', status.added);
console.log('Deleted files:', status.deleted);

// Stage and commit changes
await sandbox.git.add(['app.js']);
await sandbox.git.commit('Add application file');

// Sync with remote
await sandbox.git.push();
await sandbox.git.pull();
```

## Terminal Operations

Execute commands in the sandbox environment:

```typescript
import type { TerminalResult } from '@codebolt/e2b-provider';

// Run commands
const result: TerminalResult = await sandbox.terminal.run('npm install');
console.log('Exit code:', result.exitCode);
console.log('Output:', result.stdout);
console.log('Errors:', result.stderr);

// Chain commands
await sandbox.terminal.run('npm init -y');
await sandbox.terminal.run('npm install express');
const runResult = await sandbox.terminal.run('node app.js');
```

## Notification System

The sandbox integrates with the notification system for real-time updates:

```typescript
import { 
  sendFsNotification, 
  sendTerminalNotification, 
  sendGitNotification 
} from '@codebolt/e2b-provider';

// Send file system notifications
sendFsNotification('CREATE_FILE_REQUEST', { fileName: 'app.js' });
sendFsNotification('CREATE_FILE_RESULT', 'File created successfully');

// Send terminal notifications
sendTerminalNotification('EXECUTE_COMMAND_REQUEST', { command: 'npm install' });
sendTerminalNotification('EXECUTE_COMMAND_RESULT', 'Command completed');

// Send git notifications
sendGitNotification('STATUS_REQUEST', { path: '/' });
sendGitNotification('STATUS_RESULT', status);
```

## Type Safety

The module provides comprehensive type definitions:

```typescript
import type {
  E2BSandbox,
  SandboxConfig,
  GitStatus,
  TerminalResult,
  FilesystemOptions
} from '@codebolt/e2b-provider';

// Type-safe sandbox configuration
const config: SandboxConfig = {
  id: 'my-sandbox',
  template: 'node-v18',
  timeout: 30000,
  env: { NODE_ENV: 'development' }
};

// Type-safe result handling
const result: TerminalResult = await sandbox.terminal.run('npm test');
if (result.exitCode === 0) {
  console.log('Tests passed!');
}
```

## Error Handling

All sandbox operations should be wrapped in try-catch blocks:

```typescript
import { createE2BSandbox } from '@codebolt/e2b-provider';

try {
  const sandbox = createE2BSandbox();
  await sandbox.create();
  
  // Your operations here
  
  await sandbox.destroy();
} catch (error) {
  console.error('Sandbox operation failed:', error);
  // Handle cleanup if needed
}
```

## Real Implementation Notes

When implementing with actual E2B SDK:

1. **Replace MockE2BSandbox**: Import actual E2B classes in `src/utils/sandboxManager.ts`
2. **Update createE2BSandbox**: Use real E2B factory functions
3. **Configure Authentication**: Add E2B API keys and configuration
4. **Handle Network Errors**: Add retry logic and better error handling
5. **Resource Limits**: Implement proper resource management and limits

```typescript
// Real implementation in src/utils/sandboxManager.ts:
import { Sandbox } from '@e2b/sdk';
import type { E2BSandbox, SandboxConfig } from '../types/sandbox';

export class RealE2BSandbox implements E2BSandbox {
  private sandbox: Sandbox;
  
  constructor(config?: SandboxConfig) {
    this.sandbox = new Sandbox({
      apiKey: process.env.E2B_API_KEY,
      template: config?.template || 'node-v18',
      // other configuration
    });
  }
  
  // ... implement all methods
}

export function createE2BSandbox(config?: SandboxConfig): E2BSandbox {
  return new RealE2BSandbox(config);
}
```

## Testing

The mock implementation allows for easy testing:

```typescript
import { MockE2BSandbox } from '@codebolt/e2b-provider';

describe('Sandbox Operations', () => {
  let sandbox: MockE2BSandbox;
  
  beforeEach(async () => {
    sandbox = new MockE2BSandbox();
    await sandbox.create();
  });
  
  afterEach(async () => {
    await sandbox.destroy();
  });
  
  it('should create and read files', async () => {
    await sandbox.filesystem.write('test.txt', 'Hello');
    const content = await sandbox.filesystem.read('test.txt');
    expect(content).toContain('test.txt');
  });
  
  it('should handle git operations', async () => {
    const status = await sandbox.git.status();
    expect(status).toHaveProperty('modified');
    expect(status).toHaveProperty('added');
    expect(status).toHaveProperty('deleted');
  });
});
```

## Performance Considerations

- **Sandbox Reuse**: Use SandboxManager to reuse sandboxes when possible
- **Parallel Operations**: Multiple sandboxes can run operations in parallel
- **Resource Cleanup**: Always destroy sandboxes when done to free resources
- **Connection Pooling**: In real implementations, consider connection pooling
- **Type Checking**: TypeScript provides compile-time checks for better performance

## Security

- **Isolation**: Each sandbox provides isolated execution environment
- **Resource Limits**: Sandboxes should have CPU, memory, and disk limits
- **Network Access**: Control network access based on requirements
- **File System**: Sandboxes have isolated file systems
- **Type Safety**: TypeScript helps prevent runtime errors and security issues
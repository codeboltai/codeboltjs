# E2B Sandbox Module

This module provides sandbox functionality for the E2B provider, allowing for isolated code execution in remote environments.

## Architecture

The sandbox module is separated from the main provider logic to improve code organization and reusability:

```
providers/e2bProvider/
├── index.ts          # Main E2B Provider class
├── sandbox.ts        # Sandbox interface and implementations
├── example.ts        # Usage examples
├── package.json      # Dependencies
├── tsconfig.json     # TypeScript configuration
├── README.md         # Main documentation
└── SANDBOX.md        # This file
```

## Components

### 1. E2BSandbox Interface

Defines the contract for sandbox operations:

```typescript
interface E2BSandbox {
  id: string;
  create(): Promise<void>;
  destroy(): Promise<void>;
  filesystem: FileSystemOperations;
  git: GitOperations;
  terminal: TerminalOperations;
}
```

### 2. MockE2BSandbox Class

A mock implementation for development and testing:

```typescript
const sandbox = new MockE2BSandbox();
await sandbox.create();
await sandbox.filesystem.write('test.js', 'console.log("Hello");');
await sandbox.destroy();
```

### 3. SandboxManager Class

Manages multiple sandbox instances:

```typescript
const manager = new SandboxManager();
const sandbox1 = await manager.createSandbox();
const sandbox2 = await manager.createSandbox();

console.log(manager.getActiveSandboxIds()); // ['sandbox-123', 'sandbox-456']

await manager.destroySandbox(sandbox1.id);
await manager.destroyAll();
```

### 4. Factory Functions

Convenient functions for creating sandboxes:

```typescript
// Create a single sandbox
const sandbox = createE2BSandbox();

// Use default manager
import { defaultSandboxManager } from './sandbox';
const managedSandbox = await defaultSandboxManager.createSandbox();
```

## Usage Patterns

### Basic Usage

```typescript
import { createE2BSandbox } from './sandbox';

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
import { SandboxManager } from './sandbox';

const manager = new SandboxManager();

// Create multiple sandboxes for different tasks
const devSandbox = await manager.createSandbox();
const testSandbox = await manager.createSandbox();

// Use them independently
await devSandbox.filesystem.write('src/index.js', 'console.log("Dev");');
await testSandbox.filesystem.write('test/spec.js', 'console.log("Test");');

// Clean up specific sandbox
await manager.destroySandbox(devSandbox.id);

// Or clean up all at once
await manager.destroyAll();
```

### Integration with E2BProvider

```typescript
import { E2BProvider } from './index';
import { SandboxManager } from './sandbox';

// Use shared sandbox manager across providers
const sharedManager = new SandboxManager();
const provider1 = new E2BProvider(sharedManager);
const provider2 = new E2BProvider(sharedManager);

// Both providers share the same sandbox pool
console.log(provider1.getActiveSandboxIds());
console.log(provider2.getActiveSandboxIds());
```

## File System Operations

The sandbox filesystem provides isolated file operations:

```typescript
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
// Check status and get diffs
const status = await sandbox.git.status();
const diff = await sandbox.git.getDiff();

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
// Run commands
const result = await sandbox.terminal.run('npm install');
console.log('Exit code:', result.exitCode);
console.log('Output:', result.stdout);
console.log('Errors:', result.stderr);

// Chain commands
await sandbox.terminal.run('npm init -y');
await sandbox.terminal.run('npm install express');
const runResult = await sandbox.terminal.run('node app.js');
```

## Error Handling

All sandbox operations should be wrapped in try-catch blocks:

```typescript
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

1. **Replace MockE2BSandbox**: Import actual E2B classes
2. **Update createE2BSandbox**: Use real E2B factory functions
3. **Configure Authentication**: Add E2B API keys and configuration
4. **Handle Network Errors**: Add retry logic and better error handling
5. **Resource Limits**: Implement proper resource management and limits

```typescript
// Real implementation would look like:
import { Sandbox } from '@e2b/sdk';

export function createE2BSandbox(): E2BSandbox {
  return new Sandbox({
    apiKey: process.env.E2B_API_KEY,
    template: 'node-v18',
    // other configuration
  });
}
```

## Testing

The mock implementation allows for easy testing:

```typescript
import { MockE2BSandbox } from './sandbox';

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
});
```

## Performance Considerations

- **Sandbox Reuse**: Use SandboxManager to reuse sandboxes when possible
- **Parallel Operations**: Multiple sandboxes can run operations in parallel
- **Resource Cleanup**: Always destroy sandboxes when done to free resources
- **Connection Pooling**: In real implementations, consider connection pooling

## Security

- **Isolation**: Each sandbox provides isolated execution environment
- **Resource Limits**: Sandboxes should have CPU, memory, and disk limits
- **Network Access**: Control network access based on requirements
- **File System**: Sandboxes have isolated file systems

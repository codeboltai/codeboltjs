---
name: codebolt-provider-development
description: Create Codebolt providers that connect applications to external environments running remote executors. Providers abstract environment management (Docker, AWS EC2, WSL, SSH, Kubernetes, Git worktree, or any custom environment) and handle all communication with agents. Use when: (1) Building new providers for any environment type, (2) Implementing environment lifecycle management, (3) Setting up remote executor communication, (4) Handling file operations through remote environments, (5) Configuring heartbeat monitoring for health checks.
---

# Codebolt Provider Development

## What is a Provider?

A **Provider** is the bridge between the Codebolt application and an external environment running agents. It has three core responsibilities:

1. **Create an external environment** - Any isolated space: Docker container, VM, git worktree, SSH server, WSL, AWS EC2, Kubernetes pod, or custom
2. **Run a remote executor** - Start and manage the agent server in that environment
3. **Handle all communication** - Route messages, file operations, and health checks between the app and environment

```
┌─────────────────┐         ┌──────────────┐         ┌─────────────────┐
│   Codebolt      │ ◄─────► │   Provider   │ ◄─────► │ Remote Executor │
│   Application   │   WS    │              │   WS    │   (Agents)      │
└─────────────────┘         └──────────────┘         └─────────────────┘
```

---

## Quick Start

### 1. Copy the Template

Copy the provider template from `assets/provider-template/` to start a new provider.

### 2. Implement Required Methods

```typescript
import { BaseProvider } from '@codebolt/provider';
import codebolt from '@codebolt/codeboltjs';

class MyProvider extends BaseProvider {
  constructor() {
    super({
      agentServerPort: 3001,
      agentServerHost: 'localhost',
      transport: 'websocket',
    });
  }

  // REQUIRED: Create your external environment
  protected async setupEnvironment(initVars: ProviderInitVars): Promise<void> {
    // Create container, VM, worktree, SSH connection, etc.
    this.state.workspacePath = '/path/to/environment';
  }

  // REQUIRED: Set the project path
  protected async resolveProjectContext(initVars: ProviderInitVars): Promise<void> {
    this.state.projectPath = initVars.projectPath || process.cwd();
  }

  // REQUIRED: Return changed files info
  async onGetDiffFiles(): Promise<any> {
    return { files: [], hasChanges: false };
  }

  // OPTIONAL: Clean up environment
  protected async teardownEnvironment(): Promise<void> {
    // Stop container, remove worktree, close SSH, etc.
  }
}
```

### 3. Register Event Handlers

```typescript
const provider = new MyProvider();
const handlers = provider.getEventHandlers();

// Lifecycle
codebolt.onProviderStart((vars) => handlers.onProviderStart(vars));
codebolt.onProviderAgentStart((msg) => handlers.onProviderAgentStart(msg));
codebolt.onProviderStop((vars) => handlers.onProviderStop(vars));
codebolt.onCloseSignal(() => handlers.onCloseSignal());
codebolt.onRawMessage((msg) => handlers.onRawMessage(msg));

// File operations
codebolt.onReadFile(async (path) => /* read from environment */);
codebolt.onWriteFile(async (path, content) => /* write to environment */);
// ... more handlers
```

---

## Core Implementation Steps

### Step 1: Extend BaseProvider

```typescript
class MyProvider extends BaseProvider {
  constructor() {
    super({
      agentServerPort: 3001,         // Port where agent server runs
      agentServerHost: 'localhost',  // Host (localhost for local, IP for remote)
      transport: 'websocket',        // Communication method
      reconnectAttempts: 10,         // Connection retry count
      reconnectDelay: 1000,          // Delay between retries (ms)
      wsRegistrationTimeout: 10000,  // WebSocket registration timeout (ms)
      timeouts: {
        agentServerStartup: 60000,   // Agent server startup timeout
        connection: 30000,           // Connection timeout
        cleanup: 15000,              // Cleanup timeout
      },
    });
  }
}
```

### Step 2: Implement Environment Creation

The `setupEnvironment` method creates your isolated environment:

```typescript
protected async setupEnvironment(initVars: ProviderInitVars): Promise<void> {
  // initVars contains:
  // - environmentName: string (unique identifier)
  // - type: string (provider type)
  // - projectPath?: string (optional project path)
  // - ...custom properties

  // YOUR LOGIC: Create environment based on your type
  // - Docker: docker.createContainer()
  // - SSH: ssh.connect()
  // - Git worktree: git worktree add
  // - AWS EC2: ec2.runInstances()

  // Set the workspace path for file operations
  this.state.workspacePath = '/path/to/environment/workspace';
}
```

### Step 3: Implement Cleanup

The `teardownEnvironment` method cleans up:

```typescript
protected async teardownEnvironment(): Promise<void> {
  // YOUR LOGIC: Clean up environment
  // - Docker: container.stop(), container.remove()
  // - SSH: ssh.end()
  // - Git worktree: git worktree remove
  // - AWS EC2: ec2.terminateInstances()
}
```

### Step 4: Register All Event Handlers

See [message-handlers.md](references/message-handlers.md) for the complete list.

---

## Provider Lifecycle

### Startup Sequence

When `onProviderStart` is called:

```
1. resetState()              - Clear previous state
2. resolveProjectContext()   - Set this.state.projectPath
3. resolveWorkspacePath()    - Set this.state.workspacePath
4. ensureAgentServer()       - Start/verify agent server
5. setupEnvironment()        - Create external environment
6. ensureTransportConnection() - Connect WebSocket
7. afterConnected()          - Post-connection hook (start heartbeats)
```

### Shutdown Sequence

When `onProviderStop` or `onCloseSignal` is called:

```
1. beforeClose()         - Pre-cleanup hook (stop heartbeats)
2. disconnectTransport() - Close WebSocket
3. teardownEnvironment() - Clean up environment
```

For detailed lifecycle patterns, see [lifecycle-patterns.md](references/lifecycle-patterns.md).

---

## Remote Executor Communication

### WebSocket Connection

The provider connects to the agent server via WebSocket:

```typescript
// URL format
ws://{host}:{port}?clientType=app&appId={environmentName}&projectName={environmentName}

// Registration handshake
1. Provider connects
2. Server sends: { type: "registered" }
3. Provider ready for messages
```

### Message Routing

**Outbound (App → Provider → Agent Server):**
```typescript
// Handled by BaseProvider.sendToAgentServer()
await provider.sendToAgentServer({
  type: 'someMessage',
  requestId: 'req-123',
  data: { ... },
});
```

**Inbound (Agent Server → Provider → App):**
```typescript
// Automatically forwarded via handleTransportMessage()
// Override for custom handling
```

---

## Heartbeat Monitoring

Providers must report health status:

### Setup Heartbeats

```typescript
protected async afterConnected(startResult: ProviderStartResult): Promise<void> {
  // Start provider heartbeat (every 10 seconds)
  this.startHeartbeat();

  // Track this environment
  this.registerConnectedEnvironment(startResult.environmentName);

  // Start environment heartbeat (every 15 seconds)
  this.startEnvironmentHeartbeat(startResult.environmentName);
}

protected async beforeClose(): Promise<void> {
  this.stopHeartbeat();
  this.stopEnvironmentHeartbeat();
}
```

### Health Status Values

| Provider Status | Meaning |
|-----------------|---------|
| `healthy` | Fully operational |
| `degraded` | Partial functionality |
| `error` | Not functional |

| Environment Status | Meaning |
|--------------------|---------|
| `active` | Environment responsive |
| `degraded` | Some features unavailable |
| `unreachable` | Cannot communicate |

For detailed heartbeat patterns, see [heartbeat-monitoring.md](references/heartbeat-monitoring.md).

---

## File Operations

Providers must handle file operations in the external environment:

```typescript
codebolt.onReadFile(async (filePath: string) => {
  const fullPath = path.join(workspacePath, filePath);
  const content = await fs.readFile(fullPath, 'utf-8');
  return { success: true, content };
});

codebolt.onWriteFile(async (filePath: string, content: string) => {
  const fullPath = path.join(workspacePath, filePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, 'utf-8');
  return { success: true };
});

// Also implement:
// onDeleteFile, onDeleteFolder, onRenameItem, onCreateFolder
// onCopyFile, onCopyFolder, onGetTreeChildren
```

For remote environments (SSH, Docker), route these operations through the environment's filesystem.

---

## Creating Custom Environments

### Guidelines

1. **Environment Creation** - Must be idempotent (safe to call multiple times)
2. **Cleanup** - Must handle partial states (environment might not fully exist)
3. **Agent Server** - Either start it yourself or connect to existing
4. **File Operations** - Route all file ops through the environment
5. **Health Checks** - Implement meaningful health status

### Checklist

- [ ] Implement `setupEnvironment()` - Creates isolated environment
- [ ] Implement `resolveProjectContext()` - Sets project path
- [ ] Implement `onGetDiffFiles()` - Returns changed files
- [ ] Implement `teardownEnvironment()` - Cleans up
- [ ] Register all lifecycle handlers
- [ ] Register all file operation handlers
- [ ] Set up heartbeat monitoring
- [ ] Test startup/shutdown cycle
- [ ] Test file operations
- [ ] Test error recovery

---

## References

| Topic | Reference |
|-------|-----------|
| Type Definitions | [types.md](references/types.md) |
| API Reference | [api-reference.md](references/api-reference.md) |
| Lifecycle Patterns | [lifecycle-patterns.md](references/lifecycle-patterns.md) |
| Message Handlers | [message-handlers.md](references/message-handlers.md) |
| Heartbeat Monitoring | [heartbeat-monitoring.md](references/heartbeat-monitoring.md) |
| Example Providers | [example-providers.md](references/example-providers.md) |

## Assets

| Asset | Description |
|-------|-------------|
| [provider-template/](assets/provider-template/) | Starter template with all handlers |

## Source Files

| File | Description |
|------|-------------|
| `packages/provider/src/lib/BaseProvider.ts` | Core abstract provider class |
| `packages/provider/src/lib/ProviderTypes.ts` | Type definitions |
| `packages/codeboltjs/src/core/Codebolt.ts` | Event handler registration API |
| `providers/` | Existing provider implementations |

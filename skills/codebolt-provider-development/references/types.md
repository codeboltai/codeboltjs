# Provider Type Definitions

Complete type definitions for Codebolt provider development.

## Table of Contents
- [Configuration Types](#configuration-types)
- [State Types](#state-types)
- [Message Types](#message-types)
- [Heartbeat Types](#heartbeat-types)
- [Handler Interfaces](#handler-interfaces)

---

## Configuration Types

### BaseProviderConfig

Configuration options for the BaseProvider constructor.

```typescript
interface BaseProviderConfig {
  // Agent server settings
  agentServerPort: number;        // Default: 3001
  agentServerHost: string;        // Default: 'localhost'
  agentServerPath?: string;       // Path to agent server executable
  agentServerArgs?: string[];     // Arguments for agent server

  // Connection settings
  reconnectAttempts: number;      // Default: 10
  reconnectDelay: number;         // Default: 1000 (ms)
  wsRegistrationTimeout: number;  // Default: 10000 (ms)

  // Transport type
  transport: ProviderTransportType; // 'websocket' | 'custom'

  // Timeouts
  timeouts?: {
    agentServerStartup?: number;  // Default: 60000 (ms)
    connection?: number;          // Default: 30000 (ms)
    cleanup?: number;             // Default: 15000 (ms)
  };

  // Custom properties
  [key: string]: unknown;
}

type ProviderTransportType = 'websocket' | 'custom';
```

---

## State Types

### ProviderState

Internal state tracked by the provider.

```typescript
interface ProviderState {
  initialized: boolean;           // True after successful start
  environmentName: string | null; // Current environment name
  projectPath: string | null;     // Base project directory
  workspacePath: string | null;   // Working directory for file ops

  // Extended state (added by BaseProvider)
  providerId?: string;
  startTime?: number;             // Timestamp for uptime calculation
  environmentId?: string;
  connectedEnvironments?: string[];
}
```

### AgentServerConnection

WebSocket connection state to the agent server.

```typescript
interface AgentServerConnection {
  wsConnection: WebSocket | null;
  process: ChildProcess | null;   // If provider starts agent server
  isConnected: boolean;
  serverUrl: string;
  metadata: Record<string, unknown>;
}
```

---

## Message Types

### ProviderInitVars

Passed to `onProviderStart` and `onProviderStop`.

```typescript
interface ProviderInitVars {
  environmentName: string;        // Unique environment identifier
  type: string;                   // Provider type identifier
  projectPath?: string;           // Optional project path
  [key: string]: unknown;         // Custom initialization variables
}
```

### ProviderStartResult

Returned from `onProviderStart`.

```typescript
interface ProviderStartResult {
  success: boolean;
  environmentName: string;
  agentServerUrl: string;         // WebSocket URL for agent server
  workspacePath: string;          // Path where file ops occur
  worktreePath?: string;          // Optional (git worktree specific)
  transport: ProviderTransportType;
  [key: string]: unknown;         // Custom result properties
}
```

### AgentStartMessage

Passed to `onProviderAgentStart`.

```typescript
interface AgentStartMessage extends FlatUserMessage {
  agentId: string;                // Unique agent identifier
  agentType: AgentType;           // How agent is loaded
  task?: string;                  // Task description
  context?: unknown;              // Additional context
  timestamp?: number;
  path?: string;                  // Agent path (for local agents)
  [key: string]: unknown;
}

enum AgentType {
  Marketplace = 'marketplace',    // From marketplace
  Zip_Path = 'zippath',           // From zip file
  Folder_Path = 'folderpath',     // From local folder
  URL = 'url'                     // From URL
}
```

### RawMessageForAgent

Generic message format for agent communication.

```typescript
interface RawMessageForAgent {
  type: string;                   // Message type identifier
  requestId: string;              // Request correlation ID
  action?: string;                // Optional action specifier
  data?: unknown;                 // Payload data
  timestamp?: number;
  [key: string]: unknown;
}
```

---

## Heartbeat Types

### Provider Heartbeat

Sent via `sendProviderHeartbeat`.

```typescript
interface ProviderHeartbeatData {
  providerId: string;
  status: 'healthy' | 'degraded' | 'error';
  connectedEnvironments: string[];
  uptime?: number;                // Seconds since start
  metadata?: Record<string, any>;
}
```

### Environment Heartbeat

Sent via `sendEnvironmentHeartbeat`.

```typescript
interface EnvironmentHeartbeatData {
  environmentId: string;
  providerId: string;
}
```

### Heartbeat Request Response

Returned from `onProviderHeartbeatRequest`.

```typescript
interface ProviderHeartbeatResponse {
  status: 'healthy' | 'degraded' | 'error';
  connectedEnvironments: string[];
}
```

### Environment Heartbeat Response

Returned from `onEnvironmentHeartbeatRequest`.

```typescript
interface EnvironmentHeartbeatResponse {
  status: 'active' | 'degraded' | 'unreachable';
  remoteExecutorStatus: 'running' | 'stopped' | 'starting' | 'error' | 'restarting';
}
```

### Environment Restart Response

Returned from `onEnvironmentRestartRequest`.

```typescript
interface EnvironmentRestartResponse {
  success: boolean;
  message?: string;
}
```

---

## Handler Interfaces

### ProviderLifecycleHandlers

Interface for lifecycle methods.

```typescript
interface ProviderLifecycleHandlers {
  onProviderStart(initVars: ProviderInitVars): Promise<ProviderStartResult>;
  onProviderAgentStart(message: AgentStartMessage): Promise<void>;
  onProviderStop(initVars: ProviderInitVars): Promise<void>;
  onGetDiffFiles(): Promise<any>;
  onCloseSignal(): Promise<void>;
  onRawMessage(message: RawMessageForAgent): Promise<void>;
}
```

### ProviderTransport

Interface for transport methods.

```typescript
interface ProviderTransport {
  ensureTransportConnection(initVars: ProviderInitVars): Promise<void>;
  sendToAgentServer(message: AgentStartMessage | RawMessageForAgent): Promise<boolean>;
}
```

### ProviderEventHandlers

Returned by `getEventHandlers()` for registration.

```typescript
interface ProviderEventHandlers {
  onProviderStart: (vars: ProviderInitVars) => Promise<ProviderStartResult>;
  onProviderAgentStart: (message: AgentStartMessage) => Promise<void>;
  onProviderStop: (vars: ProviderInitVars) => Promise<void>;
  onGetDiffFiles: () => Promise<any>;
  onCloseSignal: () => Promise<void>;
  onRawMessage: (message: RawMessageForAgent) => Promise<void>;
}
```

---

## File Paths

- Types: `packages/provider/src/lib/ProviderTypes.ts`
- Shared types: `common/types/src/provider/index.ts`
- BaseProvider: `packages/provider/src/lib/BaseProvider.ts`

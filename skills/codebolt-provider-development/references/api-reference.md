# Provider API Reference

Complete API documentation for BaseProvider class and Codebolt event handlers.

## Table of Contents
- [BaseProvider Class](#baseprovider-class)
- [Codebolt Event Registration](#codebolt-event-registration)
- [WebSocket Communication](#websocket-communication)

---

## BaseProvider Class

Location: `packages/provider/src/lib/BaseProvider.ts`

### Constructor

```typescript
constructor(config: Partial<BaseProviderConfig> = {})
```

Creates a new provider with the specified configuration. Defaults:
- `agentServerPort`: 3001
- `agentServerHost`: 'localhost'
- `transport`: 'websocket'
- `reconnectAttempts`: 10
- `reconnectDelay`: 1000ms
- `wsRegistrationTimeout`: 10000ms

### Public Methods

#### getEventHandlers()
```typescript
getEventHandlers(): ProviderEventHandlers
```
Returns an object with bound handler functions for registration with Codebolt.

#### onProviderStart()
```typescript
async onProviderStart(initVars: ProviderInitVars): Promise<ProviderStartResult>
```
Called when provider starts. Orchestrates the startup sequence:
1. Resets state
2. Calls `resolveProjectContext()`
3. Calls `resolveWorkspacePath()`
4. Calls `ensureAgentServer()`
5. Calls `setupEnvironment()`
6. Calls `ensureTransportConnection()`
7. Calls `afterConnected()`

#### onProviderAgentStart()
```typescript
async onProviderAgentStart(message: AgentStartMessage): Promise<void>
```
Forwards agent start message to the agent server via WebSocket.

#### onProviderStop()
```typescript
async onProviderStop(initVars: ProviderInitVars): Promise<void>
```
Graceful shutdown sequence:
1. Calls `beforeClose()`
2. Calls `disconnectTransport()`
3. Calls `teardownEnvironment()`

#### onCloseSignal()
```typescript
async onCloseSignal(): Promise<void>
```
Handles immediate shutdown signal. Same sequence as `onProviderStop`.

#### onRawMessage()
```typescript
async onRawMessage(message: RawMessageForAgent): Promise<void>
```
Forwards raw messages to the agent server.

### Abstract Methods (Must Implement)

#### setupEnvironment()
```typescript
protected abstract setupEnvironment(initVars: ProviderInitVars): Promise<void>
```
Create and configure your external environment (container, VM, worktree, etc.).

#### resolveProjectContext()
```typescript
protected abstract resolveProjectContext(initVars: ProviderInitVars): Promise<void>
```
Set `this.state.projectPath` to the base project directory.

#### onGetDiffFiles()
```typescript
abstract onGetDiffFiles(): Promise<any>
```
Return information about changed files in the environment.

### Protected Methods (Optional Override)

#### teardownEnvironment()
```typescript
protected async teardownEnvironment(): Promise<void>
```
Clean up environment resources. Default: no-op.

#### ensureAgentServer()
```typescript
protected async ensureAgentServer(): Promise<void>
```
Start or verify agent server is running. Default: no-op.

#### resolveWorkspacePath()
```typescript
protected async resolveWorkspacePath(initVars: ProviderInitVars): Promise<string>
```
Return the workspace path for file operations. Default: returns `this.state.projectPath`.

#### afterConnected()
```typescript
protected async afterConnected(startResult: ProviderStartResult): Promise<void>
```
Hook called after WebSocket connection established. Default: no-op.

#### beforeClose()
```typescript
protected async beforeClose(): Promise<void>
```
Hook called before cleanup begins. Default: no-op.

#### buildWebSocketUrl()
```typescript
protected buildWebSocketUrl(initVars: ProviderInitVars): string
```
Construct WebSocket URL for agent server connection.

#### handleTransportMessage()
```typescript
protected handleTransportMessage(message: RawMessageForAgent): void
```
Process incoming messages from agent server. Default: forwards to Codebolt.

#### getProviderHealthStatus()
```typescript
protected getProviderHealthStatus(): 'healthy' | 'degraded' | 'error'
```
Determine current health status for heartbeats.

### Heartbeat Methods

#### startHeartbeat()
```typescript
protected startHeartbeat(): void
```
Begin sending provider heartbeats at 10-second intervals.

#### stopHeartbeat()
```typescript
protected stopHeartbeat(): void
```
Stop heartbeat monitoring.

#### sendProviderHeartbeat()
```typescript
protected sendProviderHeartbeat(): void
```
Send a single provider heartbeat.

#### startEnvironmentHeartbeat()
```typescript
protected startEnvironmentHeartbeat(environmentId: string): void
```
Begin sending environment heartbeats at 15-second intervals.

#### stopEnvironmentHeartbeat()
```typescript
protected stopEnvironmentHeartbeat(): void
```
Stop environment heartbeat monitoring.

#### registerConnectedEnvironment()
```typescript
protected registerConnectedEnvironment(environmentId: string): void
```
Add environment to tracked list.

#### unregisterConnectedEnvironment()
```typescript
protected unregisterConnectedEnvironment(environmentId: string): void
```
Remove environment from tracked list.

### Transport Methods

#### sendToAgentServer()
```typescript
async sendToAgentServer(message: RawMessageForAgent | AgentStartMessage): Promise<boolean>
```
Send message to agent server via WebSocket.

#### ensureTransportConnection()
```typescript
async ensureTransportConnection(initVars: ProviderInitVars): Promise<void>
```
Establish WebSocket connection to agent server.

#### disconnectTransport()
```typescript
protected async disconnectTransport(): Promise<void>
```
Close WebSocket connection.

---

## Codebolt Event Registration

Location: `packages/codeboltjs/src/core/Codebolt.ts`

### Lifecycle Events

```typescript
codebolt.onProviderStart(handler: (initVars: ProviderInitVars) => Promise<any>)
codebolt.onProviderAgentStart(handler: (message: any) => Promise<any>)
codebolt.onProviderStop(handler: (initVars: ProviderInitVars) => Promise<any>)
codebolt.onCloseSignal(handler: () => Promise<any>)
codebolt.onRawMessage(handler: (message: RawMessageForAgent) => Promise<any>)
```

### File Operations

```typescript
codebolt.onReadFile(handler: (path: string) => Promise<any>)
codebolt.onWriteFile(handler: (path: string, content: string) => Promise<any>)
codebolt.onDeleteFile(handler: (path: string) => Promise<any>)
codebolt.onDeleteFolder(handler: (path: string) => Promise<any>)
codebolt.onRenameItem(handler: (oldPath: string, newPath: string) => Promise<any>)
codebolt.onCreateFolder(handler: (path: string) => Promise<any>)
codebolt.onCopyFile(handler: (sourcePath: string, destPath: string) => Promise<any>)
codebolt.onCopyFolder(handler: (sourcePath: string, destPath: string) => Promise<any>)
```

### Project Operations

```typescript
codebolt.onGetTreeChildren(handler: (path: string) => Promise<any>)
codebolt.onGetDiffFiles(handler: () => Promise<any>)
codebolt.onGetFullProject(handler: () => Promise<any>)
```

### VCS Operations

```typescript
codebolt.onMergeAsPatch(handler: () => Promise<any>)
codebolt.onSendPR(handler: () => Promise<any>)
codebolt.onCreatePatchRequest(handler: () => Promise<any>)
codebolt.onCreatePullRequestRequest(handler: () => Promise<any>)
```

### Heartbeat Events

```typescript
codebolt.onProviderHeartbeatRequest(handler: (request) => Promise<ProviderHeartbeatResponse>)
codebolt.onEnvironmentHeartbeatRequest(handler: (request) => Promise<EnvironmentHeartbeatResponse>)
codebolt.onEnvironmentRestartRequest(handler: (request) => Promise<EnvironmentRestartResponse>)
```

### Heartbeat Sending

```typescript
codebolt.sendProviderHeartbeat(data: ProviderHeartbeatData): void
codebolt.sendEnvironmentHeartbeat(data: EnvironmentHeartbeatData): void
```

---

## WebSocket Communication

### Connection URL Format

```
ws://{host}:{port}?clientType=app&appId={environmentName}&projectName={environmentName}&currentProject={projectPath}
```

### Registration Handshake

1. Provider connects to agent server WebSocket
2. Server sends: `{ type: "registered", ... }`
3. Provider is now ready for message exchange

### Message Flow

**Outbound (Provider → Agent Server):**
```typescript
{
  ...message,
  timestamp: Date.now()
}
```

**Inbound (Agent Server → Provider → Codebolt):**
Messages are automatically forwarded to Codebolt via `handleTransportMessage()`.

### Response Format

All handlers respond with:
```typescript
{
  type: "remoteProviderEvent",
  action: "{eventName}Response",
  message?: any,  // Handler return value
  error?: string  // If error occurred
}
```

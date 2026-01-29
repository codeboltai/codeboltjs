# Message Handlers Reference

Complete reference for all provider event handlers.

## Table of Contents
- [Lifecycle Handlers](#lifecycle-handlers)
- [File Operation Handlers](#file-operation-handlers)
- [Project Handlers](#project-handlers)
- [VCS Handlers](#vcs-handlers)
- [Heartbeat Handlers](#heartbeat-handlers)
- [Response Format](#response-format)

---

## Lifecycle Handlers

### onProviderStart

Called when the application requests provider initialization.

```typescript
codebolt.onProviderStart(async (initVars: ProviderInitVars) => {
  // initVars contains:
  // - environmentName: string (required)
  // - type: string (required)
  // - projectPath?: string
  // - ...custom properties

  // Return ProviderStartResult
  return {
    success: true,
    environmentName: initVars.environmentName,
    agentServerUrl: 'ws://localhost:3001',
    workspacePath: '/path/to/workspace',
    transport: 'websocket',
  };
});
```

**Message type:** `providerStart`
**Response action:** `providerStartResponse`

### onProviderAgentStart

Called when an agent task should begin.

```typescript
codebolt.onProviderAgentStart(async (message: AgentStartMessage) => {
  // message contains:
  // - agentId: string
  // - agentType: AgentType
  // - task?: string
  // - context?: unknown
  // - timestamp?: number

  // Forward to agent server
  await provider.sendToAgentServer(message);
});
```

**Message type:** `providerAgentStart`
**Response action:** `providerAgentStartResponse`

### onProviderStop

Called for graceful shutdown.

```typescript
codebolt.onProviderStop(async (initVars: ProviderInitVars) => {
  // Clean up resources
  await teardownEnvironment();
  await disconnectWebSocket();
});
```

**Message type:** `providerStop`
**Response action:** `providerStopResponse`

### onCloseSignal

Called for immediate shutdown (e.g., SIGTERM).

```typescript
codebolt.onCloseSignal(async () => {
  // Emergency cleanup
  await forceCleanup();
});
```

**Message type:** `closeSignal`
**Response action:** `closeSignalResponse`

### onRawMessage

Called for any message not handled by specific handlers.

```typescript
codebolt.onRawMessage(async (message: RawMessageForAgent) => {
  // message contains:
  // - type: string
  // - requestId: string
  // - action?: string
  // - data?: unknown

  // Forward to agent server
  await provider.sendToAgentServer(message);
});
```

---

## File Operation Handlers

### onReadFile

```typescript
codebolt.onReadFile(async (filePath: string) => {
  const fullPath = path.join(workspacePath, filePath);
  const content = await fs.readFile(fullPath, 'utf-8');
  return { success: true, content };
});
```

**Message type:** `providerReadFile`
**Response action:** `providerReadFileResponse`

### onWriteFile

```typescript
codebolt.onWriteFile(async (filePath: string, content: string) => {
  const fullPath = path.join(workspacePath, filePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, 'utf-8');
  return { success: true };
});
```

**Message type:** `providerWriteFile`
**Response action:** `providerWriteFileResponse`

### onDeleteFile

```typescript
codebolt.onDeleteFile(async (filePath: string) => {
  const fullPath = path.join(workspacePath, filePath);
  await fs.unlink(fullPath);
  return { success: true };
});
```

**Message type:** `providerDeleteFile`
**Response action:** `providerDeleteFileResponse`

### onDeleteFolder

```typescript
codebolt.onDeleteFolder(async (folderPath: string) => {
  const fullPath = path.join(workspacePath, folderPath);
  await fs.rm(fullPath, { recursive: true });
  return { success: true };
});
```

**Message type:** `providerDeleteFolder`
**Response action:** `providerDeleteFolderResponse`

### onRenameItem

```typescript
codebolt.onRenameItem(async (oldPath: string, newPath: string) => {
  const oldFullPath = path.join(workspacePath, oldPath);
  const newFullPath = path.join(workspacePath, newPath);
  await fs.rename(oldFullPath, newFullPath);
  return { success: true };
});
```

**Message type:** `providerRenameItem`
**Response action:** `providerRenameItemResponse`

### onCreateFolder

```typescript
codebolt.onCreateFolder(async (folderPath: string) => {
  const fullPath = path.join(workspacePath, folderPath);
  await fs.mkdir(fullPath, { recursive: true });
  return { success: true };
});
```

**Message type:** `providerCreateFolder`
**Response action:** `providerCreateFolderResponse`

### onCopyFile

```typescript
codebolt.onCopyFile(async (sourcePath: string, destPath: string) => {
  const sourceFullPath = path.join(workspacePath, sourcePath);
  const destFullPath = path.join(workspacePath, destPath);
  await fs.mkdir(path.dirname(destFullPath), { recursive: true });
  await fs.copyFile(sourceFullPath, destFullPath);
  return { success: true };
});
```

**Message type:** `providerCopyFile`
**Response action:** `providerCopyFileResponse`

### onCopyFolder

```typescript
codebolt.onCopyFolder(async (sourcePath: string, destPath: string) => {
  const sourceFullPath = path.join(workspacePath, sourcePath);
  const destFullPath = path.join(workspacePath, destPath);
  await fs.cp(sourceFullPath, destFullPath, { recursive: true });
  return { success: true };
});
```

**Message type:** `providerCopyFolder`
**Response action:** `providerCopyFolderResponse`

---

## Project Handlers

### onGetTreeChildren

Returns directory contents for file explorer.

```typescript
codebolt.onGetTreeChildren(async (dirPath: string) => {
  const fullPath = dirPath === 'root'
    ? workspacePath
    : path.join(workspacePath, dirPath);

  const items = await fs.readdir(fullPath, { withFileTypes: true });

  return items.map(item => ({
    id: path.relative(workspacePath, path.join(fullPath, item.name)),
    name: item.name,
    path: path.join(fullPath, item.name),
    isFolder: item.isDirectory(),
  }));
});
```

**Message type:** `providerGetTreeChildren`
**Response action:** `providerGetTreeChildrenResponse`

### onGetDiffFiles

Returns changed files information.

```typescript
codebolt.onGetDiffFiles(async () => {
  // For git-based environments:
  const result = await execAsync('git diff --name-status', { cwd: workspacePath });

  return {
    files: parseGitDiff(result.stdout),
    hasChanges: result.stdout.length > 0,
  };
});
```

**Message type:** `providerGetDiffFiles`
**Response action:** `providerDiffFilesResponse`

### onGetFullProject

Returns full project structure.

```typescript
codebolt.onGetFullProject(async () => {
  return {
    root: workspacePath,
    structure: await buildFileTree(workspacePath),
  };
});
```

**Message type:** `providerGetFullProject`
**Response action:** `providerGetFullProjectResponse`

---

## VCS Handlers

### onMergeAsPatch

Generate and apply changes as a patch.

```typescript
codebolt.onMergeAsPatch(async () => {
  const patch = await execAsync('git diff', { cwd: workspacePath });
  // Apply patch to main branch
  return { success: true, patch: patch.stdout };
});
```

**Message type:** `providerMergeAsPatch`
**Response action:** `providerMergeAsPatchResponse`

### onSendPR

Create a pull request with changes.

```typescript
codebolt.onSendPR(async () => {
  await execAsync('git push origin HEAD', { cwd: workspacePath });
  const prUrl = await createPullRequest();
  return { success: true, prUrl };
});
```

**Message type:** `providerSendPR`
**Response action:** `providerSendPRResponse`

### onCreatePatchRequest

```typescript
codebolt.onCreatePatchRequest(async () => {
  // Create patch file
  return { success: true };
});
```

**Message type:** `createPatchRequest`
**Response action:** `createPatchRequestResponse`

### onCreatePullRequestRequest

```typescript
codebolt.onCreatePullRequestRequest(async () => {
  // Create PR
  return { success: true };
});
```

**Message type:** `createPullRequestRequest`
**Response action:** `createPullRequestRequestResponse`

---

## Heartbeat Handlers

### onProviderHeartbeatRequest

Respond to provider health check.

```typescript
codebolt.onProviderHeartbeatRequest(async (request) => {
  // request contains: { providerId, timestamp }

  return {
    status: getHealthStatus(),  // 'healthy' | 'degraded' | 'error'
    connectedEnvironments: getConnectedEnvironments(),
  };
});
```

**Message type:** `providerHeartbeatRequest`

### onEnvironmentHeartbeatRequest

Respond to environment health check.

```typescript
codebolt.onEnvironmentHeartbeatRequest(async (request) => {
  // request contains: { environmentId, providerId, timestamp }

  return {
    status: 'active',  // 'active' | 'degraded' | 'unreachable'
    remoteExecutorStatus: 'running',  // 'running' | 'stopped' | 'starting' | 'error' | 'restarting'
  };
});
```

**Message type:** `environmentHeartbeat`
**Response type:** `environmentHeartbeatResponse`

### onEnvironmentRestartRequest

Handle environment restart request.

```typescript
codebolt.onEnvironmentRestartRequest(async (request) => {
  // request contains: { environmentId, providerId }

  await restartEnvironment(request.environmentId);

  return {
    success: true,
    message: 'Environment restarted successfully',
  };
});
```

**Message type:** `environmentRestartRequest`
**Response type:** `environmentRestartResponse`

---

## Response Format

All handlers automatically wrap responses:

### Success Response

```typescript
{
  type: "remoteProviderEvent",
  action: "{handlerName}Response",
  message: <handler return value>
}
```

### Error Response

```typescript
{
  type: "remoteProviderEvent",
  action: "{handlerName}Response",
  error: "Error message string"
}
```

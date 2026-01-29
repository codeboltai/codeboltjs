# Provider Lifecycle Patterns

Patterns for implementing provider lifecycle methods across different environment types.

## Table of Contents
- [Lifecycle Overview](#lifecycle-overview)
- [Environment Creation Patterns](#environment-creation-patterns)
- [Agent Server Patterns](#agent-server-patterns)
- [Connection Patterns](#connection-patterns)
- [Shutdown Patterns](#shutdown-patterns)
- [Error Recovery](#error-recovery)

---

## Lifecycle Overview

### State Transitions

```
[Uninitialized]
       │
       ▼ onProviderStart()
[Starting]
       │
       ├─ resolveProjectContext()
       ├─ resolveWorkspacePath()
       ├─ ensureAgentServer()
       ├─ setupEnvironment()
       └─ ensureTransportConnection()
       │
       ▼
[Connected]
       │
       ▼ afterConnected()
[Running] ◄──────────┐
       │             │
       │ onProviderAgentStart()
       │             │
       ├─────────────┘
       │
       ▼ onProviderStop() / onCloseSignal()
[Stopping]
       │
       ├─ beforeClose()
       ├─ disconnectTransport()
       └─ teardownEnvironment()
       │
       ▼
[Stopped]
```

---

## Environment Creation Patterns

### Pattern 1: Local Process

For environments that spawn a local process (e.g., local agent server).

```typescript
protected async setupEnvironment(initVars: ProviderInitVars): Promise<void> {
  // Create working directory
  this.workDir = `/tmp/env-${initVars.environmentName}`;
  await fs.mkdir(this.workDir, { recursive: true });

  // Copy project files if needed
  if (initVars.projectPath) {
    await fs.cp(initVars.projectPath, this.workDir, { recursive: true });
  }

  this.state.workspacePath = this.workDir;
}

protected async teardownEnvironment(): Promise<void> {
  if (this.workDir) {
    await fs.rm(this.workDir, { recursive: true, force: true });
  }
}
```

### Pattern 2: Container-Based

For Docker, Podman, or similar container environments.

```typescript
protected async setupEnvironment(initVars: ProviderInitVars): Promise<void> {
  const containerName = `codebolt-${initVars.environmentName}`;

  // Create container
  this.container = await this.docker.createContainer({
    Image: 'codebolt-executor:latest',
    name: containerName,
    Env: [
      `ENVIRONMENT_NAME=${initVars.environmentName}`,
      `PROJECT_PATH=/workspace`,
    ],
    HostConfig: {
      Binds: [`${initVars.projectPath}:/workspace:rw`],
      PortBindings: { '3001/tcp': [{ HostPort: '0' }] }, // Dynamic port
    },
  });

  await this.container.start();

  // Get assigned port
  const info = await this.container.inspect();
  this.agentServerPort = info.NetworkSettings.Ports['3001/tcp'][0].HostPort;
  this.state.workspacePath = '/workspace';
}

protected async teardownEnvironment(): Promise<void> {
  if (this.container) {
    await this.container.stop({ t: 10 });
    await this.container.remove();
  }
}
```

### Pattern 3: Remote Server (SSH)

For SSH-based remote environments.

```typescript
protected async setupEnvironment(initVars: ProviderInitVars): Promise<void> {
  const { host, username, privateKey } = initVars;

  // Establish SSH connection
  this.ssh = new SSH2Client();
  await this.ssh.connect({ host, username, privateKey });

  // Create remote working directory
  const remotePath = `/tmp/codebolt-${initVars.environmentName}`;
  await this.ssh.exec(`mkdir -p ${remotePath}`);

  // Sync project files
  await this.rsync(initVars.projectPath, `${username}@${host}:${remotePath}`);

  // Start agent server on remote
  await this.ssh.exec(`cd ${remotePath} && node agent-server.js &`);

  this.remotePath = remotePath;
  this.state.workspacePath = remotePath;
}

protected async teardownEnvironment(): Promise<void> {
  if (this.ssh) {
    await this.ssh.exec(`rm -rf ${this.remotePath}`);
    await this.ssh.end();
  }
}
```

### Pattern 4: Git Worktree

For branch-based isolation.

```typescript
protected async setupEnvironment(initVars: ProviderInitVars): Promise<void> {
  const worktreePath = path.join(this.worktreeBaseDir, initVars.environmentName);

  // Create worktree with new branch
  await execAsync(
    `git worktree add -b "${initVars.environmentName}" "${worktreePath}"`,
    { cwd: this.baseRepoPath }
  );

  this.worktreePath = worktreePath;
  this.state.workspacePath = worktreePath;
}

protected async teardownEnvironment(): Promise<void> {
  if (this.worktreePath) {
    await execAsync(
      `git worktree remove "${this.worktreePath}"`,
      { cwd: this.baseRepoPath }
    );
  }
}
```

---

## Agent Server Patterns

### Pattern 1: Bundled Agent Server

Start agent server as a child process.

```typescript
protected async ensureAgentServer(): Promise<void> {
  const serverPath = path.resolve(__dirname, '../agent-server/dist/server.mjs');

  this.agentProcess = spawn('node', [
    serverPath,
    '--port', this.config.agentServerPort.toString(),
    '--noui',
  ], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });

  // Wait for server to be ready
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server startup timeout')), 60000);

    this.agentProcess.stdout?.on('data', (data) => {
      if (data.toString().includes('Server started')) {
        clearTimeout(timeout);
        resolve();
      }
    });

    this.agentProcess.on('error', reject);
  });
}
```

### Pattern 2: Container-Internal Server

Agent server runs inside container.

```typescript
protected async ensureAgentServer(): Promise<void> {
  // Server starts automatically in container via ENTRYPOINT
  // Just wait for it to be ready

  const maxAttempts = 30;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`http://localhost:${this.agentServerPort}/health`);
      if (response.ok) return;
    } catch {
      // Server not ready yet
    }
    await this.sleep(1000);
  }

  throw new Error('Agent server failed to start in container');
}
```

### Pattern 3: Remote Server

Agent server runs on remote machine.

```typescript
protected async ensureAgentServer(): Promise<void> {
  // Start on remote via SSH
  await this.ssh.exec(`
    cd ${this.remotePath} &&
    nohup node agent-server.js --port ${this.remotePort} > /dev/null 2>&1 &
  `);

  // Set up SSH port forwarding
  this.sshTunnel = await this.ssh.forwardOut(
    'localhost', this.config.agentServerPort,
    'localhost', this.remotePort
  );
}
```

---

## Connection Patterns

### Standard WebSocket Connection

```typescript
protected async ensureTransportConnection(initVars: ProviderInitVars): Promise<void> {
  const url = this.buildWebSocketUrl(initVars);

  await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(url);
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Connection timeout'));
    }, this.config.wsRegistrationTimeout);

    ws.on('open', () => {
      this.agentServer.wsConnection = ws;
      this.agentServer.isConnected = true;
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === 'registered') {
        clearTimeout(timeout);
        resolve();
      }
      this.handleTransportMessage(message);
    });

    ws.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    ws.on('close', () => {
      this.agentServer.isConnected = false;
      this.agentServer.wsConnection = null;
    });
  });
}
```

---

## Shutdown Patterns

### Graceful Shutdown

```typescript
async onProviderStop(initVars: ProviderInitVars): Promise<void> {
  this.resetState();

  try {
    // Pre-cleanup hook
    await this.beforeClose();

    // Stop heartbeats
    this.stopHeartbeat();
    this.stopEnvironmentHeartbeat();

    // Close WebSocket
    await this.disconnectTransport();

    // Clean up environment
    await this.teardownEnvironment();

    // Stop agent server if we started it
    if (this.agentProcess) {
      this.agentProcess.kill('SIGTERM');
      await this.waitForProcessExit(this.agentProcess, 10000);
    }
  } finally {
    this.state.initialized = false;
  }
}
```

### Timeout-Protected Cleanup

```typescript
protected async teardownEnvironment(): Promise<void> {
  const timeout = this.config.timeouts?.cleanup || 15000;

  await Promise.race([
    this.doCleanup(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Cleanup timeout')), timeout)
    ),
  ]).catch((error) => {
    console.error('Cleanup error:', error);
    // Force cleanup
    this.forceCleanup();
  });
}
```

---

## Error Recovery

### Reconnection Pattern

```typescript
private async reconnect(): Promise<void> {
  for (let attempt = 1; attempt <= this.config.reconnectAttempts; attempt++) {
    console.log(`Reconnection attempt ${attempt}/${this.config.reconnectAttempts}`);

    try {
      await this.ensureTransportConnection(this.lastInitVars);
      console.log('Reconnected successfully');
      return;
    } catch (error) {
      console.error(`Reconnection failed:`, error);
      if (attempt < this.config.reconnectAttempts) {
        await this.sleep(this.config.reconnectDelay * attempt); // Exponential backoff
      }
    }
  }

  throw new Error('Failed to reconnect after maximum attempts');
}
```

### Health-Based Recovery

```typescript
protected getProviderHealthStatus(): 'healthy' | 'degraded' | 'error' {
  if (!this.state.initialized) {
    return 'error';
  }

  if (!this.agentServer.isConnected) {
    // Attempt reconnection in background
    this.reconnect().catch(() => {});
    return 'degraded';
  }

  return 'healthy';
}
```

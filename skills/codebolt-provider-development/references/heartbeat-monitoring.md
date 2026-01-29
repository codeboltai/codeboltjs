# Heartbeat Monitoring

Provider and environment health monitoring system.

## Table of Contents
- [Overview](#overview)
- [Provider Heartbeat](#provider-heartbeat)
- [Environment Heartbeat](#environment-heartbeat)
- [Health Status](#health-status)
- [Implementation Patterns](#implementation-patterns)

---

## Overview

The heartbeat system monitors provider and environment health:

- **Provider Heartbeat**: Reports overall provider status (10-second intervals)
- **Environment Heartbeat**: Reports individual environment status (15-second intervals)

```
┌─────────────────┐     heartbeat     ┌─────────────────┐
│    Provider     │ ───────────────▶  │   Application   │
│                 │                   │                 │
│  ┌───────────┐  │   env heartbeat   │                 │
│  │ Env 1     │  │ ───────────────▶  │                 │
│  └───────────┘  │                   │                 │
│  ┌───────────┐  │   env heartbeat   │                 │
│  │ Env 2     │  │ ───────────────▶  │                 │
│  └───────────┘  │                   │                 │
└─────────────────┘                   └─────────────────┘
```

---

## Provider Heartbeat

### Sending Heartbeats

BaseProvider automatically handles heartbeats when you call `startHeartbeat()`:

```typescript
protected async afterConnected(startResult: ProviderStartResult): Promise<void> {
  this.startHeartbeat();  // Start 10-second heartbeat
  this.registerConnectedEnvironment(startResult.environmentName);
}
```

### Manual Heartbeat

```typescript
codebolt.sendProviderHeartbeat({
  providerId: 'my-provider-id',
  status: 'healthy',
  connectedEnvironments: ['env-1', 'env-2'],
  uptime: 3600,  // seconds
  metadata: {
    version: '1.0.0',
    transport: 'websocket',
  },
});
```

### Heartbeat Data

```typescript
interface ProviderHeartbeat {
  providerId: string;                    // Unique provider ID
  status: 'healthy' | 'degraded' | 'error';
  connectedEnvironments: string[];       // List of environment IDs
  uptime?: number;                       // Seconds since start
  metadata?: Record<string, any>;        // Custom metadata
  timestamp: string;                     // Auto-added ISO timestamp
}
```

### Responding to Requests

```typescript
codebolt.onProviderHeartbeatRequest((request) => {
  // request: { providerId, timestamp }

  return {
    status: this.getHealthStatus(),
    connectedEnvironments: this.state.connectedEnvironments || [],
  };
});
```

---

## Environment Heartbeat

### Starting Environment Heartbeat

```typescript
protected async afterConnected(startResult: ProviderStartResult): Promise<void> {
  this.registerConnectedEnvironment(startResult.environmentName);
  this.startEnvironmentHeartbeat(startResult.environmentName);  // 15-second interval
}
```

### Manual Environment Heartbeat

```typescript
codebolt.sendEnvironmentHeartbeat({
  environmentId: 'env-123',
  providerId: 'my-provider-id',
});
```

### Responding to Environment Requests

```typescript
codebolt.onEnvironmentHeartbeatRequest((request) => {
  // request: { environmentId, providerId, timestamp }

  const envStatus = checkEnvironmentStatus(request.environmentId);

  return {
    status: envStatus.isReachable ? 'active' : 'unreachable',
    remoteExecutorStatus: envStatus.executorStatus,
  };
});
```

### Environment Status Values

```typescript
interface EnvironmentHeartbeatResponse {
  status: 'active' | 'degraded' | 'unreachable';
  remoteExecutorStatus: 'running' | 'stopped' | 'starting' | 'error' | 'restarting';
}
```

---

## Health Status

### Provider Health Determination

```typescript
protected getProviderHealthStatus(): 'healthy' | 'degraded' | 'error' {
  // Error: Provider not initialized
  if (!this.state.initialized) {
    return 'error';
  }

  // Degraded: WebSocket disconnected but can recover
  if (!this.agentServer.isConnected) {
    return 'degraded';
  }

  // Healthy: All systems operational
  return 'healthy';
}
```

### Health Status Meanings

| Status | Provider | Environment |
|--------|----------|-------------|
| **healthy/active** | Fully operational | Environment responsive |
| **degraded** | Partial functionality (e.g., reconnecting) | Some features unavailable |
| **error/unreachable** | Not functional | Cannot communicate |

### Remote Executor Status

| Status | Meaning |
|--------|---------|
| `running` | Executor actively processing |
| `stopped` | Executor not running |
| `starting` | Executor initializing |
| `error` | Executor crashed or failed |
| `restarting` | Executor restarting |

---

## Implementation Patterns

### Complete Heartbeat Setup

```typescript
class MyProvider extends BaseProvider {
  protected async afterConnected(startResult: ProviderStartResult): Promise<void> {
    // Start provider-level heartbeat (10s)
    this.startHeartbeat();

    // Track this environment
    this.registerConnectedEnvironment(startResult.environmentName);

    // Start environment-specific heartbeat (15s)
    this.startEnvironmentHeartbeat(startResult.environmentName);
  }

  protected async beforeClose(): Promise<void> {
    // Stop all heartbeats
    this.stopHeartbeat();
    this.stopEnvironmentHeartbeat();

    // Unregister environment
    this.unregisterConnectedEnvironment(this.state.environmentName!);
  }

  protected getProviderHealthStatus(): 'healthy' | 'degraded' | 'error' {
    if (!this.state.initialized) return 'error';
    if (!this.agentServer.isConnected) return 'degraded';
    if (!this.isEnvironmentHealthy()) return 'degraded';
    return 'healthy';
  }

  private isEnvironmentHealthy(): boolean {
    // Custom health check for your environment type
    return true;
  }
}
```

### Environment Restart Handling

```typescript
codebolt.onEnvironmentRestartRequest(async (request) => {
  const { environmentId, providerId } = request;

  try {
    // Stop current environment
    await this.stopEnvironment(environmentId);

    // Restart
    await this.startEnvironment(environmentId);

    return { success: true, message: 'Restarted successfully' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Restart failed',
    };
  }
});
```

### Multi-Environment Provider

```typescript
class MultiEnvProvider extends BaseProvider {
  private environments = new Map<string, EnvironmentState>();

  protected registerConnectedEnvironment(envId: string): void {
    super.registerConnectedEnvironment(envId);
    this.environments.set(envId, { status: 'active' });
  }

  protected getProviderHealthStatus(): 'healthy' | 'degraded' | 'error' {
    if (!this.state.initialized) return 'error';

    const statuses = Array.from(this.environments.values());
    const hasErrors = statuses.some(e => e.status === 'error');
    const hasDegraded = statuses.some(e => e.status === 'degraded');

    if (hasErrors) return 'error';
    if (hasDegraded) return 'degraded';
    return 'healthy';
  }
}
```

### Constants

```typescript
const HEARTBEAT_INTERVAL = 10_000;              // 10 seconds
const ENVIRONMENT_HEARTBEAT_INTERVAL = 15_000;  // 15 seconds
```

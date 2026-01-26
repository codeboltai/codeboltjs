# codebolt.orchestrator - Orchestrator Management

Manages Codebolt orchestrators, which are high-level agents that coordinate worker agents for complex tasks. Orchestrators have configurable settings, status management, and integration with the Codebolt ecosystem.

## Response Types

All methods return a standard OrchestratorResponse:

```typescript
interface OrchestratorResponse {
  success: boolean;           // Whether the operation succeeded
  requestId?: string;         // Unique request identifier
  data?: any;                 // Response data (varies by method)
  error?: {
    code: string;             // Error code
    message: string;          // Human-readable error message
    details?: any;            // Additional error details
  };
}
```

### OrchestratorInstance

Represents an orchestrator configuration and state:

```typescript
interface OrchestratorInstance {
  id: string;                           // Unique orchestrator identifier
  name: string;                         // Orchestrator display name
  description: string;                  // Description of orchestrator purpose
  agentId: string;                      // Associated agent identifier
  defaultWorkerAgentId?: string | null; // Default worker for tasks
  threadId: string;                     // Associated conversation thread
  status: 'idle' | 'running' | 'paused'; // Current operational status
  metadata?: Record<string, any>;       // Custom metadata
  createdAt: Date;                      // Creation timestamp
  updatedAt: Date;                      // Last update timestamp
}
```

### CreateOrchestratorParams

Parameters for creating a new orchestrator:

```typescript
interface CreateOrchestratorParams {
  name: string;                      // Required: Orchestrator name
  description: string;               // Required: Orchestrator description
  agentId: string;                   // Required: Associated agent ID
  defaultWorkerAgentId?: string;     // Optional: Default worker agent ID
  metadata?: Record<string, any>;     // Optional: Custom metadata
}
```

### UpdateOrchestratorParams

Parameters for updating an orchestrator:

```typescript
interface UpdateOrchestratorParams {
  name?: string;                     // Updated name
  description?: string;              // Updated description
  agentId?: string;                  // Updated agent ID
  defaultWorkerAgentId?: string;     // Updated default worker
  metadata?: Record<string, any>;    // Updated metadata
}
```

### UpdateOrchestratorSettingsParams

Parameters for updating orchestrator settings:

```typescript
interface UpdateOrchestratorSettingsParams {
  name?: string;                     // Updated name
  description?: string;              // Updated description
  defaultWorkerAgentId?: string;     // Updated default worker
  metadata?: Record<string, any>;    // Updated metadata
}
```

## Methods

### `listOrchestrators()`

Lists all available orchestrators in the system.

**Response:**
```typescript
{
  success: boolean;
  data?: OrchestratorInstance[];  // Array of orchestrator instances
  requestId?: string;
}
```

```typescript
const result = await codebolt.orchestrator.listOrchestrators();
if (result.success && result.data) {
  console.log(`Found ${result.data.length} orchestrators`);
  result.data.forEach(orch => {
    console.log(`${orch.name}: ${orch.status}`);
  });
}
```

---

### `getOrchestrator(orchestratorId)`

Retrieves a specific orchestrator by its ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| orchestratorId | string | Yes | Unique identifier of the orchestrator |

**Response:**
```typescript
{
  success: boolean;
  data?: OrchestratorInstance;  // Orchestrator details
  requestId?: string;
}
```

```typescript
const result = await codebolt.orchestrator.getOrchestrator('orch-123');
if (result.success && result.data) {
  console.log(`Orchestrator: ${result.data.name}`);
  console.log(`Status: ${result.data.status}`);
  console.log(`Agent: ${result.data.agentId}`);
}
```

---

### `getOrchestratorSettings(orchestratorId)`

Gets the configuration settings for a specific orchestrator.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| orchestratorId | string | Yes | Unique identifier of the orchestrator |

**Response:**
```typescript
{
  success: boolean;
  data?: {
    id: string;
    name?: string;
    description?: string;
    defaultWorkerAgentId?: string;
    metadata?: Record<string, any>;
  };
  requestId?: string;
}
```

```typescript
const result = await codebolt.orchestrator.getOrchestratorSettings('orch-123');
if (result.success && result.data) {
  console.log('Settings:', result.data);
}
```

---

### `createOrchestrator(data)`

Creates a new orchestrator with the specified configuration.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| data | CreateOrchestratorParams | Yes | Orchestrator configuration |
| data.name | string | Yes | Display name for the orchestrator |
| data.description | string | Yes | Description of orchestrator purpose |
| data.agentId | string | Yes | Associated agent identifier |
| data.defaultWorkerAgentId | string | No | Default worker agent ID |
| data.metadata | Record<string, any> | No | Custom metadata |

**Response:**
```typescript
{
  success: boolean;
  data?: OrchestratorInstance;  // Created orchestrator details
  requestId?: string;
}
```

```typescript
const result = await codebolt.orchestrator.createOrchestrator({
  name: 'Task Orchestrator',
  description: 'Coordinates code analysis tasks',
  agentId: 'agent-456',
  defaultWorkerAgentId: 'worker-789',
  metadata: { department: 'devops' }
});
if (result.success && result.data) {
  console.log(`Created orchestrator with ID: ${result.data.id}`);
}
```

---

### `updateOrchestrator(orchestratorId, data)`

Updates an existing orchestrator's configuration.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| orchestratorId | string | Yes | Unique identifier of the orchestrator |
| data | UpdateOrchestratorParams | Yes | Updated configuration |
| data.name | string | No | New display name |
| data.description | string | No | New description |
| data.agentId | string | No | New agent ID |
| data.defaultWorkerAgentId | string | No | New default worker |
| data.metadata | Record<string, any> | No | New metadata |

**Response:**
```typescript
{
  success: boolean;
  data?: OrchestratorInstance;  // Updated orchestrator details
  requestId?: string;
}
```

```typescript
const result = await codebolt.orchestrator.updateOrchestrator('orch-123', {
  name: 'Updated Orchestrator Name',
  description: 'New description',
  metadata: { version: 2.0 }
});
if (result.success && result.data) {
  console.log('Orchestrator updated successfully');
}
```

---

### `updateOrchestratorSettings(orchestratorId, settings)`

Updates the settings for a specific orchestrator.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| orchestratorId | string | Yes | Unique identifier of the orchestrator |
| settings | UpdateOrchestratorSettingsParams | Yes | New settings |
| settings.name | string | No | Updated name |
| settings.description | string | No | Updated description |
| settings.defaultWorkerAgentId | string | No | Updated default worker |
| settings.metadata | Record<string, any> | No | Updated metadata |

**Response:**
```typescript
{
  success: boolean;
  data?: {
    id: string;
    name?: string;
    description?: string;
    defaultWorkerAgentId?: string;
    metadata?: Record<string, any>;
  };
  requestId?: string;
}
```

```typescript
const result = await codebolt.orchestrator.updateOrchestratorSettings('orch-123', {
  defaultWorkerAgentId: 'new-worker-999'
});
if (result.success && result.data) {
  console.log('Settings updated:', result.data);
}
```

---

### `deleteOrchestrator(orchestratorId)`

Deletes an orchestrator from the system.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| orchestratorId | string | Yes | Unique identifier of the orchestrator |

**Response:**
```typescript
{
  success: boolean;
  data?: { deletedId: string };
  requestId?: string;
}
```

```typescript
const result = await codebolt.orchestrator.deleteOrchestrator('orch-123');
if (result.success) {
  console.log('Orchestrator deleted successfully');
}
```

---

### `updateOrchestratorStatus(orchestratorId, status)`

Updates the operational status of an orchestrator.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| orchestratorId | string | Yes | Unique identifier of the orchestrator |
| status | 'idle' | 'running' | 'paused' | Yes | New status value |

**Response:**
```typescript
{
  success: boolean;
  data?: OrchestratorInstance;  // Updated orchestrator with new status
  requestId?: string;
}
```

```typescript
const result = await codebolt.orchestrator.updateOrchestratorStatus('orch-123', 'running');
if (result.success && result.data) {
  console.log(`Orchestrator status: ${result.data.status}`);
}
```

---

### `updateCodeboltJs()`

Initiates an update of the Codebolt JS system. This triggers a system-wide update process.

**Response:**
```typescript
{
  success: boolean;
  data?: {
    message: string;
    version?: string;
  };
  requestId?: string;
}
```

```typescript
const result = await codebolt.orchestrator.updateCodeboltJs();
if (result.success) {
  console.log('Codebolt JS update initiated');
  console.log(result.data?.message);
}
```

## Examples

### Creating and Configuring a New Orchestrator

```typescript
// Create a new orchestrator for code review tasks
const result = await codebolt.orchestrator.createOrchestrator({
  name: 'Code Review Orchestrator',
  description: 'Coordinates automated code review processes',
  agentId: 'agent-review-001',
  defaultWorkerAgentId: 'worker-linter-001',
  metadata: {
    department: 'engineering',
    priority: 'high',
    checkList: ['security', 'performance', 'style']
  }
});

if (result.success && result.data) {
  console.log(`Created: ${result.data.id}`);
  console.log(`Thread: ${result.data.threadId}`);
}
```

### Managing Orchestrator Lifecycle

```typescript
// Get orchestrator and update its status
const orchestratorId = 'orch-review-001';

// Fetch current status
const statusResult = await codebolt.orchestrator.getOrchestrator(orchestratorId);
if (statusResult.success && statusResult.data) {
  console.log(`Current status: ${statusResult.data.status}`);

  // Start the orchestrator
  if (statusResult.data.status === 'idle') {
    const updateResult = await codebolt.orchestrator.updateOrchestratorStatus(
      orchestratorId,
      'running'
    );
    if (updateResult.success) {
      console.log('Orchestrator is now running');
    }
  }
}
```

### Listing and Filtering Orchestrators

```typescript
// List all orchestrators and filter by status
const result = await codebolt.orchestrator.listOrchestrators();
if (result.success && result.data) {
  const orchestrators = result.data;
  
  console.log(`Total orchestrators: ${orchestrators.length}`);
  
  // Count by status
  const statusCounts = orchestrators.reduce((acc, orch) => {
    acc[orch.status] = (acc[orch.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('Status breakdown:', statusCounts);
  
  // List idle orchestrators
  const idleOrchestrators = orchestrators.filter(o => o.status === 'idle');
  console.log(`Idle orchestrators: ${idleOrchestrators.length}`);
}
```

### Updating Orchestrator Settings

```typescript
// Update orchestrator configuration while preserving other settings
const orchestratorId = 'orch-review-001';

// Get current settings
const currentSettings = await codebolt.orchestrator.getOrchestratorSettings(orchestratorId);
if (currentSettings.success && currentSettings.data) {
  // Update specific fields
  const updateResult = await codebolt.orchestrator.updateOrchestratorSettings(
    orchestratorId,
    {
      defaultWorkerAgentId: 'worker-updated-002',
      metadata: {
        ...currentSettings.data.metadata,
        lastUpdated: new Date().toISOString(),
        version: '2.1'
      }
    }
  );
  
  if (updateResult.success) {
    console.log('Settings updated successfully');
  }
}
```

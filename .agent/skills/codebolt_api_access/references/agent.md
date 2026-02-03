# codebolt.agent - Agent Management Module

Provides functionality to discover, list, and execute agents for various tasks. Agents are specialized AI workers that can perform specific operations like code generation, debugging, testing, and more.

## Response Types

All responses extend a base response with common fields:

```typescript
interface BaseAgentResponse {
  success?: boolean;  // Whether the operation succeeded
  message?: string;   // Optional status message
  error?: string;     // Error details if operation failed
}
```

### AgentFunction

Represents an agent's function definition with its schema:

```typescript
interface AgentFunction {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, {
        type: string;
        description: string;
      }>;
      required?: string[];
      additionalProperties?: boolean;
    };
    strict?: boolean;
  };
}
```

### AgentDetail

Detailed information about an agent:

```typescript
interface AgentDetail {
  id: string;               // Unique identifier
  name: string;             // Display name
  description: string;       // What the agent does
  capabilities?: string[];  // List of capabilities
  isLocal: boolean;         // Whether it's a local agent
  version: string;           // Agent version
  status: string;           // Current status
  unique_id: string;        // Globally unique ID
}
```

## Methods

### `findAgent(task, maxResult?, agents?, agentLocation?, getFrom?)`

Finds the most suitable agent for a given task using vector database search or AI-based matching.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| task | string | Yes | The task description to find an agent for |
| maxResult | number | No | Maximum number of results (default: 1) |
| agents | string[] | No | List of agent IDs to filter against in vector DB |
| agentLocation | `AgentLocation` | No | Where to search: `"all"`, `"local_only"`, `"remote_only"` (default: `"all"`) |
| getFrom | `FilterUsing` | No | Search method: `"use_ai"`, `"use_vector_db"`, `"use_both"` (default: `"use_vector_db"`) |

**Response:**
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
  agents?: AgentFunction[];  // Array of matching agents
}
```

```typescript
const result = await codebolt.agent.findAgent('Write unit tests for a React component');
if (result.success && result.agents) {
  console.log(`Found ${result.agents.length} agent(s)`);
  const agent = result.agents[0];
  console.log(`Best match: ${agent.function.name}`);
}
```

---

### `startAgent(agentId, task)`

Starts execution of a specific agent for a given task.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agentId | string | Yes | The ID of the agent to start |
| task | string | Yes | The task for the agent to execute |

**Response:**
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
  from?: string;    // Who started the agent
  agentId?: string; // Agent that was started
  task?: string;    // Task that was assigned
  result?: any;     // Agent's execution result
}
```

```typescript
const result = await codebolt.agent.startAgent('agent-123', 'Fix the login bug');
if (result.success) {
  console.log('Agent started:', result.agentId);
  console.log('Result:', result.result);
} else {
  console.error('Failed to start agent:', result.error);
}
```

---

### `getAgentsList(type?)`

Lists all available agents, optionally filtered by type.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | `Agents` | No | Filter by: `"local"`, `"all"`, `"downloaded"` (default: `"downloaded"`) |

**Response:**
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
  agents?: AgentFunction[];  // List of available agents
}
```

```typescript
const result = await codebolt.agent.getAgentsList('downloaded');
if (result.success && result.agents) {
  result.agents.forEach(agent => {
    console.log(`${agent.function.name}: ${agent.function.description}`);
  });
}
```

---

### `getAgentsDetail(agentList?)`

Retrieves detailed information about specific agents or all agents.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agentList | string[] | No | List of agent IDs to get details for (empty array = all agents) |

**Response:**
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
  payload?: {
    agents: AgentDetail[];  // Detailed agent information
  };
}
```

```typescript
const result = await codebolt.agent.getAgentsDetail(['agent-123', 'agent-456']);
if (result.success && result.payload) {
  result.payload.agents.forEach(agent => {
    console.log(`${agent.name} (v${agent.version}) - ${agent.description}`);
    console.log(`Status: ${agent.status}, Local: ${agent.isLocal}`);
  });
}
```

---

## Examples

### Finding and Starting an Agent for Code Review

```typescript
const task = 'Review the authentication module for security issues';

// Find the best agent for the task
const searchResult = await codebolt.agent.findAgent(
  task,
  1,
  [],
  'all',
  'use_vector_db'
);

if (searchResult.success && searchResult.agents && searchResult.agents.length > 0) {
  const bestAgent = searchResult.agents[0];
  console.log(`Using agent: ${bestAgent.function.name}`);

  // Start the agent
  const executionResult = await codebolt.agent.startAgent(
    bestAgent.function.name,
    task
  );

  if (executionResult.success) {
    console.log('Agent completed:', executionResult.result);
  }
}
```

### Listing All Downloaded Agents

```typescript
const result = await codebolt.agent.getAgentsList('downloaded');

if (result.success && result.agents) {
  console.log(`Found ${result.agents.length} downloaded agents:\n`);

  result.agents.forEach((agent, index) => {
    console.log(`${index + 1}. ${agent.function.name}`);
    console.log(`   ${agent.function.description}`);
    console.log(`   Parameters: ${Object.keys(agent.function.parameters.properties).join(', ')}`);
    console.log('');
  });
}
```

### Getting Detailed Agent Information

```typescript
// Get details for all agents
const result = await codebolt.agent.getAgentsDetail([]);

if (result.success && result.payload) {
  const activeAgents = result.payload.agents.filter(a => a.status === 'active');
  console.log(`${activeAgents.length} active agents:`);

  activeAgents.forEach(agent => {
    console.log(`\n${agent.name}`);
    console.log(`  Version: ${agent.version}`);
    console.log(`  Location: ${agent.isLocal ? 'Local' : 'Remote'}`);
    console.log(`  Capabilities: ${agent.capabilities?.join(', ') || 'None'}`);
    console.log(`  Unique ID: ${agent.unique_id}`);
  });
}
```

### Searching Local Agents Only

```typescript
const task = 'Optimize database queries';

// Search only local agents using AI matching
const result = await codebolt.agent.findAgent(
  task,
  3,
  [],
  'local_only',
  'use_ai'
);

if (result.success) {
  if (result.agents && result.agents.length > 0) {
    console.log(`Found ${result.agents.length} local agents:\n`);
    result.agents.forEach(agent => {
      console.log(`- ${agent.function.name}: ${agent.function.description}`);
    });
  } else {
    console.log('No local agents found for this task');
  }
} else {
  console.error('Search failed:', result.error);
}
```

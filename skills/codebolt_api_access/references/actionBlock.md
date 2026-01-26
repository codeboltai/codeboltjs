# codebolt.actionBlock - ActionBlock Management

Provides functionality for managing and executing ActionBlocks in the codebolt platform.

## Response Types

### ActionBlock

Used in list and detail responses to represent an ActionBlock:

```typescript
interface ActionBlock {
  id: string;
  name: string;
  description: string;
  version: string;
  entryPoint: string;
  path: string;
  type: ActionBlockType;        // 'filesystem' | 'runtime' | 'builtin'
  metadata: ActionBlockMetadata;
}
```

### ActionBlockMetadata

Contains optional metadata about an ActionBlock:

```typescript
interface ActionBlockMetadata {
  author?: string;
  tags?: string[];
  dependencies?: string[];
  inputs?: ActionBlockInput[];
  outputs?: ActionBlockOutput[];
}
```

### ActionBlockInput

Describes an input parameter for an ActionBlock:

```typescript
interface ActionBlockInput {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  default?: any;
}
```

### ActionBlockOutput

Describes an output value from an ActionBlock:

```typescript
interface ActionBlockOutput {
  name: string;
  type: string;
  description?: string;
}
```

### ActionBlockFilter

Optional filter for listing ActionBlocks:

```typescript
interface ActionBlockFilter {
  type?: ActionBlockType;  // Filter by ActionBlock type
}
```

### ActionBlockType

Enumeration of available ActionBlock types:

```typescript
enum ActionBlockType {
  FILESYSTEM = 'filesystem',
  RUNTIME = 'runtime',
  BUILTIN = 'builtin'
}
```

## Methods

### `list(filter?)`

Lists all available ActionBlocks, optionally filtered by type.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filter | ActionBlockFilter | No | Optional filter to narrow results by type |

**Response:**
```typescript
{
  type: 'listActionBlocksResponse';
  success: boolean;
  actionBlocks?: ActionBlock[];      // Array of ActionBlock objects
  error?: string;                    // Error message if failed
  requestId?: string;                 // Request identifier
}
```

```typescript
const result = await codebolt.actionBlock.list({ type: 'filesystem' });
if (result.success) {
  console.log(`Found ${result.actionBlocks.length} ActionBlocks`);
  result.actionBlocks.forEach(ab => {
    console.log(`- ${ab.name} v${ab.version}`);
  });
}
```

---

### `getDetail(actionBlockName)`

Gets detailed information about a specific ActionBlock including its metadata, inputs, and outputs.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| actionBlockName | string | Yes | Name of the ActionBlock to retrieve |

**Response:**
```typescript
{
  type: 'getActionBlockDetailResponse';
  success: boolean;
  actionBlock?: {
    id: string;
    name: string;
    description: string;
    version: string;
    entryPoint: string;
    path: string;
    type: ActionBlockType;
    metadata: ActionBlockMetadata;
  };
  error?: string;                    // Error message if not found
  requestId?: string;                 // Request identifier
}
```

```typescript
const result = await codebolt.actionBlock.getDetail('myActionBlock');
if (result.success && result.actionBlock) {
  console.log(`Name: ${result.actionBlock.name}`);
  console.log(`Version: ${result.actionBlock.version}`);
  console.log(`Author: ${result.actionBlock.metadata.author}`);
}
```

---

### `start(actionBlockName, params?)`

Starts execution of an ActionBlock by name, optionally passing parameters.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| actionBlockName | string | Yes | Name of the ActionBlock to start |
| params | Record<string, any> | No | Optional parameters to pass to the ActionBlock |

**Response:**
```typescript
{
  type: 'startActionBlockResponse';
  success: boolean;
  sideExecutionId?: string;         // Execution identifier for tracking
  result?: any;                     // Result returned by the ActionBlock
  error?: string;                   // Error message if execution failed
  requestId?: string;               // Request identifier
}
```

```typescript
const result = await codebolt.actionBlock.start('dataProcessor', {
  inputFile: '/path/to/input.txt',
  outputFile: '/path/to/output.txt',
  mode: 'fast'
});
if (result.success) {
  console.log(`Execution started: ${result.sideExecutionId}`);
  console.log(`Result: ${JSON.stringify(result.result)}`);
}
```

## Examples

### List All Filesystem ActionBlocks

```typescript
const result = await codebolt.actionBlock.list({ type: 'filesystem' });
if (result.success) {
  result.actionBlocks.forEach(ab => {
    console.log(`${ab.name}: ${ab.description}`);
  });
}
```

### Get ActionBlock Details and Check Inputs

```typescript
const detail = await codebolt.actionBlock.getDetail('myActionBlock');
if (detail.success && detail.actionBlock) {
  console.log(`Inputs required:`);
  detail.actionBlock.metadata.inputs?.forEach(input => {
    console.log(`  - ${input.name} (${input.type}) ${input.required ? '[required]' : '[optional]'}`);
  });
}
```

### Execute ActionBlock with Error Handling

```typescript
try {
  const result = await codebolt.actionBlock.start('batchProcessor', {
    batchSize: 100,
    timeout: 5000
  });

  if (result.success) {
    console.log(`Execution ID: ${result.sideExecutionId}`);
    console.log(`Output:`, result.result);
  } else {
    console.error(`Failed to start: ${result.error}`);
  }
} catch (err) {
  console.error('Unexpected error:', err);
}
```

### Discover and Use Runtime ActionBlocks

```typescript
const list = await codebolt.actionBlock.list({ type: 'runtime' });
if (list.success) {
  for (const ab of list.actionBlocks) {
    const detail = await codebolt.actionBlock.getDetail(ab.name);
    if (detail.success && detail.actionBlock?.metadata.tags?.includes('utility')) {
      const result = await codebolt.actionBlock.start(ab.name, { verbose: true });
      if (result.success) {
        console.log(`${ab.name} completed successfully`);
      }
    }
  }
}
```

# Telemetry

Multillm includes **automatic telemetry** to log all LLM operations - no configuration needed!

## Overview

Telemetry is **enabled by default** and automatically logs:
- Request parameters (model, temperature, etc.)
- Token usage
- Response metadata
- Error information
- Custom metadata

All logs follow **OpenTelemetry GenAI semantic conventions**.

## Quick Start

```typescript
import Multillm from '@arrowai/multillm';

// Telemetry works automatically - no config needed!
const llm = new Multillm('openai', 'gpt-4', null, process.env.OPENAI_API_KEY);

await llm.createCompletion({
  messages: [{ role: 'user', content: 'Hello!' }]
});

// Automatically logged to ./llm-telemetry.ndjson
```

**Check your logs:**

```bash
cat llm-telemetry.ndjson
```

Output:
```json
{"timestamp":"2024-01-01T00:00:00.000Z","operation":"chat","provider":"openai","model":"gpt-4","usage":{"inputTokens":10,"outputTokens":20,"totalTokens":30},"status":"OK"}
```

## Configuration

### Basic Configuration

```typescript
const llm = new Multillm('openai', 'gpt-4', null, process.env.OPENAI_API_KEY, null, {
  telemetry: {
    enabled: true,
    filePath: './logs/llm-calls.ndjson',
    consoleLog: true,
    consoleVerbose: true,
    recordInputs: true,
    recordOutputs: true
  }
});
```

### Full Configuration Options

```typescript
interface TelemetryConfig {
  /** Enable/disable telemetry (default: true) */
  enabled?: boolean;

  /** Log file path (default: ./llm-telemetry.ndjson) */
  filePath?: string;

  /** Log to console (default: false) */
  consoleLog?: boolean;

  /** Verbose console logging (default: false) */
  consoleVerbose?: boolean;

  /** Record input prompts (privacy: may contain sensitive data) */
  recordInputs?: boolean;

  /** Record output completions (privacy: may contain sensitive data) */
  recordOutputs?: boolean;

  /** Function/operation identifier for grouping */
  functionId?: string;

  /** Service name for resource attributes */
  serviceName?: string;

  /** Service version */
  serviceVersion?: string;

  /** Custom metadata to attach to all spans */
  metadata?: Record<string, unknown>;
}
```

## Log Format

### NDJSON Format

Logs are stored in **Newline Delimited JSON (NDJSON)** format:

```json
{"timestamp":"2024-01-01T12:00:00.000Z","traceId":"abc123...","spanId":"def456...","operation":"chat","provider":"openai","model":"gpt-4","durationMs":1500,"status":"OK","usage":{"inputTokens":10,"outputTokens":20,"totalTokens":30}}
{"timestamp":"2024-01-01T12:00:02.000Z","traceId":"ghi789...","spanId":"jkl012...","operation":"chat","provider":"anthropic","model":"claude-3-5-sonnet-20241022","durationMs":2000,"status":"OK","usage":{"inputTokens":15,"outputTokens":25,"totalTokens":40}}
```

### Log Entry Structure

```typescript
interface TelemetryLogEntry {
  timestamp: string;              // ISO timestamp
  traceId: string;               // Trace ID (groups related operations)
  spanId: string;                // Unique span ID
  parentSpanId?: string;          // Parent span (for nested operations)
  operation: string;               // 'chat' | 'embeddings' | 'generate_image' | etc.
  provider: string;                // Provider name
  model?: string;                 // Model used
  durationMs?: number;             // Operation duration
  status: 'OK' | 'ERROR' | 'UNSET';
  finishReason?: string;            // 'stop' | 'length' | 'tool_calls' | etc.
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cachedTokens?: number;          // Cache hit tokens
    cacheCreationTokens?: number;   // Cache creation tokens
    reasoningTokens?: number;        // Reasoning model tokens
  };
  error?: {
    type: string;
    message: string;
  };
  metadata?: Record<string, unknown>;  // Custom metadata
  input?: string;                 // Prompt (if recordInputs: true)
  output?: string;                // Completion (if recordOutputs: true)
}
```

## Disabling Telemetry

```typescript
const llm = new Multillm('openai', 'gpt-4', null, process.env.OPENAI_API_KEY, null, {
  telemetry: {
    enabled: false  // Disable telemetry
  }
});
```

## Custom File Path

```typescript
const llm = new Multillm('openai', 'gpt-4', null, process.env.OPENAI_API_KEY, null, {
  telemetry: {
    enabled: true,
    filePath: './logs/production/llm-calls.ndjson'  // Custom path
  }
});
```

## Console Logging

```typescript
const llm = new Multillm('openai', 'gpt-4', null, process.env.OPENAI_API_KEY, null, {
  telemetry: {
    enabled: true,
    consoleLog: true,      // Log to console
    consoleVerbose: true    // Verbose logging with details
  }
});
```

Console output:
```
[telemetry] Chat completion: gpt-4 - 30 tokens in 1500ms
[telemetry] [VERBOSE] Request: {...}
[telemetry] [VERBOSE] Response: {...}
```

## Recording Inputs and Outputs

```typescript
const llm = new Multillm('openai', 'gpt-4', null, process.env.OPENAI_API_KEY, null, {
  telemetry: {
    enabled: true,
    recordInputs: true,   // Record prompts (privacy concern!)
    recordOutputs: true   // Record completions (privacy concern!)
  }
});
```

**Privacy Warning**: Recording inputs/outputs may contain sensitive user data. Use only in development or with user consent.

## Custom Metadata

```typescript
const llm = new Multillm('openai', 'gpt-4', null, process.env.OPENAI_API_KEY, null, {
  telemetry: {
    enabled: true,
    serviceName: 'my-application',
    serviceVersion: '1.0.0',
    metadata: {
      environment: 'production',
      userId: 'user-123',
      region: 'us-east-1',
      feature: 'chatbot'
    }
  }
});
```

Metadata appears in every log entry:

```json
{
  "service.name": "my-application",
  "service.version": "1.0.0",
  "environment": "production",
  "userId": "user-123",
  "region": "us-east-1",
  "feature": "chatbot",
  "operation": "chat",
  ...
}
```

## Function ID

Group related operations:

```typescript
const llm = new Multillm('openai', 'gpt-4', null, process.env.OPENAI_API_KEY, null, {
  telemetry: {
    functionId: 'rag-pipeline'  // Group all RAG operations
  }
});
```

## Provider Tracking

Telemetry automatically identifies the provider:

| Provider | Name in Logs |
|----------|--------------|
| OpenAI | openai |
| Anthropic | anthropic |
| DeepSeek | deepseek |
| Gemini | gemini |
| Mistral | mistral_ai |
| Groq | groq |
| Ollama | ollama |
| Replicate | replicate |
| Bedrock | bedrock |
| Cloudflare | cloudflare |
| OpenRouter | openrouter |
| HuggingFace | huggingface |
| Grok | grok |
| CodeBolt AI | codeboltai |
| ZAi | zai |

## Operation Tracking

Different operations are tracked separately:

| Operation | Name in Logs |
|-----------|---------------|
| Chat Completions | chat |
| Embeddings | embeddings |
| Image Generation | generate_image |
| Speech Generation | speech |
| Transcription | transcription |
| Reranking | rerank |
| Tool Execution | execute_tool |

## Token Usage Tracking

All token types are tracked:

```typescript
// Standard tokens
usage: {
  inputTokens: 100,
  outputTokens: 200,
  totalTokens: 300
}

// With caching
usage: {
  inputTokens: 100,
  outputTokens: 200,
  totalTokens: 300,
  cachedTokens: 50,              // Tokens served from cache
  cacheCreationTokens: 100        // Tokens used to create cache
}

// With reasoning models
usage: {
  inputTokens: 50,
  outputTokens: 100,
  totalTokens: 150,
  reasoningTokens: 500            // Tokens used for reasoning
}
```

## Reading and Analyzing Logs

### Basic Analysis with jq

```bash
# Count total operations
cat llm-telemetry.ndjson | jq 'length'

# Count operations by provider
cat llm-telemetry.ndjson | jq -r '.provider' | sort | uniq -c

# Calculate total tokens
cat llm-telemetry.ndjson | jq '[.usage.totalTokens] | add'

# Average duration
cat llm-telemetry.ndjson | jq '[.durationMs] | add/length'
```

### Node.js Analysis

```typescript
import fs from 'fs';

function analyzeLogs(logFile: string) {
  const logs = fs.readFileSync(logFile, 'utf-8')
    .split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line));

  const stats = {
    totalOperations: logs.length,
    totalTokens: logs.reduce((sum, log) => sum + (log.usage?.totalTokens || 0), 0),
    avgDuration: logs.reduce((sum, log) => sum + (log.durationMs || 0), 0) / logs.length,
    byProvider: {} as Record<string, number>,
    byModel: {} as Record<string, number>,
    errors: logs.filter(log => log.status === 'ERROR').length
  };

  // Count by provider
  logs.forEach(log => {
    stats.byProvider[log.provider] = (stats.byProvider[log.provider] || 0) + 1;
    if (log.model) {
      stats.byModel[log.model] = (stats.byModel[log.model] || 0) + 1;
    }
  });

  console.log(stats);
}

analyzeLogs('./llm-telemetry.ndjson');
```

## Best Practices

1. **Keep Logs in Production**: Monitor usage and costs
2. **Rotate Logs**: Archive old logs to prevent file growth
3. **Analyze Regularly**: Review for patterns and issues
4. **Privacy First**: Don't record inputs/outputs in production without consent
5. **Use Function ID**: Group related operations
6. **Monitor Errors**: Track error rates and types
7. **Cost Tracking**: Calculate costs from token usage
8. **Set Service Info**: Include application version and environment

## Cost Tracking

```typescript
interface Pricing {
  provider: string;
  model: string;
  inputCostPer1k: number;
  outputCostPer1k: number;
}

const pricing: Pricing[] = [
  { provider: 'openai', model: 'gpt-4o', inputCostPer1k: 0.0025, outputCostPer1k: 0.01 },
  { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', inputCostPer1k: 0.003, outputCostPer1k: 0.015 }
];

function calculateCost(logs: TelemetryLogEntry[]): number {
  let total = 0;

  for (const log of logs) {
    const price = pricing.find(p => p.provider === log.provider && p.model === log.model);
    if (price && log.usage) {
      const inputCost = (log.usage.inputTokens / 1000) * price.inputCostPer1k;
      const outputCost = (log.usage.outputTokens / 1000) * price.outputCostPer1k;
      total += inputCost + outputCost;
    }
  }

  return total;
}

const logs = fs.readFileSync('llm-telemetry.ndjson', 'utf-8')
  .split('\n')
  .filter(line => line.trim())
  .map(line => JSON.parse(line));

const totalCost = calculateCost(logs);
console.log(`Total cost: $${totalCost.toFixed(2)}`);
```

## Error Tracking

```typescript
// Log entries with errors
const errorLogs = logs.filter(log => log.status === 'ERROR');

console.log(`Error rate: ${errorLogs.length / logs.length * 100}%`);

// Group by error type
const errorsByType = errorLogs.reduce((acc, log) => {
  const type = log.error?.type || 'unknown';
  acc[type] = (acc[type] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log('Errors by type:', errorsByType);
```

## Log Rotation

Prevent log file from growing too large:

```typescript
import fs from 'fs';
import path from 'path';

function rotateLog(filePath: string, maxSizeMB: number = 10) {
  const stats = fs.statSync(filePath);
  const sizeMB = stats.size / 1024 / 1024;

  if (sizeMB > maxSizeMB) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${filePath}.${timestamp}`;
    fs.renameSync(filePath, backupPath);
    console.log(`Rotated log to: ${backupPath}`);
  }
}

// Call before each operation
function logOperation(operation: () => Promise<void>) {
  rotateLog('./llm-telemetry.ndjson');
  return operation();
}

await logOperation(() => llm.createCompletion({ messages }));
```

## Integration with Observability Platforms

### Export to OpenTelemetry Format

```typescript
// Logs are already in OpenTelemetry-compatible format
// You can send them to your observability platform

import { post } from 'axios';

async function sendToDatadog(logs: TelemetryLogEntry[]) {
  await post('https://http-intake.logs.datadoghq.com/v1/input', logs, {
    headers: {
      'Content-Type': 'application/json',
      'DD-API-KEY': process.env.DATADOG_API_KEY
    }
  });
}

const logs = fs.readFileSync('llm-telemetry.ndjson', 'utf-8')
  .split('\n')
  .filter(line => line.trim())
  .map(line => JSON.parse(line));

await sendToDatadog(logs);
```

### Export to CloudWatch

```typescript
import { CloudWatchLogsClient, PutLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs';

async function sendToCloudWatch(logs: TelemetryLogEntry[]) {
  const client = new CloudWatchLogsClient({ region: 'us-east-1' });

  const events = logs.map(log => ({
    timestamp: new Date(log.timestamp),
    message: JSON.stringify(log)
  }));

  await client.send(new PutLogEventsCommand({
    logGroupName: '/aws/lambda/multillm',
    logStreamName: 'telemetry',
    logEvents: events
  }));
}
```

## Disable in Tests

```typescript
import Multillm from '@arrowai/multillm';

const llm = new Multillm('openai', 'gpt-4', null, process.env.OPENAI_API_KEY, null, {
  telemetry: {
    enabled: false  // Disable in tests
  }
});
```

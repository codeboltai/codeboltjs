# codebolt.terminal - Command Execution

This module provides functionality for executing commands in a terminal-like environment via WebSocket, supporting synchronous execution, long-running processes, and streaming output.

## Response Types

All responses extend a base response with common fields:

```typescript
interface BaseTerminalResponse {
  success?: boolean;  // Whether the operation succeeded
  message?: string;   // Optional status message
  error?: string;     // Error details if operation failed
}
```

### CommandOutput

Returned when a command produces output:

```typescript
interface CommandOutput {
  success?: boolean;
  output: string;     // Combined output
  stdout?: string;    // Standard output
  stderr?: string;    // Standard error output
}
```

### CommandError

Returned when a command produces an error:

```typescript
interface CommandError {
  success?: boolean;
  error: string;      // Error message
  exitCode?: number;  // Process exit code
  stderr?: string;    // Standard error output
}
```

### CommandFinish

Returned when a command completes:

```typescript
interface CommandFinish {
  success?: boolean;
  exitCode: number;   // Process exit code (0 = success)
  stdout?: string;    // Standard output
  stderr?: string;    // Standard error output
}
```

## Methods

### `executeCommand(command, returnEmptyStringOnSuccess?)`

Executes a given command and returns the result. Waits for the command to complete before returning.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| command | string | Yes | The command to be executed |
| returnEmptyStringOnSuccess | boolean | No | If true, returns empty string on success (default: false) |

**Response:** `CommandOutput | CommandError`

```typescript
{
  // On success:
  success?: boolean;
  output: string;     // Command output
  stdout?: string;
  stderr?: string;

  // On error:
  error: string;
  exitCode?: number;
  stderr?: string;
}
```

```typescript
const result = await codebolt.terminal.executeCommand('npm install');

if ('error' in result) {
  console.error(`Command failed (exit ${result.exitCode}): ${result.error}`);
  console.error('Stderr:', result.stderr);
} else {
  console.log('Output:', result.output);
}
```

---

### `executeCommandRunUntilError(command, executeInMain?)`

Executes a given command and keeps running until an error occurs. Useful for dev servers or watch processes that should run indefinitely until they fail.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| command | string | Yes | The command to be executed |
| executeInMain | boolean | No | Whether to execute in main terminal (default: false) |

**Response:** `CommandError`

```typescript
{
  success?: boolean;
  error: string;      // Error that caused the stop
  exitCode?: number;  // Process exit code
  stderr?: string;    // Standard error output
}
```

```typescript
// Start a dev server - will run until an error occurs
console.log('Starting dev server...');
const error = await codebolt.terminal.executeCommandRunUntilError('npm run dev');

// This line only executes when the server stops due to an error
console.log(`Server stopped with error: ${error.error}`);
console.log(`Exit code: ${error.exitCode}`);
```

---

### `executeCommandRunUntilInterrupt(command, executeInMain?)`

Executes a given command and keeps running until manually interrupted via `sendManualInterrupt()`.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| command | string | Yes | The command to be executed |
| executeInMain | boolean | No | Whether to execute in main terminal (default: false) |

**Response:** `CommandError`

```typescript
{
  success?: boolean;
  error: string;      // Typically indicates interrupted
  exitCode?: number;
  stderr?: string;
}
```

```typescript
// Start a watch process
console.log('Starting file watcher...');
const result = await codebolt.terminal.executeCommandRunUntilInterrupt('npm run watch');

// This line only executes after sendManualInterrupt() is called
console.log('Watcher stopped:', result.error);
```

---

### `sendManualInterrupt()`

Sends a manual interrupt signal (equivalent to Ctrl+C) to stop a running process started with `executeCommandRunUntilInterrupt` or `executeCommandRunUntilError`.

**Response:**

```typescript
{
  success?: boolean;
  interrupted?: boolean; // Whether interrupt was sent
  message?: string;
}
```

```typescript
// Send interrupt signal
const result = await codebolt.terminal.sendManualInterrupt();
if (result.interrupted) {
  console.log('Process interrupted successfully');
}
```

---

### `executeCommandWithStream(command, executeInMain?)`

Executes a given command and streams the output in real-time. Returns an EventEmitter that emits events for output, errors, and completion.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| command | string | Yes | The command to be executed |
| executeInMain | boolean | No | Whether to execute in main terminal (default: false) |

**Returns:** `CustomEventEmitter`

**Events:**

| Event | Payload | Description |
|-------|---------|-------------|
| `commandOutput` | `{ type: string, output?: string, message?: string }` | Emitted when command produces output |
| `commandError` | `{ type: string, error?: string, message?: string }` | Emitted when command produces an error |
| `commandFinish` | `{ type: string, exitCode?: number }` | Emitted when command completes |

**Methods:**
- `cleanup()` - Call to remove event listeners when done

```typescript
const stream = codebolt.terminal.executeCommandWithStream('npm test');

stream.on('commandOutput', (data) => {
  console.log('Output:', data.output || data.message);
});

stream.on('commandError', (data) => {
  console.error('Error:', data.error || data.message);
});

stream.on('commandFinish', (data) => {
  console.log(`Command finished with exit code: ${data.exitCode}`);
  stream.cleanup?.(); // Clean up listeners
});
```

## Examples

### Simple Command Execution

```typescript
// Run a simple command
const lsResult = await codebolt.terminal.executeCommand('ls -la');
console.log('Directory listing:', lsResult.output);

// Install dependencies
const installResult = await codebolt.terminal.executeCommand('npm install');
if ('error' in installResult) {
  console.error('Install failed:', installResult.error);
} else {
  console.log('Dependencies installed');
}

// Run tests
const testResult = await codebolt.terminal.executeCommand('npm test');
if ('error' in testResult && testResult.exitCode !== 0) {
  console.error('Tests failed with exit code:', testResult.exitCode);
}
```

### Long-Running Process with Streaming

```typescript
// Start a build with streaming output
const buildStream = codebolt.terminal.executeCommandWithStream('npm run build');

let outputLines: string[] = [];
let hasErrors = false;

buildStream.on('commandOutput', (data) => {
  const line = data.output || data.message || '';
  outputLines.push(line);
  console.log('[BUILD]', line);
});

buildStream.on('commandError', (data) => {
  const errorLine = data.error || data.message || '';
  hasErrors = true;
  console.error('[ERROR]', errorLine);
});

buildStream.on('commandFinish', (data) => {
  console.log('---');
  console.log(`Build ${hasErrors ? 'failed' : 'completed'}`);
  console.log(`Exit code: ${data.exitCode}`);
  console.log(`Total output lines: ${outputLines.length}`);

  // Clean up listeners
  buildStream.cleanup?.();
});
```

### Dev Server Management

```typescript
// Start a dev server that runs until error
async function startDevServer() {
  console.log('Starting development server...');

  try {
    // This will block until the server crashes or exits with error
    const error = await codebolt.terminal.executeCommandRunUntilError(
      'npm run dev',
      true  // Execute in main terminal
    );

    console.log('Server stopped unexpectedly');
    console.log(`Exit code: ${error.exitCode}`);
    console.log(`Error: ${error.error}`);

    // Optionally restart
    if (error.exitCode !== 0) {
      console.log('Attempting restart...');
      await startDevServer();
    }
  } catch (e) {
    console.error('Server crashed:', e);
  }
}

// To stop the server from another context
async function stopDevServer() {
  const result = await codebolt.terminal.sendManualInterrupt();
  console.log('Stop signal sent:', result.interrupted);
}
```

### Watch Process with Timeout

```typescript
// Start a watch process with automatic timeout
async function watchWithTimeout(timeoutMs: number) {
  console.log(`Starting watcher for ${timeoutMs}ms...`);

  // Set up timeout to stop the watcher
  const timeoutId = setTimeout(async () => {
    console.log('Timeout reached, stopping watcher...');
    await codebolt.terminal.sendManualInterrupt();
  }, timeoutMs);

  try {
    const result = await codebolt.terminal.executeCommandRunUntilInterrupt('npm run watch');
    console.log('Watcher stopped:', result.error);
  } finally {
    clearTimeout(timeoutId);
  }
}

// Watch for 5 minutes then stop
await watchWithTimeout(5 * 60 * 1000);
```

### Sequential Command Pipeline

```typescript
async function runBuildPipeline() {
  const steps = [
    { name: 'Install', cmd: 'npm install' },
    { name: 'Lint', cmd: 'npm run lint' },
    { name: 'Test', cmd: 'npm test' },
    { name: 'Build', cmd: 'npm run build' }
  ];

  for (const step of steps) {
    console.log(`\n=== ${step.name} ===`);

    const result = await codebolt.terminal.executeCommand(step.cmd);

    if ('error' in result && result.exitCode !== 0) {
      console.error(`${step.name} failed!`);
      console.error('Error:', result.error);
      console.error('Stderr:', result.stderr);
      return false;
    }

    console.log(`${step.name} completed successfully`);
  }

  console.log('\n=== All steps completed ===');
  return true;
}
```

### Parallel Streaming Commands

```typescript
async function runParallelChecks() {
  const testStream = codebolt.terminal.executeCommandWithStream('npm test');
  const lintStream = codebolt.terminal.executeCommandWithStream('npm run lint');

  const results = {
    test: { done: false, success: true },
    lint: { done: false, success: true }
  };

  return new Promise((resolve) => {
    const checkComplete = () => {
      if (results.test.done && results.lint.done) {
        testStream.cleanup?.();
        lintStream.cleanup?.();
        resolve({
          testPassed: results.test.success,
          lintPassed: results.lint.success,
          allPassed: results.test.success && results.lint.success
        });
      }
    };

    testStream.on('commandError', () => { results.test.success = false; });
    testStream.on('commandFinish', (data) => {
      results.test.done = true;
      results.test.success = data.exitCode === 0;
      checkComplete();
    });

    lintStream.on('commandError', () => { results.lint.success = false; });
    lintStream.on('commandFinish', (data) => {
      results.lint.done = true;
      results.lint.success = data.exitCode === 0;
      checkComplete();
    });
  });
}

const { testPassed, lintPassed, allPassed } = await runParallelChecks();
console.log(`Tests: ${testPassed ? 'PASS' : 'FAIL'}`);
console.log(`Lint: ${lintPassed ? 'PASS' : 'FAIL'}`);
```

### Error Handling Patterns

```typescript
// Pattern 1: Check for error type
const result = await codebolt.terminal.executeCommand('npm run build');

if ('error' in result) {
  // Command failed
  console.error('Build error:', result.error);
  console.error('Exit code:', result.exitCode);
} else {
  // Command succeeded
  console.log('Build output:', result.output);
}

// Pattern 2: Check exit code in streaming
const stream = codebolt.terminal.executeCommandWithStream('npm test');

stream.on('commandFinish', (data) => {
  if (data.exitCode === 0) {
    console.log('All tests passed!');
  } else {
    console.error(`Tests failed with exit code ${data.exitCode}`);
    process.exit(1);
  }
  stream.cleanup?.();
});

// Pattern 3: Wrap in try-catch for unexpected errors
try {
  const result = await codebolt.terminal.executeCommand('some-command');
  // Handle result
} catch (error) {
  console.error('Unexpected error executing command:', error);
}
```

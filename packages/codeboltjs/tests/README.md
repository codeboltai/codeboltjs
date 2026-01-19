# CodeboltJS Test Suite

This directory contains comprehensive test cases for the CodeboltJS SDK.

## Test Files Overview

### Core Module Tests
| File | Description | Test Count |
|------|-------------|------------|
| `fs.test.ts` | File System operations (create, read, write, delete, search) | 19 |
| `git.test.ts` | Git operations (init, commit, status, push, pull, clone) | 19 |
| `terminal.test.ts` | Terminal command execution (all execution modes) | 67 |
| `browser.test.ts` | Browser automation (navigation, screenshots, content extraction) | 30+ |
| `llm.test.ts` | LLM inference and configuration | 40+ |
| `mcp.test.ts` | MCP server and tool management | 40+ |
| `todo.test.ts` | Todo CRUD + export/import | 20 |
| `agentPortfolio.test.ts` | Agent portfolio, karma, talents, testimonials | 45 |

### Higher-Level Module Tests
| File | Description | Test Count |
|------|-------------|------------|
| `task.test.ts` | Task management (CRUD, assign, start) | 22 |
| `thread.test.ts` | Thread operations (CRUD, messages, file changes) | 22 |
| `memory.test.ts` | All memory systems (db, persistent, episodic, knowledge graph) | 70+ |
| `agent.test.ts` | Agent operations (find, start, list, detail) | 15+ |
| `agentDeliberation.test.ts` | Agent deliberation workflows | 10+ |

### Remaining Module Tests
| File | Description | Test Count |
|------|-------------|------------|
| `remaining.test.ts` | All other modules (capabilities, jobs, swarms, etc.) | 100+ |

### Example & Setup
| File | Description |
|------|-------------|
| `setup.ts` | Test infrastructure (shared SDK instance, connection management) |
| `example.test.ts` | Example test patterns and utilities |

**Total Test Cases: 500+**

## Prerequisites

Before running tests, ensure:

1. **Dependencies are installed:**
   ```bash
   cd /Users/utkarshshukla/Codebolt/codeboltjs
   pnpm install
   ```

2. **Codebolt application is running:**
   - The tests require a running Codebolt instance with WebSocket server
   - Tests will attempt to connect to `ws://localhost:3000` by default
   - Set environment variable `CODEBOLT_WS_URL` to use a different URL

3. **Packages are built:**
   ```bash
   # Build common/types package
   cd common/types
   npm run build

   # Build codeboltjs package
   cd ../../packages/codeboltjs
   npm run build
   ```

## Running Tests

### Run All Tests
```bash
cd packages/codeboltjs
npm test
```

### Run Specific Test File
```bash
npm test -- fs.test.ts
```

### Run with Coverage
```bash
npm run test:coverage
```

### Run in Watch Mode
```bash
npm run test:watch
```

### Run with Verbose Output
```bash
npm run test:verbose
```

## Test Architecture

### Shared SDK Instance

All tests use a **single shared CodeboltSDK instance** to avoid creating multiple WebSocket connections:

```typescript
import { sharedCodebolt, waitForConnection } from './setup';

describe('My Test Suite', () => {
    beforeAll(async () => {
        await waitForConnection(); // Ensures connection is ready
    });

    test('my test', async () => {
        const codebolt = sharedCodebolt(); // Same instance across all tests
        const result = await codebolt.fs.readFile('test.txt');
        expect(result.success).toBe(true);
    });
});
```

### Test File Structure

Each test file follows this pattern:

```typescript
// 1. Import the shared Codebolt instance
import Codebolt from '../src/core/Codebolt';

// 2. Create the codebolt instance (singleton pattern)
const codebolt = new Codebolt();

describe('Module Tests', () => {
    // 3. Wait for connection before running tests
    beforeAll(async () => {
        await codebolt.waitForReady();
    }, 30000);

    // 4. Write individual tests
    test('should do something specific', async () => {
        const result = await codebolt.module.method(params);

        // Assertions
        expect(result.success).toBe(true);

        // User verification prompt
        console.log('AskUserQuestion: Did the test succeed?');
    });
});
```

### Connection Management

The `setup.ts` file provides:
- `sharedCodebolt()` - Returns the singleton Codebolt instance
- `waitForConnection(timeout)` - Waits for WebSocket connection
- `isConnectionReady()` - Checks if connection is active
- `setupTestEnvironment(config)` - Sets up connection with config
- `teardownTestEnvironment()` - Cleans up after tests

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CODEBOLT_WS_URL` | WebSocket server URL | `ws://localhost:3000` |
| `CODEBOLT_PORT` | WebSocket server port | `3000` |
| `CODEBOLT_HOST` | WebSocket server host | `localhost` |
| `DEBUG_TESTS` | Enable debug logging | `false` |

## Test Timeout

Default test timeout is **30 seconds** per test. Tests involving:
- LLM inference: 60 seconds
- File operations: 30 seconds
- Browser automation: 30 seconds
- Network operations: 30 seconds

## Known Issues & Notes

### TypeScript Errors in Editor

You may see red squigglies in your editor for:
- `describe`, `test`, `expect` - These are Jest globals injected at runtime
- `beforeAll`, `afterEach` - Also Jest globals

**These errors won't affect test execution.** Jest automatically provides these globals when tests run.

### Connection Failures

If tests fail with connection errors:
1. Verify Codebolt application is running
2. Check WebSocket URL is correct
3. Ensure no firewall blocking the connection
4. Check `CODEBOLT_WS_URL` environment variable

### Serial Test Execution

Tests run **sequentially** (not in parallel) using `jest-serial-runner` to avoid:
- Race conditions with WebSocket
- Shared state conflicts
- Resource contention

## Writing New Tests

When adding new tests:

1. **Use the shared instance:**
   ```typescript
   import Codebolt from '../src/core/Codebolt';
   const codebolt = new Codebolt();
   ```

2. **Wait for connection:**
   ```typescript
   beforeAll(async () => {
       await codebolt.waitForReady();
   });
   ```

3. **Add AskUserQuestion for verification:**
   ```typescript
   test('my test', async () => {
       const result = await codebolt.module.method();
       console.log('AskUserQuestion: Verify X succeeded?');
   });
   ```

4. **Handle errors gracefully:**
   ```typescript
   test('should handle errors', async () => {
       try {
           await codebolt.module.method(invalidParams);
       } catch (error) {
           expect(error).toBeDefined();
       }
   });
   ```

## Troubleshooting

### Tests hang/timing out
- Increase timeout in the test: `test('name', async () => {}, 60000);`
- Check if Codebolt server is responding
- Enable debug mode: `DEBUG_TESTS=true npm test`

### "Cannot find module" errors
- Run `pnpm install` in the root directory
- Build packages: `npm run build` in common/types and codeboltjs

### WebSocket connection fails
- Verify Codebolt application is running
- Check port is correct (default: 3000)
- Try setting `CODEBOLT_WS_URL` explicitly

## Test Coverage Report

To generate coverage report:
```bash
npm run test:coverage
```

Report will be in `coverage/` directory.

## CI/CD Integration

For CI/CD environments:

```yaml
# Example GitHub Actions
- name: Install dependencies
  run: pnpm install

- name: Build packages
  run: |
    cd common/types && npm run build
    cd ../../packages/codeboltjs && npm run build

- name: Run tests
  run: |
    cd packages/codeboltjs
    npm test
```

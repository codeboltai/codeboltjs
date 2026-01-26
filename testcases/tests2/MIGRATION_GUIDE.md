# Test Migration Guide

Guide for migrating existing tests to use the new test setup utilities.

## Overview

The new test setup provides a shared Codebolt instance that persists across tests, preventing multiple WebSocket connections and improving test reliability and performance.

## Old Pattern vs New Pattern

### Old Pattern (Multiple Connections)

```typescript
// OLD: Each test creates a new connection
const codebolt = require('../dist');

describe('Old Tests', () => {
    test('test 1', async () => {
        await codebolt.activate(); // New connection
        // Test code...
    });

    test('test 2', async () => {
        await codebolt.activate(); // Another new connection!
        // Test code...
    });
});
```

### New Pattern (Shared Connection)

```typescript
// NEW: All tests share one connection
import { sharedCodebolt, waitForConnection } from './setup';

describe('New Tests', () => {
    beforeAll(async () => {
        await waitForConnection(); // Single connection for all tests
    });

    test('test 1', async () => {
        const codebolt = sharedCodebolt();
        // Test code...
    });

    test('test 2', async () => {
        const codebolt = sharedCodebolt(); // Reuses same connection
        // Test code...
    });
});
```

## Migration Steps

### Step 1: Update Imports

**Before:**
```typescript
const codebolt = require('../dist');
```

**After:**
```typescript
import { sharedCodebolt, waitForConnection } from './setup';
```

### Step 2: Add Connection Setup

**Before:**
```typescript
describe('Tests', () => {
    test('my test', async () => {
        await codebolt.activate();
        // Test code...
    });
});
```

**After:**
```typescript
describe('Tests', () => {
    beforeAll(async () => {
        await waitForConnection();
    });

    test('my test', async () => {
        const codebolt = sharedCodebolt();
        // Test code...
    });
});
```

### Step 3: Update Codebolt References

**Before:**
```typescript
await codebolt.fs.readFile('test.txt');
```

**After:**
```typescript
const codebolt = sharedCodebolt();
await codebolt.fs.readFile('test.txt');
```

## Complete Migration Example

### Before (fs.test.js)

```javascript
const codebolt = require("../dist");
const fs = require('fs');

describe('File System Tests', () => {
    test('createFile should create a file', async () => {
        await codebolt.activate();
        const fileName = 'testFile.txt';
        const source = 'Test content';
        const filePath = '/test';
        const { projectPath } = await codebolt.project.getProjectPath();
        await codebolt.fs.createFile(fileName, source, filePath);
        const fileFullPath = projectPath + filePath + '/' + fileName;
        expect(fs.existsSync(fileFullPath)).toBe(true);
    });
});
```

### After (fs.test.ts)

```typescript
import { sharedCodebolt, waitForConnection, runTest } from './setup';
import fs from 'fs';

describe('File System Tests', () => {
    beforeAll(async () => {
        await waitForConnection();
    });

    test('createFile should create a file', async () => {
        const result = await runTest(async () => {
            const codebolt = sharedCodebolt();
            const fileName = 'testFile.txt';
            const source = 'Test content';
            const filePath = '/test';
            const { projectPath } = await codebolt.project.getProjectPath();
            await codebolt.fs.createFile(fileName, source, filePath);
            const fileFullPath = projectPath + filePath + '/' + fileName;
            return {
                exists: fs.existsSync(fileFullPath),
                fullPath: fileFullPath
            };
        });

        expect(result.exists).toBe(true);
    });
});
```

## Advanced Migration Patterns

### Adding Timeout Protection

**Before:**
```typescript
test('slow operation', async () => {
    await codebolt.activate();
    const result = await codebolt.llm.chat('Prompt');
    expect(result).toBeDefined();
});
```

**After:**
```typescript
import { withTimeout } from './setup';

test('slow operation with timeout', async () => {
    const codebolt = sharedCodebolt();
    const result = await withTimeout(
        async () => {
            return await codebolt.llm.chat('Prompt');
        },
        10000,
        'LLM operation timed out'
    );
    expect(result).toBeDefined();
});
```

### Adding Retry Logic

**Before:**
```typescript
test('flaky operation', async () => {
    await codebolt.activate();
    const result = await codebolt.fs.readFile('test.txt');
    expect(result).toBeDefined();
});
```

**After:**
```typescript
import { retryOperation } from './setup';

test('flaky operation with retry', async () => {
    const result = await retryOperation(
        async () => {
            const codebolt = sharedCodebolt();
            return await codebolt.fs.readFile('test.txt');
        },
        3,      // max retries
        1000    // base delay
    );
    expect(result).toBeDefined();
});
```

### Adding Mock Data

**Before:**
```typescript
test('with mock data', async () => {
    await codebolt.activate();
    // Inline mock setup...
    const mockData = { ... };
    // Test code...
});
```

**After:**
```typescript
import { setMockResponse, getMockResponse, clearMockData } from './setup';

describe('With Mock Data', () => {
    beforeEach(() => {
        setMockResponse('test-key', { data: 'value' });
    });

    afterEach(() => {
        clearMockData();
    });

    test('uses mock data', () => {
        const mockData = getMockResponse('test-key');
        expect(mockData.data).toBe('value');
    });
});
```

## Common Migration Scenarios

### Scenario 1: Simple Test Suite

**Before:**
```typescript
const codebolt = require('../dist');

describe('Simple Tests', () => {
    test('test 1', async () => {
        await codebolt.activate();
        // Test...
    });

    test('test 2', async () => {
        await codebolt.activate();
        // Test...
    });
});
```

**After:**
```typescript
import { sharedCodebolt, waitForConnection } from './setup';

describe('Simple Tests', () => {
    beforeAll(async () => {
        await waitForConnection();
    });

    test('test 1', async () => {
        const codebolt = sharedCodebolt();
        // Test...
    });

    test('test 2', async () => {
        const codebolt = sharedCodebolt();
        // Test...
    });
});
```

### Scenario 2: Tests with Cleanup

**Before:**
```typescript
const codebolt = require('../dist');

describe('Tests with Cleanup', () => {
    afterEach(() => {
        // Cleanup...
    });

    test('test', async () => {
        await codebolt.activate();
        // Test...
    });
});
```

**After:**
```typescript
import {
    sharedCodebolt,
    waitForConnection,
    resetTestState,
    clearMockData
} from './setup';

describe('Tests with Cleanup', () => {
    beforeAll(async () => {
        await waitForConnection();
    });

    afterEach(() => {
        clearMockData();
        resetTestState();
    });

    test('test', async () => {
        const codebolt = sharedCodebolt();
        // Test...
    });
});
```

### Scenario 3: Error Handling Tests

**Before:**
```typescript
const codebolt = require('../dist');

describe('Error Tests', () => {
    test('handles errors', async () => {
        await codebolt.activate();
        try {
            await codebolt.fs.readFile('nonexistent.txt');
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
});
```

**After:**
```typescript
import {
    sharedCodebolt,
    waitForConnection,
    withTimeout,
    createMockError
} from './setup';

describe('Error Tests', () => {
    beforeAll(async () => {
        await waitForConnection();
    });

    test('handles errors with timeout', async () => {
        await expect(
            withTimeout(
                async () => {
                    const codebolt = sharedCodebolt();
                    return await codebolt.fs.readFile('nonexistent.txt');
                },
                5000
            )
        ).rejects.toThrow();
    });

    test('creates mock errors', () => {
        const error = createMockError('Test error', 'TEST_ERROR');
        expect(error.message).toBe('Test error');
    });
});
```

## Checklist for Migration

- [ ] Update imports to use `./setup`
- [ ] Add `beforeAll` with `waitForConnection()`
- [ ] Replace `codebolt.activate()` with `sharedCodebolt()`
- [ ] Add timeout protection for slow operations
- [ ] Add retry logic for flaky operations
- [ ] Add cleanup in `afterEach` if needed
- [ ] Update test expectations if needed
- [ ] Run tests to verify migration
- [ ] Update documentation if needed

## Benefits of Migration

1. **Single Connection**: Only one WebSocket connection for all tests
2. **Better Performance**: No connection overhead between tests
3. **Improved Reliability**: Consistent state across tests
4. **Better Tools**: Timeout protection, retry logic, mock utilities
5. **Easier Debugging**: Centralized setup and configuration
6. **Type Safety**: Full TypeScript support

## Troubleshooting Migration Issues

### Issue: "Connection not ready" errors

**Solution:**
```typescript
beforeAll(async () => {
    await waitForConnection(30000); // Increase timeout
});
```

### Issue: Tests are timing out

**Solution:**
```typescript
import { withTimeout } from './setup';

test('with custom timeout', async () => {
    const result = await withTimeout(
        async () => {
            const codebolt = sharedCodebolt();
            return await someOperation();
        },
        10000 // 10 second timeout
    );
});
```

### Issue: Tests affecting each other

**Solution:**
```typescript
afterEach(() => {
    clearMockData();
    resetTestState();
});
```

### Issue: Need to mock WebSocket messages

**Solution:**
```typescript
import { mockWebSocketMessage } from './setup';

test('with mock message', () => {
    const mockMsg = mockWebSocketMessage('messageResponse', {
        userMessage: 'Test'
    });
    // Use mock message in test...
});
```

## Additional Resources

- [Test Setup Documentation](./README.md)
- [Quick Reference Guide](./QUICK_REFERENCE.md)
- [Example Test File](./example.test.ts)
- [Jest Configuration](../jest.config.js)

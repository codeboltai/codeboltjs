# Test Setup Architecture

## Visual Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Test Suite                              │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      setup.ts (Test Setup)                      │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │           Singleton Codebolt Instance                    │  │
│  │                                                           │  │
│  │   sharedCodebolt() → Codebolt Instance                   │  │
│  │   (Created once, reused across all tests)                │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                  │                              │
│                                  ▼                              │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │           Connection Management                          │  │
│  │                                                           │  │
│  │   • waitForConnection()      - Wait with timeout         │  │
│  │   • waitForConnectionWithRetry() - Wait with retry       │  │
│  │   • isConnectionReady()      - Check status              │  │
│  │   • setupTestEnvironment()   - Initialize                │  │
│  │   • teardownTestEnvironment() - Cleanup                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                  │                              │
│                                  ▼                              │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │           Test Helpers                                   │  │
│  │                                                           │  │
│  │   • runTest()           - Auto-setup wrapper             │  │
│  │   • withTimeout()       - Timeout protection             │  │
│  │   • retryOperation()    - Retry with backoff             │  │
│  │   • delay()             - Delay execution                │  │
│  │   • createTimeout()     - Create timeout promise         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                  │                              │
│                                  ▼                              │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │           Mock Utilities                                 │  │
│  │                                                           │  │
│  │   • createMockResponse()  - Mock response                │  │
│  │   • createMockError()     - Mock error                   │  │
│  │   • mockWebSocketMessage() - Mock WebSocket message      │  │
│  │   • setMockResponse()     - Store mock response          │  │
│  │   • getMockResponse()     - Retrieve mock response       │  │
│  │   • clearMockData()       - Clear all mocks              │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                  │                              │
│                                  ▼                              │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │           State Management                               │  │
│  │                                                           │  │
│  │   • resetTestState()     - Reset test state              │  │
│  │   • getTestState()       - Get current state             │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WebSocket Connection                         │
│                                                                   │
│   ┌──────────────────────────────────────────────────────┐     │
│   │  Single WebSocket Connection (Persistent)             │     │
│   │                                                         │     │
│   │  ws://localhost:12345/codebolt?id=xxx&agentId=xxx...  │     │
│   └──────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Codebolt Server                               │
└─────────────────────────────────────────────────────────────────┘
```

## Test Execution Flow

```
Test Suite Start
        │
        ▼
┌───────────────────────┐
│  Jest initializes     │
│  Loads setup.ts       │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│  beforeAll hook       │
│  (if configured)      │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│  setupTestEnvironment()│
│  - Create singleton   │
│  - Initialize WS      │
│  - Wait for ready     │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│  Test 1               │
│  - Get sharedCodebolt │
│  - Execute test       │
│  - Assertions         │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│  afterEach hook       │
│  - Clear mock data    │
│  - Reset state        │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│  Test 2               │
│  - Reuse sharedCodebolt│
│  - Execute test       │
│  - Assertions         │
└───────────────────────┘
        │
        ▼
     ... more tests ...
        │
        ▼
┌───────────────────────┐
│  afterAll hook        │
│  - Teardown           │
│  - Log statistics     │
└───────────────────────┘
        │
        ▼
Test Suite End
```

## Component Interactions

### 1. Singleton Pattern

```
┌──────────────┐
│  Test File 1 │ ──┐
└──────────────┘   │
                   │
┌──────────────┐   │    ┌──────────────────┐
│  Test File 2 │ ──┼───→│ sharedCodebolt() │
└──────────────┘   │    │                  │
                   │    │  Codebolt Instance│
┌──────────────┐   │    │  (Singleton)      │
│  Test File 3 │ ──┘    └──────────────────┘
└──────────────┘            │
                            ▼
                    ┌──────────────┐
                    │  WebSocket   │
                    │  Connection  │
                    └──────────────┘
```

### 2. Connection Flow

```
Test calls waitForConnection()
        │
        ▼
Check if already connected
        │
        ├─ Yes → Return immediately
        │
        └─ No → Initialize connection
                │
                ▼
        ┌───────────────┐
        │ Create WebSocket│
        │ Connection     │
        └───────────────┘
                │
                ▼
        ┌───────────────┐
        │ Wait for 'open'│
        │ event          │
        └───────────────┘
                │
                ▼
        ┌───────────────┐
        │ Set ready flag │
        │ = true        │
        └───────────────┘
                │
                ▼
        Return to test
```

### 3. Timeout Protection

```
Test calls withTimeout(fn, 5000)
        │
        ▼
┌───────────────────┐
│ Promise.race([    │
│   fn(),            │──┐
│   timeoutPromise  │  │
│ ])                │  │
└───────────────────┘  │
        │              │
        │              ├─ fn completes first → Return result
        │              │
        │              └─ timeout completes first → Throw error
        ▼
   Return result or error
```

### 4. Retry Logic

```
Test calls retryOperation(fn, 3, 1000)
        │
        ▼
┌─────────────┐
│ Attempt 1/3 │ ── Success → Return result
└─────────────┘
        │
        └─ Fail → Wait 1000ms
                │
                ▼
        ┌─────────────┐
        │ Attempt 2/3 │ ── Success → Return result
        └─────────────┘
                │
                └─ Fail → Wait 2000ms (1000 * 2^1)
                        │
                        ▼
                ┌─────────────┐
                │ Attempt 3/3 │ ── Success → Return result
                └─────────────┘
                        │
                        └─ Fail → Throw error
```

## Data Flow

### Test State Management

```
┌──────────────────────────────────────────────┐
│              testState                       │
├──────────────────────────────────────────────┤
│  sharedCodebolt: Codebolt | null            │
│  connectionStatus: ConnectionStatus         │
│  connectionPromise: Promise<void> | null    │
│  config: TestSetupConfig                    │
│  ┌─────────────────────────────────────┐    │
│  │  mockData                           │    │
│  │  ├─ messages: any[]                 │    │
│  │  ├─ responses: Map<string, any>     │    │
│  │  └─ errors: Map<string, Error>      │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │  counters                           │    │
│  │  ├─ testsRun: number                │    │
│  │  ├─ testsPassed: number             │    │
│  │  └─ testsFailed: number             │    │
│  └─────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

### Mock Data Storage

```
Test calls setMockResponse('key', value)
        │
        ▼
testState.mockData.responses.set('key', value)
        │
        ▼
┌─────────────────────────────┐
│  Map<string, any>           │
│  ┌──────────────────────┐   │
│  │ 'key' → value        │   │
│  │ 'user-123' → {...}   │   │
│  │ 'test-data' → {...}  │   │
│  └──────────────────────┘   │
└─────────────────────────────┘

Test calls getMockResponse('key')
        │
        ▼
testState.mockData.responses.get('key')
        │
        ▼
Return value or undefined
```

## Error Handling Flow

```
Test Operation Fails
        │
        ▼
Is wrapped in retryOperation?
        │
        ├─ Yes → Retry with backoff
        │         │
        │         └─ Max retries reached?
        │                   │
        │                   ├─ Yes → Throw error
        │                   └─ No → Try again
        │
        └─ No → Is wrapped in withTimeout?
                  │
                  ├─ Yes → Timeout exceeded?
                  │         │
                  │         ├─ Yes → Throw timeout error
                  │         └─ No → Throw original error
                  │
                  └─ No → Throw error immediately
```

## Lifecycle Hooks

### Jest Integration

```
┌──────────────────────────────────────────────┐
│  Jest Test File                              │
├──────────────────────────────────────────────┤
│  import { sharedCodebolt, waitForConnection }│
│  from './setup';                             │
│                                              │
│  describe('Test Suite', () => {             │
│      beforeAll(async () => {                 │
│          await waitForConnection();  ◄──────┤
│      });                                     │   │
│                                              │   │
│      afterEach(() => {                      │   │
│          clearMockData();           ◄──────┤   │
│      });                                     │   │
│                                              │   │
│      test('test', async () => {              │   │
│          const codebolt = sharedCodebolt();  │   │
│          // Test code...                     │   │
│      });                                     │   │
│  });                                         │   │
└──────────────────────────────────────────────┘   │
                                                    │
┌──────────────────────────────────────────────┐   │
│  setup.ts                                    │◄──┘
│  ├─ beforeAll → setupTestEnvironment()
│  ├─ afterAll → teardownTestEnvironment()
│  └─ afterEach → clearMockData()
└──────────────────────────────────────────────┘
```

## Best Practices Architecture

### 1. Test Isolation

```
┌──────────────┐
│  Before Each │
│  - Reset state│
│  - Clear mocks│
└──────────────┘
        │
        ▼
┌──────────────┐
│   Execute    │
│   Test       │
└──────────────┘
        │
        ▼
┌──────────────┐
│  After Each  │
│  - Verify    │
│  - Cleanup   │
└──────────────┘
```

### 2. Resource Management

```
Test Suite Start
        │
        ▼
┌─────────────────────────┐
│  Allocate Resources     │
│  - WebSocket connection │
│  - Shared instance      │
└─────────────────────────┘
        │
        ├─ Reuse across all tests
        ▼
┌─────────────────────────┐
│  Test Suite End         │
│  - Keep connection alive│
│  - For next test suite  │
└─────────────────────────┘
```

### 3. Error Recovery

```
┌─────────────────────────────────┐
│  Operation Attempt              │
└─────────────────────────────────┘
        │
        ├─ Success → Return result
        │
        └─ Error
            │
            ├─ Is retriable?
            │   │
            │   ├─ Yes → Retry with backoff
            │   │         │
            │   │         └─ Max retries?
            │   │                   │
            │   │                   ├─ Yes → Fail
            │   │                   └─ No → Retry
            │   │
            │   └─ No → Fail immediately
            │
            └─ Throw formatted error
```

## Performance Considerations

### Connection Pooling (Current)

```
┌─────────────────────────────────────┐
│  Single Connection for All Tests    │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  WebSocket Connection         │ │
│  │  (Established once)           │ │
│  └───────────────────────────────┘ │
│                                     │
│  Test 1 ──┐                         │
│  Test 2 ──┼──→ Use Connection      │
│  Test 3 ──┘                         │
└─────────────────────────────────────┘

Benefits:
• Fast test execution
• Low overhead
• Consistent state
```

### Future: Parallel Execution (Potential)

```
┌─────────────────────────────────────┐
│  Connection Pool                    │
│                                     │
│  ┌───────┐ ┌───────┐ ┌───────┐     │
│  │ Conn 1│ │ Conn 2│ │ Conn 3│     │
│  └───────┘ └───────┘ └───────┘     │
│      │         │         │          │
│  Test 1    Test 2    Test 3        │
│  (parallel execution)               │
└─────────────────────────────────────┘

Benefits:
• Faster overall execution
• Better resource utilization
• Test isolation
```

## Security Considerations

### Environment Variables

```
┌──────────────────────────────────────┐
│  .env.test (Not in git)             │
│  ├─ SOCKET_PORT=12345               │
│  ├─ CODEBOLT_SERVER_URL=localhost   │
│  └─ agentId=test-agent              │
└──────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│  Test Setup                          │
│  ├─ Reads environment variables     │
│  ├─ Validates configuration         │
│  └─ Establishes connection          │
└──────────────────────────────────────┘
```

### WebSocket Security

```
┌──────────────────────────────────────┐
│  WebSocket URL Construction          │
│                                      │
│  ws://SERVER_URL:PORT/codebolt       │
│    ?id=UNIQUE_ID                     │
│    &agentId=AGENT_ID                 │
│    &parentId=PARENT_ID               │
│    &threadToken=TOKEN                │
│    &custom_params=...                │
└──────────────────────────────────────┘
```

## Summary

This architecture provides:

1. **Single Connection**: One WebSocket connection for all tests
2. **Resource Efficiency**: Reuses connections and state
3. **Test Isolation**: Clear state between tests
4. **Error Resilience**: Timeout and retry mechanisms
5. **Developer Friendly**: Simple API, comprehensive tools
6. **Maintainable**: Clear structure, well documented
7. **Extensible**: Easy to add new utilities
8. **Type Safe**: Full TypeScript support

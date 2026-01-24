# codebolt.autoTesting - Automated Testing Module

Manage test suites, test cases, and test runs for automated testing workflows. Create and organize tests, execute test suites, and track test results with step-by-step execution details.


## Table of Contents

- [Response Types](#response-types)
  - [Suite](#suite)
  - [Case](#case)
  - [Run](#run)
  - [RunCase](#runcase)
  - [RunStep](#runstep)
- [Methods](#methods)
  - [Test Suite Operations](#test-suite-operations)
  - [Test Case Operations](#test-case-operations)
  - [Test Run Operations](#test-run-operations)
- [Examples](#examples)

## Response Types

### TestStatus

Status of a test case, test step, or test run:

```typescript
type TestStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
```

### TestRunStatus

Status of a test run:

```typescript
type TestRunStatus = 'pending' | 'running' | 'completed' | 'cancelled';
```

### TestStep

A single step within a test case:

```typescript
interface TestStep {
  id: string;                    // Unique step identifier
  order: number;                 // Order of the step in the test case
  content: string;               // Step description or action
  status?: TestStatus;           // Execution status (populated in test runs)
  logs?: string;                 // Execution logs
  userOverride?: boolean;        // Whether the status was manually overridden
}
```

### TestCase

A test case with steps and metadata:

```typescript
interface TestCase {
  id: string;                    // Unique test case identifier
  key: string;                   // Test case key for reference
  name: string;                  // Test case name
  description?: string;          // Optional description
  steps: TestStep[];             // Test steps
  labels?: string[];             // Optional labels for categorization
  priority?: 'low' | 'medium' | 'high' | 'automated';
  type?: string;                 // Optional type identifier
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
  archivedAt?: string;           // ISO timestamp if archived
}
```

### TestSuite

A collection of test cases:

```typescript
interface TestSuite {
  id: string;                    // Unique suite identifier
  name: string;                  // Suite name
  description?: string;          // Optional description
  testCaseIds: string[];         // IDs of test cases in the suite
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}
```

### TestRunStep

Execution details for a test step:

```typescript
interface TestRunStep {
  stepId: string;                // Reference to original TestStep.id
  status: TestStatus;            // Execution status
  logs?: string;                 // Execution logs
  userOverride?: boolean;        // Whether status was manually overridden
  executedAt?: string;           // ISO timestamp when step was executed
}
```

### TestRunCase

Execution details for a test case:

```typescript
interface TestRunCase {
  testCaseId: string;            // Reference to original TestCase.id
  status: TestStatus;            // Overall test case status
  steps: TestRunStep[];          // Execution details for each step
  userOverride?: boolean;        // Whether status was manually overridden
  startedAt?: string;            // ISO timestamp when case started
  completedAt?: string;          // ISO timestamp when case completed
}
```

### TestRun

A single execution of a test suite:

```typescript
interface TestRun {
  id: string;                    // Unique run identifier
  testSuiteId: string;           // ID of the test suite being executed
  name: string;                  // Run name
  status: TestRunStatus;         // Run status
  testCases: TestRunCase[];      // Execution results for each test case
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
  completedAt?: string;          // ISO timestamp when run completed
}
```

## Methods

### `createSuite(name, description?, testCaseIds?)`

Creates a new test suite with optional test cases.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Name of the test suite |
| description | string | No | Optional description of the suite |
| testCaseIds | string[] | No | Array of test case IDs to include in the suite |

**Response:**
```typescript
{
  payload: {
    suite: TestSuite  // Created test suite with id, timestamps
  }
}
```

```typescript
const result = await codebolt.autoTesting.createSuite(
  'Login Tests',
  'Authentication and login validation tests',
  ['case-1', 'case-2']
);
if (result.payload?.suite) {
  console.log('Suite created:', result.payload.suite.id);
}
```

---

### `getSuite(id)`

Retrieves a test suite along with its test cases.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Suite identifier |

**Response:**
```typescript
{
  payload: {
    suite: TestSuite;      // Suite details
    testCases: TestCase[]  // All test cases in the suite
  }
}
```

```typescript
const result = await codebolt.autoTesting.getSuite('suite-123');
if (result.payload?.suite) {
  console.log('Suite:', result.payload.suite.name);
  console.log('Test cases:', result.payload.testCases.length);
}
```

---

### `listSuites()`

Lists all available test suites.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| (none) | - | - | No parameters required |

**Response:**
```typescript
{
  payload: {
    suites: TestSuite[]  // Array of all test suites
  }
}
```

```typescript
const result = await codebolt.autoTesting.listSuites();
if (result.payload?.suites) {
  result.payload.suites.forEach(suite => {
    console.log(suite.name, suite.testCaseIds.length, 'cases');
  });
}
```

---

### `updateSuite(id, name?, description?, testCaseIds?)`

Updates a test suite's properties.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Suite identifier |
| name | string | No | New name for the suite |
| description | string | No | New description for the suite |
| testCaseIds | string[] | No | New array of test case IDs |

**Response:**
```typescript
{
  payload: {
    suite: TestSuite  // Updated test suite
  }
}
```

```typescript
const result = await codebolt.autoTesting.updateSuite(
  'suite-123',
  'Updated Login Tests',
  'Revised authentication tests',
  ['case-1', 'case-2', 'case-3']
);
if (result.payload?.suite) {
  console.log('Suite updated');
}
```

---

### `deleteSuite(id)`

Deletes a test suite.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Suite identifier |

**Response:**
```typescript
{
  payload: {
    ok: boolean;       // Whether deletion succeeded
    suiteId?: string   // ID of deleted suite
  }
}
```

```typescript
const result = await codebolt.autoTesting.deleteSuite('suite-123');
if (result.payload?.ok) {
  console.log('Suite deleted successfully');
}
```

---

### `addCaseToSuite(suiteId, caseId)`

Adds a test case to a test suite.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| suiteId | string | Yes | Suite identifier |
| caseId | string | Yes | Test case identifier |

**Response:**
```typescript
{
  payload: {
    suite: TestSuite  // Updated suite with new case
  }
}
```

```typescript
const result = await codebolt.autoTesting.addCaseToSuite(
  'suite-123',
  'case-456'
);
if (result.payload?.suite) {
  console.log('Case added to suite');
}
```

---

### `removeCaseFromSuite(suiteId, caseId)`

Removes a test case from a test suite.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| suiteId | string | Yes | Suite identifier |
| caseId | string | Yes | Test case identifier |

**Response:**
```typescript
{
  payload: {
    suite: TestSuite  // Updated suite without the case
  }
}
```

```typescript
const result = await codebolt.autoTesting.removeCaseFromSuite(
  'suite-123',
  'case-456'
);
if (result.payload?.suite) {
  console.log('Case removed from suite');
}
```

---

### `createCase(key, name, description?, steps, labels?, priority?, type?)`

Creates a new test case with steps.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| key | string | Yes | Test case key for reference |
| name | string | Yes | Test case name |
| description | string | No | Optional description |
| steps | Array<{content, order?}> | Yes | Test steps with content and order |
| labels | string[] | No | Optional labels for categorization |
| priority | 'low' \| 'medium' \| 'high' \| 'automated' | No | Test case priority |
| type | string | No | Optional type identifier |

**Response:**
```typescript
{
  payload: {
    testCase: TestCase  // Created test case with id, timestamps
  }
}
```

```typescript
const result = await codebolt.autoTesting.createCase(
  'AUTH-001',
  'Valid login with correct credentials',
  'Tests successful login flow',
  [
    { content: 'Navigate to login page', order: 1 },
    { content: 'Enter valid username', order: 2 },
    { content: 'Enter valid password', order: 3 },
    { content: 'Click login button', order: 4 },
    { content: 'Verify dashboard is displayed', order: 5 }
  ],
  ['authentication', 'smoke'],
  'high',
  'functional'
);
if (result.payload?.testCase) {
  console.log('Test case created:', result.payload.testCase.id);
}
```

---

### `getCase(id)`

Retrieves a test case.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Test case identifier |

**Response:**
```typescript
{
  payload: {
    testCase: TestCase  // Test case details
  }
}
```

```typescript
const result = await codebolt.autoTesting.getCase('case-456');
if (result.payload?.testCase) {
  console.log('Test case:', result.payload.testCase.name);
  console.log('Steps:', result.payload.testCase.steps);
}
```

---

### `listCases()`

Lists all available test cases.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| (none) | - | - | No parameters required |

**Response:**
```typescript
{
  payload: {
    cases: TestCase[]  // Array of all test cases
  }
}
```

```typescript
const result = await codebolt.autoTesting.listCases();
if (result.payload?.cases) {
  result.payload.cases.forEach(testCase => {
    console.log(testCase.key, testCase.name);
  });
}
```

---

### `updateCase(id, key?, name?, description?, steps?, labels?, priority?, type?)`

Updates a test case's properties.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Test case identifier |
| key | string | No | New key for the test case |
| name | string | No | New name for the test case |
| description | string | No | New description |
| steps | Array<{id?, content, order?}> | No | New or updated steps |
| labels | string[] | No | New labels array |
| priority | 'low' \| 'medium' \| 'high' \| 'automated' | No | New priority |
| type | string | No | New type identifier |

**Response:**
```typescript
{
  payload: {
    testCase: TestCase  // Updated test case
  }
}
```

```typescript
const result = await codebolt.autoTesting.updateCase(
  'case-456',
  undefined,
  'Updated valid login test',
  undefined,
  [
    { id: 'step-1', content: 'Navigate to login page', order: 1 },
    { content: 'Add new verification step', order: 6 }
  ]
);
if (result.payload?.testCase) {
  console.log('Test case updated');
}
```

---

### `deleteCase(id)`

Deletes a test case.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Test case identifier |

**Response:**
```typescript
{
  payload: {
    ok: boolean;     // Whether deletion succeeded
    caseId?: string  // ID of deleted case
  }
}
```

```typescript
const result = await codebolt.autoTesting.deleteCase('case-456');
if (result.payload?.ok) {
  console.log('Test case deleted successfully');
}
```

---

### `createRun(testSuiteId, name?)`

Creates a new test run for a test suite.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| testSuiteId | string | Yes | ID of the test suite to execute |
| name | string | No | Optional name for the run |

**Response:**
```typescript
{
  payload: {
    run: TestRun  // Created test run with id, status: 'pending'
  }
}
```

```typescript
const result = await codebolt.autoTesting.createRun(
  'suite-123',
  'Login Tests - Production'
);
if (result.payload?.run) {
  console.log('Test run created:', result.payload.run.id);
}
```

---

### `getRun(id)`

Retrieves a test run with execution details.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Run identifier |

**Response:**
```typescript
{
  payload: {
    run: TestRun  // Test run with all test case results
  }
}
```

```typescript
const result = await codebolt.autoTesting.getRun('run-789');
if (result.payload?.run) {
  console.log('Run status:', result.payload.run.status);
  result.payload.run.testCases.forEach(tc => {
    console.log(tc.testCaseId, tc.status);
  });
}
```

---

### `listRuns(suiteId?)`

Lists test runs, optionally filtered by suite.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| suiteId | string | No | Optional suite ID to filter runs |

**Response:**
```typescript
{
  payload: {
    runs: TestRun[]  // Array of test runs
  }
}
```

```typescript
const result = await codebolt.autoTesting.listRuns('suite-123');
if (result.payload?.runs) {
  result.payload.runs.forEach(run => {
    console.log(run.name, '-', run.status);
  });
}
```

---

### `updateRunStatus(runId, status)`

Updates the overall status of a test run.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| runId | string | Yes | Run identifier |
| status | 'pending' \| 'running' \| 'completed' \| 'cancelled' | Yes | New status for the run |

**Response:**
```typescript
{
  payload: {
    run: TestRun  // Updated test run
  }
}
```

```typescript
const result = await codebolt.autoTesting.updateRunStatus('run-789', 'running');
if (result.payload?.run) {
  console.log('Run status updated to running');
}
```

---

### `updateRunCaseStatus(runId, caseId, status, userOverride?)`

Updates the status of a specific test case within a run.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| runId | string | Yes | Run identifier |
| caseId | string | Yes | Test case identifier |
| status | 'pending' \| 'running' \| 'passed' \| 'failed' \| 'skipped' | Yes | New status for the case |
| userOverride | boolean | No | Whether this is a manual override |

**Response:**
```typescript
{
  payload: {
    run: TestRun  // Updated test run with updated case
  }
}
```

```typescript
const result = await codebolt.autoTesting.updateRunCaseStatus(
  'run-789',
  'case-456',
  'passed',
  true
);
if (result.payload?.run) {
  console.log('Test case status updated');
}
```

---

### `updateRunStepStatus(runId, caseId, stepId, status, logs?, userOverride?)`

Updates the status and logs of a specific test step within a run.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| runId | string | Yes | Run identifier |
| caseId | string | Yes | Test case identifier |
| stepId | string | Yes | Step identifier |
| status | 'pending' \| 'running' \| 'passed' \| 'failed' \| 'skipped' | Yes | New status for the step |
| logs | string | No | Optional execution logs |
| userOverride | boolean | No | Whether this is a manual override |

**Response:**
```typescript
{
  payload: {
    run: TestRun  // Updated test run with updated step
  }
}
```

```typescript
const result = await codebolt.autoTesting.updateRunStepStatus(
  'run-789',
  'case-456',
  'step-1',
  'passed',
  'Step completed successfully',
  false
);
if (result.payload?.run) {
  console.log('Test step status updated');
}
```

## Examples

### Creating a Test Suite with Test Cases

```typescript
// Create test cases first
const case1 = await codebolt.autoTesting.createCase(
  'AUTH-001',
  'Valid login',
  null,
  [
    { content: 'Navigate to login', order: 1 },
    { content: 'Enter credentials', order: 2 },
    { content: 'Verify dashboard', order: 3 }
  ]
);

const case2 = await codebolt.autoTesting.createCase(
  'AUTH-002',
  'Invalid password',
  null,
  [
    { content: 'Navigate to login', order: 1 },
    { content: 'Enter valid username', order: 2 },
    { content: 'Enter invalid password', order: 3 },
    { content: 'Verify error message', order: 4 }
  ]
);

// Create suite with the cases
const suite = await codebolt.autoTesting.createSuite(
  'Authentication Tests',
  'Tests for login and registration',
  [case1.payload.testCase.id, case2.payload.testCase.id]
);

console.log('Suite created:', suite.payload.suite.id);
```

### Running a Test Suite and Tracking Results

```typescript
// Create a test run
const run = await codebolt.autoTesting.createRun(
  'suite-123',
  'Smoke Test - Build #42'
);
const runId = run.payload.run.id;

// Mark run as running
await codebolt.autoTesting.updateRunStatus(runId, 'running');

// For each test case, execute and update status
const suiteData = await codebolt.autoTesting.getSuite('suite-123');
const testCases = suiteData.payload.testCases;

for (const testCase of testCases) {
  await codebolt.autoTesting.updateRunCaseStatus(
    runId,
    testCase.id,
    'running'
  );

  for (const step of testCase.steps) {
    await codebolt.autoTesting.updateRunStepStatus(
      runId,
      testCase.id,
      step.id,
      'passed',
      `Executed: ${step.content}`
    );
  }

  await codebolt.autoTesting.updateRunCaseStatus(
    runId,
    testCase.id,
    'passed'
  );
}

// Mark run as completed
await codebolt.autoTesting.updateRunStatus(runId, 'completed');
console.log('Test run completed');
```

### Managing Test Cases Dynamically

```typescript
// Add a new test case to an existing suite
const newCase = await codebolt.autoTesting.createCase(
  'AUTH-003',
  'Password reset flow',
  'Tests password reset functionality',
  [
    { content: 'Request password reset', order: 1 },
    { content: 'Check email for reset link', order: 2 },
    { content: 'Click reset link', order: 3 },
    { content: 'Enter new password', order: 4 },
    { content: 'Verify password changed', order: 5 }
  ]
);

await codebolt.autoTesting.addCaseToSuite(
  'suite-123',
  newCase.payload.testCase.id
);

// Later, update the test case with an additional step
await codebolt.autoTesting.updateCase(
  newCase.payload.testCase.id,
  undefined,
  undefined,
  undefined,
  [
    { content: 'Request password reset', order: 1 },
    { content: 'Check email for reset link', order: 2 },
    { content: 'Click reset link', order: 3 },
    { content: 'Enter new password', order: 4 },
    { content: 'Confirm new password', order: 5 },
    { content: 'Verify password changed', order: 6 }
  ]
);
```

### Analyzing Test Run History

```typescript
// Get all runs for a suite
const runs = await codebolt.autoTesting.listRuns('suite-123');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

for (const run of runs.payload.runs) {
  for (const testCase of run.testCases) {
    totalTests++;
    if (testCase.status === 'passed') {
      passedTests++;
    } else if (testCase.status === 'failed') {
      failedTests++;
    }
  }
}

console.log(`Total tests: ${totalTests}`);
console.log(`Passed: ${passedTests} (${(passedTests / totalTests * 100).toFixed(1)}%)`);
console.log(`Failed: ${failedTests}`);

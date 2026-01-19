---
name: createRun
cbbaseinfo:
  description: Creates a new test run from a test suite for execution tracking.
cbparameters:
  parameters:
    - name: params
      typeName: ICreateRunParams
      description: Parameters including test suite ID and optional run name.
  returns:
    signatureTypeName: Promise<ICreateRunResponse>
    description: A promise that resolves to the created test run.
    typeArgs: []
data:
  name: createRun
  category: autoTesting
  link: createRun.md
---
<CBBaseInfo />
<CBParameters />

### Examples

```typescript
// Create a test run
const run = await codebolt.autoTesting.createRun({
  testSuiteId: 'suite-123',
  name: 'Nightly Build Test Run'
});

// Create run with default name
const run = await codebolt.autoTesting.createRun({
  testSuiteId: 'suite-123'
});
```

### Notes

- Runs track execution of all cases in a suite
- Each run has unique IDs for tracking
- Status starts as 'pending'
- Use updateRunStatus to progress the run

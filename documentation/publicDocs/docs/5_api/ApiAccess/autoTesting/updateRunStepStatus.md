---
name: updateRunStepStatus
cbbaseinfo:
  description: Updates the status of a specific test step within a run and case.
cbparameters:
  parameters:
    - name: params
      typeName: IUpdateRunStepParams
      description: Parameters including run ID, case ID, step ID, status, logs, and user override flag.
  returns:
    signatureTypeName: "Promise<IUpdateRunStepResponse>"
    description: A promise that resolves to the updated test run.
    typeArgs: []
data:
  name: updateRunStepStatus
  category: autoTesting
  link: updateRunStepStatus.md
---
<CBBaseInfo />
<CBParameters />

### Examples

```typescript
// Mark step as passed
await codebolt.autoTesting.updateRunStepStatus({
  runId: 'run-123',
  caseId: 'case-456',
  stepId: 'step-789',
  status: 'passed'
});

// Mark step as failed with error logs
await codebolt.autoTesting.updateRunStepStatus({
  runId: 'run-123',
  caseId: 'case-456',
  stepId: 'step-789',
  status: 'failed',
  logs: 'Expected element not found',
  userOverride: true
});
```

### Notes

- Use logs to record failure details
- Step status affects case status
- User override indicates manual intervention

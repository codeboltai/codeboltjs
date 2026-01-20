---
name: listRuns
cbbaseinfo:
  description: Lists test runs, optionally filtered by suite.
cbparameters:
  parameters:
    - name: params
      typeName: IListRunsParams
      description: Optional parameters including suite ID for filtering.
      isOptional: true
  returns:
    signatureTypeName: "Promise<IListRunsResponse>"
    description: A promise that resolves to the list of test runs.
    typeArgs: []
data:
  name: listRuns
  category: autoTesting
  link: listRuns.md
---
<CBBaseInfo />
<CBParameters />

### Examples

```typescript
// List all runs
const allRuns = await codebolt.autoTesting.listRuns();

// Filter by suite
const suiteRuns = await codebolt.autoTesting.listRuns({
  suiteId: 'suite-123'
});
```

### Notes

- Filter by suite to see specific history
- Useful for tracking test trends
- Most recent runs first

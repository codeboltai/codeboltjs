---
name: getSuite
cbbaseinfo:
  description: Retrieves details of a specific test suite including its test cases.
cbparameters:
  parameters:
    - name: params
      typeName: IGetSuiteParams
      description: Parameters including the suite ID.
  returns:
    signatureTypeName: Promise<IGetSuiteResponse>
    description: A promise that resolves to the test suite with associated test cases.
    typeArgs: []
data:
  name: getSuite
  category: autoTesting
  link: getSuite.md
---
<CBBaseInfo />
<CBParameters />

### Examples

```typescript
const suite = await codebolt.autoTesting.getSuite({ id: 'suite-123' });
console.log('Suite:', suite.payload.suite);
console.log('Test cases:', suite.payload.testCases);
```

### Notes

- Returns suite details and all test cases
- Useful for suite inspection
- Includes case details for planning

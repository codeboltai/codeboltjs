---
name: listSuites
cbbaseinfo:
  description: Lists all available test suites.
cbparameters:
  parameters:
    - name: params
      typeName: IListSuitesParams
      description: Optional parameters for filtering.
      isOptional: true
  returns:
    signatureTypeName: "Promise<IListSuitesResponse>"
    description: A promise that resolves to the list of test suites.
    typeArgs: []
data:
  name: listSuites
  category: autoTesting
  link: listSuites.md
---
<CBBaseInfo />
<CBParameters />

### Examples

```typescript
const suites = await codebolt.autoTesting.listSuites();
console.log('Available suites:', suites.payload.suites);
```

### Notes

- Returns all test suites
- Useful for test discovery
- No filtering currently supported

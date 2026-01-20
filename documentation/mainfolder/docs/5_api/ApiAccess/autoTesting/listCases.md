---
name: listCases
cbbaseinfo:
  description: Lists all available test cases.
cbparameters:
  parameters:
    - name: params
      typeName: IListCasesParams
      description: Optional parameters for filtering.
      isOptional: true
  returns:
    signatureTypeName: "Promise<IListCasesResponse>"
    description: A promise that resolves to the list of test cases.
    typeArgs: []
data:
  name: listCases
  category: autoTesting
  link: listCases.md
---
<CBBaseInfo />
<CBParameters />

### Examples

```typescript
const cases = await codebolt.autoTesting.listCases();
console.log('Available test cases:', cases.payload.cases);
```

### Notes

- Returns all test cases
- Useful for browsing available tests
- Can filter by labels or priority

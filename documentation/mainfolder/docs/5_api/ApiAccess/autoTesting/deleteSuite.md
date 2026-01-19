---
name: deleteSuite
cbbaseinfo:
  description: Deletes a test suite and all its associations.
cbparameters:
  parameters:
    - name: params
      typeName: IDeleteSuiteParams
      description: Parameters including the suite ID to delete.
  returns:
    signatureTypeName: Promise<IDeleteSuiteResponse>
    description: A promise that resolves when the suite is deleted.
    typeArgs: []
data:
  name: deleteSuite
  category: autoTesting
  link: deleteSuite.md
---
<CBBaseInfo />
<CBParameters />

### Examples

```typescript
await codebolt.autoTesting.deleteSuite({ id: 'suite-123' });
```

### Notes

- Doesn't delete associated test cases
- Only removes the suite
- Permanent operation

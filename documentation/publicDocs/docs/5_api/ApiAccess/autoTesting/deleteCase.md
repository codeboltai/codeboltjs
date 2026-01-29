---
name: deleteCase
cbbaseinfo:
  description: Deletes a test case.
cbparameters:
  parameters:
    - name: params
      typeName: IDeleteCaseParams
      description: Parameters including the case ID to delete.
  returns:
    signatureTypeName: "Promise<IDeleteCaseResponse>"
    description: A promise that resolves when the case is deleted.
    typeArgs: []
data:
  name: deleteCase
  category: autoTesting
  link: deleteCase.md
---
<CBBaseInfo />
<CBParameters />

### Examples

```typescript
await codebolt.autoTesting.deleteCase({ id: 'case-123' });
```

### Notes

- Removes case from all suites
- Permanent operation
- Cannot delete cases used in runs

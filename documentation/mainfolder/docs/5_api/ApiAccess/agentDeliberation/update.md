---
name: update
cbbaseinfo:
  description: Updates an existing deliberation's status or request message.
cbparameters:
  parameters:
    - name: params
      typeName: IUpdateDeliberationParams
      description: Parameters including deliberation ID and fields to update.
  returns:
    signatureTypeName: Promise<IUpdateDeliberationResponse>
    description: A promise that resolves to the updated deliberation.
    typeArgs: []
data:
  name: update
  category: agentDeliberation
  link: update.md
---
<CBBaseInfo />
<CBParameters />

### Examples

```typescript
// Change status to voting
await codebolt.agentDeliberation.update({
  deliberationId: 'delib-123',
  status: 'voting'
});

// Update request message
await codebolt.agentDeliberation.update({
  deliberationId: 'delib-123',
  requestMessage: 'Updated question text...'
});
```

### Notes

- Only status and requestMessage can be updated
- Status changes should follow the workflow
- Creator typically has update permissions

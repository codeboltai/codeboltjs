---
name: respond
cbbaseinfo:
  description: Submits a response to a deliberation from an agent or user.
cbparameters:
  parameters:
    - name: params
      typeName: IRespondParams
      description: Parameters including deliberation ID, responder info, and response body.
  returns:
    signatureTypeName: "Promise<IRespondResponse>"
    description: A promise that resolves to the submitted response.
    typeArgs: []
data:
  name: respond
  category: agentDeliberation
  link: respond.md
---
<CBBaseInfo />
<CBParameters />

### Examples

```typescript
// Submit a response
await codebolt.agentDeliberation.respond({
  deliberationId: 'delib-123',
  responderId: 'agent-456',
  responderName: 'Expert Agent',
  body: 'Based on my analysis, I recommend option A because...'
});
```

### Notes

- Responses can only be added during 'collecting-responses' status
- Multiple responses per participant are allowed
- Responses are visible to all participants

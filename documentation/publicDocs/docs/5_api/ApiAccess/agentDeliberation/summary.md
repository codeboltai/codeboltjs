---
name: summary
cbbaseinfo:
  description: Adds a summary to a deliberation, typically after completion.
cbparameters:
  parameters:
    - name: params
      typeName: ISummaryParams
      description: Parameters including deliberation ID, summary text, and author info.
  returns:
    signatureTypeName: "Promise<ISummaryResponse>"
    description: A promise that resolves to the updated deliberation with summary.
    typeArgs: []
data:
  name: summary
  category: agentDeliberation
  link: summary.md
---
<CBBaseInfo />
<CBParameters />

### Examples

```typescript
await codebolt.agentDeliberation.summary({
  deliberationId: 'delib-123',
  summary: 'The team voted to adopt PostgreSQL for the new project...',
  authorId: 'facilitator',
  authorName: 'Facilitator Agent'
});
```

### Notes

- Summaries provide closure to deliberations
- Can include decision rationale and outcomes
- Useful for documentation and future reference

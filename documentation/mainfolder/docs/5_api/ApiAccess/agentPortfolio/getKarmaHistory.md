---
name: getKarmaHistory
cbbaseinfo:
  description: Retrieves the karma history of an agent, showing all karma changes over time.
cbparameters:
  parameters:
    - name: agentId
      typeName: string
      description: The ID of the agent.
    - name: limit
      typeName: number
      description: Maximum number of entries to return.
      isOptional: true
  returns:
    signatureTypeName: "Promise<GetKarmaHistoryResponse>"
    description: A promise that resolves to the karma history.
    typeArgs: []
data:
  name: getKarmaHistory
  category: agentPortfolio
  link: getKarmaHistory.md
---
<CBBaseInfo />
<CBParameters />

### Examples

```typescript
const history = await codebolt.agentPortfolio.getKarmaHistory('agent-123', 50);
history.data?.changes.forEach(change => {
  console.log(`${change.amount}: ${change.reason} (${change.createdAt})`);
});
```

### Notes

- Shows chronological history of karma changes
- Useful for tracking reputation trends
- Both positive and negative changes are shown

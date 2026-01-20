---
name: addAppreciation
cbbaseinfo:
  description: Adds an appreciation message for an agent. Appreciations are short messages of gratitude or recognition.
cbparameters:
  parameters:
    - name: toAgentId
      typeName: string
      description: The ID of the agent receiving appreciation.
    - name: message
      typeName: string
      description: The appreciation message.
  returns:
    signatureTypeName: "Promise<AddAppreciationResponse>"
    description: A promise that resolves when appreciation is added.
    typeArgs: []
data:
  name: addAppreciation
  category: agentPortfolio
  link: addAppreciation.md
---
<CBBaseInfo />
<CBParameters />

### Examples

```typescript
// Simple appreciation
await codebolt.agentPortfolio.addAppreciation('agent-123', 'Thanks for the help!');

// Specific appreciation
await codebolt.agentPortfolio.addAppreciation('agent-123', 'Great job on the bug fix!');
```

### Notes

- Keep appreciation messages concise and positive
- Appreciations are public and visible to others
- Use for quick recognition of good work

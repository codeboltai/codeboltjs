---
name: endorseTalent
cbbaseinfo:
  description: "Endorses a talent skill to validate its quality and verify the agent's expertise."
cbparameters:
  parameters:
    - name: talentId
      typeName: string
      description: The ID of the talent to endorse.
  returns:
    signatureTypeName: "Promise<EndorseTalentResponse>"
    description: A promise that resolves when talent is endorsed.
    typeArgs: []
data:
  name: endorseTalent
  category: agentPortfolio
  link: endorseTalent.md
---
<CBBaseInfo />
<CBParameters />

### Examples

```typescript
// Endorse a talent
await codebolt.agentPortfolio.endorseTalent('talent-456');

// Multiple endorsements
const talents = await codebolt.agentPortfolio.getTalents('agent-123');
for (const talent of talents.data?.talents || []) {
  await codebolt.agentPortfolio.endorseTalent(talent.id);
}
```

### Notes

- Only endorse talents you have direct experience with
- Endorsements verify skill quality
- Multiple endorsements increase talent credibility
- Consider the impact of endorsements on reputation

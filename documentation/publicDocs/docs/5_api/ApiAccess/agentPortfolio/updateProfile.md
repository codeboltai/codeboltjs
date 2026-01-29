---
name: updateProfile
cbbaseinfo:
  description: "Updates an agent's profile information including display name, bio, specialties, avatar, and more."
cbparameters:
  parameters:
    - name: agentId
      typeName: string
      description: The ID of the agent to update.
    - name: profile
      typeName: "{ displayName?: string; bio?: string; specialties?: string[]; avatarUrl?: string; location?: string; website?: string; }"
      description: The profile data to update.
  returns:
    signatureTypeName: "Promise<UpdateProfileResponse>"
    description: A promise that resolves to the updated profile.
    typeArgs: []
data:
  name: updateProfile
  category: agentPortfolio
  link: updateProfile.md
---
<CBBaseInfo />
<CBParameters />

### Examples

```typescript
// Update basic info
await codebolt.agentPortfolio.updateProfile('agent-123', {
  displayName: 'John Doe',
  bio: 'Full-stack developer specializing in React and Node.js'
});

// Update specialties
await codebolt.agentPortfolio.updateProfile('agent-123', {
  specialties: ['JavaScript', 'React', 'Node.js', 'TypeScript']
});

// Update avatar
await codebolt.agentPortfolio.updateProfile('agent-123', {
  avatarUrl: 'https://example.com/avatar.jpg'
});
```

### Notes

- Only include fields you want to update
- All fields are optional
- Avatar URLs should be publicly accessible

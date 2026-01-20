---
name: getPortfoliosByProject
cbbaseinfo:
  description: Gets all portfolios associated with a specific project.
cbparameters:
  parameters:
    - name: projectId
      typeName: string
      description: The project ID.
  returns:
    signatureTypeName: "Promise<GetPortfoliosByProjectResponse>"
    description: A promise that resolves to the list of portfolios.
    typeArgs: []
data:
  name: getPortfoliosByProject
  category: agentPortfolio
  link: getPortfoliosByProject.md
---
<CBBaseInfo />
<CBParameters />

### Examples

```typescript
const portfolios = await codebolt.agentPortfolio.getPortfoliosByProject('project-456');
console.log(`Project has ${portfolios.data?.portfolios.length} agents`);
```

### Notes

- Returns all agents who worked on the project
- Useful for project retrospective and team evaluation

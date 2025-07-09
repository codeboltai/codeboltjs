You can use the following code to build a prompt:

```javascript
const userMessage = {
    messageText: "Help me analyze this code",
    mentionedMCPs: [
        { name: "CodeAnalyzer", toolName: "analyze", tools: ["static-analysis", "complexity"] }
    ],
    mentionedAgents: [
        { name: "CodeReviewer", description: "Performs code reviews" }
    ]
};

const prompt = new PromptBuilder(userMessage)
    .addMCPTools()
    .addAgents()
    .addContext("Project is a Node.js application")
    .build();
```


# InitialPromptBuilder

The `InitialPromptBuilder` class helps construct complex prompts with tools, environment details, and system instructions.

  

```typescript

import { InitialPromptBuilder } from './promptbuilder';
const promptBuilder = new InitialPromptBuilder(userMessage, codebolt);
const prompt = await InitialPromptBuilder
.addMCPTools()
.addAgentTools()
.addAgentsToPrompt()
.addEnvironmentDetails()
.addSystemPrompt('agent.yaml', 'test', 'example.md')
.addTaskInstruction('task.yaml', 'main_task')
.buildInferenceParams();
```

InitialPromptBuilder allows to Convert the incoming userMessage to the Actual Prompt

This is a Good Class That allows the usermessage to be converted to the Actual Prompt and it can be used in multiple Places.
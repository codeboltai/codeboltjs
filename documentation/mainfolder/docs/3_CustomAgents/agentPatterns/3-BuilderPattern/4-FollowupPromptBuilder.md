# Followup Prompt Builder

This is the Class like [[2-InitialPromptBuilder]] but this is for subsequent Prompt Building.

The `FollowUpPromptBuilder` class manages conversation continuation and summarization.

  

```typescript

import { FollowUpPromptBuilder } from './followupquestionbuilder';
const followUpBuilder = new FollowUpPromptBuilder(codebolt);
const nextPrompt = await followUpBuilder
.addPreviousConversation(previousPrompt)
.addToolResult(toolResults)
.checkAndSummarizeConversationIfLong()
.buildInferenceParams();
```

This is For Building the Follow up Prompts
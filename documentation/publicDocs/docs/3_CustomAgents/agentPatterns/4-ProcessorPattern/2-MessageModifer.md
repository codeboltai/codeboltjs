# Message Modifier

The Message Modifier class is similar to [[2-InitialPromptBuilder]] but Instead of using builder pattern of . it uses the Processor Pattern. 

The Processor Allow for much more control of the Modification as you can add custom processors.

Example is:

```ts
const messageModifier = new RequestMessage({
	messageModifiers: [
		new BaseContextMessageModifier({
			prependmessage: "This is Codebolt Agent. Setting up the Context.",
			datetime: true,
			osInfo: true,
			workingdir: true
		}),
		new WorkingDirectoryMessageModifier({
			showFolderStructureSummary: true,
			listFiles: true,
			listFilesDepth: 2,
			listFilesLimit: 200,
			listFilesIgnoreFromGitignore: true,
			listFilesIgnore: ["node_modules"]
		}),
		new BaseSystemInstructionMessageModifier({
			systemInstruction: "You are a helpful assistant that can answer questions and help with tasks."
		}),
		new HandleUrlMessageModifier({
			fetchUrlContent: true,
		}),
		new ImageAttachmentMessageModifier({
			passImageAs: "URL",
		}),
		new AddToolsListMessageModifier({
			toolsList: toolList,
			addToolsLocation: "InsidePrompt", //or as Tool
			giveToolExamples: true,
			maxToolExamples: 2,
		}),
	]
});
const InitialPrompt = await messageModifier.modify(message);
```

This also returns the similar Initial Prompt as we are getting from the Initial Prompt Builder.


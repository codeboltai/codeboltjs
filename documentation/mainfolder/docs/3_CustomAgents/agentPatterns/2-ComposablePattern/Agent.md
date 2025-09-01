# ComposableAgent

The Composable Agent takes the various parts of the Message and then runs the complete Agent Loop.

Example is:

```ts
export const documentAgent = new ComposableAgent({
	name: 'Document Processing Agent',
	instructions: `
	You are a helpful document processing assistant that can analyze, summarize, and extract information from documents.
	Your capabilities include:
	- Summarizing document content
	- Extracting keywords and key topics
	- Chunking documents for processing
	- Analyzing document structure and metadata
	Use the process-document tool to perform these operations.
	`,
	model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
	tools: { processDocumentTool },
	memory: createCodeBoltAgentMemory()
});
```


This is a bit different from [[5-Example]] where we are controlling the Agent Loop. Instead here we are passing things to the agent and the agent class handles the entire loop
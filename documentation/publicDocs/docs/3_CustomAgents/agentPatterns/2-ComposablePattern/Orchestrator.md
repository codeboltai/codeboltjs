There are various types of Orchestrator Flows that are possible. Think of it as a this way that all the Following can be used as a tool when running an agent:
1. Agent as a tool
2. Tool as a Tool 
3. Workflow as a Tool 


So, a Workflow can run as a tool, but also the workflow can run an agent or tool in its step.
An Agent Can run as a Tool but also the agent can run tools and Workflows
Tool Can run itself and ideally should not run any agents and workflows or workflows inside it.

Orchestrator can run agents, workflows and Tools as Tools. The Differnce is that Orchestrator can run agents, workflows and tools in any order it wants, while the Workflow Has a fixed specific order.

An Example is:

```ts
  
const agentStep1 = createStep({ 
	id: 'agent-step', 
	description: 'This step is used to do research and text synthesis.',
	inputSchema: z.object({ ... }), 
	outputSchema: z.object({ ... }), 
	execute: async ({ inputData }) => return await agent1.generate(inputData.city, { ... }),
}); 

const agentStep2 = createStep({ 
	id: 'agent-step-two', 
	description: 'This step is used to do research and text synthesis.',
	inputSchema: z.object({ ... }), 
	outputSchema: z.object({ ... }), 
	execute: async ({ inputData }) => { return await agent2.generate(inputData.text, { ... }); },
}); 

const workflow1 = createWorkflow({ 
	id: 'workflow1', 
	description: 'description', 
	steps: [], 
	inputSchema: z.object({ ... }), 
	outputSchema: z.object({ ... }),
}).then(agentStep1).then(agentStep2).commit(); 

const agent1 = new Agent({ 
	name: 'agent1', 
	instructions: 'Instruction', 
	description: 'Decription', 
}); 

const agent2 = new Agent({ 
	name: 'agent2', 
	description: 'description2', 
	instructions: 'Instruction2', 
}); 

const network = new Orchestrator({ 
	id: 'test-network', 
	name: 'Test Network', 
	instructions: 'instruciton', 
	model: openai('gpt-4o'), 
	agents: { agent1, agent2, }, 
	workflows: { workflow1, }, 
	memory: memory,
}); 

const runtimeContext = new RuntimeContext(); 

await orchestrator.loop( 
	'Main User Message', 
	{ runtimeContext }, 
);
```

In the above Example, we have created two Agents, and a workflow and they are being run by orchestrator
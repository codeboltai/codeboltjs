# Local Tools

While Codebolt already provides tools using the Codeboltjs in the format of:
1. MCP Tools
2. Codebolt Features as Tools

You might sometime need to create your local tools at the agent level. As an example, you might want to create a tool like WaitForCompletion which waits for specified amount of time before resolving.

The composable agent provides an interface to create Tools using createTool in @codebolt/agent/composable library. You can use the CreateTool like:

```ts
import {createTool} from @codebolt/agent/composable

export const weatherTool = createTool({
	id: 'get-weather',
	description: 'Get current weather for a location',
	inputSchema: z.object({
		location: z.string().describe('City name'),
	}),
	outputSchema: z.object({
		temperature: z.number(),
		feelsLike: z.number(),
		humidity: z.number(),
		windSpeed: z.number(),
		windGust: z.number(),
		conditions: z.string(),
		location: z.string(),
	}),
	execute: async ({ context }) => {
		return await getWeather(context.location);
	},
});
```

>[!note]
Please note that this is different from create MCP logic which is provided by @codebolt/mcp. The Codebolt MCP Library allows you to create a full fledged MCP server which can be installed in the Codebolt Application while the createTool only creates a Tool in the local Agent, especially the Composable Agent. 

The basic syntax and structure of the Codebolt createTool is as Follows:

```ts
mytool = createTool({
	id: "uniqueid",
	description: "Description of the Tool",
	inputSchema: z.object(), //Zod Schema of the input
	outputSchema: z.object(), //Zod Schema of the output of the Tool
	execute: async ({context}) => {
		//The Actual Execution Logic
	},
})
```


This way you can create local Tools that you can then pass to ComposableAgent which can then use it in the Agent Execution and pass it to the LLM. When the LLM asks to execute the tool, then the Execute Function will be called.
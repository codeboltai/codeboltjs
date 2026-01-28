# LLM Agent Step

> **Note**: This document describes a planned pattern. Some processors referenced below (like `AdvancedLoopDetectionProcessor`, `TokenManagementProcessor`, `ResponseValidationProcessor`, `TelemetryProcessor`) are not yet implemented. See the [Roadmap](../5-unified/6-roadmap.md) for current status.
>
> For currently available APIs, see the [Unified Agent Framework](../5-unified/README.md) documentation.

This is the main LLMAgentStep that takes various Processors as Input and output. This helps it to control the internal processing. 

This is slightly differnet from [[3_CustomAgents/agentPatterns/2-ComposablePattern/Agent|Agent]] Where we are configuring only based on parameters. This seems to be more scalable but might need to write some more Code.

```ts
const agentStep = new LLMAgentStep({
	inputProcessors: [
		// Phase 1: Core Safety & Performance
		new AdvancedLoopDetectionProcessor({
			toolCallThreshold: 5,
			contentLoopThreshold: 10,
			enableLLMDetection: false // Disable for now to avoid extra LLM calls
		}),
		
		new TokenManagementProcessor({
			maxTokens: 128000,
			warningThreshold: 0.8,
			enableCompression: true
		}),
		
		// Phase 2: Context & Intelligence
		new ContextManagementProcessor({
			enableProjectContext: true,
			enableIdeContext: true,
			enableDirectoryContext: true
		}),
		
		new ChatCompressionProcessor({
			compressionThreshold: 0.7,
			tokenLimit: 128000
		}),
	],
	outputProcessors: [
		// Phase 1: Critical Validation
		new ResponseValidationProcessor({
			validateToolCalls: true,
			validateContent: true,
			validateStructure: true
		}),
		
		// Phase 3: Monitoring & Recording
		new ChatRecordingProcessor({
			enableTokenTracking: true,
			exportFormat: 'json',
			autoExport: false // Manual export for now
		}),
		
		new TelemetryProcessor({
			enablePerformanceTracking: true,
			enableErrorTracking: true,
			enableUsageTracking: true,
			sampleRate: 1.0
		})
	],
	
	toolList: toolList,
	toolExecutor: toolExecutor,
	llmconfig: {
		llmname: "gemini-pro",
		model: "gemini-pro",
		temperature: 0.7,
		maxTokens: 8192
	},
	maxIterations: 10
});
```
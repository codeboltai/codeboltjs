const ACT_UPDATED_REFERENCE = '/Users/ravirawat/Documents/codeboltai/AiEditor/codeboltjs/agents/act-updated';

const PLATFORM_KNOWLEDGE = `
PlatformMofier creates CodeBolt platform artifacts by delegating each action to an internal ActionBlock.

Agent loop reference:
- Canonical full agentic loop: ${ACT_UPDATED_REFERENCE}
- Use codebolt.onMessage, progress updates, context gathering, tool execution, max-turn limits, loop detection, compaction, and verification before completion.

Platform surfaces:
- agent: codeboltagent.yaml plus TypeScript source at src/index.ts, built runtime output at dist/index.js, and @codebolt/codeboltjs message handling.
- plugin: package.json#codebolt.plugin plus TypeScript source at src/index.ts, built runtime output at dist/index.js, and @codebolt/plugin-sdk lifecycle.
- llm-plugin: TypeScript plugin SDK llmProvider.register, completion/stream/login handlers, built runtime output at dist/index.js, and server routing through llmService.
- websearch-plugin: TypeScript plugin SDK webSearchProvider.register, search/login handlers, built runtime output at dist/index.js, and server routing through webSearchService.
- provider: providers.yaml plus TypeScript source at src/index.ts, built runtime output at dist/index.js, and provider lifecycle hooks such as onProviderStart and onProviderAgentStart.
- dynamic-panel/custom-ui: TypeScript plugin process at src/index.ts, built runtime output at dist/index.js, package.json#codebolt.plugin.ui.path, and plugin.dynamicPanel communication where needed.
- action-block: actionblock.yml plus TypeScript source at src/index.ts, built runtime output at dist/index.js, and codebolt.onActionBlockInvocation as a side-execution mini-agent.
`.trim();

export {
  ACT_UPDATED_REFERENCE,
  PLATFORM_KNOWLEDGE,
};

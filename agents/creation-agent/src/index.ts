process.env.WS_NO_BUFFER_UTIL = '1';
process.env.WS_NO_UTF_8_VALIDATE = '1';
process.env.CODEBOLT_URL = process.env.CODEBOLT_URL || 'ws://localhost:31245/codebolt';
process.env.CODEBOLT_ID = process.env.CODEBOLT_ID || 'creation-agent';

import type { AgentLocalTool } from '@codebolt/types/agent';
import type { FlatUserMessage } from '@codebolt/types/sdk';
import type { ApiDocSearchResult } from '@codebolt/api-docs-index';

const codebolt = require('@codebolt/codeboltjs') as CodeboltRuntime;
const { createAgent } = require('@codebolt/agent/unified') as typeof import('@codebolt/agent/unified');
const { apiDocsIndexTools } = require('@codebolt/api-docs-index/tools') as typeof import('@codebolt/api-docs-index/tools');
const { searchApiDocs } = require('@codebolt/api-docs-index') as typeof import('@codebolt/api-docs-index');

interface CodeboltRuntime {
  onMessage(handler: (message: FlatUserMessage) => Promise<string | void>): void;
  chat: {
    sendMessage(message: string, payload?: object): void;
    processStarted?(): unknown;
    processFinished?(): unknown;
  };
}

type FlexibleIncomingMessage = Partial<FlatUserMessage> & {
  message?: unknown;
};

const CREATOR_SYSTEM_PROMPT = `
You are Creation Agent, a specialized software-engineering agent that creates runnable CodeBolt custom agents.

Your job is to turn the user's request into a real CodeBolt agent package, not just advice. You should create or update files in the current CodeBolt project, usually under agents/<agent-id>, unless the user explicitly names another target path.

Core requirements:
- Use the local API documentation tools before choosing SDK calls:
  - list_api_categories for available surfaces when useful.
  - search_api_docs for natural-language API discovery.
  - get_api_spec for the exact APIs you plan to use.
- Use CodeBolt file and terminal tools to create files and validate the generated agent.
- Prefer the current TypeScript agent style:
  - package.json
  - codeboltagent.yaml
  - tsconfig.json
  - webpack.config.js
  - process-polyfill.js when webpack/browser polyfills are needed
  - src/index.ts
  - README.md
- For LLM-driven generated agents, prefer createAgent from @codebolt/agent/unified.
- For procedural generated agents, use codebolt.onMessage with explicit SDK calls.
- Use codebolt.chat.sendMessage for deterministic progress/status messages from generated code.
- Keep generated code readable, with explicit function names and clear error handling.
- Do not hallucinate CodeBolt SDK APIs. Search the API docs index and inspect exact specs first.
- Declare only the dependencies the generated agent actually needs.
- Validate before finishing. At minimum run the generated agent's typecheck or build command if dependencies are available. If validation cannot run because dependencies are missing, state the exact blocker and the command the user should run.

Internal workflow:
1. Understand the requested agent behavior.
2. Create a concise blueprint with agent name, target folder, runtime style, files, APIs, permissions, and validation plan.
3. Search API docs and retrieve specs for each selected API.
4. Create or update the agent files.
5. Run validation checks.
6. Repair any generated-code errors you can fix.
7. Report the generated folder, important files, validation result, and any remaining steps.

When writing code, do not create a separate framework. Use the local CodeBolt conventions already present in the agents folder.
`;

function getNestedMessage(incomingMessage: FlexibleIncomingMessage): FlexibleIncomingMessage | undefined {
  if (typeof incomingMessage.message === 'object' && incomingMessage.message !== null && !Array.isArray(incomingMessage.message)) {
    return incomingMessage.message as FlexibleIncomingMessage;
  }

  return undefined;
}

function getUserRequest(incomingMessage: FlexibleIncomingMessage): string {
  const nestedMessage = getNestedMessage(incomingMessage);

  if (typeof incomingMessage.userMessage === 'string' && incomingMessage.userMessage.trim()) {
    return incomingMessage.userMessage.trim();
  }

  if (typeof nestedMessage?.userMessage === 'string' && nestedMessage.userMessage.trim()) {
    return nestedMessage.userMessage.trim();
  }

  if (typeof incomingMessage.message === 'string' && incomingMessage.message.trim()) {
    return incomingMessage.message.trim();
  }

  if (typeof nestedMessage?.message === 'string' && nestedMessage.message.trim()) {
    return nestedMessage.message.trim();
  }

  return '';
}

function compactSearchResult(result: ApiDocSearchResult): Record<string, unknown> {
  const compact: Record<string, unknown> = {
    id: result.id,
    package: result.package,
    surface: result.surface,
    kind: result.kind,
    title: result.title,
    score: Number(result.score.toFixed(2)),
  };

  if (result.summary) compact.summary = result.summary;
  if (result.signature) compact.signature = result.signature;
  if (result.importPath) compact.importPath = result.importPath;
  if (result.risk) compact.risk = result.risk;
  if (result.tags) compact.tags = result.tags;

  return compact;
}

function dedupeSearchResults(resultGroups: ApiDocSearchResult[][]): ApiDocSearchResult[] {
  const resultById = new Map<string, ApiDocSearchResult>();

  for (const resultGroup of resultGroups) {
    for (const result of resultGroup) {
      const existing = resultById.get(result.id);
      if (!existing || result.score > existing.score) {
        resultById.set(result.id, result);
      }
    }
  }

  return Array.from(resultById.values())
    .sort((firstResult, secondResult) => secondResult.score - firstResult.score)
    .slice(0, 18);
}

async function getInitialApiDocMatches(userRequest: string): Promise<ApiDocSearchResult[]> {
  const seedQueries = [
    userRequest,
    'create CodeBolt agent local tools createAgent onMessage',
    'send message to user read file write file run command CodeBolt agent',
    'CodeBolt agent framework createTool createAgent local tools',
  ];

  const resultGroups = await Promise.all(
    seedQueries.map((query) => searchApiDocs(query, { limit: 6 })),
  );

  return dedupeSearchResults(resultGroups);
}

async function buildCreatorTask(userRequest: string): Promise<string> {
  const initialApiDocs = await getInitialApiDocMatches(userRequest);
  const compactDocs = initialApiDocs.map(compactSearchResult);

  return `
<user_request>
${userRequest}
</user_request>

<initial_api_docs_context>
${JSON.stringify(compactDocs, null, 2)}
</initial_api_docs_context>

Create the requested CodeBolt agent. The initial API docs context is only a starting point. You must call search_api_docs and get_api_spec for the exact SDK APIs you decide to use before writing final code.
`;
}

const creationAgent = createAgent({
  name: 'creation-agent',
  instructions: CREATOR_SYSTEM_PROMPT,
  tools: apiDocsIndexTools as unknown as AgentLocalTool[],
  maxTurns: 30,
  includeDefaultModifiers: true,
  includeDefaultProcessors: true,
  enableLogging: true,
});

codebolt.onMessage(async (reqMessage: FlatUserMessage): Promise<string> => {
  const userRequest = getUserRequest(reqMessage as FlexibleIncomingMessage);

  if (!userRequest) {
    const emptyRequestMessage = 'Tell me what CodeBolt agent you want to create, including what it should do and where you want it placed.';
    codebolt.chat.sendMessage(emptyRequestMessage);
    return emptyRequestMessage;
  }

  codebolt.chat.processStarted?.();
  codebolt.chat.sendMessage('Creating a CodeBolt agent blueprint and searching the API docs index...');

  try {
    const creatorTask = await buildCreatorTask(userRequest);
    const runResult = await creationAgent.run({
      ...reqMessage,
      userMessage: creatorTask,
    });

    if (!runResult.success) {
      const failureMessage = runResult.error || 'Creation agent failed before producing a final result.';
      codebolt.chat.sendMessage(failureMessage);
      return failureMessage;
    }

    const finalMessage = runResult.finalMessage || 'Creation agent finished. Review the generated files and validation output above.';
    codebolt.chat.sendMessage(finalMessage);
    return finalMessage;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    codebolt.chat.sendMessage(`Creation agent failed: ${errorMessage}`);
    return `Creation agent failed: ${errorMessage}`;
  } finally {
    codebolt.chat.processFinished?.();
  }
});

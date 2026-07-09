import codebolt from "@codebolt/codeboltjs";
import { FlatUserMessage } from "@codebolt/types/sdk";

type LlmInputItem = Record<string, unknown>;
type LlmTool = {
  type: string;
  [key: string]: unknown;
};
type LlmRequest = {
  formatVersion: "codebolt.llm.v2";
  input: LlmInputItem[];
  tools: LlmTool[];
  tool_choice: "auto";
  saveToContext: boolean;
  cache: {
    prompt_cache_key: string;
  };
};

function runLlmInference(request: LlmRequest): Promise<any> {
  return codebolt.llm.inference(request as any);
}

const systemPrompt = [
  "You are testing CodeBolt LLM tool search.",
  "When the user asks for weather, first call tool_search.",
  "After tool_search returns a script resource, call executeScript with that scriptName and args.",
].join("\n");

const baseTools = [
  {
    type: "tool_search" as const,
    execution: "client" as const,
    description: "Search available tools and resources.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
        },
      },
      required: ["query"],
    },
  },
  {
    type: "function" as const,
    name: "executeScript",
    description: "Execute a saved script by name with arguments.",
    parameters: {
      type: "object",
      properties: {
        scriptName: {
          type: "string",
        },
        args: {
          type: "object",
        },
      },
      required: ["scriptName"],
    },
  },
];

const searchedTools = [
  {
    type: "function" as const,
    name: "get_current_time",
    description: "Get the current time for a location or timezone.",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "City, country, or timezone to get the current time for.",
        },
      },
      required: ["location"],
    },
  },
];

function getToolSearchCall(response: any): any | null {
  const items = Array.isArray(response?.items) ? response.items : [];
  return items.find((item: any) => (
    item?.type === "function_call" && item?.name === "tool_search" && item?.call_id
  )) || null;
}

function createToolSearchOutput(callId: string): LlmInputItem {
  return {
    type: "tool_search_output",
    call_id: callId,
    execution: "client",
    status: "completed",
    tools: searchedTools,
    resources: [
      {
        type: "script",
        name: "get_weather_script",
        description: "Get the current weather report and temperature for a requested location.",
        argsSchema: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "City or place name to get the weather for.",
            },
          },
          required: ["location"],
        },
        call: {
          tool: "executeScript",
          arguments: {
            scriptName: "get_weather_script",
          },
        },
      },
    ],
  };
}

codebolt.onMessage(async (_reqMessage: FlatUserMessage) => {
  await codebolt.chat.sendMessage("Testing tool_search resources flow");

  const firstRequest: LlmRequest = {
    formatVersion: "codebolt.llm.v2" as const,
    input: [
      {
        role: "system" as const,
        content: systemPrompt,
      },
      {
        role: "user" as const,
        content: "Serarch and use tool to get temperature  of delhi",
      },
    ],
    tools: baseTools,
    tool_choice: "auto" as const,
    saveToContext: true,
    cache: {
      prompt_cache_key: "codebolt-testingagent-weather",
    },
  };

  const firstResponse = await runLlmInference(firstRequest);
  await codebolt.chat.sendMessage(JSON.stringify(firstResponse));

  const toolSearchCall = getToolSearchCall(firstResponse);
  if (!toolSearchCall) {
    await codebolt.chat.sendMessage("No tool_search function_call was returned by the model.");
    return firstResponse;
  }

  const secondRequest: LlmRequest = {
    ...firstRequest,
    tools: [
      ...baseTools,
      ...searchedTools,
    ],
    input: [
      ...firstRequest.input,
      ...(Array.isArray(firstResponse?.items) ? firstResponse.items : []),
      createToolSearchOutput(String(toolSearchCall.call_id)),
    ],
  };

  const secondResponse = await runLlmInference(secondRequest);
  await codebolt.chat.sendMessage(JSON.stringify(secondResponse));
  return secondResponse;
});

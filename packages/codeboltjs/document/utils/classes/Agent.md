[@codebolt/codeboltjs](../README.md) / [Exports](../modules.md) / Agent

# Class: Agent

Agent class that manages conversations with LLMs and tool executions.
Handles the conversation flow, tool calls, and task completions.

## Table of contents

### Constructors

- [constructor](Agent.md#constructor)

### Properties

- [apiConversationHistory](Agent.md#apiconversationhistory)
- [maxRun](Agent.md#maxrun)
- [nextUserMessage](Agent.md#nextusermessage)
- [systemPrompt](Agent.md#systemprompt)
- [tools](Agent.md#tools)
- [userMessage](Agent.md#usermessage)

### Methods

- [attemptApiRequest](Agent.md#attemptapirequest)
- [attemptLlmRequest](Agent.md#attemptllmrequest)
- [executeTool](Agent.md#executetool)
- [getToolDetail](Agent.md#gettooldetail)
- [getToolResult](Agent.md#gettoolresult)
- [run](Agent.md#run)
- [startSubAgent](Agent.md#startsubagent)

## Constructors

### constructor

• **new Agent**(`tools?`, `systemPrompt`, `maxRun?`): [`Agent`](Agent.md)

Creates a new Agent instance.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `tools` | `any` | `[]` | The tools available to the agent |
| `systemPrompt` | [`SystemPrompt`](SystemPrompt.md) | `undefined` | The system prompt providing instructions to the LLM |
| `maxRun` | `number` | `0` | Maximum number of conversation turns (0 means unlimited) |

#### Returns

[`Agent`](Agent.md)

#### Defined in

[src/agentlib/agent.ts:73](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/agent.ts#L73)

## Properties

### apiConversationHistory

• `Private` **apiConversationHistory**: `Message`[]

Full conversation history for API calls

#### Defined in

[src/agentlib/agent.ts:56](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/agent.ts#L56)

___

### maxRun

• `Private` **maxRun**: `number`

Maximum number of conversation turns (0 means unlimited)

#### Defined in

[src/agentlib/agent.ts:58](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/agent.ts#L58)

___

### nextUserMessage

• `Private` **nextUserMessage**: `any`

The next user message to be added to the conversation

#### Defined in

[src/agentlib/agent.ts:64](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/agent.ts#L64)

___

### systemPrompt

• `Private` **systemPrompt**: [`SystemPrompt`](SystemPrompt.md)

System prompt that provides instructions to the model

#### Defined in

[src/agentlib/agent.ts:60](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/agent.ts#L60)

___

### tools

• `Private` **tools**: `any`[]

Available tools for the agent to use

#### Defined in

[src/agentlib/agent.ts:54](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/agent.ts#L54)

___

### userMessage

• `Private` **userMessage**: `Message`[]

Messages from the user

#### Defined in

[src/agentlib/agent.ts:62](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/agent.ts#L62)

## Methods

### attemptApiRequest

▸ **attemptApiRequest**(): `any`

Fallback method for API requests in case of failures.

#### Returns

`any`

**`Throws`**

Error API request fallback not implemented

#### Defined in

[src/agentlib/agent.ts:412](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/agent.ts#L412)

___

### attemptLlmRequest

▸ **attemptLlmRequest**(`apiConversationHistory`, `tools`): `Promise`\<`any`\>

Attempts to make a request to the LLM with conversation history and tools.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `apiConversationHistory` | `Message`[] | The current conversation history |
| `tools` | `Record`\<`string`, `any`\> | The tools available to the LLM |

#### Returns

`Promise`\<`any`\>

Promise with the LLM response

#### Defined in

[src/agentlib/agent.ts:317](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/agent.ts#L317)

___

### executeTool

▸ **executeTool**(`toolName`, `toolInput`): `Promise`\<[`boolean`, `any`]\>

Executes a tool with given name and input.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `toolName` | `string` | The name of the tool to execute |
| `toolInput` | `any` | The input parameters for the tool |

#### Returns

`Promise`\<[`boolean`, `any`]\>

Promise with tuple [userRejected, result]

#### Defined in

[src/agentlib/agent.ts:348](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/agent.ts#L348)

___

### getToolDetail

▸ **getToolDetail**(`tool`): `ToolDetails`

Extracts tool details from a tool call object.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tool` | `any` | The tool call object from the LLM response |

#### Returns

`ToolDetails`

ToolDetails object with name, input, and ID

#### Defined in

[src/agentlib/agent.ts:371](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/agent.ts#L371)

___

### getToolResult

▸ **getToolResult**(`tool_call_id`, `content`): `ToolResult`

Creates a tool result object from the tool execution response.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tool_call_id` | `string` | The ID of the tool call |
| `content` | `string` | The content returned by the tool |

#### Returns

`ToolResult`

ToolResult object

#### Defined in

[src/agentlib/agent.ts:386](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/agent.ts#L386)

___

### run

▸ **run**(`task`, `successCondition?`): `Promise`\<\{ `error`: ``null`` \| `string` ; `message`: ``null`` \| `string` ; `success`: `boolean`  }\>

Runs the agent on a specific task until completion or max runs reached.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `task` | [`TaskInstruction`](TaskInstruction.md) | The task instruction to be executed |
| `successCondition` | () => `boolean` | Optional function to determine if the task is successful |

#### Returns

`Promise`\<\{ `error`: ``null`` \| `string` ; `message`: ``null`` \| `string` ; `success`: `boolean`  }\>

Promise with success status, error (if any), and the last assistant message

#### Defined in

[src/agentlib/agent.ts:89](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/agent.ts#L89)

___

### startSubAgent

▸ **startSubAgent**(`agentName`, `params`): `Promise`\<[`boolean`, `any`]\>

Starts a sub-agent to handle a specific task.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `agentName` | `string` | The name of the sub-agent to start |
| `params` | `any` | Parameters for the sub-agent |

#### Returns

`Promise`\<[`boolean`, `any`]\>

Promise with tuple [userRejected, result]

#### Defined in

[src/agentlib/agent.ts:361](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/agent.ts#L361)

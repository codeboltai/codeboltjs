---
title: CodeboltAPI
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: CodeboltAPI

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:284](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L284)

Interface for codebolt API functionality

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="chat"></a> `chat` | \{ `sendMessage`: (`message`: `string`, `metadata`: `Record`\<`string`, `unknown`\>) => `Promise`\<`void`\>; \} | [packages/codeboltjs/src/types/libFunctionTypes.ts:297](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L297) |
| `chat.sendMessage` | (`message`: `string`, `metadata`: `Record`\<`string`, `unknown`\>) => `Promise`\<`void`\> | [packages/codeboltjs/src/types/libFunctionTypes.ts:298](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L298) |
| <a id="fs"></a> `fs` | \{ `listFile`: (`path`: `string`, `recursive`: `boolean`) => `Promise`\<\{ `result`: `string`; `success`: `boolean`; \}\>; `readFile`: (`filepath`: `string`) => `Promise`\<`string`\>; \} | [packages/codeboltjs/src/types/libFunctionTypes.ts:290](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L290) |
| `fs.listFile` | (`path`: `string`, `recursive`: `boolean`) => `Promise`\<\{ `result`: `string`; `success`: `boolean`; \}\> | [packages/codeboltjs/src/types/libFunctionTypes.ts:292](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L292) |
| `fs.readFile` | (`filepath`: `string`) => `Promise`\<`string`\> | [packages/codeboltjs/src/types/libFunctionTypes.ts:291](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L291) |
| <a id="mcp"></a> `mcp` | \{ `executeTool`: (`toolboxName`: `string`, `actualToolName`: `string`, `toolInput`: `Record`\<`string`, `unknown`\>) => `Promise`\<\{ `data`: `string` \| `Record`\<`string`, `unknown`\>; \}\>; `getTools`: (`mcps`: `string`[]) => `Promise`\<\{ `data`: [`OpenAITool`](OpenAITool)[]; \}\>; `listMcpFromServers`: (`servers`: `string`[]) => `Promise`\<\{ `data`: [`OpenAITool`](OpenAITool)[]; \}\>; \} | [packages/codeboltjs/src/types/libFunctionTypes.ts:285](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L285) |
| `mcp.executeTool` | (`toolboxName`: `string`, `actualToolName`: `string`, `toolInput`: `Record`\<`string`, `unknown`\>) => `Promise`\<\{ `data`: `string` \| `Record`\<`string`, `unknown`\>; \}\> | [packages/codeboltjs/src/types/libFunctionTypes.ts:288](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L288) |
| `mcp.getTools` | (`mcps`: `string`[]) => `Promise`\<\{ `data`: [`OpenAITool`](OpenAITool)[]; \}\> | [packages/codeboltjs/src/types/libFunctionTypes.ts:287](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L287) |
| `mcp.listMcpFromServers` | (`servers`: `string`[]) => `Promise`\<\{ `data`: [`OpenAITool`](OpenAITool)[]; \}\> | [packages/codeboltjs/src/types/libFunctionTypes.ts:286](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L286) |
| <a id="project"></a> `project` | \{ `getProjectPath`: () => `Promise`\<\{ `projectPath`: `string`; \}\>; \} | [packages/codeboltjs/src/types/libFunctionTypes.ts:294](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L294) |
| `project.getProjectPath` | () => `Promise`\<\{ `projectPath`: `string`; \}\> | [packages/codeboltjs/src/types/libFunctionTypes.ts:295](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/libFunctionTypes.ts#L295) |

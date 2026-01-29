[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / CodeboltAPI

# Interface: CodeboltAPI

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:284](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L284)

Interface for codebolt API functionality

## Properties

### chat

> **chat**: `object`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:297](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L297)

#### sendMessage()

> **sendMessage**: (`message`, `metadata`) => `Promise`\<`void`\>

##### Parameters

###### message

`string`

###### metadata

`Record`\<`string`, `unknown`\>

##### Returns

`Promise`\<`void`\>

***

### fs

> **fs**: `object`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:290](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L290)

#### listFile()

> **listFile**: (`path`, `recursive`) => `Promise`\<\{ `result`: `string`; `success`: `boolean`; \}\>

##### Parameters

###### path

`string`

###### recursive

`boolean`

##### Returns

`Promise`\<\{ `result`: `string`; `success`: `boolean`; \}\>

#### readFile()

> **readFile**: (`filepath`) => `Promise`\<`string`\>

##### Parameters

###### filepath

`string`

##### Returns

`Promise`\<`string`\>

***

### mcp

> **mcp**: `object`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:285](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L285)

#### executeTool()

> **executeTool**: (`toolboxName`, `actualToolName`, `toolInput`) => `Promise`\<\{ `data`: `string` \| `Record`\<`string`, `unknown`\>; \}\>

##### Parameters

###### toolboxName

`string`

###### actualToolName

`string`

###### toolInput

`Record`\<`string`, `unknown`\>

##### Returns

`Promise`\<\{ `data`: `string` \| `Record`\<`string`, `unknown`\>; \}\>

#### getTools()

> **getTools**: (`mcps`) => `Promise`\<\{ `data`: [`OpenAITool`](OpenAITool.md)[]; \}\>

##### Parameters

###### mcps

`string`[]

##### Returns

`Promise`\<\{ `data`: [`OpenAITool`](OpenAITool.md)[]; \}\>

#### listMcpFromServers()

> **listMcpFromServers**: (`servers`) => `Promise`\<\{ `data`: [`OpenAITool`](OpenAITool.md)[]; \}\>

##### Parameters

###### servers

`string`[]

##### Returns

`Promise`\<\{ `data`: [`OpenAITool`](OpenAITool.md)[]; \}\>

***

### project

> **project**: `object`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:294](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L294)

#### getProjectPath()

> **getProjectPath**: () => `Promise`\<\{ `projectPath`: `string`; \}\>

##### Returns

`Promise`\<\{ `projectPath`: `string`; \}\>

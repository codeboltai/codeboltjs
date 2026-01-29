[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [packages/codeboltjs/src/modules/sideExecution.ts:24](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/sideExecution.ts#L24)

Side Execution Module
Provides functionality for running code in isolated child processes

## Type Declaration

### getStatus()

> **getStatus**: (`sideExecutionId`) => `Promise`\<[`GetSideExecutionStatusResponse`](../interfaces/GetSideExecutionStatusResponse.md)\>

Get the status of a side execution

#### Parameters

##### sideExecutionId

`string`

ID of the side execution

#### Returns

`Promise`\<[`GetSideExecutionStatusResponse`](../interfaces/GetSideExecutionStatusResponse.md)\>

Promise resolving to execution status

### listActionBlocks()

> **listActionBlocks**: (`projectPath?`) => `Promise`\<[`ListActionBlocksResponse`](../interfaces/ListActionBlocksResponse.md)\>

List all available ActionBlocks

#### Parameters

##### projectPath?

`string`

Optional project path to search for ActionBlocks

#### Returns

`Promise`\<[`ListActionBlocksResponse`](../interfaces/ListActionBlocksResponse.md)\>

Promise resolving to list of ActionBlocks

### startWithActionBlock()

> **startWithActionBlock**: (`actionBlockPath`, `params?`, `timeout?`) => `Promise`\<[`StartSideExecutionResponse`](../interfaces/StartSideExecutionResponse.md)\>

Start a side execution with an ActionBlock path

#### Parameters

##### actionBlockPath

`string`

Path to the ActionBlock directory

##### params?

`Record`\<`string`, `any`\>

Additional parameters to pass to the ActionBlock

##### timeout?

`number`

Execution timeout in milliseconds (default: 5 minutes)

#### Returns

`Promise`\<[`StartSideExecutionResponse`](../interfaces/StartSideExecutionResponse.md)\>

Promise resolving to the side execution ID

### startWithCode()

> **startWithCode**: (`inlineCode`, `params?`, `timeout?`) => `Promise`\<[`StartSideExecutionResponse`](../interfaces/StartSideExecutionResponse.md)\>

Start a side execution with inline JavaScript code

#### Parameters

##### inlineCode

`string`

JavaScript code to execute

##### params?

`Record`\<`string`, `any`\>

Additional parameters available in the execution context

##### timeout?

`number`

Execution timeout in milliseconds (default: 5 minutes)

#### Returns

`Promise`\<[`StartSideExecutionResponse`](../interfaces/StartSideExecutionResponse.md)\>

Promise resolving to the side execution ID

### stop()

> **stop**: (`sideExecutionId`) => `Promise`\<[`StopSideExecutionResponse`](../interfaces/StopSideExecutionResponse.md)\>

Stop a running side execution

#### Parameters

##### sideExecutionId

`string`

ID of the side execution to stop

#### Returns

`Promise`\<[`StopSideExecutionResponse`](../interfaces/StopSideExecutionResponse.md)\>

Promise resolving to success status

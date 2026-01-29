[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / ToolInvocation

# Interface: ToolInvocation\<TParams, TResult\>

Defined in: [packages/codeboltjs/src/tools/types.ts:278](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L278)

Represents a validated and ready-to-execute tool call

## Type Parameters

### TParams

`TParams` *extends* `object`

### TResult

`TResult` *extends* [`ToolFrameworkResult`](ToolFrameworkResult.md)

## Properties

### params

> **params**: `TParams`

Defined in: [packages/codeboltjs/src/tools/types.ts:283](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L283)

The validated parameters for this specific invocation

## Methods

### execute()

> **execute**(`signal`, `updateOutput?`): `Promise`\<`TResult`\>

Defined in: [packages/codeboltjs/src/tools/types.ts:294](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L294)

Executes the tool with the validated parameters

#### Parameters

##### signal

`AbortSignal`

##### updateOutput?

(`output`) => `void`

#### Returns

`Promise`\<`TResult`\>

***

### shouldConfirmExecute()

> **shouldConfirmExecute**(`abortSignal`): `Promise`\<`false` \| [`ToolCallConfirmationDetails`](../type-aliases/ToolCallConfirmationDetails.md)\>

Defined in: [packages/codeboltjs/src/tools/types.ts:289](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L289)

Determines if the tool should prompt for confirmation before execution

#### Parameters

##### abortSignal

`AbortSignal`

#### Returns

`Promise`\<`false` \| [`ToolCallConfirmationDetails`](../type-aliases/ToolCallConfirmationDetails.md)\>

***

### toolLocations()

> **toolLocations**(): [`ToolLocation`](ToolLocation.md)[]

Defined in: [packages/codeboltjs/src/tools/types.ts:286](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L286)

Determines what file system paths the tool will affect

#### Returns

[`ToolLocation`](ToolLocation.md)[]

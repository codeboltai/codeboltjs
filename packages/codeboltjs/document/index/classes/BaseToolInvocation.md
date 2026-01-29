[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / BaseToolInvocation

# Abstract Class: BaseToolInvocation\<TParams, TResult\>

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:33](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L33)

A convenience base class for ToolInvocation

## Type Parameters

### TParams

`TParams` *extends* `object`

### TResult

`TResult` *extends* [`ToolFrameworkResult`](../interfaces/ToolFrameworkResult.md)

## Implements

- [`ToolInvocation`](../interfaces/ToolInvocation.md)\<`TParams`, `TResult`\>

## Constructors

### Constructor

> **new BaseToolInvocation**\<`TParams`, `TResult`\>(`params`): `BaseToolInvocation`\<`TParams`, `TResult`\>

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:37](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L37)

#### Parameters

##### params

`TParams`

#### Returns

`BaseToolInvocation`\<`TParams`, `TResult`\>

## Properties

### params

> `readonly` **params**: `TParams`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:37](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L37)

The validated parameters for this specific invocation

#### Implementation of

[`ToolInvocation`](../interfaces/ToolInvocation.md).[`params`](../interfaces/ToolInvocation.md#params)

## Methods

### execute()

> `abstract` **execute**(`signal`, `updateOutput?`): `Promise`\<`TResult`\>

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:49](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L49)

Executes the tool with the validated parameters

#### Parameters

##### signal

`AbortSignal`

##### updateOutput?

(`output`) => `void`

#### Returns

`Promise`\<`TResult`\>

#### Implementation of

[`ToolInvocation`](../interfaces/ToolInvocation.md).[`execute`](../interfaces/ToolInvocation.md#execute)

***

### shouldConfirmExecute()

> **shouldConfirmExecute**(`_abortSignal`): `Promise`\<`false` \| [`ToolCallConfirmationDetails`](../type-aliases/ToolCallConfirmationDetails.md)\>

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:43](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L43)

Determines if the tool should prompt for confirmation before execution

#### Parameters

##### \_abortSignal

`AbortSignal`

#### Returns

`Promise`\<`false` \| [`ToolCallConfirmationDetails`](../type-aliases/ToolCallConfirmationDetails.md)\>

#### Implementation of

[`ToolInvocation`](../interfaces/ToolInvocation.md).[`shouldConfirmExecute`](../interfaces/ToolInvocation.md#shouldconfirmexecute)

***

### toolLocations()

> **toolLocations**(): [`ToolLocation`](../interfaces/ToolLocation.md)[]

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:39](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L39)

Determines what file system paths the tool will affect

#### Returns

[`ToolLocation`](../interfaces/ToolLocation.md)[]

#### Implementation of

[`ToolInvocation`](../interfaces/ToolInvocation.md).[`toolLocations`](../interfaces/ToolInvocation.md#toollocations)

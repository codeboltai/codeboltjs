[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / ToolBuilder

# Interface: ToolBuilder\<TParams, TResult\>

Defined in: [packages/codeboltjs/src/tools/types.ts:303](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L303)

Interface for a tool builder that validates parameters and creates invocations

## Type Parameters

### TParams

`TParams` *extends* `object`

### TResult

`TResult` *extends* [`ToolFrameworkResult`](ToolFrameworkResult.md)

## Properties

### canUpdateOutput

> **canUpdateOutput**: `boolean`

Defined in: [packages/codeboltjs/src/tools/types.ts:332](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L332)

Whether the tool supports live (streaming) output

***

### description

> **description**: `string`

Defined in: [packages/codeboltjs/src/tools/types.ts:314](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L314)

Description of what the tool does

***

### displayName

> **displayName**: `string`

Defined in: [packages/codeboltjs/src/tools/types.ts:311](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L311)

The user-friendly display name of the tool

***

### explanation

> **explanation**: `string`

Defined in: [packages/codeboltjs/src/tools/types.ts:317](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L317)

One sentence explanation as to why this tool is being used, and how it contributes to the goal.

***

### genAISchema

> **genAISchema**: `FunctionDeclaration`

Defined in: [packages/codeboltjs/src/tools/types.ts:326](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L326)

Function declaration schema for Google GenAI (for backward compatibility)

***

### isOutputMarkdown

> **isOutputMarkdown**: `boolean`

Defined in: [packages/codeboltjs/src/tools/types.ts:329](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L329)

Whether the tool's output should be rendered as markdown

***

### kind

> **kind**: [`Kind`](../enumerations/Kind.md)

Defined in: [packages/codeboltjs/src/tools/types.ts:320](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L320)

The kind of tool for categorization and permissions

***

### name

> **name**: `string`

Defined in: [packages/codeboltjs/src/tools/types.ts:308](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L308)

The internal name of the tool (used for API calls)

***

### schema

> **schema**: [`OpenAIToolSchema`](OpenAIToolSchema.md)

Defined in: [packages/codeboltjs/src/tools/types.ts:323](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L323)

Primary schema format (OpenAI tool schema)

## Methods

### build()

> **build**(`params`): [`ToolInvocation`](ToolInvocation.md)\<`TParams`, `TResult`\>

Defined in: [packages/codeboltjs/src/tools/types.ts:335](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L335)

Validates raw parameters and builds a ready-to-execute invocation

#### Parameters

##### params

`TParams`

#### Returns

[`ToolInvocation`](ToolInvocation.md)\<`TParams`, `TResult`\>

***

### buildAndExecute()

> **buildAndExecute**(`params`, `signal`, `updateOutput?`): `Promise`\<`TResult`\>

Defined in: [packages/codeboltjs/src/tools/types.ts:341](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L341)

Builds and executes tool in one step

#### Parameters

##### params

`TParams`

##### signal

`AbortSignal`

##### updateOutput?

(`output`) => `void`

#### Returns

`Promise`\<`TResult`\>

***

### validateBuildAndExecute()

> **validateBuildAndExecute**(`params`, `abortSignal`): `Promise`\<[`ToolFrameworkResult`](ToolFrameworkResult.md)\>

Defined in: [packages/codeboltjs/src/tools/types.ts:348](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L348)

Validates, builds, and executes tool in one step. Never throws.

#### Parameters

##### params

`TParams`

##### abortSignal

`AbortSignal`

#### Returns

`Promise`\<[`ToolFrameworkResult`](ToolFrameworkResult.md)\>

***

### validateToolParams()

> **validateToolParams**(`params`): `null` \| `string`

Defined in: [packages/codeboltjs/src/tools/types.ts:338](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/types.ts#L338)

Validates tool parameters

#### Parameters

##### params

`TParams`

#### Returns

`null` \| `string`

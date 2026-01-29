[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / DeclarativeTool

# Abstract Class: DeclarativeTool\<TParams, TResult\>

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:58](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L58)

Base class for tools that separates validation from execution

## Extended by

- [`BaseDeclarativeTool`](BaseDeclarativeTool.md)

## Type Parameters

### TParams

`TParams` *extends* `object`

### TResult

`TResult` *extends* [`ToolFrameworkResult`](../interfaces/ToolFrameworkResult.md)

## Implements

- [`ToolBuilder`](../interfaces/ToolBuilder.md)\<`TParams`, `TResult`\>

## Constructors

### Constructor

> **new DeclarativeTool**\<`TParams`, `TResult`\>(`name`, `displayName`, `description`, `kind`, `parameterSchema`, `isOutputMarkdown`, `canUpdateOutput`): `DeclarativeTool`\<`TParams`, `TResult`\>

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:62](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L62)

#### Parameters

##### name

`string`

##### displayName

`string`

##### description

`string`

##### kind

[`Kind`](../enumerations/Kind.md)

##### parameterSchema

`unknown`

##### isOutputMarkdown

`boolean` = `true`

##### canUpdateOutput

`boolean` = `false`

#### Returns

`DeclarativeTool`\<`TParams`, `TResult`\>

## Properties

### canUpdateOutput

> `readonly` **canUpdateOutput**: `boolean` = `false`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:69](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L69)

Whether the tool supports live (streaming) output

#### Implementation of

[`ToolBuilder`](../interfaces/ToolBuilder.md).[`canUpdateOutput`](../interfaces/ToolBuilder.md#canupdateoutput)

***

### description

> `readonly` **description**: `string`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:65](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L65)

Description of what the tool does

#### Implementation of

[`ToolBuilder`](../interfaces/ToolBuilder.md).[`description`](../interfaces/ToolBuilder.md#description)

***

### displayName

> `readonly` **displayName**: `string`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:64](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L64)

The user-friendly display name of the tool

#### Implementation of

[`ToolBuilder`](../interfaces/ToolBuilder.md).[`displayName`](../interfaces/ToolBuilder.md#displayname)

***

### isOutputMarkdown

> `readonly` **isOutputMarkdown**: `boolean` = `true`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:68](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L68)

Whether the tool's output should be rendered as markdown

#### Implementation of

[`ToolBuilder`](../interfaces/ToolBuilder.md).[`isOutputMarkdown`](../interfaces/ToolBuilder.md#isoutputmarkdown)

***

### kind

> `readonly` **kind**: [`Kind`](../enumerations/Kind.md)

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:66](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L66)

The kind of tool for categorization and permissions

#### Implementation of

[`ToolBuilder`](../interfaces/ToolBuilder.md).[`kind`](../interfaces/ToolBuilder.md#kind)

***

### name

> `readonly` **name**: `string`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:63](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L63)

The internal name of the tool (used for API calls)

#### Implementation of

[`ToolBuilder`](../interfaces/ToolBuilder.md).[`name`](../interfaces/ToolBuilder.md#name)

***

### parameterSchema

> `readonly` **parameterSchema**: `unknown`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:67](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L67)

## Accessors

### explanation

#### Get Signature

> **get** **explanation**(): `string`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:76](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L76)

One sentence explanation as to why this tool is being used, and how it contributes to the goal.
Defaults to description if not implemented by subclass.

##### Returns

`string`

One sentence explanation as to why this tool is being used, and how it contributes to the goal.

#### Implementation of

[`ToolBuilder`](../interfaces/ToolBuilder.md).[`explanation`](../interfaces/ToolBuilder.md#explanation)

***

### genAISchema

#### Get Signature

> **get** **genAISchema**(): `FunctionDeclaration`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:118](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L118)

Get Google GenAI schema format (for backward compatibility)

##### Returns

`FunctionDeclaration`

Function declaration schema for Google GenAI (for backward compatibility)

#### Implementation of

[`ToolBuilder`](../interfaces/ToolBuilder.md).[`genAISchema`](../interfaces/ToolBuilder.md#genaischema)

***

### openAIFunctionCall

#### Get Signature

> **get** **openAIFunctionCall**(): [`OpenAIFunctionCall`](../interfaces/OpenAIFunctionCall.md)

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:102](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L102)

Get OpenAI function call format

##### Returns

[`OpenAIFunctionCall`](../interfaces/OpenAIFunctionCall.md)

***

### schema

#### Get Signature

> **get** **schema**(): [`OpenAIToolSchema`](../interfaces/OpenAIToolSchema.md)

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:83](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L83)

Primary schema format (OpenAI tool schema)

##### Returns

[`OpenAIToolSchema`](../interfaces/OpenAIToolSchema.md)

Primary schema format (OpenAI tool schema)

#### Implementation of

[`ToolBuilder`](../interfaces/ToolBuilder.md).[`schema`](../interfaces/ToolBuilder.md#schema)

## Methods

### build()

> `abstract` **build**(`params`): [`ToolInvocation`](../interfaces/ToolInvocation.md)\<`TParams`, `TResult`\>

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:140](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L140)

The core of the pattern. It validates parameters and, if successful,
returns a `ToolInvocation` object that encapsulates the logic for the
specific, validated call.

#### Parameters

##### params

`TParams`

#### Returns

[`ToolInvocation`](../interfaces/ToolInvocation.md)\<`TParams`, `TResult`\>

#### Implementation of

[`ToolBuilder`](../interfaces/ToolBuilder.md).[`build`](../interfaces/ToolBuilder.md#build)

***

### buildAndExecute()

> **buildAndExecute**(`params`, `signal`, `updateOutput?`): `Promise`\<`TResult`\>

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:145](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L145)

A convenience method that builds and executes the tool in one step.

#### Parameters

##### params

`TParams`

##### signal

`AbortSignal`

##### updateOutput?

(`output`) => `void`

#### Returns

`Promise`\<`TResult`\>

#### Implementation of

[`ToolBuilder`](../interfaces/ToolBuilder.md).[`buildAndExecute`](../interfaces/ToolBuilder.md#buildandexecute)

***

### silentBuild()

> `private` **silentBuild**(`params`): `Error` \| [`ToolInvocation`](../interfaces/ToolInvocation.md)\<`TParams`, `TResult`\>

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:157](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L157)

Similar to `build` but never throws.

#### Parameters

##### params

`TParams`

#### Returns

`Error` \| [`ToolInvocation`](../interfaces/ToolInvocation.md)\<`TParams`, `TResult`\>

***

### validateBuildAndExecute()

> **validateBuildAndExecute**(`params`, `abortSignal`): `Promise`\<[`ToolFrameworkResult`](../interfaces/ToolFrameworkResult.md)\>

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:174](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L174)

A convenience method that builds and executes the tool in one step.
Never throws.

#### Parameters

##### params

`TParams`

##### abortSignal

`AbortSignal`

#### Returns

`Promise`\<[`ToolFrameworkResult`](../interfaces/ToolFrameworkResult.md)\>

#### Implementation of

[`ToolBuilder`](../interfaces/ToolBuilder.md).[`validateBuildAndExecute`](../interfaces/ToolBuilder.md#validatebuildandexecute)

***

### validateToolParams()

> **validateToolParams**(`_params`): `null` \| `string`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:131](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L131)

Validates the raw tool parameters.
Subclasses should override this to add custom validation logic
beyond the JSON schema check.

#### Parameters

##### \_params

`TParams`

#### Returns

`null` \| `string`

#### Implementation of

[`ToolBuilder`](../interfaces/ToolBuilder.md).[`validateToolParams`](../interfaces/ToolBuilder.md#validatetoolparams)

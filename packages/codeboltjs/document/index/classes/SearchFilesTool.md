[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / SearchFilesTool

# Class: SearchFilesTool

Defined in: [packages/codeboltjs/src/tools/search/search-files.ts:128](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/search/search-files.ts#L128)

Implementation of the SearchFiles tool logic

## Extends

- [`BaseDeclarativeTool`](BaseDeclarativeTool.md)\<`SearchFilesToolParams`, [`ToolFrameworkResult`](../interfaces/ToolFrameworkResult.md)\>

## Constructors

### Constructor

> **new SearchFilesTool**(): `SearchFilesTool`

Defined in: [packages/codeboltjs/src/tools/search/search-files.ts:134](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/search/search-files.ts#L134)

#### Returns

`SearchFilesTool`

#### Overrides

[`BaseDeclarativeTool`](BaseDeclarativeTool.md).[`constructor`](BaseDeclarativeTool.md#constructor)

## Properties

### canUpdateOutput

> `readonly` **canUpdateOutput**: `boolean` = `false`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:69](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L69)

Whether the tool supports live (streaming) output

#### Inherited from

[`BaseDeclarativeTool`](BaseDeclarativeTool.md).[`canUpdateOutput`](BaseDeclarativeTool.md#canupdateoutput)

***

### description

> `readonly` **description**: `string`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:65](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L65)

Description of what the tool does

#### Inherited from

[`BaseDeclarativeTool`](BaseDeclarativeTool.md).[`description`](BaseDeclarativeTool.md#description)

***

### displayName

> `readonly` **displayName**: `string`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:64](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L64)

The user-friendly display name of the tool

#### Inherited from

[`BaseDeclarativeTool`](BaseDeclarativeTool.md).[`displayName`](BaseDeclarativeTool.md#displayname)

***

### isOutputMarkdown

> `readonly` **isOutputMarkdown**: `boolean` = `true`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:68](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L68)

Whether the tool's output should be rendered as markdown

#### Inherited from

[`BaseDeclarativeTool`](BaseDeclarativeTool.md).[`isOutputMarkdown`](BaseDeclarativeTool.md#isoutputmarkdown)

***

### kind

> `readonly` **kind**: [`Kind`](../enumerations/Kind.md)

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:66](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L66)

The kind of tool for categorization and permissions

#### Inherited from

[`BaseDeclarativeTool`](BaseDeclarativeTool.md).[`kind`](BaseDeclarativeTool.md#kind)

***

### name

> `readonly` **name**: `string`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:63](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L63)

The internal name of the tool (used for API calls)

#### Inherited from

[`BaseDeclarativeTool`](BaseDeclarativeTool.md).[`name`](BaseDeclarativeTool.md#name)

***

### parameterSchema

> `readonly` **parameterSchema**: `unknown`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:67](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L67)

#### Inherited from

[`BaseDeclarativeTool`](BaseDeclarativeTool.md).[`parameterSchema`](BaseDeclarativeTool.md#parameterschema)

***

### Name

> `readonly` `static` **Name**: `string` = `'search_files'`

Defined in: [packages/codeboltjs/src/tools/search/search-files.ts:132](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/search/search-files.ts#L132)

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

#### Inherited from

[`BaseDeclarativeTool`](BaseDeclarativeTool.md).[`explanation`](BaseDeclarativeTool.md#explanation)

***

### genAISchema

#### Get Signature

> **get** **genAISchema**(): `FunctionDeclaration`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:118](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L118)

Get Google GenAI schema format (for backward compatibility)

##### Returns

`FunctionDeclaration`

Function declaration schema for Google GenAI (for backward compatibility)

#### Inherited from

[`BaseDeclarativeTool`](BaseDeclarativeTool.md).[`genAISchema`](BaseDeclarativeTool.md#genaischema)

***

### openAIFunctionCall

#### Get Signature

> **get** **openAIFunctionCall**(): [`OpenAIFunctionCall`](../interfaces/OpenAIFunctionCall.md)

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:102](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L102)

Get OpenAI function call format

##### Returns

[`OpenAIFunctionCall`](../interfaces/OpenAIFunctionCall.md)

#### Inherited from

[`BaseDeclarativeTool`](BaseDeclarativeTool.md).[`openAIFunctionCall`](BaseDeclarativeTool.md#openaifunctioncall)

***

### schema

#### Get Signature

> **get** **schema**(): [`OpenAIToolSchema`](../interfaces/OpenAIToolSchema.md)

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:83](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L83)

Primary schema format (OpenAI tool schema)

##### Returns

[`OpenAIToolSchema`](../interfaces/OpenAIToolSchema.md)

Primary schema format (OpenAI tool schema)

#### Inherited from

[`BaseDeclarativeTool`](BaseDeclarativeTool.md).[`schema`](BaseDeclarativeTool.md#schema)

## Methods

### build()

> **build**(`params`): [`ToolInvocation`](../interfaces/ToolInvocation.md)\<`SearchFilesToolParams`, [`ToolFrameworkResult`](../interfaces/ToolFrameworkResult.md)\>

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:215](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L215)

The core of the pattern. It validates parameters and, if successful,
returns a `ToolInvocation` object that encapsulates the logic for the
specific, validated call.

#### Parameters

##### params

`SearchFilesToolParams`

#### Returns

[`ToolInvocation`](../interfaces/ToolInvocation.md)\<`SearchFilesToolParams`, [`ToolFrameworkResult`](../interfaces/ToolFrameworkResult.md)\>

#### Inherited from

[`BaseDeclarativeTool`](BaseDeclarativeTool.md).[`build`](BaseDeclarativeTool.md#build)

***

### buildAndExecute()

> **buildAndExecute**(`params`, `signal`, `updateOutput?`): `Promise`\<[`ToolFrameworkResult`](../interfaces/ToolFrameworkResult.md)\>

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:145](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L145)

A convenience method that builds and executes the tool in one step.

#### Parameters

##### params

`SearchFilesToolParams`

##### signal

`AbortSignal`

##### updateOutput?

(`output`) => `void`

#### Returns

`Promise`\<[`ToolFrameworkResult`](../interfaces/ToolFrameworkResult.md)\>

#### Inherited from

[`BaseDeclarativeTool`](BaseDeclarativeTool.md).[`buildAndExecute`](BaseDeclarativeTool.md#buildandexecute)

***

### createInvocation()

> `protected` **createInvocation**(`params`): [`ToolInvocation`](../interfaces/ToolInvocation.md)\<`SearchFilesToolParams`, [`ToolFrameworkResult`](../interfaces/ToolFrameworkResult.md)\>

Defined in: [packages/codeboltjs/src/tools/search/search-files.ts:194](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/search/search-files.ts#L194)

#### Parameters

##### params

`SearchFilesToolParams`

#### Returns

[`ToolInvocation`](../interfaces/ToolInvocation.md)\<`SearchFilesToolParams`, [`ToolFrameworkResult`](../interfaces/ToolFrameworkResult.md)\>

#### Overrides

[`BaseDeclarativeTool`](BaseDeclarativeTool.md).[`createInvocation`](BaseDeclarativeTool.md#createinvocation)

***

### validateBuildAndExecute()

> **validateBuildAndExecute**(`params`, `abortSignal`): `Promise`\<[`ToolFrameworkResult`](../interfaces/ToolFrameworkResult.md)\>

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:174](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L174)

A convenience method that builds and executes the tool in one step.
Never throws.

#### Parameters

##### params

`SearchFilesToolParams`

##### abortSignal

`AbortSignal`

#### Returns

`Promise`\<[`ToolFrameworkResult`](../interfaces/ToolFrameworkResult.md)\>

#### Inherited from

[`BaseDeclarativeTool`](BaseDeclarativeTool.md).[`validateBuildAndExecute`](BaseDeclarativeTool.md#validatebuildandexecute)

***

### validateToolParams()

> **validateToolParams**(`params`): `null` \| `string`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:223](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L223)

Validates the raw tool parameters.
Subclasses should override this to add custom validation logic
beyond the JSON schema check.

#### Parameters

##### params

`SearchFilesToolParams`

#### Returns

`null` \| `string`

#### Inherited from

[`BaseDeclarativeTool`](BaseDeclarativeTool.md).[`validateToolParams`](BaseDeclarativeTool.md#validatetoolparams)

***

### validateToolParamValues()

> `protected` **validateToolParamValues**(`params`): `null` \| `string`

Defined in: [packages/codeboltjs/src/tools/search/search-files.ts:169](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/search/search-files.ts#L169)

#### Parameters

##### params

`SearchFilesToolParams`

#### Returns

`null` \| `string`

#### Overrides

[`BaseDeclarativeTool`](BaseDeclarativeTool.md).[`validateToolParamValues`](BaseDeclarativeTool.md#validatetoolparamvalues)

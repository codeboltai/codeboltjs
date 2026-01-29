[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / BaseDeclarativeTool

# Abstract Class: BaseDeclarativeTool\<TParams, TResult\>

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:211](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L211)

Base class for declarative tools with built-in validation

## Extends

- [`DeclarativeTool`](DeclarativeTool.md)\<`TParams`, `TResult`\>

## Extended by

- [`ReadFileTool`](ReadFileTool.md)
- [`WriteFileTool`](WriteFileTool.md)
- [`EditTool`](EditTool.md)
- [`ListDirectoryTool`](ListDirectoryTool.md)
- [`ReadManyFilesTool`](ReadManyFilesTool.md)
- [`GlobTool`](GlobTool.md)
- [`GrepTool`](GrepTool.md)
- [`SearchFilesTool`](SearchFilesTool.md)
- [`CodebaseSearchTool`](CodebaseSearchTool.md)
- [`SearchMcpToolTool`](SearchMcpToolTool.md)
- [`ListCodeDefinitionNamesTool`](ListCodeDefinitionNamesTool.md)
- [`ExecuteCommandTool`](ExecuteCommandTool.md)
- [`GitInitTool`](GitInitTool.md)
- [`GitStatusTool`](GitStatusTool.md)
- [`GitAddTool`](GitAddTool.md)
- [`GitCommitTool`](GitCommitTool.md)
- [`GitPushTool`](GitPushTool.md)
- [`GitPullTool`](GitPullTool.md)
- [`GitCheckoutTool`](GitCheckoutTool.md)
- [`GitBranchTool`](GitBranchTool.md)
- [`GitLogsTool`](GitLogsTool.md)
- [`GitDiffTool`](GitDiffTool.md)
- [`GitCloneTool`](GitCloneTool.md)
- [`BrowserNavigateTool`](BrowserNavigateTool.md)
- [`BrowserScreenshotTool`](BrowserScreenshotTool.md)
- [`BrowserClickTool`](BrowserClickTool.md)
- [`BrowserTypeTool`](BrowserTypeTool.md)
- [`BrowserScrollTool`](BrowserScrollTool.md)
- [`BrowserGetContentTool`](BrowserGetContentTool.md)
- [`BrowserGetHtmlTool`](BrowserGetHtmlTool.md)
- [`BrowserGetMarkdownTool`](BrowserGetMarkdownTool.md)
- [`BrowserGetUrlTool`](BrowserGetUrlTool.md)
- [`BrowserCloseTool`](BrowserCloseTool.md)
- [`BrowserEnterTool`](BrowserEnterTool.md)
- [`BrowserSearchTool`](BrowserSearchTool.md)
- [`TaskCreateTool`](TaskCreateTool.md)
- [`TaskUpdateTool`](TaskUpdateTool.md)
- [`TaskDeleteTool`](TaskDeleteTool.md)
- [`TaskListTool`](TaskListTool.md)
- [`TaskGetTool`](TaskGetTool.md)
- [`TaskAssignTool`](TaskAssignTool.md)
- [`TaskExecuteTool`](TaskExecuteTool.md)
- [`AgentFindTool`](AgentFindTool.md)
- [`AgentStartTool`](AgentStartTool.md)
- [`AgentListTool`](AgentListTool.md)
- [`AgentDetailsTool`](AgentDetailsTool.md)
- [`ThreadCreateTool`](ThreadCreateTool.md)
- [`ThreadCreateStartTool`](ThreadCreateStartTool.md)
- [`ThreadCreateBackgroundTool`](ThreadCreateBackgroundTool.md)
- [`ThreadListTool`](ThreadListTool.md)
- [`ThreadGetTool`](ThreadGetTool.md)
- [`ThreadStartTool`](ThreadStartTool.md)
- [`ThreadUpdateTool`](ThreadUpdateTool.md)
- [`ThreadDeleteTool`](ThreadDeleteTool.md)
- [`ThreadGetMessagesTool`](ThreadGetMessagesTool.md)
- [`ThreadUpdateStatusTool`](ThreadUpdateStatusTool.md)
- [`OrchestratorListTool`](OrchestratorListTool.md)
- [`OrchestratorGetTool`](OrchestratorGetTool.md)
- [`OrchestratorGetSettingsTool`](OrchestratorGetSettingsTool.md)
- [`OrchestratorCreateTool`](OrchestratorCreateTool.md)
- [`OrchestratorUpdateTool`](OrchestratorUpdateTool.md)
- [`OrchestratorUpdateSettingsTool`](OrchestratorUpdateSettingsTool.md)
- [`OrchestratorDeleteTool`](OrchestratorDeleteTool.md)
- [`OrchestratorUpdateStatusTool`](OrchestratorUpdateStatusTool.md)

## Type Parameters

### TParams

`TParams` *extends* `object`

### TResult

`TResult` *extends* [`ToolFrameworkResult`](../interfaces/ToolFrameworkResult.md)

## Constructors

### Constructor

> **new BaseDeclarativeTool**\<`TParams`, `TResult`\>(`name`, `displayName`, `description`, `kind`, `parameterSchema`, `isOutputMarkdown`, `canUpdateOutput`): `BaseDeclarativeTool`\<`TParams`, `TResult`\>

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

`BaseDeclarativeTool`\<`TParams`, `TResult`\>

#### Inherited from

[`DeclarativeTool`](DeclarativeTool.md).[`constructor`](DeclarativeTool.md#constructor)

## Properties

### canUpdateOutput

> `readonly` **canUpdateOutput**: `boolean` = `false`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:69](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L69)

Whether the tool supports live (streaming) output

#### Inherited from

[`DeclarativeTool`](DeclarativeTool.md).[`canUpdateOutput`](DeclarativeTool.md#canupdateoutput)

***

### description

> `readonly` **description**: `string`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:65](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L65)

Description of what the tool does

#### Inherited from

[`DeclarativeTool`](DeclarativeTool.md).[`description`](DeclarativeTool.md#description)

***

### displayName

> `readonly` **displayName**: `string`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:64](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L64)

The user-friendly display name of the tool

#### Inherited from

[`DeclarativeTool`](DeclarativeTool.md).[`displayName`](DeclarativeTool.md#displayname)

***

### isOutputMarkdown

> `readonly` **isOutputMarkdown**: `boolean` = `true`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:68](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L68)

Whether the tool's output should be rendered as markdown

#### Inherited from

[`DeclarativeTool`](DeclarativeTool.md).[`isOutputMarkdown`](DeclarativeTool.md#isoutputmarkdown)

***

### kind

> `readonly` **kind**: [`Kind`](../enumerations/Kind.md)

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:66](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L66)

The kind of tool for categorization and permissions

#### Inherited from

[`DeclarativeTool`](DeclarativeTool.md).[`kind`](DeclarativeTool.md#kind)

***

### name

> `readonly` **name**: `string`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:63](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L63)

The internal name of the tool (used for API calls)

#### Inherited from

[`DeclarativeTool`](DeclarativeTool.md).[`name`](DeclarativeTool.md#name)

***

### parameterSchema

> `readonly` **parameterSchema**: `unknown`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:67](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L67)

#### Inherited from

[`DeclarativeTool`](DeclarativeTool.md).[`parameterSchema`](DeclarativeTool.md#parameterschema)

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

[`DeclarativeTool`](DeclarativeTool.md).[`explanation`](DeclarativeTool.md#explanation)

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

[`DeclarativeTool`](DeclarativeTool.md).[`genAISchema`](DeclarativeTool.md#genaischema)

***

### openAIFunctionCall

#### Get Signature

> **get** **openAIFunctionCall**(): [`OpenAIFunctionCall`](../interfaces/OpenAIFunctionCall.md)

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:102](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L102)

Get OpenAI function call format

##### Returns

[`OpenAIFunctionCall`](../interfaces/OpenAIFunctionCall.md)

#### Inherited from

[`DeclarativeTool`](DeclarativeTool.md).[`openAIFunctionCall`](DeclarativeTool.md#openaifunctioncall)

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

[`DeclarativeTool`](DeclarativeTool.md).[`schema`](DeclarativeTool.md#schema)

## Methods

### build()

> **build**(`params`): [`ToolInvocation`](../interfaces/ToolInvocation.md)\<`TParams`, `TResult`\>

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:215](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L215)

The core of the pattern. It validates parameters and, if successful,
returns a `ToolInvocation` object that encapsulates the logic for the
specific, validated call.

#### Parameters

##### params

`TParams`

#### Returns

[`ToolInvocation`](../interfaces/ToolInvocation.md)\<`TParams`, `TResult`\>

#### Overrides

[`DeclarativeTool`](DeclarativeTool.md).[`build`](DeclarativeTool.md#build)

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

#### Inherited from

[`DeclarativeTool`](DeclarativeTool.md).[`buildAndExecute`](DeclarativeTool.md#buildandexecute)

***

### createInvocation()

> `abstract` `protected` **createInvocation**(`params`): [`ToolInvocation`](../interfaces/ToolInvocation.md)\<`TParams`, `TResult`\>

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:239](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L239)

#### Parameters

##### params

`TParams`

#### Returns

[`ToolInvocation`](../interfaces/ToolInvocation.md)\<`TParams`, `TResult`\>

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

#### Inherited from

[`DeclarativeTool`](DeclarativeTool.md).[`validateBuildAndExecute`](DeclarativeTool.md#validatebuildandexecute)

***

### validateToolParams()

> **validateToolParams**(`params`): `null` \| `string`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:223](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L223)

Validates the raw tool parameters.
Subclasses should override this to add custom validation logic
beyond the JSON schema check.

#### Parameters

##### params

`TParams`

#### Returns

`null` \| `string`

#### Overrides

[`DeclarativeTool`](DeclarativeTool.md).[`validateToolParams`](DeclarativeTool.md#validatetoolparams)

***

### validateToolParamValues()

> `protected` **validateToolParamValues**(`_params`): `null` \| `string`

Defined in: [packages/codeboltjs/src/tools/base-tool.ts:235](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/base-tool.ts#L235)

#### Parameters

##### \_params

`TParams`

#### Returns

`null` \| `string`

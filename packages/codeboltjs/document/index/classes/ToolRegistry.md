[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / ToolRegistry

# Class: ToolRegistry

Defined in: [packages/codeboltjs/src/tools/registry.ts:16](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/registry.ts#L16)

Registry for managing tools

## Constructors

### Constructor

> **new ToolRegistry**(): `ToolRegistry`

#### Returns

`ToolRegistry`

## Properties

### tools

> `private` **tools**: `Map`\<`string`, [`AnyDeclarativeTool`](../type-aliases/AnyDeclarativeTool.md)\>

Defined in: [packages/codeboltjs/src/tools/registry.ts:17](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/registry.ts#L17)

## Methods

### clear()

> **clear**(): `void`

Defined in: [packages/codeboltjs/src/tools/registry.ts:223](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/registry.ts#L223)

Clear all registered tools

#### Returns

`void`

***

### executeTool()

> **executeTool**(`name`, `params`, `signal?`, `updateOutput?`): `Promise`\<[`ToolFrameworkResult`](../interfaces/ToolFrameworkResult.md)\>

Defined in: [packages/codeboltjs/src/tools/registry.ts:119](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/registry.ts#L119)

Execute a tool by name with given parameters

#### Parameters

##### name

`string`

The name of the tool to execute

##### params

`object`

The parameters to pass to the tool

##### signal?

`AbortSignal`

Optional AbortSignal for cancellation

##### updateOutput?

(`output`) => `void`

Optional callback for streaming output

#### Returns

`Promise`\<[`ToolFrameworkResult`](../interfaces/ToolFrameworkResult.md)\>

The tool execution result

***

### executeToolWithConfirmation()

> **executeToolWithConfirmation**(`name`, `params`, `signal`, `onConfirmation`, `updateOutput?`): `Promise`\<[`ToolFrameworkResult`](../interfaces/ToolFrameworkResult.md)\>

Defined in: [packages/codeboltjs/src/tools/registry.ts:164](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/registry.ts#L164)

Execute a tool with confirmation support

#### Parameters

##### name

`string`

The name of the tool

##### params

`object`

The parameters to pass

##### signal

`AbortSignal`

AbortSignal for cancellation

##### onConfirmation

(`details`) => `Promise`\<`boolean`\>

Callback when confirmation is needed

##### updateOutput?

(`output`) => `void`

Optional callback for streaming output

#### Returns

`Promise`\<[`ToolFrameworkResult`](../interfaces/ToolFrameworkResult.md)\>

The tool execution result

***

### getAllTools()

> **getAllTools**(): [`AnyDeclarativeTool`](../type-aliases/AnyDeclarativeTool.md)[]

Defined in: [packages/codeboltjs/src/tools/registry.ts:71](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/registry.ts#L71)

Get all registered tools

#### Returns

[`AnyDeclarativeTool`](../type-aliases/AnyDeclarativeTool.md)[]

Array of all registered tools

***

### getFunctionCallSchemas()

> **getFunctionCallSchemas**(): [`OpenAIFunctionCall`](../interfaces/OpenAIFunctionCall.md)[]

Defined in: [packages/codeboltjs/src/tools/registry.ts:103](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/registry.ts#L103)

Get OpenAI function call schemas for all registered tools

#### Returns

[`OpenAIFunctionCall`](../interfaces/OpenAIFunctionCall.md)[]

Array of OpenAI function call schemas

***

### getTool()

> **getTool**(`name`): `undefined` \| [`AnyDeclarativeTool`](../type-aliases/AnyDeclarativeTool.md)

Defined in: [packages/codeboltjs/src/tools/registry.ts:54](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/registry.ts#L54)

Get a tool by name

#### Parameters

##### name

`string`

The name of the tool

#### Returns

`undefined` \| [`AnyDeclarativeTool`](../type-aliases/AnyDeclarativeTool.md)

The tool if found, undefined otherwise

***

### getToolCount()

> **getToolCount**(): `number`

Defined in: [packages/codeboltjs/src/tools/registry.ts:87](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/registry.ts#L87)

Get the count of registered tools

#### Returns

`number`

Number of registered tools

***

### getToolNames()

> **getToolNames**(): `string`[]

Defined in: [packages/codeboltjs/src/tools/registry.ts:79](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/registry.ts#L79)

Get the names of all registered tools

#### Returns

`string`[]

Array of tool names

***

### getToolSchemas()

> **getToolSchemas**(): [`OpenAIToolSchema`](../interfaces/OpenAIToolSchema.md)[]

Defined in: [packages/codeboltjs/src/tools/registry.ts:95](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/registry.ts#L95)

Get OpenAI tool schemas for all registered tools

#### Returns

[`OpenAIToolSchema`](../interfaces/OpenAIToolSchema.md)[]

Array of OpenAI tool schemas

***

### hasTool()

> **hasTool**(`name`): `boolean`

Defined in: [packages/codeboltjs/src/tools/registry.ts:63](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/registry.ts#L63)

Check if a tool is registered

#### Parameters

##### name

`string`

The name of the tool

#### Returns

`boolean`

true if the tool is registered

***

### registerTool()

> **registerTool**(`tool`): `void`

Defined in: [packages/codeboltjs/src/tools/registry.ts:23](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/registry.ts#L23)

Register a tool with the registry

#### Parameters

##### tool

[`AnyDeclarativeTool`](../type-aliases/AnyDeclarativeTool.md)

The tool to register

#### Returns

`void`

***

### registerTools()

> **registerTools**(`tools`): `void`

Defined in: [packages/codeboltjs/src/tools/registry.ts:34](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/registry.ts#L34)

Register multiple tools at once

#### Parameters

##### tools

[`AnyDeclarativeTool`](../type-aliases/AnyDeclarativeTool.md)[]

Array of tools to register

#### Returns

`void`

***

### unregisterTool()

> **unregisterTool**(`name`): `boolean`

Defined in: [packages/codeboltjs/src/tools/registry.ts:45](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/tools/registry.ts#L45)

Unregister a tool by name

#### Parameters

##### name

`string`

The name of the tool to unregister

#### Returns

`boolean`

true if the tool was found and removed

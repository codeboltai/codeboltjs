---
title: ToolRegistry
---

[**@codebolt/codeboltjs**](../index)

***

# Class: ToolRegistry

Defined in: [packages/codeboltjs/src/tools/registry.ts:16](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/tools/registry.ts#L16)

Registry for managing tools

## Constructors

### Constructor

```ts
new ToolRegistry(): ToolRegistry;
```

#### Returns

`ToolRegistry`

## Methods

### clear()

```ts
clear(): void;
```

Defined in: [packages/codeboltjs/src/tools/registry.ts:223](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/tools/registry.ts#L223)

Clear all registered tools

#### Returns

`void`

***

### executeTool()

```ts
executeTool(
   name: string, 
   params: object, 
   signal?: AbortSignal, 
updateOutput?: (output: string) => void): Promise<ToolFrameworkResult>;
```

Defined in: [packages/codeboltjs/src/tools/registry.ts:119](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/tools/registry.ts#L119)

Execute a tool by name with given parameters

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | The name of the tool to execute |
| `params` | `object` | The parameters to pass to the tool |
| `signal?` | `AbortSignal` | Optional AbortSignal for cancellation |
| `updateOutput?` | (`output`: `string`) => `void` | Optional callback for streaming output |

#### Returns

`Promise`\<[`ToolFrameworkResult`](../interfaces/ToolFrameworkResult)\>

The tool execution result

***

### executeToolWithConfirmation()

```ts
executeToolWithConfirmation(
   name: string, 
   params: object, 
   signal: AbortSignal, 
   onConfirmation: (details: any) => Promise<boolean>, 
updateOutput?: (output: string) => void): Promise<ToolFrameworkResult>;
```

Defined in: [packages/codeboltjs/src/tools/registry.ts:164](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/tools/registry.ts#L164)

Execute a tool with confirmation support

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | The name of the tool |
| `params` | `object` | The parameters to pass |
| `signal` | `AbortSignal` | AbortSignal for cancellation |
| `onConfirmation` | (`details`: `any`) => `Promise`\<`boolean`\> | Callback when confirmation is needed |
| `updateOutput?` | (`output`: `string`) => `void` | Optional callback for streaming output |

#### Returns

`Promise`\<[`ToolFrameworkResult`](../interfaces/ToolFrameworkResult)\>

The tool execution result

***

### getAllTools()

```ts
getAllTools(): AnyDeclarativeTool[];
```

Defined in: [packages/codeboltjs/src/tools/registry.ts:71](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/tools/registry.ts#L71)

Get all registered tools

#### Returns

[`AnyDeclarativeTool`](../type-aliases/AnyDeclarativeTool)[]

Array of all registered tools

***

### getFunctionCallSchemas()

```ts
getFunctionCallSchemas(): OpenAIFunctionCall[];
```

Defined in: [packages/codeboltjs/src/tools/registry.ts:103](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/tools/registry.ts#L103)

Get OpenAI function call schemas for all registered tools

#### Returns

[`OpenAIFunctionCall`](../interfaces/OpenAIFunctionCall)[]

Array of OpenAI function call schemas

***

### getTool()

```ts
getTool(name: string): 
  | undefined
  | AnyDeclarativeTool;
```

Defined in: [packages/codeboltjs/src/tools/registry.ts:54](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/tools/registry.ts#L54)

Get a tool by name

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | The name of the tool |

#### Returns

  \| `undefined`
  \| [`AnyDeclarativeTool`](../type-aliases/AnyDeclarativeTool)

The tool if found, undefined otherwise

***

### getToolCount()

```ts
getToolCount(): number;
```

Defined in: [packages/codeboltjs/src/tools/registry.ts:87](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/tools/registry.ts#L87)

Get the count of registered tools

#### Returns

`number`

Number of registered tools

***

### getToolNames()

```ts
getToolNames(): string[];
```

Defined in: [packages/codeboltjs/src/tools/registry.ts:79](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/tools/registry.ts#L79)

Get the names of all registered tools

#### Returns

`string`[]

Array of tool names

***

### getToolSchemas()

```ts
getToolSchemas(): OpenAIToolSchema[];
```

Defined in: [packages/codeboltjs/src/tools/registry.ts:95](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/tools/registry.ts#L95)

Get OpenAI tool schemas for all registered tools

#### Returns

[`OpenAIToolSchema`](../interfaces/OpenAIToolSchema)[]

Array of OpenAI tool schemas

***

### hasTool()

```ts
hasTool(name: string): boolean;
```

Defined in: [packages/codeboltjs/src/tools/registry.ts:63](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/tools/registry.ts#L63)

Check if a tool is registered

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | The name of the tool |

#### Returns

`boolean`

true if the tool is registered

***

### registerTool()

```ts
registerTool(tool: AnyDeclarativeTool): void;
```

Defined in: [packages/codeboltjs/src/tools/registry.ts:23](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/tools/registry.ts#L23)

Register a tool with the registry

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `tool` | [`AnyDeclarativeTool`](../type-aliases/AnyDeclarativeTool) | The tool to register |

#### Returns

`void`

***

### registerTools()

```ts
registerTools(tools: AnyDeclarativeTool[]): void;
```

Defined in: [packages/codeboltjs/src/tools/registry.ts:34](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/tools/registry.ts#L34)

Register multiple tools at once

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `tools` | [`AnyDeclarativeTool`](../type-aliases/AnyDeclarativeTool)[] | Array of tools to register |

#### Returns

`void`

***

### unregisterTool()

```ts
unregisterTool(name: string): boolean;
```

Defined in: [packages/codeboltjs/src/tools/registry.ts:45](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/tools/registry.ts#L45)

Unregister a tool by name

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | The name of the tool to unregister |

#### Returns

`boolean`

true if the tool was found and removed

[@codebolt/codeboltjs](README.md) / Exports

# @codebolt/codeboltjs

## Table of contents

### Variables

- [default](modules.md#default)

## Variables

### default

• `Const` **default**: `Object`

Object containing methods for interacting with Codebolt MCP (Model Context Protocol) tools.
Provides functionality to discover, list, and execute tools.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `configureToolBox` | (`name`: `string`, `config`: `any`) => `Promise`\<`any`\> | - |
| `executeTool` | (`toolbox`: `string`, `toolName`: `string`, `params`: `any`) => `Promise`\<`any`\> | - |
| `getEnabledToolBoxes` | () => `Promise`\<`any`\> | - |
| `getLocalToolBoxes` | () => `Promise`\<`any`\> | - |
| `getMentionedToolBoxes` | (`userMessage`: `UserMessage`) => `Promise`\<`any`\> | - |
| `getTools` | (`tools`: \{ `toolName`: `string` ; `toolbox`: `string`  }[]) => `Promise`\<`any`[]\> | - |
| `listToolsFromToolBoxes` | (`toolBoxes`: `string`[]) => `Promise`\<`any`\> | - |
| `searchAvailableToolBoxes` | (`query`: `string`) => `Promise`\<`any`\> | - |

#### Defined in

[tools.ts:8](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/modules/tools.ts#L8)

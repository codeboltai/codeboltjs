[@codebolt/codeboltjs](README.md) / Exports

# @codebolt/codeboltjs

## Table of contents

### Variables

- [default](modules.md#default)

## Variables

### default

• `Const` **default**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `addToAgentState` | (`key`: `string`, `value`: `string`) => `Promise`\<`AddToAgentStateResponse`\> | - |
| `getAgentState` | () => `Promise`\<`GetAgentStateResponse`\> | - |
| `getApplicationState` | () => `Promise`\<`ApplicationState`\> | - |
| `getProjectState` | () => `Promise`\<`any`\> | - |
| `updateProjectState` | (`key`: `string`, `value`: `any`) => `Promise`\<`any`\> | - |

#### Defined in

[state.ts:4](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/modules/state.ts#L4)

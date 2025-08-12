[@codebolt/codeboltjs](README.md) / Exports

# @codebolt/codeboltjs

## Table of contents

### Variables

- [default](modules.md#default)

## Variables

### default

• `Const` **default**: `Object`

A module for interacting with project settings and paths.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `getEditorFileStatus` | () => `Promise`\<`any`\> | - |
| `getProjectPath` | () => `Promise`\<`GetProjectPathResponse`\> | - |
| `getProjectSettings` | () => `Promise`\<`any`\> | - |
| `getRepoMap` | (`message`: `any`) => `Promise`\<`GetProjectPathResponse`\> | - |
| `runProject` | () => `void` | - |

#### Defined in

[project.ts:6](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/modules/project.ts#L6)

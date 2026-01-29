[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [project.ts:8](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/project.ts#L8)

A module for interacting with project settings and paths.

## Type Declaration

### getEditorFileStatus()

> **getEditorFileStatus**: () => `Promise`\<`any`\>

#### Returns

`Promise`\<`any`\>

### getProjectPath()

> **getProjectPath**: () => `Promise`\<`GetProjectPathResponse`\>

Retrieves the path of the current project.

#### Returns

`Promise`\<`GetProjectPathResponse`\>

A promise that resolves with the project path response.

### getProjectSettings()

> **getProjectSettings**: () => `Promise`\<`GetProjectSettingsResponse`\>

Retrieves the project settings from the server.

#### Returns

`Promise`\<`GetProjectSettingsResponse`\>

A promise that resolves with the project settings response.

### getRepoMap()

> **getRepoMap**: (`message`) => `Promise`\<`GetProjectPathResponse`\>

#### Parameters

##### message

`any`

#### Returns

`Promise`\<`GetProjectPathResponse`\>

### runProject()

> **runProject**: () => `void`

#### Returns

`void`

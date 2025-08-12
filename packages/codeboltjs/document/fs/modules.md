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
| `createFile` | (`fileName`: `string`, `source`: `string`, `filePath`: `string`) => `Promise`\<`CreateFileResponse`\> | - |
| `createFolder` | (`folderName`: `string`, `folderPath`: `string`) => `Promise`\<`CreateFolderResponse`\> | - |
| `deleteFile` | (`filename`: `string`, `filePath`: `string`) => `Promise`\<`DeleteFileResponse`\> | - |
| `deleteFolder` | (`foldername`: `string`, `folderpath`: `string`) => `Promise`\<`DeleteFolderResponse`\> | - |
| `editFileWithDiff` | (`targetFile`: `string`, `codeEdit`: `string`, `diffIdentifier`: `string`, `prompt`: `string`, `applyModel?`: `string`) => `Promise`\<\{ `result`: `any` ; `success`: `boolean`  }\> | - |
| `fileSearch` | (`query`: `string`) => `Promise`\<\{ `result`: `any` ; `success`: `boolean`  }\> | - |
| `grepSearch` | (`path`: `string`, `query`: `string`, `includePattern?`: `string`, `excludePattern?`: `string`, `caseSensitive`: `boolean`) => `Promise`\<\{ `result`: `any` ; `success`: `boolean`  }\> | - |
| `listCodeDefinitionNames` | (`path`: `string`) => `Promise`\<\{ `result`: `any` ; `success`: `boolean`  }\> | - |
| `listFile` | (`folderPath`: `string`, `isRecursive`: `boolean`) => `Promise`\<`any`\> | - |
| `readFile` | (`filePath`: `string`) => `Promise`\<`ReadFileResponse`\> | - |
| `searchFiles` | (`path`: `string`, `regex`: `string`, `filePattern`: `string`) => `Promise`\<\{ `result`: `any` ; `success`: `boolean`  }\> | - |
| `updateFile` | (`filename`: `string`, `filePath`: `string`, `newContent`: `string`) => `Promise`\<`UpdateFileResponse`\> | - |
| `writeToFile` | (`relPath`: `string`, `newContent`: `string`) => `Promise`\<`any`\> | - |

#### Defined in

[fs.ts:7](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/modules/fs.ts#L7)

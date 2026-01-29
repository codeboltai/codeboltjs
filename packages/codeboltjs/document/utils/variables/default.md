[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [utils.ts:6](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/utils.ts#L6)

## Type Declaration

### editFileAndApplyDiff()

> **editFileAndApplyDiff**: (`filePath`, `diff`, `diffIdentifier`, `prompt`, `applyModel?`) => `Promise`\<`FsEditFileAndApplyDiffResponse`\>

Edits a file and applies a diff with AI assistance.

#### Parameters

##### filePath

`string`

The path to the file to edit.

##### diff

`string`

The diff to apply.

##### diffIdentifier

`string`

The identifier for the diff.

##### prompt

`string`

The prompt for the AI model.

##### applyModel?

`string`

Optional model to use for applying the diff.

#### Returns

`Promise`\<`FsEditFileAndApplyDiffResponse`\>

A promise that resolves with the edit response.

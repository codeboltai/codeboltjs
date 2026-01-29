---
title: utils
---

[**@codebolt/codeboltjs**](../index)

***

# Variable: utils

```ts
const utils: {
  editFileAndApplyDiff: (filePath: string, diff: string, diffIdentifier: string, prompt: string, applyModel?: string) => Promise<FsEditFileAndApplyDiffResponse>;
};
```

Defined in: [packages/codeboltjs/src/modules/utils.ts:6](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/utils.ts#L6)

## Type Declaration

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="editfileandapplydiff"></a> `editFileAndApplyDiff()` | (`filePath`: `string`, `diff`: `string`, `diffIdentifier`: `string`, `prompt`: `string`, `applyModel?`: `string`) => `Promise`\<`FsEditFileAndApplyDiffResponse`\> | Edits a file and applies a diff with AI assistance. | [packages/codeboltjs/src/modules/utils.ts:17](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/utils.ts#L17) |

---
title: utils
---

[**@codebolt/codeboltjs**](../README)

***

# Variable: utils

```ts
const utils: {
  editFileAndApplyDiff: (filePath: string, diff: string, diffIdentifier: string, prompt: string, applyModel?: string) => Promise<FsEditFileAndApplyDiffResponse>;
};
```

Defined in: [packages/codeboltjs/src/modules/utils.ts:6](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/utils.ts#L6)

## Type Declaration

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="editfileandapplydiff"></a> `editFileAndApplyDiff()` | (`filePath`: `string`, `diff`: `string`, `diffIdentifier`: `string`, `prompt`: `string`, `applyModel?`: `string`) => `Promise`\<`FsEditFileAndApplyDiffResponse`\> | Edits a file and applies a diff with AI assistance. | [packages/codeboltjs/src/modules/utils.ts:17](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/modules/utils.ts#L17) |

---
title: editFileAndApplyDiff
---

[**@codebolt/codeboltjs**](../README)

***

# Function: editFileAndApplyDiff()

```ts
function editFileAndApplyDiff(
   filePath: string, 
   diff: string, 
   diffIdentifier: string, 
   prompt: string, 
applyModel?: string): Promise<FsEditFileAndApplyDiffResponse>;
```

Defined in: [packages/codeboltjs/src/index.ts:405](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/index.ts#L405)

## Parameters

| Parameter | Type |
| ------ | ------ |
| `filePath` | `string` |
| `diff` | `string` |
| `diffIdentifier` | `string` |
| `prompt` | `string` |
| `applyModel?` | `string` |

## Returns

`Promise`\<`FsEditFileAndApplyDiffResponse`\>

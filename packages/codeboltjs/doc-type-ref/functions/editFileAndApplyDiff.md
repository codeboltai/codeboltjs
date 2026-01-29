---
title: editFileAndApplyDiff
---

[**@codebolt/codeboltjs**](../index)

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

Defined in: [packages/codeboltjs/src/index.ts:405](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/index.ts#L405)

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

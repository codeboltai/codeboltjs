---
title: GitCommitRequestNotify
---

[**@codebolt/codeboltjs**](../README)

***

# Function: GitCommitRequestNotify()

```ts
function GitCommitRequestNotify(
   path?: string, 
   message?: string, 
   toolUseId?: string): void;
```

Defined in: [packages/codeboltjs/src/notificationfunctions/git.ts:305](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/notificationfunctions/git.ts#L305)

Sends a git commit request notification

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path?` | `string` | Optional path where to perform git commit |
| `message?` | `string` | Optional commit message |
| `toolUseId?` | `string` | Optional custom toolUseId, will be generated if not provided |

## Returns

`void`

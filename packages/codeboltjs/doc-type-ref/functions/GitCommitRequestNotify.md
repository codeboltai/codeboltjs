---
title: GitCommitRequestNotify
---

[**@codebolt/codeboltjs**](../index)

***

# Function: GitCommitRequestNotify()

```ts
function GitCommitRequestNotify(
   path?: string, 
   message?: string, 
   toolUseId?: string): void;
```

Defined in: [packages/codeboltjs/src/notificationfunctions/git.ts:305](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/notificationfunctions/git.ts#L305)

Sends a git commit request notification

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path?` | `string` | Optional path where to perform git commit |
| `message?` | `string` | Optional commit message |
| `toolUseId?` | `string` | Optional custom toolUseId, will be generated if not provided |

## Returns

`void`

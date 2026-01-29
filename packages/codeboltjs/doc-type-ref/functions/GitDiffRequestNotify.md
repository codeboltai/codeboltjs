---
title: GitDiffRequestNotify
---

[**@codebolt/codeboltjs**](../index)

***

# Function: GitDiffRequestNotify()

```ts
function GitDiffRequestNotify(path?: string, toolUseId?: string): void;
```

Defined in: [packages/codeboltjs/src/notificationfunctions/git.ts:513](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/notificationfunctions/git.ts#L513)

Sends a git diff request notification

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path?` | `string` | Optional path where to get git diff |
| `toolUseId?` | `string` | Optional custom toolUseId, will be generated if not provided |

## Returns

`void`

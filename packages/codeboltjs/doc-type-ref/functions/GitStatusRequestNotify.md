---
title: GitStatusRequestNotify
---

[**@codebolt/codeboltjs**](../index)

***

# Function: GitStatusRequestNotify()

```ts
function GitStatusRequestNotify(path?: string, toolUseId?: string): void;
```

Defined in: [packages/codeboltjs/src/notificationfunctions/git.ts:201](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/notificationfunctions/git.ts#L201)

Sends a git status request notification

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path?` | `string` | Optional path where to check git status |
| `toolUseId?` | `string` | Optional custom toolUseId, will be generated if not provided |

## Returns

`void`

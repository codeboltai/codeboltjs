---
title: GitPushRequestNotify
---

[**@codebolt/codeboltjs**](../index)

***

# Function: GitPushRequestNotify()

```ts
function GitPushRequestNotify(path?: string, toolUseId?: string): void;
```

Defined in: [packages/codeboltjs/src/notificationfunctions/git.ts:151](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/notificationfunctions/git.ts#L151)

Sends a git push request notification

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path?` | `string` | Optional path where to perform the git push |
| `toolUseId?` | `string` | Optional custom toolUseId, will be generated if not provided |

## Returns

`void`

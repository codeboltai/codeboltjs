---
title: GitPushRequestNotify
---

[**@codebolt/codeboltjs**](../README)

***

# Function: GitPushRequestNotify()

```ts
function GitPushRequestNotify(path?: string, toolUseId?: string): void;
```

Defined in: [packages/codeboltjs/src/notificationfunctions/git.ts:151](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/notificationfunctions/git.ts#L151)

Sends a git push request notification

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path?` | `string` | Optional path where to perform the git push |
| `toolUseId?` | `string` | Optional custom toolUseId, will be generated if not provided |

## Returns

`void`

---
title: GitCloneRequestNotify
---

[**@codebolt/codeboltjs**](../README)

***

# Function: GitCloneRequestNotify()

```ts
function GitCloneRequestNotify(
   repoUrl: string, 
   targetPath?: string, 
   toolUseId?: string): void;
```

Defined in: [packages/codeboltjs/src/notificationfunctions/git.ts:676](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/notificationfunctions/git.ts#L676)

Sends a git clone request notification

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `repoUrl` | `string` | URL of the repository to clone |
| `targetPath?` | `string` | Optional target path for the cloned repository |
| `toolUseId?` | `string` | Optional custom toolUseId, will be generated if not provided |

## Returns

`void`

---
title: GitBranchRequestNotify
---

[**@codebolt/codeboltjs**](../README)

***

# Function: GitBranchRequestNotify()

```ts
function GitBranchRequestNotify(
   path?: string, 
   branchName?: string, 
   toolUseId?: string): void;
```

Defined in: [packages/codeboltjs/src/notificationfunctions/git.ts:411](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/notificationfunctions/git.ts#L411)

Sends a git branch request notification

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path?` | `string` | Optional path where to perform git branch operation |
| `branchName?` | `string` | Optional branch name to create or list |
| `toolUseId?` | `string` | Optional custom toolUseId, will be generated if not provided |

## Returns

`void`

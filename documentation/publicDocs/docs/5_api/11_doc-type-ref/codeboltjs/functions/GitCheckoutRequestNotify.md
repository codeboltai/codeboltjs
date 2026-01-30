---
title: GitCheckoutRequestNotify
---

[**@codebolt/codeboltjs**](../README)

***

# Function: GitCheckoutRequestNotify()

```ts
function GitCheckoutRequestNotify(
   path?: string, 
   branchName?: string, 
   toolUseId?: string): void;
```

Defined in: [packages/codeboltjs/src/notificationfunctions/git.ts:358](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/notificationfunctions/git.ts#L358)

Sends a git checkout request notification

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path?` | `string` | Optional path where to perform git checkout |
| `branchName?` | `string` | Optional branch name to checkout |
| `toolUseId?` | `string` | Optional custom toolUseId, will be generated if not provided |

## Returns

`void`

---
title: GitRemoteAddRequestNotify
---

[**@codebolt/codeboltjs**](../index)

***

# Function: GitRemoteAddRequestNotify()

```ts
function GitRemoteAddRequestNotify(
   remoteName: string, 
   remoteUrl: string, 
   path?: string, 
   toolUseId?: string): void;
```

Defined in: [packages/codeboltjs/src/notificationfunctions/git.ts:621](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/notificationfunctions/git.ts#L621)

Sends a git remote add request notification

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `remoteName` | `string` | Name of the remote to add |
| `remoteUrl` | `string` | URL of the remote repository |
| `path?` | `string` | Optional path where to add the remote |
| `toolUseId?` | `string` | Optional custom toolUseId, will be generated if not provided |

## Returns

`void`

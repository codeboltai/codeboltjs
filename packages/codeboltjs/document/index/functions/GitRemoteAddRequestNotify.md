[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / GitRemoteAddRequestNotify

# Function: GitRemoteAddRequestNotify()

> **GitRemoteAddRequestNotify**(`remoteName`, `remoteUrl`, `path?`, `toolUseId?`): `void`

Defined in: [packages/codeboltjs/src/notificationfunctions/git.ts:621](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/notificationfunctions/git.ts#L621)

Sends a git remote add request notification

## Parameters

### remoteName

`string`

Name of the remote to add

### remoteUrl

`string`

URL of the remote repository

### path?

`string`

Optional path where to add the remote

### toolUseId?

`string`

Optional custom toolUseId, will be generated if not provided

## Returns

`void`

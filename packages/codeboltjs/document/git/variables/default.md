[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [git.ts:22](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/git.ts#L22)

A service for interacting with Git operations via WebSocket messages.

## Type Declaration

### addAll()

> **addAll**: () => `Promise`\<`AddResponse`\>

Adds changes in the local repository to the staging area at the given path.

#### Returns

`Promise`\<`AddResponse`\>

A promise that resolves with the response from the add event.

### branch()

> **branch**: (`branch`) => `Promise`\<`GitBranchResponse`\>

Creates a new branch in the local repository at the given path.

#### Parameters

##### branch

`string`

The name of the new branch to create.

#### Returns

`Promise`\<`GitBranchResponse`\>

A promise that resolves with the response from the branch event.

### checkout()

> **checkout**: (`branch`) => `Promise`\<`GitCheckoutResponse`\>

Checks out a branch or commit in the local repository at the given path.

#### Parameters

##### branch

`string`

The name of the branch or commit to check out.

#### Returns

`Promise`\<`GitCheckoutResponse`\>

A promise that resolves with the response from the checkout event.

### clone()

> **clone**: (`url`, `path?`) => `Promise`\<`GitCloneResponse`\>

Clones a remote Git repository to the specified path.

#### Parameters

##### url

`string`

The URL of the remote repository to clone.

##### path?

`string`

The file system path where the repository should be cloned.

#### Returns

`Promise`\<`GitCloneResponse`\>

A promise that resolves with the response from the clone event.

### commit()

> **commit**: (`message`) => `Promise`\<`GitCommitResponse`\>

Commits the staged changes in the local repository with the given commit message.

#### Parameters

##### message

`string`

The commit message to use for the commit.

#### Returns

`Promise`\<`GitCommitResponse`\>

A promise that resolves with the response from the commit event.

### diff()

> **diff**: (`commitHash`) => `Promise`\<`GitDiffResponse`\>

Retrieves the diff of changes for a specific commit in the local repository.

#### Parameters

##### commitHash

`string`

The hash of the commit to retrieve the diff for.

#### Returns

`Promise`\<`GitDiffResponse`\>

A promise that resolves with the response from the diff event.

### init()

> **init**: (`path`) => `Promise`\<`GitInitResponse`\>

Initializes a new Git repository at the given path.

#### Parameters

##### path

`string`

The file system path where the Git repository should be initialized.

#### Returns

`Promise`\<`GitInitResponse`\>

A promise that resolves with the response from the init event.

### logs()

> **logs**: (`path`) => `Promise`\<`GitLogsResponse`\>

Retrieves the commit logs for the local repository at the given path.

#### Parameters

##### path

`string`

The file system path of the local Git repository.

#### Returns

`Promise`\<`GitLogsResponse`\>

A promise that resolves with the response from the logs event.

### pull()

> **pull**: () => `Promise`\<`GitPullResponse`\>

Pulls the latest changes from the remote repository to the local repository at the given path.

#### Returns

`Promise`\<`GitPullResponse`\>

A promise that resolves with the response from the pull event.

### push()

> **push**: () => `Promise`\<`GitPushResponse`\>

Pushes local repository changes to the remote repository at the given path.

#### Returns

`Promise`\<`GitPushResponse`\>

A promise that resolves with the response from the push event.

### status()

> **status**: () => `Promise`\<`GitStatusResponse`\>

Retrieves the status of the local repository at the given path.

#### Returns

`Promise`\<`GitStatusResponse`\>

A promise that resolves with the response from the status event.

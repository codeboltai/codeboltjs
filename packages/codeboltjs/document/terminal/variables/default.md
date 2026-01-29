[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [terminal.ts:30](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/terminal.ts#L30)

A module for executing commands in a terminal-like environment via WebSocket.

## Type Declaration

### eventEmitter

> **eventEmitter**: `CustomEventEmitter`

### executeCommand()

> **executeCommand**: (`command`, `returnEmptyStringOnSuccess`) => `Promise`\<`CommandOutput` \| `CommandError` \| `CommandFinish`\>

Executes a given command and returns the result.
Listens for messages from the WebSocket that indicate the output, error, or finish state
of the executed command and resolves the promise accordingly.

#### Parameters

##### command

`string`

The command to be executed.

##### returnEmptyStringOnSuccess

`boolean` = `false`

#### Returns

`Promise`\<`CommandOutput` \| `CommandError` \| `CommandFinish`\>

A promise that resolves with the command's output, error, or finish signal.

### executeCommandRunUntilError()

> **executeCommandRunUntilError**: (`command`, `executeInMain`) => `Promise`\<`CommandError`\>

Executes a given command and keeps running until an error occurs.
Listens for messages from the WebSocket and resolves the promise when an error is encountered.

#### Parameters

##### command

`string`

The command to be executed.

##### executeInMain

`boolean` = `false`

#### Returns

`Promise`\<`CommandError`\>

A promise that resolves when an error occurs during command execution.

### executeCommandRunUntilInterrupt()

> **executeCommandRunUntilInterrupt**: (`command`, `executeInMain`) => `Promise`\<`CommandError`\>

Executes a given command and keeps running until manually interrupted.
Listens for messages from the WebSocket and resolves the promise when interrupted.

#### Parameters

##### command

`string`

The command to be executed.

##### executeInMain

`boolean` = `false`

Whether to execute in main terminal.

#### Returns

`Promise`\<`CommandError`\>

A promise that resolves when the command is interrupted.

### executeCommandWithStream()

> **executeCommandWithStream**(`command`, `executeInMain`): `CustomEventEmitter`

Executes a given command and streams the output.
Listens for messages from the WebSocket and streams the output data.

#### Parameters

##### command

`string`

The command to be executed.

##### executeInMain

`boolean` = `false`

#### Returns

`CustomEventEmitter`

A promise that streams the output data during command execution.

### sendManualInterrupt()

> **sendManualInterrupt**(): `Promise`\<`TerminalInterruptResponse`\>

Sends a manual interrupt signal to the terminal.

#### Returns

`Promise`\<`TerminalInterruptResponse`\>

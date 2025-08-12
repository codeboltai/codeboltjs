[@codebolt/codeboltjs](README.md) / Exports

# @codebolt/codeboltjs

## Table of contents

### Variables

- [default](modules.md#default)

## Variables

### default

• `Const` **default**: `Object`

A module for executing commands in a terminal-like environment via WebSocket.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventEmitter` | `CustomEventEmitter` | - |
| `executeCommand` | (`command`: `string`, `returnEmptyStringOnSuccess`: `boolean`) => `Promise`\<`any`\> | - |
| `executeCommandRunUntilError` | (`command`: `string`, `executeInMain`: `boolean`) => `Promise`\<`CommandError`\> | - |
| `executeCommandWithStream` | (`command`: `string`, `executeInMain`: `boolean`) => `CustomEventEmitter` | Executes a given command and streams the output. Listens for messages from the WebSocket and streams the output data. |
| `sendManualInterrupt` | () => `Promise`\<`TerminalInterruptResponse`\> | Sends a manual interrupt signal to the terminal. |

#### Defined in

[terminal.ts:13](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/modules/terminal.ts#L13)

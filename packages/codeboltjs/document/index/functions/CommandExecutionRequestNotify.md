[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / CommandExecutionRequestNotify

# Function: CommandExecutionRequestNotify()

> **CommandExecutionRequestNotify**(`command`, `returnEmptyStringOnSuccess?`, `executeInMain?`, `toolUseId?`): `void`

Defined in: [packages/codeboltjs/src/notificationfunctions/terminal.ts:32](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/notificationfunctions/terminal.ts#L32)

Sends a command execution request notification

## Parameters

### command

`string`

The command to execute

### returnEmptyStringOnSuccess?

`boolean`

Optional flag to return empty string on success

### executeInMain?

`boolean`

Optional flag to execute in main terminal

### toolUseId?

`string`

Optional custom toolUseId, will be generated if not provided

## Returns

`void`

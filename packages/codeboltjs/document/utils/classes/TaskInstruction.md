[@codebolt/codeboltjs](../README.md) / [Exports](../modules.md) / TaskInstruction

# Class: TaskInstruction

Class representing a task instruction.
Handles loading task data and converting it to prompts.

## Table of contents

### Constructors

- [constructor](TaskInstruction.md#constructor)

### Properties

- [filepath](TaskInstruction.md#filepath)
- [refsection](TaskInstruction.md#refsection)
- [tools](TaskInstruction.md#tools)
- [userMessage](TaskInstruction.md#usermessage)
- [userMessages](TaskInstruction.md#usermessages)

### Methods

- [toPrompt](TaskInstruction.md#toprompt)

## Constructors

### constructor

• **new TaskInstruction**(`tools?`, `userMessage`, `filepath?`, `refsection?`): [`TaskInstruction`](TaskInstruction.md)

Creates a new TaskInstruction instance.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `tools` | `Tools` | `{}` | Tools available for this task |
| `userMessage` | [`UserMessage`](UserMessage.md) | `undefined` | User message containing task instructions |
| `filepath` | `string` | `""` | Path to the YAML file with task data |
| `refsection` | `string` | `""` | Section name within the YAML file |

#### Returns

[`TaskInstruction`](TaskInstruction.md)

#### Defined in

[src/agentlib/taskInstruction.ts:74](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/taskInstruction.ts#L74)

## Properties

### filepath

• **filepath**: `string`

Path to the YAML file with task instructions

#### Defined in

[src/agentlib/taskInstruction.ts:62](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/taskInstruction.ts#L62)

___

### refsection

• **refsection**: `string`

The section reference within the YAML file

#### Defined in

[src/agentlib/taskInstruction.ts:64](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/taskInstruction.ts#L64)

___

### tools

• **tools**: `Tools`

Available tools for the task

#### Defined in

[src/agentlib/taskInstruction.ts:56](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/taskInstruction.ts#L56)

___

### userMessage

• **userMessage**: [`UserMessage`](UserMessage.md)

The user message object containing input

#### Defined in

[src/agentlib/taskInstruction.ts:60](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/taskInstruction.ts#L60)

___

### userMessages

• **userMessages**: `UserMessageContent`[] = `[]`

Messages from the user for this task

#### Defined in

[src/agentlib/taskInstruction.ts:58](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/taskInstruction.ts#L58)

## Methods

### toPrompt

▸ **toPrompt**(): `Promise`\<`UserMessages`[]\>

Converts the task instruction to a prompt format.
Loads data from YAML file and combines with user message.

#### Returns

`Promise`\<`UserMessages`[]\>

Promise with an array of user message content blocks

**`Throws`**

Error if there's an issue processing the task instruction

#### Defined in

[src/agentlib/taskInstruction.ts:88](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/taskInstruction.ts#L88)

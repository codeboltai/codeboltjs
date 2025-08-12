[@codebolt/codeboltjs](../README.md) / [Exports](../modules.md) / UserMessage

# Class: UserMessage

Class that processes and manages user messages.
Handles converting messages to prompts and extracting mentioned entities.

## Table of contents

### Constructors

- [constructor](UserMessage.md#constructor)

### Properties

- [mentionedMCPs](UserMessage.md#mentionedmcps)
- [message](UserMessage.md#message)
- [promptOverride](UserMessage.md#promptoverride)
- [userMessages](UserMessage.md#usermessages)

### Methods

- [getEnvironmentDetail](UserMessage.md#getenvironmentdetail)
- [getFiles](UserMessage.md#getfiles)
- [getMentionedAgents](UserMessage.md#getmentionedagents)
- [getMentionedMcps](UserMessage.md#getmentionedmcps)
- [getMentionedMcpsTools](UserMessage.md#getmentionedmcpstools)
- [toPrompt](UserMessage.md#toprompt)

## Constructors

### constructor

• **new UserMessage**(`message`, `promptOverride?`): [`UserMessage`](UserMessage.md)

Creates a new UserMessage instance.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `message` | `Message` | `undefined` | The message content and metadata |
| `promptOverride` | `boolean` | `false` | Whether to override default prompt generation |

#### Returns

[`UserMessage`](UserMessage.md)

#### Defined in

[usermessage.ts:77](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/usermessage.ts#L77)

## Properties

### mentionedMCPs

• **mentionedMCPs**: `string`[]

List of MCP tools mentioned in the message

#### Defined in

[usermessage.ts:69](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/usermessage.ts#L69)

___

### message

• **message**: `Message`

The message content and metadata

#### Defined in

[usermessage.ts:63](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/usermessage.ts#L63)

___

### promptOverride

• **promptOverride**: `boolean`

Whether to override the default prompt generation

#### Defined in

[usermessage.ts:65](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/usermessage.ts#L65)

___

### userMessages

• **userMessages**: [`UserMessageContent`](../interfaces/UserMessageContent.md)[]

Array of content blocks for the user message

#### Defined in

[usermessage.ts:67](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/usermessage.ts#L67)

## Methods

### getEnvironmentDetail

▸ **getEnvironmentDetail**(`cwd`): `Promise`\<`string`\>

Gets environment details for the current working directory.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cwd` | `string` | The current working directory path |

#### Returns

`Promise`\<`string`\>

Promise with a string containing environment details

#### Defined in

[usermessage.ts:177](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/usermessage.ts#L177)

___

### getFiles

▸ **getFiles**(): `void`

Gets files mentioned in the message.
Currently a placeholder for implementation.

#### Returns

`void`

#### Defined in

[usermessage.ts:89](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/usermessage.ts#L89)

___

### getMentionedAgents

▸ **getMentionedAgents**(): `agent`[]

Gets agents mentioned in the message.

#### Returns

`agent`[]

Array of agent objects

#### Defined in

[usermessage.ts:139](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/usermessage.ts#L139)

___

### getMentionedMcps

▸ **getMentionedMcps**(): `string`[]

Gets MCP tools mentioned in the message.

#### Returns

`string`[]

Array of MCP tool names

#### Defined in

[usermessage.ts:149](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/usermessage.ts#L149)

___

### getMentionedMcpsTools

▸ **getMentionedMcpsTools**(): `Promise`\<`any`\>

Gets MCP tools in a format suitable for the LLM.

#### Returns

`Promise`\<`any`\>

Promise with an array of MCP tools

#### Defined in

[usermessage.ts:158](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/usermessage.ts#L158)

___

### toPrompt

▸ **toPrompt**(`bAttachFiles?`, `bAttachImages?`, `bAttachEnvironment?`): `Promise`\<[`UserMessageContent`](../interfaces/UserMessageContent.md)[]\>

Converts the user message to a prompt format.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `bAttachFiles` | `boolean` | `true` | Whether to attach file contents |
| `bAttachImages` | `boolean` | `true` | Whether to attach images |
| `bAttachEnvironment` | `boolean` | `true` | Whether to attach environment details |

#### Returns

`Promise`\<[`UserMessageContent`](../interfaces/UserMessageContent.md)[]\>

Promise with an array of content blocks for the prompt

#### Defined in

[usermessage.ts:101](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/agentlib/usermessage.ts#L101)

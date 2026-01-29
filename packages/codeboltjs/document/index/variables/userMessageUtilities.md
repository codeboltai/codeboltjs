[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / userMessageUtilities

# Variable: userMessageUtilities

> `const` **userMessageUtilities**: `object`

Defined in: [packages/codeboltjs/src/modules/user-message-utilities.ts:11](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/user-message-utilities.ts#L11)

User message utilities for accessing current user message and context

## Type Declaration

### clear()

> **clear**: () => `void`

Clear current user message

#### Returns

`void`

### getCurrent()

> **getCurrent**: () => `undefined` \| `FlatUserMessage`

Get the current user message object

#### Returns

`undefined` \| `FlatUserMessage`

Current UserMessage or undefined

### getCurrentFile()

> **getCurrentFile**: () => `undefined` \| `string`

Get current file path

#### Returns

`undefined` \| `string`

Current file path or undefined

### getMentionedAgents()

> **getMentionedAgents**: () => `any`[]

Get mentioned agents from current message

#### Returns

`any`[]

Array of agent objects

### getMentionedFiles()

> **getMentionedFiles**: () => `string`[]

Get mentioned files from current message

#### Returns

`string`[]

Array of file paths

### getMentionedFolders()

> **getMentionedFolders**: () => `string`[]

Get mentioned folders from current message

#### Returns

`string`[]

Array of folder paths

### getMentionedMCPs()

> **getMentionedMCPs**: () => `string`[]

Get mentioned MCPs from current message

#### Returns

`string`[]

Array of MCP tools

### getMessageId()

> **getMessageId**: () => `undefined` \| `string`

Get message ID

#### Returns

`undefined` \| `string`

Message ID or undefined

### getProcessingConfig()

> **getProcessingConfig**: () => `AgentProcessingConfig`

Get processing configuration

#### Returns

`AgentProcessingConfig`

Processing configuration object

### getRemixPrompt()

> **getRemixPrompt**: () => `undefined` \| `string`

Get remix prompt from current message

#### Returns

`undefined` \| `string`

Remix prompt string or undefined

### getSelection()

> **getSelection**: () => `undefined` \| `string`

Get text selection from current message

#### Returns

`undefined` \| `string`

Selected text or undefined

### getSessionData()

> **getSessionData**: (`key`) => `any`

Get session data

#### Parameters

##### key

`string`

Session data key

#### Returns

`any`

Session data value

### getText()

> **getText**: () => `string`

Get the user message text content

#### Returns

`string`

Message text string

### getThreadId()

> **getThreadId**: () => `undefined` \| `string`

Get thread ID

#### Returns

`undefined` \| `string`

Thread ID or undefined

### getTimestamp()

> **getTimestamp**: () => `undefined` \| `string`

Get message timestamp

#### Returns

`undefined` \| `string`

Timestamp when message was received

### getUploadedImages()

> **getUploadedImages**: () => `any`[]

Get uploaded images from current message

#### Returns

`any`[]

Array of image objects

### hasMessage()

> **hasMessage**: () => `boolean`

Check if there's a current message

#### Returns

`boolean`

Whether there's a current message

### isProcessingEnabled()

> **isProcessingEnabled**: (`type`) => `boolean`

Check if a processing type is enabled

#### Parameters

##### type

Processing type to check

`"processMentionedMCPs"` | `"processRemixPrompt"` | `"processMentionedFiles"` | `"processMentionedAgents"`

#### Returns

`boolean`

Whether the processing type is enabled

### setSessionData()

> **setSessionData**: (`key`, `value`) => `void`

Set session data

#### Parameters

##### key

`string`

Session data key

##### value

`any`

Session data value

#### Returns

`void`

### updateProcessingConfig()

> **updateProcessingConfig**: (`config`) => `void`

Update processing configuration

#### Parameters

##### config

`any`

New processing configuration

#### Returns

`void`

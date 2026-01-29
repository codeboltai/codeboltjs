[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / UserMessage

# Interface: UserMessage

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:246](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L246)

User message received from the Codebolt platform
This is a simplified, user-friendly version of the internal message format

## Properties

### currentFile

> **currentFile**: `string`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:251](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L251)

Current file being worked on

***

### mentionedAgents?

> `optional` **mentionedAgents**: `string`[]

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:278](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L278)

***

### mentionedFiles

> **mentionedFiles**: `string`[]

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:253](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L253)

Files mentioned in the message

***

### mentionedFolders

> **mentionedFolders**: `string`[]

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:259](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L259)

Folders mentioned

***

### mentionedFullPaths

> **mentionedFullPaths**: `string`[]

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:255](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L255)

Full file paths mentioned

***

### mentionedMCPs

> **mentionedMCPs**: `string`[]

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:257](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L257)

MCPs mentioned

***

### messageId

> **messageId**: `string`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:268](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L268)

Unique message identifier

***

### remixPrompt?

> `optional` **remixPrompt**: `string`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:277](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L277)

***

### selectedAgent

> **selectedAgent**: `object`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:263](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L263)

Selected agent information

#### id

> **id**: `string`

#### name

> **name**: `string`

***

### selection?

> `optional` **selection**: `object`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:272](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L272)

Any text selection in the editor

#### end

> **end**: `number`

#### start

> **start**: `number`

#### text

> **text**: `string`

***

### threadId

> **threadId**: `string`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:270](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L270)

Thread identifier

***

### type

> **type**: `string`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:247](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L247)

***

### uploadedImages

> **uploadedImages**: `string`[]

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:261](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L261)

Images uploaded with the message

***

### userMessage

> **userMessage**: `string`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:249](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L249)

The user's message content

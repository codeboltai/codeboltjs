[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / chatSummary

# Variable: chatSummary

> `const` **chatSummary**: `object`

Defined in: [modules/history.ts:26](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/history.ts#L26)

Object with methods for summarizing chat history.
Provides functionality to create summaries of conversation history.

## Type Declaration

### summarize()

> **summarize**: (`messages`, `depth`) => `Promise`\<`GetSummarizeResponse`\>

Summarizes a specific part of the chat history.

#### Parameters

##### messages

`object`[]

Array of message objects to summarize

##### depth

`number`

How far back in history to consider

#### Returns

`Promise`\<`GetSummarizeResponse`\>

Promise with an array of summarized message objects

### summarizeAll()

> **summarizeAll**: () => `Promise`\<`GetSummarizeAllResponse`\>

Summarizes the entire chat history.

#### Returns

`Promise`\<`GetSummarizeAllResponse`\>

Promise with an array of message objects containing role and content

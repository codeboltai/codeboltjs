[@codebolt/codeboltjs](README.md) / Exports

# @codebolt/codeboltjs

## Table of contents

### Variables

- [default](modules.md#default)

## Variables

### default

• `Const` **default**: `Object`

Chat module to interact with the WebSocket server.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `askQuestion` | (`question`: `string`, `buttons`: `string`[], `withFeedback`: `boolean`) => `Promise`\<`string`\> | - |
| `getChatHistory` | () => `Promise`\<`ChatMessage`[]\> | - |
| `processFinished` | () => `void` | - |
| `processStarted` | (`onStopClicked?`: (`message`: `any`) => `void`) => \{ `cleanup`: () => `void` ; `stopProcess`: () => `void`  } \| \{ `cleanup?`: `undefined` ; `stopProcess`: () => `void`  } | - |
| `sendConfirmationRequest` | (`confirmationMessage`: `string`, `buttons`: `string`[], `withFeedback`: `boolean`) => `Promise`\<`string`\> | - |
| `sendMessage` | (`message`: `string`, `payload`: `any`) => `void` | - |
| `sendNotificationEvent` | (`notificationMessage`: `string`, `type`: ``"debug"`` \| ``"git"`` \| ``"planner"`` \| ``"browser"`` \| ``"editor"`` \| ``"terminal"`` \| ``"preview"``) => `void` | - |
| `setRequestHandler` | (`handler`: `RequestHandler`) => `void` | - |
| `stopProcess` | () => `void` | - |
| `waitforReply` | (`message`: `string`) => `Promise`\<`UserMessage`\> | - |

#### Defined in

[chat.ts:9](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/modules/chat.ts#L9)

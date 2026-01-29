---
title: userMessageUtilities
---

[**@codebolt/codeboltjs**](../index)

***

# Variable: userMessageUtilities

```ts
const userMessageUtilities: {
  clear: () => void;
  getCurrent: () => undefined | FlatUserMessage;
  getCurrentFile: () => undefined | string;
  getMentionedAgents: () => any[];
  getMentionedFiles: () => string[];
  getMentionedFolders: () => string[];
  getMentionedMCPs: () => string[];
  getMessageId: () => undefined | string;
  getProcessingConfig: () => AgentProcessingConfig;
  getRemixPrompt: () => undefined | string;
  getSelection: () => undefined | string;
  getSessionData: (key: string) => any;
  getText: () => string;
  getThreadId: () => undefined | string;
  getTimestamp: () => undefined | string;
  getUploadedImages: () => any[];
  hasMessage: () => boolean;
  isProcessingEnabled: (type: 
     | "processMentionedMCPs"
     | "processRemixPrompt"
     | "processMentionedFiles"
    | "processMentionedAgents") => boolean;
  setSessionData: (key: string, value: any) => void;
  updateProcessingConfig: (config: any) => void;
};
```

Defined in: [packages/codeboltjs/src/modules/user-message-utilities.ts:11](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/user-message-utilities.ts#L11)

User message utilities for accessing current user message and context

## Type Declaration

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="clear"></a> `clear()` | () => `void` | Clear current user message | [packages/codeboltjs/src/modules/user-message-utilities.ts:133](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/user-message-utilities.ts#L133) |
| <a id="getcurrent"></a> `getCurrent()` | () => `undefined` \| `FlatUserMessage` | Get the current user message object | [packages/codeboltjs/src/modules/user-message-utilities.ts:16](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/user-message-utilities.ts#L16) |
| <a id="getcurrentfile"></a> `getCurrentFile()` | () => `undefined` \| `string` | Get current file path | [packages/codeboltjs/src/modules/user-message-utilities.ts:64](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/user-message-utilities.ts#L64) |
| <a id="getmentionedagents"></a> `getMentionedAgents()` | () => `any`[] | Get mentioned agents from current message | [packages/codeboltjs/src/modules/user-message-utilities.ts:46](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/user-message-utilities.ts#L46) |
| <a id="getmentionedfiles"></a> `getMentionedFiles()` | () => `string`[] | Get mentioned files from current message | [packages/codeboltjs/src/modules/user-message-utilities.ts:34](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/user-message-utilities.ts#L34) |
| <a id="getmentionedfolders"></a> `getMentionedFolders()` | () => `string`[] | Get mentioned folders from current message | [packages/codeboltjs/src/modules/user-message-utilities.ts:40](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/user-message-utilities.ts#L40) |
| <a id="getmentionedmcps"></a> `getMentionedMCPs()` | () => `string`[] | Get mentioned MCPs from current message | [packages/codeboltjs/src/modules/user-message-utilities.ts:28](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/user-message-utilities.ts#L28) |
| <a id="getmessageid"></a> `getMessageId()` | () => `undefined` \| `string` | Get message ID | [packages/codeboltjs/src/modules/user-message-utilities.ts:76](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/user-message-utilities.ts#L76) |
| <a id="getprocessingconfig"></a> `getProcessingConfig()` | () => `AgentProcessingConfig` | Get processing configuration | [packages/codeboltjs/src/modules/user-message-utilities.ts:88](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/user-message-utilities.ts#L88) |
| <a id="getremixprompt"></a> `getRemixPrompt()` | () => `undefined` \| `string` | Get remix prompt from current message | [packages/codeboltjs/src/modules/user-message-utilities.ts:52](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/user-message-utilities.ts#L52) |
| <a id="getselection"></a> `getSelection()` | () => `undefined` \| `string` | Get text selection from current message | [packages/codeboltjs/src/modules/user-message-utilities.ts:70](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/user-message-utilities.ts#L70) |
| <a id="getsessiondata"></a> `getSessionData()` | (`key`: `string`) => `any` | Get session data | [packages/codeboltjs/src/modules/user-message-utilities.ts:110](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/user-message-utilities.ts#L110) |
| <a id="gettext"></a> `getText()` | () => `string` | Get the user message text content | [packages/codeboltjs/src/modules/user-message-utilities.ts:22](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/user-message-utilities.ts#L22) |
| <a id="getthreadid"></a> `getThreadId()` | () => `undefined` \| `string` | Get thread ID | [packages/codeboltjs/src/modules/user-message-utilities.ts:82](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/user-message-utilities.ts#L82) |
| <a id="gettimestamp"></a> `getTimestamp()` | () => `undefined` \| `string` | Get message timestamp | [packages/codeboltjs/src/modules/user-message-utilities.ts:116](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/user-message-utilities.ts#L116) |
| <a id="getuploadedimages"></a> `getUploadedImages()` | () => `any`[] | Get uploaded images from current message | [packages/codeboltjs/src/modules/user-message-utilities.ts:58](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/user-message-utilities.ts#L58) |
| <a id="hasmessage"></a> `hasMessage()` | () => `boolean` | Check if there's a current message | [packages/codeboltjs/src/modules/user-message-utilities.ts:122](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/user-message-utilities.ts#L122) |
| <a id="isprocessingenabled"></a> `isProcessingEnabled()` | (`type`: \| `"processMentionedMCPs"` \| `"processRemixPrompt"` \| `"processMentionedFiles"` \| `"processMentionedAgents"`) => `boolean` | Check if a processing type is enabled | [packages/codeboltjs/src/modules/user-message-utilities.ts:95](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/user-message-utilities.ts#L95) |
| <a id="setsessiondata"></a> `setSessionData()` | (`key`: `string`, `value`: `any`) => `void` | Set session data | [packages/codeboltjs/src/modules/user-message-utilities.ts:103](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/user-message-utilities.ts#L103) |
| <a id="updateprocessingconfig"></a> `updateProcessingConfig()` | (`config`: `any`) => `void` | Update processing configuration | [packages/codeboltjs/src/modules/user-message-utilities.ts:128](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/modules/user-message-utilities.ts#L128) |

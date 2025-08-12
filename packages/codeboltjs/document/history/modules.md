[@codebolt/codeboltjs](README.md) / Exports

# @codebolt/codeboltjs

## Table of contents

### References

- [default](modules.md#default)

### Enumerations

- [logType](enums/logType.md)

### Variables

- [chatSummary](modules.md#chatsummary)

## References

### default

Renames and re-exports [chatSummary](modules.md#chatsummary)

## Variables

### chatSummary

• `Const` **chatSummary**: `Object`

Object with methods for summarizing chat history.
Provides functionality to create summaries of conversation history.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `summarize` | (`messages`: \{ `content`: `string` ; `role`: `string`  }[], `depth`: `number`) => `Promise`\<\{ `content`: `string` ; `role`: `string`  }[]\> | - |
| `summarizeAll` | () => `Promise`\<\{ `content`: `string` ; `role`: `string`  }[]\> | - |

#### Defined in

[history.ts:19](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/modules/history.ts#L19)

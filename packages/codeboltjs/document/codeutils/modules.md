[@codebolt/codeboltjs](README.md) / Exports

# @codebolt/codeboltjs

## Table of contents

### Interfaces

- [JSTreeResponse](interfaces/JSTreeResponse.md)
- [JSTreeStructureItem](interfaces/JSTreeStructureItem.md)

### Variables

- [default](modules.md#default)

## Variables

### default

• `Const` **default**: `Object`

A utility module for working with code.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `getAllFilesAsMarkDown` | () => `Promise`\<`string`\> | - |
| `getJsTree` | (`filePath?`: `string`) => `Promise`\<[`JSTreeResponse`](interfaces/JSTreeResponse.md)\> | - |
| `getMatcherList` | () => `Promise`\<`GetMatcherListTreeResponse`\> | - |
| `matchDetail` | (`matcher`: `string`) => `Promise`\<`getMatchDetail`\> | - |
| `performMatch` | (`matcherDefinition`: `object`, `problemPatterns`: `any`[], `problems`: `any`[]) => `Promise`\<`MatchProblemResponse`\> | - |

#### Defined in

[codeutils.ts:34](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/modules/codeutils.ts#L34)

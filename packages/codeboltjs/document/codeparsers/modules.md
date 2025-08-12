[@codebolt/codeboltjs](README.md) / Exports

# @codebolt/codeboltjs

## Table of contents

### Interfaces

- [ASTNode](interfaces/ASTNode.md)

### Variables

- [default](modules.md#default)

## Variables

### default

• `Const` **default**: `Object`

A collection of code parser functions.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `getAstTreeInFile` | (`file`: `string`, `className?`: `string`) => `Promise`\<[`ASTNode`](interfaces/ASTNode.md) \| \{ `error`: `string`  }\> | - |
| `getClassesInFile` | (`file`: `string`) => `Promise`\<\{ `error`: `string`  } \| \{ `location`: `string` = file; `name`: `any`  }[]\> | - |
| `getFunctionsinClass` | (`file`: `string`, `className`: `string`) => `Promise`\<\{ `error`: `string`  } \| \{ `class`: `string` = className; `location`: `string` = file; `name`: `string` = methodName }[]\> | - |

#### Defined in

[codeparsers.ts:20](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/modules/codeparsers.ts#L20)

[@codebolt/codeboltjs](README.md) / Exports

# @codebolt/codeboltjs

## Table of contents

### Variables

- [default](modules.md#default)

## Variables

### default

• `Const` **default**: `Object`

A module for parsing output messages to identify errors and warnings.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `parseCSV` | (`csvString`: `string`) => \{ `error?`: `Error` ; `parsed?`: `any`[] ; `success`: `boolean`  } | - |
| `parseErrors` | (`output`: `any`) => `string`[] | - |
| `parseJSON` | (`jsonString`: `string`) => \{ `error?`: `Error` ; `parsed?`: `any` ; `success`: `boolean`  } | - |
| `parseText` | (`text`: `string`) => \{ `parsed`: `string`[] ; `success`: `boolean`  } | - |
| `parseWarnings` | (`output`: `any`) => `string`[] | - |
| `parseXML` | (`xmlString`: `string`) => \{ `parsed?`: `any` ; `success`: `boolean`  } | - |

#### Defined in

[outputparsers.ts:4](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/modules/outputparsers.ts#L4)

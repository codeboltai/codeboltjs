[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [rag.ts:4](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/rag.ts#L4)

A module for managing files within the CodeBolt File System.

## Type Declaration

### add\_file()

> **add\_file**: (`filename`, `file_path`) => `void`

Adds a file to the CodeBolt File System.

#### Parameters

##### filename

`string`

The name of the file to add.

##### file\_path

`string`

The path where the file should be added.

#### Returns

`void`

### init()

> **init**: () => `void`

Initializes the CodeBolt File System Module.

#### Returns

`void`

### retrieve\_related\_knowledge()

> **retrieve\_related\_knowledge**: (`query`, `filename`) => `void`

Retrieves related knowledge for a given query and filename.

#### Parameters

##### query

`string`

The query to retrieve related knowledge for.

##### filename

`string`

The name of the file associated with the query.

#### Returns

`void`

[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [fs.ts:12](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/fs.ts#L12)

## Type Declaration

### createFile()

> **createFile**: (`fileName`, `source`, `filePath`) => `Promise`\<`CreateFileResponse`\>

**`Function`**

createFile

#### Parameters

##### fileName

`string`

The name of the file to create.

##### source

`string`

The source content to write into the file.

##### filePath

`string`

The path where the file should be created.

#### Returns

`Promise`\<`CreateFileResponse`\>

A promise that resolves with the server response.

#### Description

Creates a new file.

### createFolder()

> **createFolder**: (`folderName`, `folderPath`) => `Promise`\<`CreateFolderResponse`\>

**`Function`**

createFolder

#### Parameters

##### folderName

`string`

The name of the folder to create.

##### folderPath

`string`

The path where the folder should be created.

#### Returns

`Promise`\<`CreateFolderResponse`\>

A promise that resolves with the server response.

#### Description

Creates a new folder.

### deleteFile()

> **deleteFile**: (`filename`, `filePath`) => `Promise`\<`DeleteFileResponse`\>

**`Function`**

deleteFile

#### Parameters

##### filename

`string`

The name of the file to delete.

##### filePath

`string`

The path of the file to delete.

#### Returns

`Promise`\<`DeleteFileResponse`\>

A promise that resolves with the server response.

#### Description

Deletes a file.

### deleteFolder()

> **deleteFolder**: (`foldername`, `folderpath`) => `Promise`\<`DeleteFolderResponse`\>

**`Function`**

deleteFolder

#### Parameters

##### foldername

`string`

The name of the folder to delete.

##### folderpath

`string`

The path of the folder to delete.

#### Returns

`Promise`\<`DeleteFolderResponse`\>

A promise that resolves with the server response.

#### Description

Deletes a folder.

### editFileWithDiff()

> **editFileWithDiff**: (`targetFile`, `codeEdit`, `diffIdentifier`, `prompt`, `applyModel?`) => `Promise`\<`EditFileAndApplyDiffResponse`\>

**`Function`**

editFileWithDiff

#### Parameters

##### targetFile

`string`

The target file to edit.

##### codeEdit

`string`

The code edit to apply.

##### diffIdentifier

`string`

The diff identifier.

##### prompt

`string`

The prompt for the edit.

##### applyModel?

`string`

The model to apply the edit with.

#### Returns

`Promise`\<`EditFileAndApplyDiffResponse`\>

A promise that resolves with the edit result.

#### Description

Edits a file by applying a diff.

### fileSearch()

> **fileSearch**: (`query`) => `Promise`\<`FileSearchResponse`\>

**`Function`**

fileSearch

#### Parameters

##### query

`string`

The query to search for.

#### Returns

`Promise`\<`FileSearchResponse`\>

A promise that resolves with the search results.

#### Description

Performs a fuzzy search for files.

### grepSearch()

> **grepSearch**: (`path`, `query`, `includePattern?`, `excludePattern?`, `caseSensitive`) => `Promise`\<`GrepSearchResponse`\>

**`Function`**

grepSearch

#### Parameters

##### path

`string`

The path to search within.

##### query

`string`

The query to search for.

##### includePattern?

`string`

Pattern of files to include.

##### excludePattern?

`string`

Pattern of files to exclude.

##### caseSensitive?

`boolean` = `true`

Whether the search is case sensitive.

#### Returns

`Promise`\<`GrepSearchResponse`\>

A promise that resolves with the search results.

#### Description

Performs a grep search in files.

### listCodeDefinitionNames()

> **listCodeDefinitionNames**: (`path`) => `Promise`\<`ListCodeDefinitionsResponse`\>

**`Function`**

listCodeDefinitionNames

#### Parameters

##### path

`string`

The path to search for code definitions.

#### Returns

`Promise`\<`ListCodeDefinitionsResponse`\>

A promise that resolves with the list of code definition names.

#### Description

Lists all code definition names in a given path.

### listDirectory()

> **listDirectory**: (`params`) => `Promise`\<`ListDirectoryResponse`\>

**`Function`**

listDirectory

#### Parameters

##### params

###### detailed?

`boolean`

###### ignore?

`string`[]

###### limit?

`number`

###### notifyUser?

`boolean`

###### path

`string`

###### show_hidden?

`boolean`

#### Returns

`Promise`\<`ListDirectoryResponse`\>

A promise that resolves with the directory listing result.

#### Description

Lists directory contents using advanced directory listing tool.

### listFile()

> **listFile**: (`folderPath`, `isRecursive`) => `Promise`\<`FileListResponse`\>

**`Function`**

listFile

#### Parameters

##### folderPath

`string`

##### isRecursive

`boolean` = `false`

#### Returns

`Promise`\<`FileListResponse`\>

A promise that resolves with the list of files.

#### Description

Lists all files.

### readFile()

> **readFile**: (`filePath`) => `Promise`\<`ReadFileResponse`\>

**`Function`**

readFile

#### Parameters

##### filePath

`string`

The path of the file to read.

#### Returns

`Promise`\<`ReadFileResponse`\>

A promise that resolves with the server response.

#### Description

Reads the content of a file.

### readManyFiles()

> **readManyFiles**: (`params`) => `Promise`\<`ReadManyFilesResponse`\>

**`Function`**

readManyFiles

#### Parameters

##### params

###### exclude?

`string`[]

###### include?

`string`[]

###### include_metadata?

`boolean`

###### max_files?

`number`

###### max_total_size?

`number`

###### notifyUser?

`boolean`

###### paths

`string`[]

###### recursive?

`boolean`

###### separator_format?

`string`

###### use_default_excludes?

`boolean`

#### Returns

`Promise`\<`ReadManyFilesResponse`\>

A promise that resolves with the read operation result.

#### Description

Reads multiple files based on paths, patterns, or glob expressions.

### searchFiles()

> **searchFiles**: (`path`, `regex`, `filePattern`) => `Promise`\<`SearchFilesResponse`\>

**`Function`**

searchFiles

#### Parameters

##### path

`string`

The path to search within.

##### regex

`string`

The regex pattern to search for.

##### filePattern

`string`

The file pattern to match files.

#### Returns

`Promise`\<`SearchFilesResponse`\>

A promise that resolves with the search results.

#### Description

Searches files in a given path using a regex pattern.

### updateFile()

> **updateFile**: (`filename`, `filePath`, `newContent`) => `Promise`\<`UpdateFileResponse`\>

**`Function`**

updateFile

#### Parameters

##### filename

`string`

The name of the file to update.

##### filePath

`string`

The path of the file to update.

##### newContent

`string`

The new content to write into the file.

#### Returns

`Promise`\<`UpdateFileResponse`\>

A promise that resolves with the server response.

#### Description

Updates the content of a file.

### writeToFile()

> **writeToFile**: (`relPath`, `newContent`) => `Promise`\<`any`\>

**`Function`**

writeToFile

#### Parameters

##### relPath

`string`

The relative path of the file to write to.

##### newContent

`string`

The new content to write into the file.

#### Returns

`Promise`\<`any`\>

A promise that resolves with the write operation result.

#### Description

Writes content to a file.

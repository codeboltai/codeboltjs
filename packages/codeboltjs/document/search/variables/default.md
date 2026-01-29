[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [search.ts:4](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/search.ts#L4)

A module for handling search operations.

## Type Declaration

### get\_first\_link()

> **get\_first\_link**: (`query`) => `Promise`\<`string`\>

Retrieves the first link from the search results for the given query.

#### Parameters

##### query

`string`

The search query.

#### Returns

`Promise`\<`string`\>

A promise that resolves with the first link of the search results.

### init()

> **init**: (`engine?`) => `void`

Initializes the search module with the specified search engine.

#### Parameters

##### engine?

`string` = `"bing"`

The search engine to use for initializing the module.

#### Returns

`void`

### search()

> **search**: (`query`) => `Promise`\<`string`\>

Performs a search operation for the given query.

#### Parameters

##### query

`string`

The search query.

#### Returns

`Promise`\<`string`\>

A promise that resolves with the search results.

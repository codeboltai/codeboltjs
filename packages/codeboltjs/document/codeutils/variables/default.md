[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [codeutils.ts:13](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/codeutils.ts#L13)

A utility module for working with code.

## Type Declaration

### getAllFilesAsMarkDown()

> **getAllFilesAsMarkDown**: () => `Promise`\<`string`\>

Retrieves all files as Markdown.

#### Returns

`Promise`\<`string`\>

A promise that resolves with the Markdown content of all files.

### getMatcherList()

> **getMatcherList**: () => `Promise`\<`GetMatcherListTreeResponse`\>

Retrieves the list of matchers.

#### Returns

`Promise`\<`GetMatcherListTreeResponse`\>

A promise that resolves with the list of matchers response.

### matchDetail()

> **matchDetail**: (`matcher`) => `Promise`\<`getMatchDetail`\>

Retrieves details of a match.

#### Parameters

##### matcher

`string`

The matcher to retrieve details for (by name or identifier).

#### Returns

`Promise`\<`getMatchDetail`\>

A promise that resolves with the match detail response.

### performMatch()

> **performMatch**: (`matcherDefinition`, `problemPatterns`, `problems`) => `Promise`\<`MatchProblemResponse`\>

Performs a matching operation based on the provided matcher definition and problem patterns.

#### Parameters

##### matcherDefinition

`object`

The definition of the matcher (name, pattern, language, etc.).

##### problemPatterns

`any`[]

The patterns to match against (regex patterns with severity levels).

##### problems

`any`[] = `[]`

Optional list of pre-existing problems to include.

#### Returns

`Promise`\<`MatchProblemResponse`\>

A promise that resolves with the matching problem response.

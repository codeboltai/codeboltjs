[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [outputparsers.ts:18](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/outputparsers.ts#L18)

## Type Declaration

### parseCSV()

> **parseCSV**: (`csvString`) => [`ParseResult`](../interfaces/ParseResult.md)\<[`CSVRow`](../interfaces/CSVRow.md)[]\>

Parses CSV string and returns a result object.

#### Parameters

##### csvString

`string`

The CSV string to parse.

#### Returns

[`ParseResult`](../interfaces/ParseResult.md)\<[`CSVRow`](../interfaces/CSVRow.md)[]\>

An object with success flag and parsed data or error.

### parseErrors()

> **parseErrors**: (`output`) => `string`[]

Parses the given output and returns all the error messages.

#### Parameters

##### output

[`ParsableOutput`](../type-aliases/ParsableOutput.md)

The output to parse for error messages.

#### Returns

`string`[]

An array of error messages.

### parseJSON()

> **parseJSON**: (`jsonString`) => [`ParseResult`](../interfaces/ParseResult.md)\<`unknown`\>

Parses JSON string and returns a result object.

#### Parameters

##### jsonString

`string`

The JSON string to parse.

#### Returns

[`ParseResult`](../interfaces/ParseResult.md)\<`unknown`\>

An object with success flag and parsed data or error.

### parseText()

> **parseText**: (`text`) => [`ParseResult`](../interfaces/ParseResult.md)\<`string`[]\>

Parses text string and returns a result object with lines.

#### Parameters

##### text

`string`

The text to parse.

#### Returns

[`ParseResult`](../interfaces/ParseResult.md)\<`string`[]\>

An object with success flag and parsed lines.

### parseWarnings()

> **parseWarnings**: (`output`) => `string`[]

Parses the given output and returns all the warning messages.

#### Parameters

##### output

[`ParsableOutput`](../type-aliases/ParsableOutput.md)

The output to parse for warning messages.

#### Returns

`string`[]

An array of warning messages.

### parseXML()

> **parseXML**: (`xmlString`) => [`ParseResult`](../interfaces/ParseResult.md)\<\{\[`key`: `string`\]: `unknown`; `rootElement`: `string`; \}\>

Parses XML string and returns a result object.

#### Parameters

##### xmlString

`string`

The XML string to parse.

#### Returns

[`ParseResult`](../interfaces/ParseResult.md)\<\{\[`key`: `string`\]: `unknown`; `rootElement`: `string`; \}\>

An object with success flag and parsed data.

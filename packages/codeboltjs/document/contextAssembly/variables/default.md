[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [contextAssembly.ts:17](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/contextAssembly.ts#L17)

## Type Declaration

### evaluateRules()

> **evaluateRules**: (`request`, `ruleEngineIds?`) => `Promise`\<`RuleEvaluationResponse`\>

Evaluate rules only without fetching memory content

#### Parameters

##### request

`ContextAssemblyRequest`

Context assembly request

##### ruleEngineIds?

`string`[]

Optional specific rule engine IDs to evaluate

#### Returns

`Promise`\<`RuleEvaluationResponse`\>

### getContext()

> **getContext**: (`request`) => `Promise`\<`ContextAssemblyResponse`\>

Assemble context from various memory sources

#### Parameters

##### request

`ContextAssemblyRequest`

Context assembly request

#### Returns

`Promise`\<`ContextAssemblyResponse`\>

### getRequiredVariables()

> **getRequiredVariables**: (`memoryNames`) => `Promise`\<`RequiredVariablesResponse`\>

Get required variables for specific memory types

#### Parameters

##### memoryNames

`string`[]

Array of memory type names

#### Returns

`Promise`\<`RequiredVariablesResponse`\>

### listMemoryTypes()

> **listMemoryTypes**: () => `Promise`\<`MemoryTypesResponse`\>

List available memory types

#### Returns

`Promise`\<`MemoryTypesResponse`\>

### validate()

> **validate**: (`request`) => `Promise`\<`ContextValidateResponse`\>

Validate a context assembly request

#### Parameters

##### request

`ContextAssemblyRequest`

Request to validate

#### Returns

`Promise`\<`ContextValidateResponse`\>

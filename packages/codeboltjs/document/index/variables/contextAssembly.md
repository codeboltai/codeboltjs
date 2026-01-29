[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / contextAssembly

# Variable: contextAssembly

> `const` **contextAssembly**: `object`

Defined in: [packages/codeboltjs/src/modules/contextAssembly.ts:17](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/contextAssembly.ts#L17)

## Type Declaration

### evaluateRules()

> **evaluateRules**: (`request`, `ruleEngineIds?`) => `Promise`\<[`RuleEvaluationResponse`](../interfaces/RuleEvaluationResponse.md)\>

Evaluate rules only without fetching memory content

#### Parameters

##### request

[`ContextAssemblyRequest`](../interfaces/ContextAssemblyRequest.md)

Context assembly request

##### ruleEngineIds?

`string`[]

Optional specific rule engine IDs to evaluate

#### Returns

`Promise`\<[`RuleEvaluationResponse`](../interfaces/RuleEvaluationResponse.md)\>

### getContext()

> **getContext**: (`request`) => `Promise`\<[`ContextAssemblyResponse`](../interfaces/ContextAssemblyResponse.md)\>

Assemble context from various memory sources

#### Parameters

##### request

[`ContextAssemblyRequest`](../interfaces/ContextAssemblyRequest.md)

Context assembly request

#### Returns

`Promise`\<[`ContextAssemblyResponse`](../interfaces/ContextAssemblyResponse.md)\>

### getRequiredVariables()

> **getRequiredVariables**: (`memoryNames`) => `Promise`\<[`RequiredVariablesResponse`](../interfaces/RequiredVariablesResponse.md)\>

Get required variables for specific memory types

#### Parameters

##### memoryNames

`string`[]

Array of memory type names

#### Returns

`Promise`\<[`RequiredVariablesResponse`](../interfaces/RequiredVariablesResponse.md)\>

### listMemoryTypes()

> **listMemoryTypes**: () => `Promise`\<[`MemoryTypesResponse`](../interfaces/MemoryTypesResponse.md)\>

List available memory types

#### Returns

`Promise`\<[`MemoryTypesResponse`](../interfaces/MemoryTypesResponse.md)\>

### validate()

> **validate**: (`request`) => `Promise`\<[`ContextValidateResponse`](../interfaces/ContextValidateResponse.md)\>

Validate a context assembly request

#### Parameters

##### request

[`ContextAssemblyRequest`](../interfaces/ContextAssemblyRequest.md)

Request to validate

#### Returns

`Promise`\<[`ContextValidateResponse`](../interfaces/ContextValidateResponse.md)\>

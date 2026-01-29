[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / contextRuleEngine

# Variable: contextRuleEngine

> `const` **contextRuleEngine**: `object`

Defined in: [packages/codeboltjs/src/modules/contextRuleEngine.ts:19](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/contextRuleEngine.ts#L19)

## Type Declaration

### create()

> **create**: (`config`) => `Promise`\<[`ContextRuleEngineResponse`](../interfaces/ContextRuleEngineResponse.md)\>

Create a new rule engine

#### Parameters

##### config

[`CreateContextRuleEngineParams`](../interfaces/CreateContextRuleEngineParams.md)

Rule engine configuration

#### Returns

`Promise`\<[`ContextRuleEngineResponse`](../interfaces/ContextRuleEngineResponse.md)\>

### delete()

> **delete**: (`id`) => `Promise`\<[`ContextRuleEngineDeleteResponse`](../interfaces/ContextRuleEngineDeleteResponse.md)\>

Delete a rule engine

#### Parameters

##### id

`string`

Rule engine ID

#### Returns

`Promise`\<[`ContextRuleEngineDeleteResponse`](../interfaces/ContextRuleEngineDeleteResponse.md)\>

### evaluate()

> **evaluate**: (`params`) => `Promise`\<[`EvaluateRulesResponse`](../interfaces/EvaluateRulesResponse.md)\>

Evaluate rules against provided variables

#### Parameters

##### params

[`EvaluateRulesParams`](../interfaces/EvaluateRulesParams.md)

Evaluation parameters

#### Returns

`Promise`\<[`EvaluateRulesResponse`](../interfaces/EvaluateRulesResponse.md)\>

### get()

> **get**: (`id`) => `Promise`\<[`ContextRuleEngineResponse`](../interfaces/ContextRuleEngineResponse.md)\>

Get a rule engine by ID

#### Parameters

##### id

`string`

Rule engine ID

#### Returns

`Promise`\<[`ContextRuleEngineResponse`](../interfaces/ContextRuleEngineResponse.md)\>

### getPossibleVariables()

> **getPossibleVariables**: () => `Promise`\<[`PossibleVariablesResponse`](../interfaces/PossibleVariablesResponse.md)\>

Get all possible variables for UI configuration

#### Returns

`Promise`\<[`PossibleVariablesResponse`](../interfaces/PossibleVariablesResponse.md)\>

### list()

> **list**: () => `Promise`\<[`ContextRuleEngineListResponse`](../interfaces/ContextRuleEngineListResponse.md)\>

List all rule engines

#### Returns

`Promise`\<[`ContextRuleEngineListResponse`](../interfaces/ContextRuleEngineListResponse.md)\>

### update()

> **update**: (`id`, `updates`) => `Promise`\<[`ContextRuleEngineResponse`](../interfaces/ContextRuleEngineResponse.md)\>

Update a rule engine

#### Parameters

##### id

`string`

Rule engine ID

##### updates

[`UpdateContextRuleEngineParams`](../interfaces/UpdateContextRuleEngineParams.md)

Update parameters

#### Returns

`Promise`\<[`ContextRuleEngineResponse`](../interfaces/ContextRuleEngineResponse.md)\>

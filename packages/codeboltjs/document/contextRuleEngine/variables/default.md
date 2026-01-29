[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [contextRuleEngine.ts:19](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/contextRuleEngine.ts#L19)

## Type Declaration

### create()

> **create**: (`config`) => `Promise`\<`ContextRuleEngineResponse`\>

Create a new rule engine

#### Parameters

##### config

`CreateContextRuleEngineParams`

Rule engine configuration

#### Returns

`Promise`\<`ContextRuleEngineResponse`\>

### delete()

> **delete**: (`id`) => `Promise`\<`ContextRuleEngineDeleteResponse`\>

Delete a rule engine

#### Parameters

##### id

`string`

Rule engine ID

#### Returns

`Promise`\<`ContextRuleEngineDeleteResponse`\>

### evaluate()

> **evaluate**: (`params`) => `Promise`\<`EvaluateRulesResponse`\>

Evaluate rules against provided variables

#### Parameters

##### params

`EvaluateRulesParams`

Evaluation parameters

#### Returns

`Promise`\<`EvaluateRulesResponse`\>

### get()

> **get**: (`id`) => `Promise`\<`ContextRuleEngineResponse`\>

Get a rule engine by ID

#### Parameters

##### id

`string`

Rule engine ID

#### Returns

`Promise`\<`ContextRuleEngineResponse`\>

### getPossibleVariables()

> **getPossibleVariables**: () => `Promise`\<`PossibleVariablesResponse`\>

Get all possible variables for UI configuration

#### Returns

`Promise`\<`PossibleVariablesResponse`\>

### list()

> **list**: () => `Promise`\<`ContextRuleEngineListResponse`\>

List all rule engines

#### Returns

`Promise`\<`ContextRuleEngineListResponse`\>

### update()

> **update**: (`id`, `updates`) => `Promise`\<`ContextRuleEngineResponse`\>

Update a rule engine

#### Parameters

##### id

`string`

Rule engine ID

##### updates

`UpdateContextRuleEngineParams`

Update parameters

#### Returns

`Promise`\<`ContextRuleEngineResponse`\>

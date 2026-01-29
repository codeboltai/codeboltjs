[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / orchestrator

# Variable: orchestrator

> `const` **orchestrator**: `object`

Defined in: [packages/codeboltjs/src/modules/orchestrator.ts:41](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/orchestrator.ts#L41)

## Type Declaration

### createOrchestrator()

> **createOrchestrator**: (`data`) => `Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

Creates a new orchestrator

#### Parameters

##### data

[`CreateOrchestratorParams`](../interfaces/CreateOrchestratorParams.md)

#### Returns

`Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

### deleteOrchestrator()

> **deleteOrchestrator**: (`orchestratorId`) => `Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

Deletes an orchestrator

#### Parameters

##### orchestratorId

`string`

#### Returns

`Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

### getOrchestrator()

> **getOrchestrator**: (`orchestratorId`) => `Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

Gets a specific orchestrator by ID

#### Parameters

##### orchestratorId

`string`

#### Returns

`Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

### getOrchestratorSettings()

> **getOrchestratorSettings**: (`orchestratorId`) => `Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

Gets orchestrator settings

#### Parameters

##### orchestratorId

`string`

#### Returns

`Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

### listOrchestrators()

> **listOrchestrators**: () => `Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

Lists all orchestrators

#### Returns

`Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

### updateCodeboltJs()

> **updateCodeboltJs**: () => `Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

Initiates a Codebolt JS update

#### Returns

`Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

### updateOrchestrator()

> **updateOrchestrator**: (`orchestratorId`, `data`) => `Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

Updates an orchestrator

#### Parameters

##### orchestratorId

`string`

##### data

[`UpdateOrchestratorParams`](../interfaces/UpdateOrchestratorParams.md)

#### Returns

`Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

### updateOrchestratorSettings()

> **updateOrchestratorSettings**: (`orchestratorId`, `settings`) => `Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

Updates orchestrator settings

#### Parameters

##### orchestratorId

`string`

##### settings

[`UpdateOrchestratorSettingsParams`](../interfaces/UpdateOrchestratorSettingsParams.md)

#### Returns

`Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

### updateOrchestratorStatus()

> **updateOrchestratorStatus**: (`orchestratorId`, `status`) => `Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

Updates orchestrator status

#### Parameters

##### orchestratorId

`string`

##### status

`OrchestratorStatus`

#### Returns

`Promise`\<[`OrchestratorResponse`](../interfaces/OrchestratorResponse.md)\>

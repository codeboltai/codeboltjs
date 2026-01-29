[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / hook

# Variable: hook

> `const` **hook**: `object`

Defined in: [packages/codeboltjs/src/modules/hook.ts:16](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/hook.ts#L16)

## Type Declaration

### create()

> **create**: (`config`) => `Promise`\<[`HookResponse`](../interfaces/HookResponse.md)\>

Create a new hook

#### Parameters

##### config

[`HookConfig`](../interfaces/HookConfig.md)

Hook configuration

#### Returns

`Promise`\<[`HookResponse`](../interfaces/HookResponse.md)\>

### delete()

> **delete**: (`hookId`) => `Promise`\<[`HookDeleteResponse`](../interfaces/HookDeleteResponse.md)\>

Delete a hook

#### Parameters

##### hookId

`string`

Hook ID

#### Returns

`Promise`\<[`HookDeleteResponse`](../interfaces/HookDeleteResponse.md)\>

### disable()

> **disable**: (`hookId`) => `Promise`\<[`HookResponse`](../interfaces/HookResponse.md)\>

Disable a hook

#### Parameters

##### hookId

`string`

Hook ID

#### Returns

`Promise`\<[`HookResponse`](../interfaces/HookResponse.md)\>

### enable()

> **enable**: (`hookId`) => `Promise`\<[`HookResponse`](../interfaces/HookResponse.md)\>

Enable a hook

#### Parameters

##### hookId

`string`

Hook ID

#### Returns

`Promise`\<[`HookResponse`](../interfaces/HookResponse.md)\>

### get()

> **get**: (`hookId`) => `Promise`\<[`HookResponse`](../interfaces/HookResponse.md)\>

Get a hook by ID

#### Parameters

##### hookId

`string`

Hook ID

#### Returns

`Promise`\<[`HookResponse`](../interfaces/HookResponse.md)\>

### initialize()

> **initialize**: (`projectPath`) => `Promise`\<[`HookInitializeResponse`](../interfaces/HookInitializeResponse.md)\>

Initialize the hook manager for a project

#### Parameters

##### projectPath

`string`

Path to the project

#### Returns

`Promise`\<[`HookInitializeResponse`](../interfaces/HookInitializeResponse.md)\>

### list()

> **list**: () => `Promise`\<[`HookListResponse`](../interfaces/HookListResponse.md)\>

List all hooks

#### Returns

`Promise`\<[`HookListResponse`](../interfaces/HookListResponse.md)\>

### update()

> **update**: (`hookId`, `config`) => `Promise`\<[`HookResponse`](../interfaces/HookResponse.md)\>

Update an existing hook

#### Parameters

##### hookId

`string`

Hook ID

##### config

`Partial`\<[`HookConfig`](../interfaces/HookConfig.md)\>

Updated hook configuration

#### Returns

`Promise`\<[`HookResponse`](../interfaces/HookResponse.md)\>

[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [hook.ts:16](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/hook.ts#L16)

## Type Declaration

### create()

> **create**: (`config`) => `Promise`\<`HookResponse`\>

Create a new hook

#### Parameters

##### config

`HookConfig`

Hook configuration

#### Returns

`Promise`\<`HookResponse`\>

### delete()

> **delete**: (`hookId`) => `Promise`\<`HookDeleteResponse`\>

Delete a hook

#### Parameters

##### hookId

`string`

Hook ID

#### Returns

`Promise`\<`HookDeleteResponse`\>

### disable()

> **disable**: (`hookId`) => `Promise`\<`HookResponse`\>

Disable a hook

#### Parameters

##### hookId

`string`

Hook ID

#### Returns

`Promise`\<`HookResponse`\>

### enable()

> **enable**: (`hookId`) => `Promise`\<`HookResponse`\>

Enable a hook

#### Parameters

##### hookId

`string`

Hook ID

#### Returns

`Promise`\<`HookResponse`\>

### get()

> **get**: (`hookId`) => `Promise`\<`HookResponse`\>

Get a hook by ID

#### Parameters

##### hookId

`string`

Hook ID

#### Returns

`Promise`\<`HookResponse`\>

### initialize()

> **initialize**: (`projectPath`) => `Promise`\<`HookInitializeResponse`\>

Initialize the hook manager for a project

#### Parameters

##### projectPath

`string`

Path to the project

#### Returns

`Promise`\<`HookInitializeResponse`\>

### list()

> **list**: () => `Promise`\<`HookListResponse`\>

List all hooks

#### Returns

`Promise`\<`HookListResponse`\>

### update()

> **update**: (`hookId`, `config`) => `Promise`\<`HookResponse`\>

Update an existing hook

#### Parameters

##### hookId

`string`

Hook ID

##### config

`Partial`\<`HookConfig`\>

Updated hook configuration

#### Returns

`Promise`\<`HookResponse`\>

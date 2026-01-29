[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [packages/codeboltjs/src/modules/memory.ts:46](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/memory.ts#L46)

## Type Declaration

### json

> **json**: `object`

#### json.delete()

> **delete**: (`memoryId`) => `Promise`\<[`DeleteMemoryResponse`](../interfaces/DeleteMemoryResponse.md)\>

##### Parameters

###### memoryId

`string`

##### Returns

`Promise`\<[`DeleteMemoryResponse`](../interfaces/DeleteMemoryResponse.md)\>

#### json.list()

> **list**: (`filters`) => `Promise`\<[`ListMemoryResponse`](../interfaces/ListMemoryResponse.md)\>

##### Parameters

###### filters

`Record`\<`string`, `unknown`\> = `{}`

##### Returns

`Promise`\<[`ListMemoryResponse`](../interfaces/ListMemoryResponse.md)\>

#### json.save()

> **save**: (`json`) => `Promise`\<[`SaveMemoryResponse`](../interfaces/SaveMemoryResponse.md)\>

##### Parameters

###### json

`any`

##### Returns

`Promise`\<[`SaveMemoryResponse`](../interfaces/SaveMemoryResponse.md)\>

#### json.update()

> **update**: (`memoryId`, `json`) => `Promise`\<[`UpdateMemoryResponse`](../interfaces/UpdateMemoryResponse.md)\>

##### Parameters

###### memoryId

`string`

###### json

`any`

##### Returns

`Promise`\<[`UpdateMemoryResponse`](../interfaces/UpdateMemoryResponse.md)\>

### markdown

> **markdown**: `object`

#### markdown.delete()

> **delete**: (`memoryId`) => `Promise`\<[`DeleteMemoryResponse`](../interfaces/DeleteMemoryResponse.md)\>

##### Parameters

###### memoryId

`string`

##### Returns

`Promise`\<[`DeleteMemoryResponse`](../interfaces/DeleteMemoryResponse.md)\>

#### markdown.list()

> **list**: (`filters`) => `Promise`\<[`ListMemoryResponse`](../interfaces/ListMemoryResponse.md)\>

##### Parameters

###### filters

`Record`\<`string`, `unknown`\> = `{}`

##### Returns

`Promise`\<[`ListMemoryResponse`](../interfaces/ListMemoryResponse.md)\>

#### markdown.save()

> **save**: (`markdown`, `metadata`) => `Promise`\<[`SaveMemoryResponse`](../interfaces/SaveMemoryResponse.md)\>

##### Parameters

###### markdown

`string`

###### metadata

`Record`\<`string`, `unknown`\> = `{}`

##### Returns

`Promise`\<[`SaveMemoryResponse`](../interfaces/SaveMemoryResponse.md)\>

#### markdown.update()

> **update**: (`memoryId`, `markdown`, `metadata`) => `Promise`\<[`UpdateMemoryResponse`](../interfaces/UpdateMemoryResponse.md)\>

##### Parameters

###### memoryId

`string`

###### markdown

`string`

###### metadata

`Record`\<`string`, `unknown`\> = `{}`

##### Returns

`Promise`\<[`UpdateMemoryResponse`](../interfaces/UpdateMemoryResponse.md)\>

### todo

> **todo**: `object`

#### todo.delete()

> **delete**: (`memoryId`) => `Promise`\<[`DeleteMemoryResponse`](../interfaces/DeleteMemoryResponse.md)\>

##### Parameters

###### memoryId

`string`

##### Returns

`Promise`\<[`DeleteMemoryResponse`](../interfaces/DeleteMemoryResponse.md)\>

#### todo.list()

> **list**: (`filters`) => `Promise`\<[`ListMemoryResponse`](../interfaces/ListMemoryResponse.md)\>

##### Parameters

###### filters

`Record`\<`string`, `unknown`\> = `{}`

##### Returns

`Promise`\<[`ListMemoryResponse`](../interfaces/ListMemoryResponse.md)\>

#### todo.save()

> **save**: (`todo`, `metadata`) => `Promise`\<[`SaveMemoryResponse`](../interfaces/SaveMemoryResponse.md)\>

##### Parameters

###### todo

\{ `createdAt?`: `string`; `id?`: `string`; `priority?`: `"low"` \| `"medium"` \| `"high"`; `status?`: `"pending"` \| `"completed"` \| `"processing"`; `tags?`: `string`[]; `title?`: `string`; `updatedAt?`: `string`; \} | `object`[]

###### metadata

`Record`\<`string`, `unknown`\> = `{}`

##### Returns

`Promise`\<[`SaveMemoryResponse`](../interfaces/SaveMemoryResponse.md)\>

#### todo.update()

> **update**: (`memoryId`, `todo`) => `Promise`\<[`UpdateMemoryResponse`](../interfaces/UpdateMemoryResponse.md)\>

##### Parameters

###### memoryId

`string`

###### todo

###### createdAt?

`string`

###### id?

`string`

###### priority?

`"low"` \| `"medium"` \| `"high"`

###### status?

`"pending"` \| `"completed"` \| `"processing"`

###### tags?

`string`[]

###### title?

`string`

###### updatedAt?

`string`

##### Returns

`Promise`\<[`UpdateMemoryResponse`](../interfaces/UpdateMemoryResponse.md)\>

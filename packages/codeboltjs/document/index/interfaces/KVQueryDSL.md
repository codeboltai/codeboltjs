[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / KVQueryDSL

# Interface: KVQueryDSL

Defined in: [packages/codeboltjs/src/types/kvStore.ts:36](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/kvStore.ts#L36)

## Properties

### from

> **from**: `object`

Defined in: [packages/codeboltjs/src/types/kvStore.ts:37](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/kvStore.ts#L37)

#### instance

> **instance**: `string`

#### namespace?

> `optional` **namespace**: `string`

***

### limit?

> `optional` **limit**: `number`

Defined in: [packages/codeboltjs/src/types/kvStore.ts:47](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/kvStore.ts#L47)

***

### offset?

> `optional` **offset**: `number`

Defined in: [packages/codeboltjs/src/types/kvStore.ts:48](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/kvStore.ts#L48)

***

### orderBy?

> `optional` **orderBy**: `object`

Defined in: [packages/codeboltjs/src/types/kvStore.ts:43](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/kvStore.ts#L43)

#### direction

> **direction**: `"asc"` \| `"desc"`

#### field

> **field**: `string`

***

### select?

> `optional` **select**: `string`[]

Defined in: [packages/codeboltjs/src/types/kvStore.ts:42](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/kvStore.ts#L42)

***

### where?

> `optional` **where**: [`KVQueryCondition`](KVQueryCondition.md)[]

Defined in: [packages/codeboltjs/src/types/kvStore.ts:41](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/kvStore.ts#L41)

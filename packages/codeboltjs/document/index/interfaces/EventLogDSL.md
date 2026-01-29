[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / EventLogDSL

# Interface: EventLogDSL

Defined in: [packages/codeboltjs/src/types/eventLog.ts:36](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/eventLog.ts#L36)

## Properties

### from

> **from**: `object`

Defined in: [packages/codeboltjs/src/types/eventLog.ts:37](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/eventLog.ts#L37)

#### instance

> **instance**: `string`

#### stream?

> `optional` **stream**: `string`

***

### limit?

> `optional` **limit**: `number`

Defined in: [packages/codeboltjs/src/types/eventLog.ts:47](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/eventLog.ts#L47)

***

### offset?

> `optional` **offset**: `number`

Defined in: [packages/codeboltjs/src/types/eventLog.ts:48](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/eventLog.ts#L48)

***

### orderBy?

> `optional` **orderBy**: `object`

Defined in: [packages/codeboltjs/src/types/eventLog.ts:43](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/eventLog.ts#L43)

#### direction

> **direction**: `"asc"` \| `"desc"`

#### field

> **field**: `string`

***

### reduce?

> `optional` **reduce**: `object`

Defined in: [packages/codeboltjs/src/types/eventLog.ts:49](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/eventLog.ts#L49)

#### field?

> `optional` **field**: `string`

#### groupBy?

> `optional` **groupBy**: `string`[]

#### type

> **type**: `"count"` \| `"sum"` \| `"avg"` \| `"min"` \| `"max"` \| `"collect"`

***

### select?

> `optional` **select**: `string`[]

Defined in: [packages/codeboltjs/src/types/eventLog.ts:42](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/eventLog.ts#L42)

***

### where?

> `optional` **where**: [`EventLogCondition`](EventLogCondition.md)[]

Defined in: [packages/codeboltjs/src/types/eventLog.ts:41](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/eventLog.ts#L41)

[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / HookConfig

# Interface: HookConfig

Defined in: [packages/codeboltjs/src/types/hook.ts:34](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L34)

## Extended by

- [`Hook`](Hook.md)

## Properties

### action

> **action**: [`HookAction`](../type-aliases/HookAction.md)

Defined in: [packages/codeboltjs/src/types/hook.ts:45](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L45)

***

### actionConfig?

> `optional` **actionConfig**: `object`

Defined in: [packages/codeboltjs/src/types/hook.ts:46](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L46)

#### agentId?

> `optional` **agentId**: `string`

#### command?

> `optional` **command**: `string`

#### message?

> `optional` **message**: `string`

#### payload?

> `optional` **payload**: `Record`\<`string`, `any`\>

#### url?

> `optional` **url**: `string`

***

### conditions?

> `optional` **conditions**: [`HookCondition`](HookCondition.md)[]

Defined in: [packages/codeboltjs/src/types/hook.ts:55](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L55)

***

### description?

> `optional` **description**: `string`

Defined in: [packages/codeboltjs/src/types/hook.ts:37](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L37)

***

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [packages/codeboltjs/src/types/hook.ts:53](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L53)

***

### id?

> `optional` **id**: `string`

Defined in: [packages/codeboltjs/src/types/hook.ts:35](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L35)

***

### name

> **name**: `string`

Defined in: [packages/codeboltjs/src/types/hook.ts:36](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L36)

***

### priority?

> `optional` **priority**: `number`

Defined in: [packages/codeboltjs/src/types/hook.ts:54](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L54)

***

### trigger

> **trigger**: [`HookTrigger`](../type-aliases/HookTrigger.md)

Defined in: [packages/codeboltjs/src/types/hook.ts:38](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L38)

***

### triggerConfig?

> `optional` **triggerConfig**: `object`

Defined in: [packages/codeboltjs/src/types/hook.ts:39](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L39)

#### command?

> `optional` **command**: `string`

#### eventType?

> `optional` **eventType**: `string`

#### path?

> `optional` **path**: `string`

#### pattern?

> `optional` **pattern**: `string`

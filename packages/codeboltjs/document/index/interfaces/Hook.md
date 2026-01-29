[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / Hook

# Interface: Hook

Defined in: [packages/codeboltjs/src/types/hook.ts:64](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L64)

## Extends

- [`HookConfig`](HookConfig.md)

## Properties

### action

> **action**: [`HookAction`](../type-aliases/HookAction.md)

Defined in: [packages/codeboltjs/src/types/hook.ts:45](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L45)

#### Inherited from

[`HookConfig`](HookConfig.md).[`action`](HookConfig.md#action)

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

#### Inherited from

[`HookConfig`](HookConfig.md).[`actionConfig`](HookConfig.md#actionconfig)

***

### conditions?

> `optional` **conditions**: [`HookCondition`](HookCondition.md)[]

Defined in: [packages/codeboltjs/src/types/hook.ts:55](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L55)

#### Inherited from

[`HookConfig`](HookConfig.md).[`conditions`](HookConfig.md#conditions)

***

### createdAt

> **createdAt**: `string`

Defined in: [packages/codeboltjs/src/types/hook.ts:67](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L67)

***

### description?

> `optional` **description**: `string`

Defined in: [packages/codeboltjs/src/types/hook.ts:37](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L37)

#### Inherited from

[`HookConfig`](HookConfig.md).[`description`](HookConfig.md#description)

***

### enabled

> **enabled**: `boolean`

Defined in: [packages/codeboltjs/src/types/hook.ts:66](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L66)

#### Overrides

[`HookConfig`](HookConfig.md).[`enabled`](HookConfig.md#enabled)

***

### id

> **id**: `string`

Defined in: [packages/codeboltjs/src/types/hook.ts:65](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L65)

#### Overrides

[`HookConfig`](HookConfig.md).[`id`](HookConfig.md#id)

***

### lastTriggeredAt?

> `optional` **lastTriggeredAt**: `string`

Defined in: [packages/codeboltjs/src/types/hook.ts:69](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L69)

***

### name

> **name**: `string`

Defined in: [packages/codeboltjs/src/types/hook.ts:36](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L36)

#### Inherited from

[`HookConfig`](HookConfig.md).[`name`](HookConfig.md#name)

***

### priority?

> `optional` **priority**: `number`

Defined in: [packages/codeboltjs/src/types/hook.ts:54](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L54)

#### Inherited from

[`HookConfig`](HookConfig.md).[`priority`](HookConfig.md#priority)

***

### trigger

> **trigger**: [`HookTrigger`](../type-aliases/HookTrigger.md)

Defined in: [packages/codeboltjs/src/types/hook.ts:38](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L38)

#### Inherited from

[`HookConfig`](HookConfig.md).[`trigger`](HookConfig.md#trigger)

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

#### Inherited from

[`HookConfig`](HookConfig.md).[`triggerConfig`](HookConfig.md#triggerconfig)

***

### triggerCount

> **triggerCount**: `number`

Defined in: [packages/codeboltjs/src/types/hook.ts:70](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L70)

***

### updatedAt

> **updatedAt**: `string`

Defined in: [packages/codeboltjs/src/types/hook.ts:68](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/hook.ts#L68)

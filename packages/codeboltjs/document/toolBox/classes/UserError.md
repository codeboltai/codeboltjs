[@codebolt/codeboltjs](../README.md) / [Exports](../modules.md) / UserError

# Class: UserError

Error that is meant to be surfaced to the user.

## Hierarchy

- [`UnexpectedStateError`](UnexpectedStateError.md)

  ↳ **`UserError`**

## Table of contents

### Constructors

- [constructor](UserError.md#constructor)

### Properties

- [extras](UserError.md#extras)
- [message](UserError.md#message)
- [name](UserError.md#name)
- [stack](UserError.md#stack)
- [prepareStackTrace](UserError.md#preparestacktrace)
- [stackTraceLimit](UserError.md#stacktracelimit)

### Methods

- [captureStackTrace](UserError.md#capturestacktrace)

## Constructors

### constructor

• **new UserError**(`message`, `extras?`): [`UserError`](UserError.md)

Creates a new UnexpectedStateError.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` | Error message |
| `extras?` | `Extras` | Additional context for the error |

#### Returns

[`UserError`](UserError.md)

#### Inherited from

[UnexpectedStateError](UnexpectedStateError.md).[constructor](UnexpectedStateError.md#constructor)

#### Defined in

[src/utils/toolBox.ts:134](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L134)

## Properties

### extras

• `Optional` **extras**: `Extras`

Additional context for the error

#### Inherited from

[UnexpectedStateError](UnexpectedStateError.md).[extras](UnexpectedStateError.md#extras)

#### Defined in

[src/utils/toolBox.ts:126](https://github.com/codeboltai/codeboltjs/blob/1ae9852f107cfee4a652d6d80c0a92c9344ec151/src/utils/toolBox.ts#L126)

___

### message

• **message**: `string`

#### Inherited from

[UnexpectedStateError](UnexpectedStateError.md).[message](UnexpectedStateError.md#message)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1077

___

### name

• **name**: `string`

#### Inherited from

[UnexpectedStateError](UnexpectedStateError.md).[name](UnexpectedStateError.md#name)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1076

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

[UnexpectedStateError](UnexpectedStateError.md).[stack](UnexpectedStateError.md#stack)

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1078

___

### prepareStackTrace

▪ `Static` `Optional` **prepareStackTrace**: (`err`: `Error`, `stackTraces`: `CallSite`[]) => `any`

Optional override for formatting stack traces

**`See`**

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Type declaration

▸ (`err`, `stackTraces`): `any`

##### Parameters

| Name | Type |
| :------ | :------ |
| `err` | `Error` |
| `stackTraces` | `CallSite`[] |

##### Returns

`any`

#### Inherited from

[UnexpectedStateError](UnexpectedStateError.md).[prepareStackTrace](UnexpectedStateError.md#preparestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:98

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

[UnexpectedStateError](UnexpectedStateError.md).[stackTraceLimit](UnexpectedStateError.md#stacktracelimit)

#### Defined in

node_modules/@types/node/globals.d.ts:100

## Methods

### captureStackTrace

▸ **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Create .stack property on a target object

#### Parameters

| Name | Type |
| :------ | :------ |
| `targetObject` | `object` |
| `constructorOpt?` | `Function` |

#### Returns

`void`

#### Inherited from

[UnexpectedStateError](UnexpectedStateError.md).[captureStackTrace](UnexpectedStateError.md#capturestacktrace)

#### Defined in

node_modules/@types/node/globals.d.ts:91

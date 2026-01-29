[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / APIEventMap

# Interface: APIEventMap

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1779](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1779)

## Properties

### connected()

> **connected**: () => `void`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1780](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1780)

#### Returns

`void`

***

### disconnected()

> **disconnected**: () => `void`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1781](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1781)

#### Returns

`void`

***

### error()

> **error**: (`error`) => `void`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1782](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1782)

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### message()

> **message**: (`message`) => `void`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1783](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1783)

#### Parameters

##### message

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### progress()

> **progress**: (`progress`) => `void`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1784](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1784)

#### Parameters

##### progress

`number`

#### Returns

`void`

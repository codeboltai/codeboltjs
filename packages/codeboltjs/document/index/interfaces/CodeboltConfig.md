[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / CodeboltConfig

# Interface: CodeboltConfig

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1791](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1791)

## Properties

### features?

> `optional` **features**: `object`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1815](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1815)

Feature flags

#### autoRetry?

> `optional` **autoRetry**: `boolean`

#### caching?

> `optional` **caching**: `boolean`

#### compression?

> `optional` **compression**: `boolean`

***

### logging?

> `optional` **logging**: `object`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1801](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1801)

Logging configuration

#### enabled?

> `optional` **enabled**: `boolean`

#### format?

> `optional` **format**: `"text"` \| `"json"`

#### level?

> `optional` **level**: `"info"` \| `"error"` \| `"debug"` \| `"warn"`

***

### timeouts?

> `optional` **timeouts**: `object`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1807](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1807)

Default timeouts for operations

#### browser?

> `optional` **browser**: `number`

#### default?

> `optional` **default**: `number`

#### fileSystem?

> `optional` **fileSystem**: `number`

#### llm?

> `optional` **llm**: `number`

#### terminal?

> `optional` **terminal**: `number`

***

### websocket?

> `optional` **websocket**: `object`

Defined in: [packages/codeboltjs/src/types/libFunctionTypes.ts:1793](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/libFunctionTypes.ts#L1793)

WebSocket configuration

#### autoReconnect?

> `optional` **autoReconnect**: `boolean`

#### maxReconnectAttempts?

> `optional` **maxReconnectAttempts**: `number`

#### reconnectInterval?

> `optional` **reconnectInterval**: `number`

#### timeout?

> `optional` **timeout**: `number`

#### url?

> `optional` **url**: `string`

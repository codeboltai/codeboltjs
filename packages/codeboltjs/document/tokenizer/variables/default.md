[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [tokenizer.ts:7](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/tokenizer.ts#L7)

Tokenizer module for handling token-related operations.

## Type Declaration

### addToken()

> **addToken**: (`key`) => `Promise`\<`AddTokenResponse`\>

Adds a token to the system via WebSocket.

#### Parameters

##### key

`string`

The key associated with the token to be added.

#### Returns

`Promise`\<`AddTokenResponse`\>

A promise that resolves with the response from the add token event.

### getToken()

> **getToken**: (`key`) => `Promise`\<`GetTokenResponse`\>

Retrieves a token from the system via WebSocket.

#### Parameters

##### key

`string`

The key associated with the token to be retrieved.

#### Returns

`Promise`\<`GetTokenResponse`\>

A promise that resolves with the response from the get token event.

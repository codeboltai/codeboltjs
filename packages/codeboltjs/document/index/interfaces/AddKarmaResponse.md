[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / AddKarmaResponse

# Interface: AddKarmaResponse

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/agentPortfolio.d.ts:146

## Extends

- `BaseAgentPortfolioSDKResponse`

## Properties

### data?

> `optional` **data**: `object`

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/agentPortfolio.d.ts:148

Karma result - returned in 'data' property from cliLib

#### karmaId?

> `optional` **karmaId**: `string`

#### newTotal?

> `optional` **newTotal**: `number`

#### transaction?

> `optional` **transaction**: [`KarmaEntry`](KarmaEntry.md)

***

### error?

> `optional` **error**: `string`

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/agentPortfolio.d.ts:8

#### Inherited from

`BaseAgentPortfolioSDKResponse.error`

***

### message?

> `optional` **message**: `string`

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/agentPortfolio.d.ts:7

#### Inherited from

`BaseAgentPortfolioSDKResponse.message`

***

### requestId?

> `optional` **requestId**: `string`

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/agentPortfolio.d.ts:10

Request identifier

#### Inherited from

`BaseAgentPortfolioSDKResponse.requestId`

***

### success?

> `optional` **success**: `boolean`

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/agentPortfolio.d.ts:6

#### Inherited from

`BaseAgentPortfolioSDKResponse.success`

***

### timestamp?

> `optional` **timestamp**: `string`

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/agentPortfolio.d.ts:12

Response timestamp

#### Inherited from

`BaseAgentPortfolioSDKResponse.timestamp`

[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [packages/codeboltjs/src/modules/mail.ts:68](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/mail.ts#L68)

## Type Declaration

### acknowledge()

> **acknowledge**: (`params`) => `Promise`\<`IAcknowledgeResponse`\>

#### Parameters

##### params

`IAcknowledgeParams`

#### Returns

`Promise`\<`IAcknowledgeResponse`\>

### archiveThread()

> **archiveThread**: (`params`) => `Promise`\<[`IArchiveThreadResponse`](../interfaces/IArchiveThreadResponse.md)\>

#### Parameters

##### params

[`IArchiveThreadParams`](../interfaces/IArchiveThreadParams.md)

#### Returns

`Promise`\<[`IArchiveThreadResponse`](../interfaces/IArchiveThreadResponse.md)\>

### checkConflicts()

> **checkConflicts**: (`params`) => `Promise`\<`ICheckConflictsResponse`\>

#### Parameters

##### params

`ICheckConflictsParams`

#### Returns

`Promise`\<`ICheckConflictsResponse`\>

### createThread()

> **createThread**: (`params`) => `Promise`\<[`ICreateThreadResponse`](../interfaces/ICreateThreadResponse.md)\>

#### Parameters

##### params

[`ICreateThreadParams`](../interfaces/ICreateThreadParams.md)

#### Returns

`Promise`\<[`ICreateThreadResponse`](../interfaces/ICreateThreadResponse.md)\>

### fetchInbox()

> **fetchInbox**: (`params`) => `Promise`\<`IFetchInboxResponse`\>

#### Parameters

##### params

`IFetchInboxParams`

#### Returns

`Promise`\<`IFetchInboxResponse`\>

### findOrCreateThread()

> **findOrCreateThread**: (`params`) => `Promise`\<[`IFindOrCreateThreadResponse`](../interfaces/IFindOrCreateThreadResponse.md)\>

#### Parameters

##### params

[`IFindOrCreateThreadParams`](../interfaces/IFindOrCreateThreadParams.md)

#### Returns

`Promise`\<[`IFindOrCreateThreadResponse`](../interfaces/IFindOrCreateThreadResponse.md)\>

### forceReserveFiles()

> **forceReserveFiles**: (`params`) => `Promise`\<`IForceReserveFilesResponse`\>

#### Parameters

##### params

`IForceReserveFilesParams`

#### Returns

`Promise`\<`IForceReserveFilesResponse`\>

### getAgent()

> **getAgent**: (`params`) => `Promise`\<[`IGetAgentResponse`](../interfaces/IGetAgentResponse.md)\>

#### Parameters

##### params

[`IGetAgentParams`](../interfaces/IGetAgentParams.md)

#### Returns

`Promise`\<[`IGetAgentResponse`](../interfaces/IGetAgentResponse.md)\>

### getMessage()

> **getMessage**: (`params`) => `Promise`\<[`IGetMessageResponse`](../interfaces/IGetMessageResponse.md)\>

#### Parameters

##### params

[`IGetMessageParams`](../interfaces/IGetMessageParams.md)

#### Returns

`Promise`\<[`IGetMessageResponse`](../interfaces/IGetMessageResponse.md)\>

### getMessages()

> **getMessages**: (`params`) => `Promise`\<[`IGetMessagesResponse`](../interfaces/IGetMessagesResponse.md)\>

#### Parameters

##### params

[`IGetMessagesParams`](../interfaces/IGetMessagesParams.md)

#### Returns

`Promise`\<[`IGetMessagesResponse`](../interfaces/IGetMessagesResponse.md)\>

### getThread()

> **getThread**: (`params`) => `Promise`\<[`IGetThreadResponse`](../interfaces/IGetThreadResponse.md)\>

#### Parameters

##### params

[`IGetThreadParams`](../interfaces/IGetThreadParams.md)

#### Returns

`Promise`\<[`IGetThreadResponse`](../interfaces/IGetThreadResponse.md)\>

### listAgents()

> **listAgents**: () => `Promise`\<[`IListAgentsResponse`](../interfaces/IListAgentsResponse.md)\>

#### Returns

`Promise`\<[`IListAgentsResponse`](../interfaces/IListAgentsResponse.md)\>

### listReservations()

> **listReservations**: (`params`) => `Promise`\<`IListReservationsResponse`\>

#### Parameters

##### params

`IListReservationsParams`

#### Returns

`Promise`\<`IListReservationsResponse`\>

### listThreads()

> **listThreads**: (`params`) => `Promise`\<[`IListThreadsResponse`](../interfaces/IListThreadsResponse.md)\>

#### Parameters

##### params

[`IListThreadsParams`](../interfaces/IListThreadsParams.md) = `{}`

#### Returns

`Promise`\<[`IListThreadsResponse`](../interfaces/IListThreadsResponse.md)\>

### markRead()

> **markRead**: (`params`) => `Promise`\<`IMarkReadResponse`\>

#### Parameters

##### params

`IMarkReadParams`

#### Returns

`Promise`\<`IMarkReadResponse`\>

### registerAgent()

> **registerAgent**: (`params`) => `Promise`\<`IRegisterAgentResponse`\>

#### Parameters

##### params

`IRegisterAgentParams`

#### Returns

`Promise`\<`IRegisterAgentResponse`\>

### releaseFiles()

> **releaseFiles**: (`params`) => `Promise`\<`IReleaseFilesResponse`\>

#### Parameters

##### params

`IReleaseFilesParams`

#### Returns

`Promise`\<`IReleaseFilesResponse`\>

### replyMessage()

> **replyMessage**: (`params`) => `Promise`\<`IReplyMessageResponse`\>

#### Parameters

##### params

`IReplyMessageParams`

#### Returns

`Promise`\<`IReplyMessageResponse`\>

### reserveFiles()

> **reserveFiles**: (`params`) => `Promise`\<`IReserveFilesResponse`\>

#### Parameters

##### params

`IReserveFilesParams`

#### Returns

`Promise`\<`IReserveFilesResponse`\>

### search()

> **search**: (`params`) => `Promise`\<`ISearchResponse`\>

#### Parameters

##### params

`ISearchParams`

#### Returns

`Promise`\<`ISearchResponse`\>

### sendMessage()

> **sendMessage**: (`params`) => `Promise`\<`ISendMessageResponse`\>

#### Parameters

##### params

`ISendMessageParams`

#### Returns

`Promise`\<`ISendMessageResponse`\>

### summarizeThread()

> **summarizeThread**: (`params`) => `Promise`\<`ISummarizeThreadResponse`\>

#### Parameters

##### params

`ISummarizeThreadParams`

#### Returns

`Promise`\<`ISummarizeThreadResponse`\>

### updateThreadStatus()

> **updateThreadStatus**: (`params`) => `Promise`\<[`IUpdateThreadStatusResponse`](../interfaces/IUpdateThreadStatusResponse.md)\>

#### Parameters

##### params

[`IUpdateThreadStatusParams`](../interfaces/IUpdateThreadStatusParams.md)

#### Returns

`Promise`\<[`IUpdateThreadStatusResponse`](../interfaces/IUpdateThreadStatusResponse.md)\>

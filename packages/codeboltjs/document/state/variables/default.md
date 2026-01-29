[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [state.ts:8](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/state.ts#L8)

## Type Declaration

### addToAgentState()

> **addToAgentState**: (`key`, `value`) => `Promise`\<`AddToAgentStateResponse`\>

Adds a key-value pair to the agent's state on the server via WebSocket.

#### Parameters

##### key

`string`

The key to add to the agent's state.

##### value

`string`

The value associated with the key.

#### Returns

`Promise`\<`AddToAgentStateResponse`\>

A promise that resolves with the response to the addition request.

### getAgentState()

> **getAgentState**: () => `Promise`\<`GetAgentStateResponse`\>

Retrieves the current state of the agent from the server via WebSocket.

#### Returns

`Promise`\<`GetAgentStateResponse`\>

A promise that resolves with the agent's state.

### getApplicationState()

> **getApplicationState**: () => `Promise`\<`ApplicationState`\>

Retrieves the current application state from the server via WebSocket.

#### Returns

`Promise`\<`ApplicationState`\>

A promise that resolves with the application state.

### getProjectState()

> **getProjectState**: () => `Promise`\<`GetProjectStateResponse`\>

Retrieves the current project state from the server via WebSocket.

#### Returns

`Promise`\<`GetProjectStateResponse`\>

A promise that resolves with the project's state.

### updateProjectState()

> **updateProjectState**: (`key`, `value`) => `Promise`\<`UpdateProjectStateResponse`\>

Updates the project state on the server via WebSocket.

#### Parameters

##### key

`string`

The key to update in the project state.

##### value

`any`

The value to set for the key.

#### Returns

`Promise`\<`UpdateProjectStateResponse`\>

A promise that resolves with the response to the update request.

[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [packages/codeboltjs/src/modules/capability.ts:44](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/capability.ts#L44)

Capability Module
Provides functionality for managing and executing capabilities (Skills, Powers, Talents)

Implements Requirements: 9.1, 9.2, 9.3, 9.4, 9.5

## Type Declaration

### getCapabilitiesByAuthor()

> **getCapabilitiesByAuthor**: (`author`) => `Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

Get capabilities by author

#### Parameters

##### author

`string`

Author to filter by

#### Returns

`Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

Promise resolving to list of capabilities by the specified author

Requirements: 9.1

### getCapabilitiesByTag()

> **getCapabilitiesByTag**: (`tag`) => `Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

Get capabilities by tag

#### Parameters

##### tag

`string`

Tag to filter by

#### Returns

`Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

Promise resolving to list of capabilities with the specified tag

Requirements: 9.1

### getCapabilityDetail()

> **getCapabilityDetail**: (`capabilityName`, `capabilityType?`) => `Promise`\<[`GetCapabilityDetailResponse`](../interfaces/GetCapabilityDetailResponse.md)\>

Get detailed information about a specific capability

#### Parameters

##### capabilityName

`string`

Name of the capability

##### capabilityType?

`string`

Optional type to narrow search

#### Returns

`Promise`\<[`GetCapabilityDetailResponse`](../interfaces/GetCapabilityDetailResponse.md)\>

Promise resolving to capability details

Requirements: 9.2

### getExecutionStatus()

> **getExecutionStatus**: (`executionId`) => `Promise`\<[`GetExecutionStatusResponse`](../interfaces/GetExecutionStatusResponse.md)\>

Get the status of a capability execution

#### Parameters

##### executionId

`string`

ID of the execution

#### Returns

`Promise`\<[`GetExecutionStatusResponse`](../interfaces/GetExecutionStatusResponse.md)\>

Promise resolving to execution status

### listCapabilities()

> **listCapabilities**: (`filter?`) => `Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

List all available capabilities with optional filtering

#### Parameters

##### filter?

[`CapabilityFilter`](../interfaces/CapabilityFilter.md)

Optional filter criteria (type, tags, author)

#### Returns

`Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

Promise resolving to list of capabilities

Requirements: 9.1

### listCapabilitiesByType()

> **listCapabilitiesByType**: (`capabilityType`) => `Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

List capabilities by type

#### Parameters

##### capabilityType

`string`

Type of capabilities to list (skill, power, talent, etc.)

#### Returns

`Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

Promise resolving to list of capabilities of the specified type

Requirements: 9.1

### listExecutors()

> **listExecutors**: () => `Promise`\<[`ListExecutorsResponse`](../interfaces/ListExecutorsResponse.md)\>

List all available capability executors

#### Returns

`Promise`\<[`ListExecutorsResponse`](../interfaces/ListExecutorsResponse.md)\>

Promise resolving to list of executors

Requirements: 9.3

### listPowers()

> **listPowers**: () => `Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

List all available powers

#### Returns

`Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

Promise resolving to list of powers

Requirements: 9.1

### listSkills()

> **listSkills**: () => `Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

List all available skills

#### Returns

`Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

Promise resolving to list of skills

Requirements: 9.1

### listTalents()

> **listTalents**: () => `Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

List all available talents

#### Returns

`Promise`\<[`ListCapabilitiesResponse`](../interfaces/ListCapabilitiesResponse.md)\>

Promise resolving to list of talents

Requirements: 9.1

### startCapability()

> **startCapability**: (`capabilityName`, `capabilityType`, `params?`, `timeout?`) => `Promise`\<[`StartCapabilityResponse`](../interfaces/StartCapabilityResponse.md)\>

Start a capability execution

#### Parameters

##### capabilityName

`string`

Name of the capability to execute

##### capabilityType

`string`

Type of the capability (skill, power, talent, etc.)

##### params?

`Record`\<`string`, `any`\>

Optional parameters to pass to the capability

##### timeout?

`number`

Optional execution timeout in milliseconds

#### Returns

`Promise`\<[`StartCapabilityResponse`](../interfaces/StartCapabilityResponse.md)\>

Promise resolving to execution ID

Requirements: 9.4

### startPower()

> **startPower**: (`powerName`, `params?`, `timeout?`) => `Promise`\<[`StartCapabilityResponse`](../interfaces/StartCapabilityResponse.md)\>

Start a power execution

#### Parameters

##### powerName

`string`

Name of the power to execute

##### params?

`Record`\<`string`, `any`\>

Optional parameters to pass to the power

##### timeout?

`number`

Optional execution timeout in milliseconds

#### Returns

`Promise`\<[`StartCapabilityResponse`](../interfaces/StartCapabilityResponse.md)\>

Promise resolving to execution ID

Requirements: 9.4

### startSkill()

> **startSkill**: (`skillName`, `params?`, `timeout?`) => `Promise`\<[`StartCapabilityResponse`](../interfaces/StartCapabilityResponse.md)\>

Start a skill execution

#### Parameters

##### skillName

`string`

Name of the skill to execute

##### params?

`Record`\<`string`, `any`\>

Optional parameters to pass to the skill

##### timeout?

`number`

Optional execution timeout in milliseconds

#### Returns

`Promise`\<[`StartCapabilityResponse`](../interfaces/StartCapabilityResponse.md)\>

Promise resolving to execution ID

Requirements: 9.4

### startTalent()

> **startTalent**: (`talentName`, `params?`, `timeout?`) => `Promise`\<[`StartCapabilityResponse`](../interfaces/StartCapabilityResponse.md)\>

Start a talent execution

#### Parameters

##### talentName

`string`

Name of the talent to execute

##### params?

`Record`\<`string`, `any`\>

Optional parameters to pass to the talent

##### timeout?

`number`

Optional execution timeout in milliseconds

#### Returns

`Promise`\<[`StartCapabilityResponse`](../interfaces/StartCapabilityResponse.md)\>

Promise resolving to execution ID

Requirements: 9.4

### stopCapability()

> **stopCapability**: (`executionId`) => `Promise`\<[`StopCapabilityResponse`](../interfaces/StopCapabilityResponse.md)\>

Stop a running capability execution

#### Parameters

##### executionId

`string`

ID of the execution to stop

#### Returns

`Promise`\<[`StopCapabilityResponse`](../interfaces/StopCapabilityResponse.md)\>

Promise resolving to success status

Requirements: 9.5

[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / CapabilityExecutionMetadata

# Interface: CapabilityExecutionMetadata

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/capability.d.ts:90

Capability execution metadata

## Properties

### capabilityName

> **capabilityName**: `string`

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/capability.d.ts:94

Name of the capability being executed

***

### capabilityType

> **capabilityType**: `string`

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/capability.d.ts:96

Type of the capability

***

### executorName

> **executorName**: `string`

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/capability.d.ts:98

Name of the executor running the capability

***

### id

> **id**: `string`

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/capability.d.ts:92

Unique identifier for this execution

***

### parentAgentId

> **parentAgentId**: `string`

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/capability.d.ts:104

Parent agent ID

***

### parentAgentInstanceId

> **parentAgentInstanceId**: `string`

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/capability.d.ts:106

Parent agent instance ID

***

### sideExecutionId

> **sideExecutionId**: `string`

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/capability.d.ts:100

ID of the underlying side execution

***

### startTime

> **startTime**: `number`

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/capability.d.ts:108

Start timestamp

***

### status

> **status**: `"timeout"` \| `"completed"` \| `"failed"` \| `"running"` \| `"starting"` \| `"stopping"` \| `"stopped"`

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/capability.d.ts:110

Current status

***

### threadId

> **threadId**: `string`

Defined in: common/types/dist/codeboltjstypes/libFunctionTypes/capability.d.ts:102

Thread ID (same as parent agent)

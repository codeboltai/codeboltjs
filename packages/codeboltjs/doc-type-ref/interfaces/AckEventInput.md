---
title: AckEventInput
---

[**@codebolt/codeboltjs**](../index)

***

# Interface: AckEventInput

Defined in: [packages/codeboltjs/src/types/agentEventQueue.ts:256](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L256)

Input for acknowledging an event

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="errormessage"></a> `errorMessage?` | `string` | Error message if processing failed | [packages/codeboltjs/src/types/agentEventQueue.ts:262](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L262) |
| <a id="eventid"></a> `eventId` | `string` | ID of the event to acknowledge | [packages/codeboltjs/src/types/agentEventQueue.ts:258](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L258) |
| <a id="success"></a> `success` | `boolean` | Whether processing was successful | [packages/codeboltjs/src/types/agentEventQueue.ts:260](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/agentEventQueue.ts#L260) |

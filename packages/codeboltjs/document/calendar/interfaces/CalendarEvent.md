[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / CalendarEvent

# Interface: CalendarEvent

Defined in: [calendar.ts:29](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L29)

## Properties

### agenda?

> `optional` **agenda**: `string`

Defined in: [calendar.ts:47](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L47)

***

### allDay?

> `optional` **allDay**: `boolean`

Defined in: [calendar.ts:37](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L37)

***

### checkType?

> `optional` **checkType**: [`CalendarCheckType`](../type-aliases/CalendarCheckType.md)

Defined in: [calendar.ts:48](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L48)

***

### completed?

> `optional` **completed**: `boolean`

Defined in: [calendar.ts:51](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L51)

***

### completedAt?

> `optional` **completedAt**: `string`

Defined in: [calendar.ts:52](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L52)

***

### createdAt

> **createdAt**: `string`

Defined in: [calendar.ts:53](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L53)

***

### createdBy

> **createdBy**: [`CalendarParticipant`](CalendarParticipant.md)

Defined in: [calendar.ts:55](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L55)

***

### cronExpression?

> `optional` **cronExpression**: `string`

Defined in: [calendar.ts:41](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L41)

***

### description?

> `optional` **description**: `string`

Defined in: [calendar.ts:32](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L32)

***

### endTime?

> `optional` **endTime**: `string`

Defined in: [calendar.ts:35](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L35)

***

### eventType

> **eventType**: [`CalendarEventType`](../type-aliases/CalendarEventType.md)

Defined in: [calendar.ts:33](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L33)

***

### hasDuration

> **hasDuration**: `boolean`

Defined in: [calendar.ts:36](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L36)

***

### id

> **id**: `string`

Defined in: [calendar.ts:30](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L30)

***

### isRecurring?

> `optional` **isRecurring**: `boolean`

Defined in: [calendar.ts:40](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L40)

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `any`\>

Defined in: [calendar.ts:50](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L50)

***

### participants?

> `optional` **participants**: [`CalendarParticipant`](CalendarParticipant.md)[]

Defined in: [calendar.ts:39](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L39)

***

### recurrenceEndTime?

> `optional` **recurrenceEndTime**: `string`

Defined in: [calendar.ts:42](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L42)

***

### reminder?

> `optional` **reminder**: `object`

Defined in: [calendar.ts:43](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L43)

#### enabled

> **enabled**: `boolean`

#### minutesBefore

> **minutesBefore**: `number`

***

### startTime

> **startTime**: `string`

Defined in: [calendar.ts:34](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L34)

***

### swarmId?

> `optional` **swarmId**: `string`

Defined in: [calendar.ts:38](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L38)

***

### tags?

> `optional` **tags**: `string`[]

Defined in: [calendar.ts:49](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L49)

***

### title

> **title**: `string`

Defined in: [calendar.ts:31](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L31)

***

### updatedAt

> **updatedAt**: `string`

Defined in: [calendar.ts:54](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/calendar.ts#L54)

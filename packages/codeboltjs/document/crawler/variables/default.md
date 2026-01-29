[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [crawler.ts:6](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/crawler.ts#L6)

A module for controlling a web crawler through WebSocket messages.

## Type Declaration

### click()

> **click**: (`id`) => `Promise`\<`any`\>

Simulates a click event on an element with the specified ID.

#### Parameters

##### id

`string`

The ID of the element to be clicked.

#### Returns

`Promise`\<`any`\>

A promise that resolves when the click action is complete.

### goToPage()

> **goToPage**: (`url`) => `void`

Directs the crawler to navigate to a specified URL.

#### Parameters

##### url

`string`

The URL for the crawler to navigate to.

#### Returns

`void`

### screenshot()

> **screenshot**: () => `void`

Takes a screenshot using the crawler.

#### Returns

`void`

### scroll()

> **scroll**: (`direction`) => `void`

Scrolls the crawler in a specified direction.

#### Parameters

##### direction

`string`

The direction to scroll ('up', 'down', 'left', 'right').

#### Returns

`void`

### start()

> **start**: () => `void`

Starts the crawler.

#### Returns

`void`

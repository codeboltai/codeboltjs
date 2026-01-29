[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / IntentLevel

# Type Alias: IntentLevel

> **IntentLevel** = `1` \| `2` \| `3` \| `4`

Defined in: [packages/codeboltjs/src/types/fileUpdateIntent.ts:13](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/types/fileUpdateIntent.ts#L13)

Intent Level - determines behavior on overlap
1 = Advisory/Notification - Just informs others; no enforcement. Overlapping agents proceed but log warning.
2 = Soft Reservation - Prefer avoidance: Agents should pick another task or negotiate if overlap.
3 = Priority-Based - Higher-priority intent wins; lower one backs off or escalates.
4 = Hard Lock - Blocks others entirely (fallback to traditional locking).

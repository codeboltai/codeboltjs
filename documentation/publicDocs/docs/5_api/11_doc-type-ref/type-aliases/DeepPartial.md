---
title: DeepPartial
---

[**@codebolt/codeboltjs**](../index)

***

# Type Alias: DeepPartial\<T\>

```ts
type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] };
```

Defined in: [packages/codeboltjs/src/types/commonTypes.ts:262](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/commonTypes.ts#L262)

Makes all properties of T optional recursively

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

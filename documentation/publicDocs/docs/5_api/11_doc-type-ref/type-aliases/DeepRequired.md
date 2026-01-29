---
title: DeepRequired
---

[**@codebolt/codeboltjs**](../index)

***

# Type Alias: DeepRequired\<T\>

```ts
type DeepRequired<T> = { [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P] };
```

Defined in: [packages/codeboltjs/src/types/commonTypes.ts:269](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/commonTypes.ts#L269)

Makes all properties of T required recursively

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

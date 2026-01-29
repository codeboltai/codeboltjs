---
title: Required
---

[**@codebolt/codeboltjs**](../index)

***

# Type Alias: Required\<T, K\>

```ts
type Required<T, K> = T & { [P in K]-?: T[P] };
```

Defined in: [packages/codeboltjs/src/types/commonTypes.ts:288](https://github.com/codeboltai/codeboltjs/blob/36eac18c55e0c3027fd350e40230c8db1c7ff3af/packages/codeboltjs/src/types/commonTypes.ts#L288)

Make specific properties required

## Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `K` *extends* keyof `T` |

---
title: ReviewRequestStatus
---

[**@codebolt/codeboltjs**](../README)

***

# Type Alias: ReviewRequestStatus

```ts
type ReviewRequestStatus = 
  | "draft"
  | "pending_review"
  | "in_review"
  | "changes_requested"
  | "approved"
  | "review_completed"
  | "merged"
  | "rejected"
  | "closed";
```

Defined in: [packages/codeboltjs/src/types/reviewMergeRequest.ts:6](https://github.com/codeboltai/codeboltjs/blob/5bb856e41fe1f2472321cbac2497f5041bf947fb/packages/codeboltjs/src/types/reviewMergeRequest.ts#L6)

Request status types representing the lifecycle of a review request

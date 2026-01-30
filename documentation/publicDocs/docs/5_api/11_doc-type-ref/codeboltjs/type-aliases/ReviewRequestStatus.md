---
title: ReviewRequestStatus
---

[**@codebolt/codeboltjs**](../index)

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

Defined in: packages/codeboltjs/src/types/reviewMergeRequest.ts:6

Request status types representing the lifecycle of a review request

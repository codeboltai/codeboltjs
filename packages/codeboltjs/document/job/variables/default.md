[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [job.ts:57](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/job.ts#L57)

Job service client for codeboltjs.
Mirrors backend CLI job operations exposed via WebSocket (jobEvent).
Follows the same pattern as task.ts and todo.ts modules.

## Type Declaration

### acceptBid()

> **acceptBid**: (`jobId`, `bidId`) => `Promise`\<`JobBidAcceptResponse`\>

#### Parameters

##### jobId

`string`

##### bidId

`string`

#### Returns

`Promise`\<`JobBidAcceptResponse`\>

### acceptSplitProposal()

> **acceptSplitProposal**: (`jobId`, `proposalId`) => `Promise`\<`JobSplitAcceptResponse`\>

#### Parameters

##### jobId

`string`

##### proposalId

`string`

#### Returns

`Promise`\<`JobSplitAcceptResponse`\>

### addBid()

> **addBid**: (`jobId`, `bid`) => `Promise`\<`JobBidAddResponse`\>

#### Parameters

##### jobId

`string`

##### bid

`AddBidData`

#### Returns

`Promise`\<`JobBidAddResponse`\>

### addBlocker()

> **addBlocker**: (`jobId`, `blocker`) => `Promise`\<`JobBlockerAddResponse`\>

#### Parameters

##### jobId

`string`

##### blocker

`AddBlockerData`

#### Returns

`Promise`\<`JobBlockerAddResponse`\>

### addDependency()

> **addDependency**: (`jobId`, `targetId`, `type?`) => `Promise`\<`JobDependencyResponse`\>

#### Parameters

##### jobId

`string`

##### targetId

`string`

##### type?

`DependencyType`

#### Returns

`Promise`\<`JobDependencyResponse`\>

### addLabel()

> **addLabel**: (`label`) => `Promise`\<`JobLabelsResponse`\>

#### Parameters

##### label

`string`

#### Returns

`Promise`\<`JobLabelsResponse`\>

### addPheromoneType()

> **addPheromoneType**: (`data`) => `Promise`\<`JobPheromoneTypeResponse`\>

#### Parameters

##### data

`AddPheromoneTypeData`

#### Returns

`Promise`\<`JobPheromoneTypeResponse`\>

### addSplitProposal()

> **addSplitProposal**: (`jobId`, `proposal`) => `Promise`\<`JobSplitProposeResponse`\>

#### Parameters

##### jobId

`string`

##### proposal

`AddSplitProposalData`

#### Returns

`Promise`\<`JobSplitProposeResponse`\>

### addUnlockRequest()

> **addUnlockRequest**: (`jobId`, `request`) => `Promise`\<`JobUnlockRequestAddResponse`\>

#### Parameters

##### jobId

`string`

##### request

`AddUnlockRequestData`

#### Returns

`Promise`\<`JobUnlockRequestAddResponse`\>

### approveUnlockRequest()

> **approveUnlockRequest**: (`jobId`, `unlockRequestId`, `respondedBy`) => `Promise`\<`JobUnlockRequestApproveResponse`\>

#### Parameters

##### jobId

`string`

##### unlockRequestId

`string`

##### respondedBy

`string`

#### Returns

`Promise`\<`JobUnlockRequestApproveResponse`\>

### createJob()

> **createJob**: (`groupId`, `data`) => `Promise`\<`JobCreateResponse`\>

#### Parameters

##### groupId

`string`

##### data

`CreateJobData`

#### Returns

`Promise`\<`JobCreateResponse`\>

### createJobGroup()

> **createJobGroup**: (`data`) => `Promise`\<`JobGroupCreateResponse`\>

#### Parameters

##### data

`CreateJobGroupData`

#### Returns

`Promise`\<`JobGroupCreateResponse`\>

### deleteJob()

> **deleteJob**: (`jobId`) => `Promise`\<`JobDeleteResponse`\>

#### Parameters

##### jobId

`string`

#### Returns

`Promise`\<`JobDeleteResponse`\>

### deleteJobs()

> **deleteJobs**: (`jobIds`) => `Promise`\<`JobDeleteBulkResponse`\>

#### Parameters

##### jobIds

`string`[]

#### Returns

`Promise`\<`JobDeleteBulkResponse`\>

### deleteSplitProposal()

> **deleteSplitProposal**: (`jobId`, `proposalId`) => `Promise`\<`JobSplitDeleteResponse`\>

#### Parameters

##### jobId

`string`

##### proposalId

`string`

#### Returns

`Promise`\<`JobSplitDeleteResponse`\>

### deleteUnlockRequest()

> **deleteUnlockRequest**: (`jobId`, `unlockRequestId`) => `Promise`\<`JobUnlockRequestDeleteResponse`\>

#### Parameters

##### jobId

`string`

##### unlockRequestId

`string`

#### Returns

`Promise`\<`JobUnlockRequestDeleteResponse`\>

### depositPheromone()

> **depositPheromone**: (`jobId`, `deposit`) => `Promise`\<`JobPheromoneDepositResponse`\>

#### Parameters

##### jobId

`string`

##### deposit

`DepositPheromoneData`

#### Returns

`Promise`\<`JobPheromoneDepositResponse`\>

### getBlockedJobs()

> **getBlockedJobs**: (`filters`) => `Promise`\<`JobReadyBlockedResponse`\>

#### Parameters

##### filters

`JobListFilters` = `{}`

#### Returns

`Promise`\<`JobReadyBlockedResponse`\>

### getJob()

> **getJob**: (`jobId`) => `Promise`\<`JobShowResponse`\>

#### Parameters

##### jobId

`string`

#### Returns

`Promise`\<`JobShowResponse`\>

### getPheromones()

> **getPheromones**: (`jobId`) => `Promise`\<`JobPheromoneListResponse`\>

#### Parameters

##### jobId

`string`

#### Returns

`Promise`\<`JobPheromoneListResponse`\>

### getPheromonesAggregated()

> **getPheromonesAggregated**: (`jobId`) => `Promise`\<`JobPheromoneAggregatedResponse`\>

#### Parameters

##### jobId

`string`

#### Returns

`Promise`\<`JobPheromoneAggregatedResponse`\>

### getPheromonesAggregatedWithDecay()

> **getPheromonesAggregatedWithDecay**: (`jobId`) => `Promise`\<`JobPheromoneAggregatedResponse`\>

#### Parameters

##### jobId

`string`

#### Returns

`Promise`\<`JobPheromoneAggregatedResponse`\>

### getPheromonesWithDecay()

> **getPheromonesWithDecay**: (`jobId`) => `Promise`\<`JobPheromoneListResponse`\>

#### Parameters

##### jobId

`string`

#### Returns

`Promise`\<`JobPheromoneListResponse`\>

### getPheromoneTypes()

> **getPheromoneTypes**: () => `Promise`\<`JobPheromoneTypesResponse`\>

#### Returns

`Promise`\<`JobPheromoneTypesResponse`\>

### getReadyJobs()

> **getReadyJobs**: (`filters`) => `Promise`\<`JobReadyBlockedResponse`\>

#### Parameters

##### filters

`JobListFilters` = `{}`

#### Returns

`Promise`\<`JobReadyBlockedResponse`\>

### isJobLocked()

> **isJobLocked**: (`jobId`) => `Promise`\<`JobLockCheckResponse`\>

#### Parameters

##### jobId

`string`

#### Returns

`Promise`\<`JobLockCheckResponse`\>

### listBids()

> **listBids**: (`jobId`) => `Promise`\<`JobBidListResponse`\>

#### Parameters

##### jobId

`string`

#### Returns

`Promise`\<`JobBidListResponse`\>

### listJobs()

> **listJobs**: (`filters`) => `Promise`\<`JobListResponse`\>

#### Parameters

##### filters

`JobListFilters` = `{}`

#### Returns

`Promise`\<`JobListResponse`\>

### listJobsByPheromone()

> **listJobsByPheromone**: (`type`, `minIntensity?`) => `Promise`\<`JobPheromoneSearchResponse`\>

#### Parameters

##### type

`string`

##### minIntensity?

`number`

#### Returns

`Promise`\<`JobPheromoneSearchResponse`\>

### listLabels()

> **listLabels**: () => `Promise`\<`JobLabelsResponse`\>

#### Returns

`Promise`\<`JobLabelsResponse`\>

### lockJob()

> **lockJob**: (`jobId`, `agentId`, `agentName?`) => `Promise`\<`JobLockAcquireResponse`\>

#### Parameters

##### jobId

`string`

##### agentId

`string`

##### agentName?

`string`

#### Returns

`Promise`\<`JobLockAcquireResponse`\>

### rejectUnlockRequest()

> **rejectUnlockRequest**: (`jobId`, `unlockRequestId`, `respondedBy`) => `Promise`\<`JobUnlockRequestRejectResponse`\>

#### Parameters

##### jobId

`string`

##### unlockRequestId

`string`

##### respondedBy

`string`

#### Returns

`Promise`\<`JobUnlockRequestRejectResponse`\>

### removeBlocker()

> **removeBlocker**: (`jobId`, `blockerId`) => `Promise`\<`JobBlockerRemoveResponse`\>

#### Parameters

##### jobId

`string`

##### blockerId

`string`

#### Returns

`Promise`\<`JobBlockerRemoveResponse`\>

### removeDependency()

> **removeDependency**: (`jobId`, `targetId`) => `Promise`\<`JobDependencyResponse`\>

#### Parameters

##### jobId

`string`

##### targetId

`string`

#### Returns

`Promise`\<`JobDependencyResponse`\>

### removeLabel()

> **removeLabel**: (`label`) => `Promise`\<`JobLabelsResponse`\>

#### Parameters

##### label

`string`

#### Returns

`Promise`\<`JobLabelsResponse`\>

### removePheromone()

> **removePheromone**: (`jobId`, `type`, `depositedBy?`) => `Promise`\<`JobPheromoneRemoveResponse`\>

#### Parameters

##### jobId

`string`

##### type

`string`

##### depositedBy?

`string`

#### Returns

`Promise`\<`JobPheromoneRemoveResponse`\>

### removePheromoneType()

> **removePheromoneType**: (`name`) => `Promise`\<`JobPheromoneTypeResponse`\>

#### Parameters

##### name

`string`

#### Returns

`Promise`\<`JobPheromoneTypeResponse`\>

### resolveBlocker()

> **resolveBlocker**: (`jobId`, `blockerId`, `resolvedBy`) => `Promise`\<`JobBlockerResolveResponse`\>

#### Parameters

##### jobId

`string`

##### blockerId

`string`

##### resolvedBy

`string`

#### Returns

`Promise`\<`JobBlockerResolveResponse`\>

### unlockJob()

> **unlockJob**: (`jobId`, `agentId`) => `Promise`\<`JobLockReleaseResponse`\>

#### Parameters

##### jobId

`string`

##### agentId

`string`

#### Returns

`Promise`\<`JobLockReleaseResponse`\>

### updateJob()

> **updateJob**: (`jobId`, `data`) => `Promise`\<`JobUpdateResponse`\>

#### Parameters

##### jobId

`string`

##### data

`UpdateJobData`

#### Returns

`Promise`\<`JobUpdateResponse`\>

### withdrawBid()

> **withdrawBid**: (`jobId`, `bidId`) => `Promise`\<`JobBidWithdrawResponse`\>

#### Parameters

##### jobId

`string`

##### bidId

`string`

#### Returns

`Promise`\<`JobBidWithdrawResponse`\>

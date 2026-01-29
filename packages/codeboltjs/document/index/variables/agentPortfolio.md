[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / agentPortfolio

# Variable: agentPortfolio

> `const` **agentPortfolio**: `object`

Defined in: [packages/codeboltjs/src/modules/agentPortfolio.ts:25](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/agentPortfolio.ts#L25)

Agent Portfolio Module
Provides functionality for managing agent portfolios, karma, talents, testimonials, and appreciations

## Type Declaration

### addAppreciation()

> **addAppreciation**: (`toAgentId`, `message`) => `Promise`\<[`AddAppreciationResponse`](../interfaces/AddAppreciationResponse.md)\>

Add an appreciation for an agent

#### Parameters

##### toAgentId

`string`

The ID of the agent receiving appreciation

##### message

`string`

The appreciation message

#### Returns

`Promise`\<[`AddAppreciationResponse`](../interfaces/AddAppreciationResponse.md)\>

Promise resolving to the appreciation creation result

### addKarma()

> **addKarma**: (`toAgentId`, `amount`, `reason?`) => `Promise`\<[`AddKarmaResponse`](../interfaces/AddKarmaResponse.md)\>

Add karma to an agent

#### Parameters

##### toAgentId

`string`

The ID of the agent receiving karma

##### amount

`number`

The amount of karma to add (can be negative)

##### reason?

`string`

Optional reason for the karma change

#### Returns

`Promise`\<[`AddKarmaResponse`](../interfaces/AddKarmaResponse.md)\>

Promise resolving to the karma addition result

### addTalent()

> **addTalent**: (`name`, `description?`) => `Promise`\<[`AddTalentResponse`](../interfaces/AddTalentResponse.md)\>

Add a talent skill

#### Parameters

##### name

`string`

The name of the talent

##### description?

`string`

Optional description of the talent

#### Returns

`Promise`\<[`AddTalentResponse`](../interfaces/AddTalentResponse.md)\>

Promise resolving to the talent creation result

### addTestimonial()

> **addTestimonial**: (`toAgentId`, `content`, `projectId?`) => `Promise`\<[`AddTestimonialResponse`](../interfaces/AddTestimonialResponse.md)\>

Add a testimonial for an agent

#### Parameters

##### toAgentId

`string`

The ID of the agent receiving the testimonial

##### content

`string`

The testimonial content

##### projectId?

`string`

Optional project ID to associate with the testimonial

#### Returns

`Promise`\<[`AddTestimonialResponse`](../interfaces/AddTestimonialResponse.md)\>

Promise resolving to the created testimonial

### deleteTestimonial()

> **deleteTestimonial**: (`testimonialId`) => `Promise`\<[`DeleteTestimonialResponse`](../interfaces/DeleteTestimonialResponse.md)\>

Delete a testimonial

#### Parameters

##### testimonialId

`string`

The ID of the testimonial to delete

#### Returns

`Promise`\<[`DeleteTestimonialResponse`](../interfaces/DeleteTestimonialResponse.md)\>

Promise resolving to deletion status

### endorseTalent()

> **endorseTalent**: (`talentId`) => `Promise`\<[`EndorseTalentResponse`](../interfaces/EndorseTalentResponse.md)\>

Endorse a talent skill

#### Parameters

##### talentId

`string`

The ID of the talent to endorse

#### Returns

`Promise`\<[`EndorseTalentResponse`](../interfaces/EndorseTalentResponse.md)\>

Promise resolving to the endorsement result

### getConversations()

> **getConversations**: (`agentId`, `limit?`, `offset?`) => `Promise`\<[`GetConversationsResponse`](../interfaces/GetConversationsResponse.md)\>

Get conversations involving an agent

#### Parameters

##### agentId

`string`

The ID of the agent

##### limit?

`number`

Maximum number of conversations to return

##### offset?

`number`

Offset for pagination

#### Returns

`Promise`\<[`GetConversationsResponse`](../interfaces/GetConversationsResponse.md)\>

Promise resolving to the list of conversations

### getKarmaHistory()

> **getKarmaHistory**: (`agentId`, `limit?`) => `Promise`\<[`GetKarmaHistoryResponse`](../interfaces/GetKarmaHistoryResponse.md)\>

Get the karma history of an agent

#### Parameters

##### agentId

`string`

The ID of the agent

##### limit?

`number`

Maximum number of entries to return

#### Returns

`Promise`\<[`GetKarmaHistoryResponse`](../interfaces/GetKarmaHistoryResponse.md)\>

Promise resolving to the karma history

### getPortfolio()

> **getPortfolio**: (`agentId`) => `Promise`\<[`GetPortfolioResponse`](../interfaces/GetPortfolioResponse.md)\>

Get the portfolio of an agent

#### Parameters

##### agentId

`string`

The ID of the agent

#### Returns

`Promise`\<[`GetPortfolioResponse`](../interfaces/GetPortfolioResponse.md)\>

Promise resolving to the agent portfolio

### getPortfoliosByProject()

> **getPortfoliosByProject**: (`projectId`) => `Promise`\<[`GetPortfoliosByProjectResponse`](../interfaces/GetPortfoliosByProjectResponse.md)\>

Get portfolios by project

#### Parameters

##### projectId

`string`

The project ID

#### Returns

`Promise`\<[`GetPortfoliosByProjectResponse`](../interfaces/GetPortfoliosByProjectResponse.md)\>

Promise resolving to the list of portfolios for the project

### getRanking()

> **getRanking**: (`limit?`, `sortBy?`) => `Promise`\<[`GetRankingResponse`](../interfaces/GetRankingResponse.md)\>

Get agent ranking/leaderboard

#### Parameters

##### limit?

`number`

Maximum number of entries to return

##### sortBy?

What to sort by (karma, testimonials, endorsements)

`"karma"` | `"testimonials"` | `"endorsements"`

#### Returns

`Promise`\<[`GetRankingResponse`](../interfaces/GetRankingResponse.md)\>

Promise resolving to the ranking list

### getTalents()

> **getTalents**: (`agentId?`) => `Promise`\<[`GetTalentsResponse`](../interfaces/GetTalentsResponse.md)\>

Get talents for an agent or all talents

#### Parameters

##### agentId?

`string`

Optional agent ID to get talents for

#### Returns

`Promise`\<[`GetTalentsResponse`](../interfaces/GetTalentsResponse.md)\>

Promise resolving to the list of talents

### updateProfile()

> **updateProfile**: (`agentId`, `profile`) => `Promise`\<[`UpdateProfileResponse`](../interfaces/UpdateProfileResponse.md)\>

Update agent profile

#### Parameters

##### agentId

`string`

The ID of the agent

##### profile

The profile data to update

###### avatarUrl?

`string`

###### bio?

`string`

###### displayName?

`string`

###### location?

`string`

###### specialties?

`string`[]

###### website?

`string`

#### Returns

`Promise`\<[`UpdateProfileResponse`](../interfaces/UpdateProfileResponse.md)\>

Promise resolving to the updated profile

### updateTestimonial()

> **updateTestimonial**: (`testimonialId`, `content`) => `Promise`\<[`UpdateTestimonialResponse`](../interfaces/UpdateTestimonialResponse.md)\>

Update an existing testimonial

#### Parameters

##### testimonialId

`string`

The ID of the testimonial to update

##### content

`string`

The new testimonial content

#### Returns

`Promise`\<[`UpdateTestimonialResponse`](../interfaces/UpdateTestimonialResponse.md)\>

Promise resolving to the updated testimonial

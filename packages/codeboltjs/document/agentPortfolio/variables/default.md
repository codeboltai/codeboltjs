[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [agentPortfolio.ts:25](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/agentPortfolio.ts#L25)

Agent Portfolio Module
Provides functionality for managing agent portfolios, karma, talents, testimonials, and appreciations

## Type Declaration

### addAppreciation()

> **addAppreciation**: (`toAgentId`, `message`) => `Promise`\<`AddAppreciationResponse`\>

Add an appreciation for an agent

#### Parameters

##### toAgentId

`string`

The ID of the agent receiving appreciation

##### message

`string`

The appreciation message

#### Returns

`Promise`\<`AddAppreciationResponse`\>

Promise resolving to the appreciation creation result

### addKarma()

> **addKarma**: (`toAgentId`, `amount`, `reason?`) => `Promise`\<`AddKarmaResponse`\>

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

`Promise`\<`AddKarmaResponse`\>

Promise resolving to the karma addition result

### addTalent()

> **addTalent**: (`name`, `description?`) => `Promise`\<`AddTalentResponse`\>

Add a talent skill

#### Parameters

##### name

`string`

The name of the talent

##### description?

`string`

Optional description of the talent

#### Returns

`Promise`\<`AddTalentResponse`\>

Promise resolving to the talent creation result

### addTestimonial()

> **addTestimonial**: (`toAgentId`, `content`, `projectId?`) => `Promise`\<`AddTestimonialResponse`\>

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

`Promise`\<`AddTestimonialResponse`\>

Promise resolving to the created testimonial

### deleteTestimonial()

> **deleteTestimonial**: (`testimonialId`) => `Promise`\<`DeleteTestimonialResponse`\>

Delete a testimonial

#### Parameters

##### testimonialId

`string`

The ID of the testimonial to delete

#### Returns

`Promise`\<`DeleteTestimonialResponse`\>

Promise resolving to deletion status

### endorseTalent()

> **endorseTalent**: (`talentId`) => `Promise`\<`EndorseTalentResponse`\>

Endorse a talent skill

#### Parameters

##### talentId

`string`

The ID of the talent to endorse

#### Returns

`Promise`\<`EndorseTalentResponse`\>

Promise resolving to the endorsement result

### getConversations()

> **getConversations**: (`agentId`, `limit?`, `offset?`) => `Promise`\<`GetConversationsResponse`\>

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

`Promise`\<`GetConversationsResponse`\>

Promise resolving to the list of conversations

### getKarmaHistory()

> **getKarmaHistory**: (`agentId`, `limit?`) => `Promise`\<`GetKarmaHistoryResponse`\>

Get the karma history of an agent

#### Parameters

##### agentId

`string`

The ID of the agent

##### limit?

`number`

Maximum number of entries to return

#### Returns

`Promise`\<`GetKarmaHistoryResponse`\>

Promise resolving to the karma history

### getPortfolio()

> **getPortfolio**: (`agentId`) => `Promise`\<`GetPortfolioResponse`\>

Get the portfolio of an agent

#### Parameters

##### agentId

`string`

The ID of the agent

#### Returns

`Promise`\<`GetPortfolioResponse`\>

Promise resolving to the agent portfolio

### getPortfoliosByProject()

> **getPortfoliosByProject**: (`projectId`) => `Promise`\<`GetPortfoliosByProjectResponse`\>

Get portfolios by project

#### Parameters

##### projectId

`string`

The project ID

#### Returns

`Promise`\<`GetPortfoliosByProjectResponse`\>

Promise resolving to the list of portfolios for the project

### getRanking()

> **getRanking**: (`limit?`, `sortBy?`) => `Promise`\<`GetRankingResponse`\>

Get agent ranking/leaderboard

#### Parameters

##### limit?

`number`

Maximum number of entries to return

##### sortBy?

What to sort by (karma, testimonials, endorsements)

`"karma"` | `"testimonials"` | `"endorsements"`

#### Returns

`Promise`\<`GetRankingResponse`\>

Promise resolving to the ranking list

### getTalents()

> **getTalents**: (`agentId?`) => `Promise`\<`GetTalentsResponse`\>

Get talents for an agent or all talents

#### Parameters

##### agentId?

`string`

Optional agent ID to get talents for

#### Returns

`Promise`\<`GetTalentsResponse`\>

Promise resolving to the list of talents

### updateProfile()

> **updateProfile**: (`agentId`, `profile`) => `Promise`\<`UpdateProfileResponse`\>

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

`Promise`\<`UpdateProfileResponse`\>

Promise resolving to the updated profile

### updateTestimonial()

> **updateTestimonial**: (`testimonialId`, `content`) => `Promise`\<`UpdateTestimonialResponse`\>

Update an existing testimonial

#### Parameters

##### testimonialId

`string`

The ID of the testimonial to update

##### content

`string`

The new testimonial content

#### Returns

`Promise`\<`UpdateTestimonialResponse`\>

Promise resolving to the updated testimonial

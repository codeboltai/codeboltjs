[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [requirementPlan.ts:114](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/requirementPlan.ts#L114)

RequirementPlan Module
Provides functionality for managing Requirement Plan documents

## Type Declaration

### addSection()

> **addSection**: (`filePath`, `section`, `afterIndex?`) => `Promise`\<[`RequirementPlanSectionResponse`](../interfaces/RequirementPlanSectionResponse.md)\>

Add a section to a requirement plan

#### Parameters

##### filePath

`string`

Path to the plan file

##### section

`Omit`\<[`RequirementPlanSection`](../interfaces/RequirementPlanSection.md), `"id"` \| `"order"`\>

Section data to add

##### afterIndex?

`number`

Optional index to insert after (-1 for beginning)

#### Returns

`Promise`\<[`RequirementPlanSectionResponse`](../interfaces/RequirementPlanSectionResponse.md)\>

Promise resolving to updated document

### create()

> **create**: (`fileName`) => `Promise`\<[`RequirementPlanCreateResponse`](../interfaces/RequirementPlanCreateResponse.md)\>

Create a new requirement plan file

#### Parameters

##### fileName

`string`

Name for the new plan file (without .plan extension)

#### Returns

`Promise`\<[`RequirementPlanCreateResponse`](../interfaces/RequirementPlanCreateResponse.md)\>

Promise resolving to creation result with file path

### get()

> **get**: (`filePath`) => `Promise`\<[`RequirementPlanGetResponse`](../interfaces/RequirementPlanGetResponse.md)\>

Get a requirement plan by file path

#### Parameters

##### filePath

`string`

Path to the plan file

#### Returns

`Promise`\<[`RequirementPlanGetResponse`](../interfaces/RequirementPlanGetResponse.md)\>

Promise resolving to the plan document

### list()

> **list**: () => `Promise`\<[`RequirementPlanListResponse`](../interfaces/RequirementPlanListResponse.md)\>

List all requirement plans in the project

#### Returns

`Promise`\<[`RequirementPlanListResponse`](../interfaces/RequirementPlanListResponse.md)\>

Promise resolving to list of plans

### removeSection()

> **removeSection**: (`filePath`, `sectionId`) => `Promise`\<[`RequirementPlanSectionResponse`](../interfaces/RequirementPlanSectionResponse.md)\>

Remove a section from a requirement plan

#### Parameters

##### filePath

`string`

Path to the plan file

##### sectionId

`string`

ID of the section to remove

#### Returns

`Promise`\<[`RequirementPlanSectionResponse`](../interfaces/RequirementPlanSectionResponse.md)\>

Promise resolving to updated document

### reorderSections()

> **reorderSections**: (`filePath`, `sectionIds`) => `Promise`\<[`RequirementPlanSectionResponse`](../interfaces/RequirementPlanSectionResponse.md)\>

Reorder sections in a requirement plan

#### Parameters

##### filePath

`string`

Path to the plan file

##### sectionIds

`string`[]

Array of section IDs in new order

#### Returns

`Promise`\<[`RequirementPlanSectionResponse`](../interfaces/RequirementPlanSectionResponse.md)\>

Promise resolving to updated document

### review()

> **review**: (`filePath`) => `Promise`\<[`RequirementPlanReviewResponse`](../interfaces/RequirementPlanReviewResponse.md)\>

Request a review for a requirement plan

#### Parameters

##### filePath

`string`

Path to the plan file

#### Returns

`Promise`\<[`RequirementPlanReviewResponse`](../interfaces/RequirementPlanReviewResponse.md)\>

Promise resolving to review status

### update()

> **update**: (`filePath`, `content`) => `Promise`\<[`RequirementPlanUpdateResponse`](../interfaces/RequirementPlanUpdateResponse.md)\>

Update a requirement plan

#### Parameters

##### filePath

`string`

Path to the plan file

##### content

New content (string or RequirementPlanDocument)

`string` | [`RequirementPlanDocument`](../interfaces/RequirementPlanDocument.md)

#### Returns

`Promise`\<[`RequirementPlanUpdateResponse`](../interfaces/RequirementPlanUpdateResponse.md)\>

Promise resolving to update result

### updateSection()

> **updateSection**: (`filePath`, `sectionId`, `updates`) => `Promise`\<[`RequirementPlanSectionResponse`](../interfaces/RequirementPlanSectionResponse.md)\>

Update a section in a requirement plan

#### Parameters

##### filePath

`string`

Path to the plan file

##### sectionId

`string`

ID of the section to update

##### updates

`Partial`\<[`RequirementPlanSection`](../interfaces/RequirementPlanSection.md)\>

Partial section data to update

#### Returns

`Promise`\<[`RequirementPlanSectionResponse`](../interfaces/RequirementPlanSectionResponse.md)\>

Promise resolving to updated document

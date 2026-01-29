[**@codebolt/codeboltjs**](../README.md)

***

[@codebolt/codeboltjs](../globals.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [roadmap.ts:29](https://github.com/codeboltai/codeboltjs/blob/a8724faf1fbd91d41208870e38936af70f149d77/packages/codeboltjs/src/modules/roadmap.ts#L29)

Roadmap Module for codeboltjs
Provides functionality for managing project roadmaps, phases, features, and ideas.
Mirrors the roadmapService.cli.ts operations via WebSocket.

## Type Declaration

### createFeature()

> **createFeature**: (`phaseId`, `data`, `projectPath?`) => `Promise`\<`RoadmapFeatureResponse`\>

Create a new feature in a phase

#### Parameters

##### phaseId

`string`

##### data

`CreateFeatureData`

##### projectPath?

`string`

#### Returns

`Promise`\<`RoadmapFeatureResponse`\>

### createIdea()

> **createIdea**: (`data`, `projectPath?`) => `Promise`\<`RoadmapIdeaResponse`\>

Create a new idea

#### Parameters

##### data

`CreateIdeaData`

##### projectPath?

`string`

#### Returns

`Promise`\<`RoadmapIdeaResponse`\>

### createPhase()

> **createPhase**: (`data`, `projectPath?`) => `Promise`\<`RoadmapPhaseResponse`\>

Create a new phase in the roadmap

#### Parameters

##### data

`CreatePhaseData`

##### projectPath?

`string`

#### Returns

`Promise`\<`RoadmapPhaseResponse`\>

### deleteFeature()

> **deleteFeature**: (`featureId`, `projectPath?`) => `Promise`\<`RoadmapDeleteResponse`\>

Delete a feature

#### Parameters

##### featureId

`string`

##### projectPath?

`string`

#### Returns

`Promise`\<`RoadmapDeleteResponse`\>

### deleteIdea()

> **deleteIdea**: (`ideaId`, `projectPath?`) => `Promise`\<`RoadmapDeleteResponse`\>

Delete an idea

#### Parameters

##### ideaId

`string`

##### projectPath?

`string`

#### Returns

`Promise`\<`RoadmapDeleteResponse`\>

### deletePhase()

> **deletePhase**: (`phaseId`, `projectPath?`) => `Promise`\<`RoadmapDeleteResponse`\>

Delete a phase from the roadmap

#### Parameters

##### phaseId

`string`

##### projectPath?

`string`

#### Returns

`Promise`\<`RoadmapDeleteResponse`\>

### getAllFeatures()

> **getAllFeatures**: (`projectPath?`) => `Promise`\<`RoadmapFeaturesResponse`\>

Get all features across all phases

#### Parameters

##### projectPath?

`string`

#### Returns

`Promise`\<`RoadmapFeaturesResponse`\>

### getFeatures()

> **getFeatures**: (`phaseId`, `projectPath?`) => `Promise`\<`RoadmapFeaturesResponse`\>

Get features in a specific phase

#### Parameters

##### phaseId

`string`

##### projectPath?

`string`

#### Returns

`Promise`\<`RoadmapFeaturesResponse`\>

### getIdeas()

> **getIdeas**: (`projectPath?`) => `Promise`\<`RoadmapIdeasResponse`\>

Get all ideas (pre-roadmap suggestions)

#### Parameters

##### projectPath?

`string`

#### Returns

`Promise`\<`RoadmapIdeasResponse`\>

### getPhases()

> **getPhases**: (`projectPath?`) => `Promise`\<`RoadmapPhasesResponse`\>

Get all phases in the roadmap

#### Parameters

##### projectPath?

`string`

#### Returns

`Promise`\<`RoadmapPhasesResponse`\>

### getRoadmap()

> **getRoadmap**: (`projectPath?`) => `Promise`\<`RoadmapGetResponse`\>

Get the complete roadmap for a project

#### Parameters

##### projectPath?

`string`

Optional project path (uses active project if not provided)

#### Returns

`Promise`\<`RoadmapGetResponse`\>

### moveFeature()

> **moveFeature**: (`featureId`, `data`, `projectPath?`) => `Promise`\<`RoadmapFeatureResponse`\>

Move a feature to a different phase

#### Parameters

##### featureId

`string`

##### data

`MoveFeatureData`

##### projectPath?

`string`

#### Returns

`Promise`\<`RoadmapFeatureResponse`\>

### moveIdeaToRoadmap()

> **moveIdeaToRoadmap**: (`ideaId`, `data`, `projectPath?`) => `Promise`\<`RoadmapMoveToRoadmapResponse`\>

Move an accepted idea to the roadmap as a feature

#### Parameters

##### ideaId

`string`

##### data

`MoveIdeaToRoadmapData`

##### projectPath?

`string`

#### Returns

`Promise`\<`RoadmapMoveToRoadmapResponse`\>

### reviewIdea()

> **reviewIdea**: (`ideaId`, `data`, `projectPath?`) => `Promise`\<`RoadmapIdeaResponse`\>

Review an idea (accept or reject)

#### Parameters

##### ideaId

`string`

##### data

`ReviewIdeaData`

##### projectPath?

`string`

#### Returns

`Promise`\<`RoadmapIdeaResponse`\>

### updateFeature()

> **updateFeature**: (`featureId`, `data`, `projectPath?`) => `Promise`\<`RoadmapFeatureResponse`\>

Update an existing feature

#### Parameters

##### featureId

`string`

##### data

`UpdateFeatureData`

##### projectPath?

`string`

#### Returns

`Promise`\<`RoadmapFeatureResponse`\>

### updateIdea()

> **updateIdea**: (`ideaId`, `data`, `projectPath?`) => `Promise`\<`RoadmapIdeaResponse`\>

Update an existing idea

#### Parameters

##### ideaId

`string`

##### data

`UpdateIdeaData`

##### projectPath?

`string`

#### Returns

`Promise`\<`RoadmapIdeaResponse`\>

### updatePhase()

> **updatePhase**: (`phaseId`, `data`, `projectPath?`) => `Promise`\<`RoadmapPhaseResponse`\>

Update an existing phase

#### Parameters

##### phaseId

`string`

##### data

`UpdatePhaseData`

##### projectPath?

`string`

#### Returns

`Promise`\<`RoadmapPhaseResponse`\>

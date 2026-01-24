# codebolt.roadmap - Roadmap Management

Manages project roadmaps including phases, features, and ideas (pre-roadmap suggestions).

## Response Types

All responses extend a base response with common fields:

```typescript
interface Base<Module>Response {
  success?: boolean;  // Whether the operation succeeded
  message?: string;   // Optional status message
  error?: string;     // Error details if operation failed
}
```

### Feature

Represents a feature within a phase of the roadmap.

```typescript
interface Feature {
  id: string;
  title: string;
  description?: string;
  impact?: 'low' | 'medium' | 'high' | 'critical';
  difficulty?: 'easy' | 'medium' | 'hard' | 'very-hard';
  priority?: number;
  tags?: string[];
  category?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  phaseId: string;
  createdBy?: { id: string; name: string; type?: 'user' | 'agent' };
  createdAt: string;
  updatedAt: string;
}
```

### Phase

Represents a phase in the roadmap containing multiple features.

```typescript
interface Phase {
  id: string;
  name: string;
  description?: string;
  order: number;
  features: Feature[];
  createdAt: string;
  updatedAt: string;
}
```

### Idea

Represents a pre-roadmap suggestion that can be reviewed and promoted to a feature.

```typescript
interface Idea {
  id: string;
  title: string;
  description?: string;
  category?: string;
  suggestedImpact?: 'low' | 'medium' | 'high' | 'critical';
  suggestedDifficulty?: 'easy' | 'medium' | 'hard' | 'very-hard';
  tags?: string[];
  status: 'pending' | 'accepted' | 'rejected';
  createdBy?: { id: string; name: string; type?: 'user' | 'agent' };
  reviewedBy?: { id: string; name: string; type?: 'user' | 'agent' };
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### RoadmapData

Complete roadmap data including all phases and ideas.

```typescript
interface RoadmapData {
  projectPath: string;
  phases: Phase[];
  ideas: Idea[];
  createdAt: string;
  updatedAt: string;
}
```

## Methods

### `getRoadmap(projectPath?)`

Get the complete roadmap for a project including all phases, features, and ideas.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| projectPath | string | No | Project path (uses active project if not provided) |

**Response:**
```typescript
{
  success: boolean;
  roadmap?: {
    projectPath: string;
    phases: Phase[];
    ideas: Idea[];
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
}
```

```typescript
const result = await codebolt.roadmap.getRoadmap();
if (result.success && result.roadmap) {
  console.log(`Found ${result.roadmap.phases.length} phases`);
  console.log(`Found ${result.roadmap.ideas.length} ideas`);
}
```

---

### `getPhases(projectPath?)`

Get all phases in the roadmap.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| projectPath | string | No | Project path (uses active project if not provided) |

**Response:**
```typescript
{
  success: boolean;
  phases?: Phase[];
  count?: number;
  error?: string;
}
```

```typescript
const result = await codebolt.roadmap.getPhases();
if (result.success && result.phases) {
  result.phases.forEach(phase => {
    console.log(`${phase.name}: ${phase.features.length} features`);
  });
}
```

---

### `createPhase(data, projectPath?)`

Create a new phase in the roadmap.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| data | object | Yes | Phase data |
| data.name | string | Yes | Phase name |
| data.description | string | No | Phase description |
| data.order | number | No | Phase order (default: last) |
| projectPath | string | No | Project path (uses active project if not provided) |

**Response:**
```typescript
{
  success: boolean;
  phase?: Phase;
  error?: string;
}
```

```typescript
const result = await codebolt.roadmap.createPhase({
  name: 'Q1 2026',
  description: 'First quarter features',
  order: 1
});
if (result.success && result.phase) {
  console.log(`Created phase: ${result.phase.id}`);
}
```

---

### `updatePhase(phaseId, data, projectPath?)`

Update an existing phase.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| phaseId | string | Yes | Phase ID to update |
| data | object | Yes | Updated phase data |
| data.name | string | No | New phase name |
| data.description | string | No | New phase description |
| data.order | number | No | New phase order |
| projectPath | string | No | Project path (uses active project if not provided) |

**Response:**
```typescript
{
  success: boolean;
  phase?: Phase;
  error?: string;
}
```

```typescript
const result = await codebolt.roadmap.updatePhase('phase-123', {
  name: 'Updated Q1 2026',
  description: 'Updated description'
});
if (result.success && result.phase) {
  console.log(`Updated phase: ${result.phase.name}`);
}
```

---

### `deletePhase(phaseId, projectPath?)`

Delete a phase from the roadmap.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| phaseId | string | Yes | Phase ID to delete |
| projectPath | string | No | Project path (uses active project if not provided) |

**Response:**
```typescript
{
  success: boolean;
  error?: string;
}
```

```typescript
const result = await codebolt.roadmap.deletePhase('phase-123');
if (result.success) {
  console.log('Phase deleted successfully');
}
```

---

### `getFeatures(phaseId, projectPath?)`

Get features in a specific phase.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| phaseId | string | Yes | Phase ID |
| projectPath | string | No | Project path (uses active project if not provided) |

**Response:**
```typescript
{
  success: boolean;
  features?: Feature[];
  count?: number;
  error?: string;
}
```

```typescript
const result = await codebolt.roadmap.getFeatures('phase-123');
if (result.success && result.features) {
  console.log(`Found ${result.count} features in phase`);
}
```

---

### `getAllFeatures(projectPath?)`

Get all features across all phases.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| projectPath | string | No | Project path (uses active project if not provided) |

**Response:**
```typescript
{
  success: boolean;
  features?: Feature[];
  count?: number;
  error?: string;
}
```

```typescript
const result = await codebolt.roadmap.getAllFeatures();
if (result.success && result.features) {
  const completed = result.features.filter(f => f.status === 'completed');
  console.log(`Completed ${completed.length} of ${result.count} features`);
}
```

---

### `createFeature(phaseId, data, projectPath?)`

Create a new feature in a phase.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| phaseId | string | Yes | Phase ID to add feature to |
| data | object | Yes | Feature data |
| data.title | string | Yes | Feature title |
| data.description | string | No | Feature description |
| data.impact | 'low' \| 'medium' \| 'high' \| 'critical' | No | Impact level |
| data.difficulty | 'easy' \| 'medium' \| 'hard' \| 'very-hard' | No | Difficulty level |
| data.priority | number | No | Feature priority (lower = higher priority) |
| data.tags | string[] | No | Feature tags |
| data.category | string | No | Feature category |
| data.status | 'pending' \| 'in-progress' \| 'completed' \| 'cancelled' | No | Initial status (default: 'pending') |
| data.createdBy | object | No | Creator info |
| projectPath | string | No | Project path (uses active project if not provided) |

**Response:**
```typescript
{
  success: boolean;
  feature?: Feature;
  error?: string;
}
```

```typescript
const result = await codebolt.roadmap.createFeature('phase-123', {
  title: 'User authentication',
  description: 'Implement OAuth2 login',
  impact: 'high',
  difficulty: 'medium',
  priority: 1,
  tags: ['security', 'auth'],
  status: 'pending'
});
if (result.success && result.feature) {
  console.log(`Created feature: ${result.feature.id}`);
}
```

---

### `updateFeature(featureId, data, projectPath?)`

Update an existing feature.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| featureId | string | Yes | Feature ID to update |
| data | object | Yes | Updated feature data |
| data.title | string | No | New feature title |
| data.description | string | No | New feature description |
| data.impact | 'low' \| 'medium' \| 'high' \| 'critical' | No | New impact level |
| data.difficulty | 'easy' \| 'medium' \| 'hard' \| 'very-hard' | No | New difficulty level |
| data.priority | number | No | New priority |
| data.tags | string[] | No | New tags |
| data.category | string | No | New category |
| data.status | 'pending' \| 'in-progress' \| 'completed' \| 'cancelled' | No | New status |
| projectPath | string | No | Project path (uses active project if not provided) |

**Response:**
```typescript
{
  success: boolean;
  feature?: Feature;
  error?: string;
}
```

```typescript
const result = await codebolt.roadmap.updateFeature('feature-123', {
  status: 'in-progress'
});
if (result.success && result.feature) {
  console.log(`Feature status updated to: ${result.feature.status}`);
}
```

---

### `deleteFeature(featureId, projectPath?)`

Delete a feature.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| featureId | string | Yes | Feature ID to delete |
| projectPath | string | No | Project path (uses active project if not provided) |

**Response:**
```typescript
{
  success: boolean;
  error?: string;
}
```

```typescript
const result = await codebolt.roadmap.deleteFeature('feature-123');
if (result.success) {
  console.log('Feature deleted successfully');
}
```

---

### `moveFeature(featureId, data, projectPath?)`

Move a feature to a different phase.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| featureId | string | Yes | Feature ID to move |
| data | object | Yes | Move data |
| data.targetPhaseId | string | Yes | Target phase ID |
| projectPath | string | No | Project path (uses active project if not provided) |

**Response:**
```typescript
{
  success: boolean;
  feature?: Feature;
  error?: string;
}
```

```typescript
const result = await codebolt.roadmap.moveFeature('feature-123', {
  targetPhaseId: 'phase-456'
});
if (result.success && result.feature) {
  console.log(`Feature moved to phase: ${result.feature.phaseId}`);
}
```

---

### `getIdeas(projectPath?)`

Get all ideas (pre-roadmap suggestions).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| projectPath | string | No | Project path (uses active project if not provided) |

**Response:**
```typescript
{
  success: boolean;
  ideas?: Idea[];
  count?: number;
  error?: string;
}
```

```typescript
const result = await codebolt.roadmap.getIdeas();
if (result.success && result.ideas) {
  const pending = result.ideas.filter(i => i.status === 'pending');
  console.log(`${pending.length} ideas awaiting review`);
}
```

---

### `createIdea(data, projectPath?)`

Create a new idea.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| data | object | Yes | Idea data |
| data.title | string | Yes | Idea title |
| data.description | string | No | Idea description |
| data.category | string | No | Idea category |
| data.suggestedImpact | 'low' \| 'medium' \| 'high' \| 'critical' | No | Suggested impact level |
| data.suggestedDifficulty | 'easy' \| 'medium' \| 'hard' \| 'very-hard' | No | Suggested difficulty level |
| data.tags | string[] | No | Idea tags |
| data.createdBy | object | No | Creator info |
| projectPath | string | No | Project path (uses active project if not provided) |

**Response:**
```typescript
{
  success: boolean;
  idea?: Idea;
  error?: string;
}
```

```typescript
const result = await codebolt.roadmap.createIdea({
  title: 'Dark mode support',
  description: 'Add dark mode theme throughout the app',
  suggestedImpact: 'medium',
  suggestedDifficulty: 'easy',
  tags: ['ui', 'accessibility']
});
if (result.success && result.idea) {
  console.log(`Created idea: ${result.idea.id}`);
}
```

---

### `updateIdea(ideaId, data, projectPath?)`

Update an existing idea.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ideaId | string | Yes | Idea ID to update |
| data | object | Yes | Updated idea data |
| data.title | string | No | New idea title |
| data.description | string | No | New idea description |
| data.category | string | No | New category |
| data.suggestedImpact | 'low' \| 'medium' \| 'high' \| 'critical' | No | New suggested impact |
| data.suggestedDifficulty | 'easy' \| 'medium' \| 'hard' \| 'very-hard' | No | New suggested difficulty |
| data.tags | string[] | No | New tags |
| projectPath | string | No | Project path (uses active project if not provided) |

**Response:**
```typescript
{
  success: boolean;
  idea?: Idea;
  error?: string;
}
```

```typescript
const result = await codebolt.roadmap.updateIdea('idea-123', {
  description: 'Updated description'
});
if (result.success && result.idea) {
  console.log(`Idea updated: ${result.idea.title}`);
}
```

---

### `deleteIdea(ideaId, projectPath?)`

Delete an idea.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ideaId | string | Yes | Idea ID to delete |
| projectPath | string | No | Project path (uses active project if not provided) |

**Response:**
```typescript
{
  success: boolean;
  error?: string;
}
```

```typescript
const result = await codebolt.roadmap.deleteIdea('idea-123');
if (result.success) {
  console.log('Idea deleted successfully');
}
```

---

### `reviewIdea(ideaId, data, projectPath?)`

Review an idea (accept or reject).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ideaId | string | Yes | Idea ID to review |
| data | object | Yes | Review data |
| data.status | 'accepted' \| 'rejected' | Yes | Review decision |
| data.reviewNotes | string | No | Review notes |
| data.reviewedBy | object | No | Reviewer info |
| projectPath | string | No | Project path (uses active project if not provided) |

**Response:**
```typescript
{
  success: boolean;
  idea?: Idea;
  error?: string;
}
```

```typescript
const result = await codebolt.roadmap.reviewIdea('idea-123', {
  status: 'accepted',
  reviewNotes: 'Great idea, fits our current goals'
});
if (result.success && result.idea) {
  console.log(`Idea status: ${result.idea.status}`);
}
```

---

### `moveIdeaToRoadmap(ideaId, data, projectPath?)`

Move an accepted idea to the roadmap as a feature.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ideaId | string | Yes | Idea ID to move |
| data | object | Yes | Move data |
| data.phaseId | string | Yes | Target phase ID |
| data.featureOverrides | object | No | Override feature properties |
| projectPath | string | No | Project path (uses active project if not provided) |

**Response:**
```typescript
{
  success: boolean;
  feature?: Feature;
  error?: string;
}
```

```typescript
const result = await codebolt.roadmap.moveIdeaToRoadmap('idea-123', {
  phaseId: 'phase-456',
  featureOverrides: {
    priority: 1,
    status: 'in-progress'
  }
});
if (result.success && result.feature) {
  console.log(`Created feature from idea: ${result.feature.id}`);
}
```

## Examples

### Setting Up a New Roadmap

```typescript
const roadmap = codebolt.roadmap;

// Create phases for your project
await roadmap.createPhase({ name: 'Phase 1: Foundation', order: 1 });
await roadmap.createPhase({ name: 'Phase 2: Core Features', order: 2 });
await roadmap.createPhase({ name: 'Phase 3: Polish', order: 3 });

// Add features to the first phase
await roadmap.createFeature('phase-1-id', {
  title: 'Database setup',
  description: 'Configure database connection and schemas',
  impact: 'critical',
  difficulty: 'easy',
  status: 'in-progress'
});

await roadmap.createFeature('phase-1-id', {
  title: 'Authentication system',
  description: 'Implement user login and registration',
  impact: 'high',
  difficulty: 'medium',
  status: 'pending'
});

console.log('Roadmap initialized');
```

### Idea Review Workflow

```typescript
const roadmap = codebolt.roadmap;

// Get pending ideas
const ideasResult = await roadmap.getIdeas();
if (ideasResult.success && ideasResult.ideas) {
  for (const idea of ideasResult.ideas.filter(i => i.status === 'pending')) {
    console.log(`Reviewing: ${idea.title}`);
    
    // Review the idea
    const reviewResult = await roadmap.reviewIdea(idea.id, {
      status: 'accepted',
      reviewNotes: 'Approved for next sprint'
    });
    
    // Move accepted ideas to roadmap
    if (reviewResult.success) {
      const phasesResult = await roadmap.getPhases();
      const targetPhase = phasesResult.phases?.[0];
      
      if (targetPhase) {
        await roadmap.moveIdeaToRoadmap(idea.id, {
          phaseId: targetPhase.id
        });
      }
    }
  }
}
```

### Tracking Feature Progress

```typescript
const roadmap = codebolt.roadmap;

// Get all features
const result = await roadmap.getAllFeatures();
if (result.success && result.features) {
  const features = result.features;
  
  const stats = {
    total: features.length,
    pending: features.filter(f => f.status === 'pending').length,
    inProgress: features.filter(f => f.status === 'in-progress').length,
    completed: features.filter(f => f.status === 'completed').length,
    highImpact: features.filter(f => f.impact === 'high' || f.impact === 'critical').length
  };
  
  console.log('Roadmap Progress:', stats);
  
  // Get high-priority pending items
  const urgent = features
    .filter(f => f.status === 'pending' && (f.impact === 'high' || f.impact === 'critical'))
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));
  
  console.log('Urgent items:', urgent.map(f => f.title));
}
```

### Managing Feature Workflow

```typescript
const roadmap = codebolt.roadmap;

const featureId = 'feature-123';

// Start working on a feature
await roadmap.updateFeature(featureId, { status: 'in-progress' });

// Later, when done working
await roadmap.updateFeature(featureId, { status: 'completed' });

// If the feature needs to be moved to a different phase
await roadmap.moveFeature(featureId, {
  targetPhaseId: 'phase-456'
});

// Or if it needs to be reprioritized
await roadmap.updateFeature(featureId, {
  priority: 1,
  description: 'Updated description based on new requirements'
});
```
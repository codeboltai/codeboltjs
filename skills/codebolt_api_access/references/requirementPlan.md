# codebolt.requirementPlan - Requirement Plan Management

Provides functionality for creating, reading, updating, and managing Requirement Plan documents with sections and content.

## Response Types

### RequirementPlanDocument

Represents a complete requirement plan document:

```typescript
interface RequirementPlanDocument {
  version: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  sections: RequirementPlanSection[];
}
```

### RequirementPlanSection

Represents a single section within a requirement plan:

```typescript
interface RequirementPlanSection {
  id: string;
  type: 'markdown' | 'specs-link' | 'actionplan-link' | 'uiflow-link' | 'code-block';
  title?: string;
  content?: string;
  linkedFile?: string;
  order?: number;
}
```

## Methods

### `create(fileName)`

Creates a new requirement plan file with the specified name.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| fileName | string | Yes | Name for the new plan file (without .plan extension) |

**Response:**
```typescript
{
  type: 'requirementPlanCreateResponse';
  success: boolean;
  filePath?: string;      // Path to the created file (success only)
  error?: string;         // Error message (failure only)
  requestId?: string;     // Request identifier
}
```

```typescript
const result = await codebolt.requirementPlan.create('my-project-requirements');
if (result.success) {
  console.log(`Created plan at: ${result.filePath}`);
}
```

---

### `get(filePath)`

Retrieves a requirement plan document by file path.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filePath | string | Yes | Path to the plan file |

**Response:**
```typescript
{
  type: 'requirementPlanGetResponse';
  success: boolean;
  data?: RequirementPlanDocument;  // The plan document (success only)
  filePath?: string;               // Path of the retrieved file
  error?: string;                  // Error message (failure only)
  requestId?: string;              // Request identifier
}
```

```typescript
const result = await codebolt.requirementPlan.get('requirements/my-project-requirements.plan');
if (result.success) {
  console.log(`Plan: ${result.data.title}`);
  console.log(`Sections: ${result.data.sections.length}`);
}
```

---

### `update(filePath, content)`

Updates an existing requirement plan with new content.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filePath | string | Yes | Path to the plan file |
| content | string or RequirementPlanDocument | Yes | New content as string or document object |

**Response:**
```typescript
{
  type: 'requirementPlanUpdateResponse';
  success: boolean;
  filePath?: string;      // Path to the updated file (success only)
  error?: string;         // Error message (failure only)
  requestId?: string;     // Request identifier
}
```

```typescript
const result = await codebolt.requirementPlan.update('requirements/my-project-requirements.plan', newContent);
if (result.success) {
  console.log(`Plan updated at: ${result.filePath}`);
}
```

---

### `list()`

Lists all requirement plans in the current project.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| (none) | - | - | No parameters required |

**Response:**
```typescript
{
  type: 'requirementPlanListResponse';
  success: boolean;
  plans?: Array<{          // List of plan files (success only)
    fileName: string;      // Name of the plan file
    filePath: string;      // Full path to the plan file
  }>;
  error?: string;          // Error message (failure only)
  requestId?: string;      // Request identifier
}
```

```typescript
const result = await codebolt.requirementPlan.list();
if (result.success) {
  result.plans.forEach(plan => {
    console.log(`${plan.fileName} at ${plan.filePath}`);
  });
}
```

---

### `addSection(filePath, section, afterIndex?)`

Adds a new section to a requirement plan.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filePath | string | Yes | Path to the plan file |
| section | object | Yes | Section data (id and order are auto-generated) |
| section.type | 'markdown' \| 'specs-link' \| 'actionplan-link' \| 'uiflow-link' \| 'code-block' | Yes | Section type |
| section.title | string | No | Optional section title |
| section.content | string | No | Section content |
| section.linkedFile | string | No | Linked file path (for link types) |
| afterIndex | number | No | Index to insert after (-1 for beginning) |

**Response:**
```typescript
{
  type: string;                    // Response type string
  success: boolean;
  document?: RequirementPlanDocument;  // Updated document (success only)
  error?: string;                  // Error message (failure only)
  requestId?: string;              // Request identifier
}
```

```typescript
const result = await codebolt.requirementPlan.addSection(
  'requirements/my-project-requirements.plan',
  { type: 'markdown', title: 'Overview', content: 'Project overview...' }
);
if (result.success) {
  console.log(`Section added. Total sections: ${result.document.sections.length}`);
}
```

---

### `updateSection(filePath, sectionId, updates)`

Updates an existing section in a requirement plan.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filePath | string | Yes | Path to the plan file |
| sectionId | string | Yes | ID of the section to update |
| updates | object | Yes | Partial section data to update |

**Response:**
```typescript
{
  type: string;                    // Response type string
  success: boolean;
  document?: RequirementPlanDocument;  // Updated document (success only)
  error?: string;                  // Error message (failure only)
  requestId?: string;              // Request identifier
}
```

```typescript
const result = await codebolt.requirementPlan.updateSection(
  'requirements/my-project-requirements.plan',
  'section-123',
  { content: 'Updated content...' }
);
if (result.success) {
  console.log('Section updated successfully');
}
```

---

### `removeSection(filePath, sectionId)`

Removes a section from a requirement plan.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filePath | string | Yes | Path to the plan file |
| sectionId | string | Yes | ID of the section to remove |

**Response:**
```typescript
{
  type: string;                    // Response type string
  success: boolean;
  document?: RequirementPlanDocument;  // Updated document (success only)
  error?: string;                  // Error message (failure only)
  requestId?: string;              // Request identifier
}
```

```typescript
const result = await codebolt.requirementPlan.removeSection(
  'requirements/my-project-requirements.plan',
  'section-123'
);
if (result.success) {
  console.log(`Section removed. Remaining sections: ${result.document.sections.length}`);
}
```

---

### `reorderSections(filePath, sectionIds)`

Reorders sections in a requirement plan based on the provided order.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filePath | string | Yes | Path to the plan file |
| sectionIds | string[] | Yes | Array of section IDs in the new order |

**Response:**
```typescript
{
  type: string;                    // Response type string
  success: boolean;
  document?: RequirementPlanDocument;  // Updated document (success only)
  error?: string;                  // Error message (failure only)
  requestId?: string;              // Request identifier
}
```

```typescript
const result = await codebolt.requirementPlan.reorderSections(
  'requirements/my-project-requirements.plan',
  ['section-1', 'section-3', 'section-2']
);
if (result.success) {
  console.log('Sections reordered successfully');
}
```

---

### `review(filePath)`

Requests a review for a requirement plan.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filePath | string | Yes | Path to the plan file |

**Response:**
```typescript
{
  type: 'requirementPlanReviewResponse';
  success: boolean;
  status?: 'approved' | 'rejected';  // Review status (success only)
  error?: string;                     // Error message (failure only)
  requestId?: string;                 // Request identifier
}
```

```typescript
const result = await codebolt.requirementPlan.review('requirements/my-project-requirements.plan');
if (result.success) {
  console.log(`Plan review status: ${result.status}`);
}
```

## Examples

### Creating and Populating a New Requirement Plan

```typescript
// Create a new plan
const createResult = await codebolt.requirementPlan.create('ecommerce-requirements');
if (!createResult.success) {
  console.error('Failed to create plan:', createResult.error);
  return;
}

const filePath = createResult.filePath;

// Add multiple sections
await codebolt.requirementPlan.addSection(filePath, {
  type: 'markdown',
  title: 'Overview',
  content: '# E-commerce Platform Requirements\n\nThis document outlines...'
});

await codebolt.requirementPlan.addSection(filePath, {
  type: 'markdown',
  title: 'User Authentication',
  content: '## Authentication Requirements\n\n- User registration...'
});

await codebolt.requirementPlan.addSection(filePath, {
  type: 'specs-link',
  title: 'API Specifications',
  linkedFile: 'specs/api.yaml'
});

console.log('Requirement plan created and populated');
```

### Building a Complete Requirement Document

```typescript
const filePath = 'requirements/project-x.plan';

const planDocument = {
  version: '1.0',
  title: 'Project X Requirements',
  description: 'Complete requirements for Project X',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  sections: [
    {
      id: 'sec-1',
      type: 'markdown',
      title: 'Introduction',
      content: '# Introduction\n\nProject X aims to...',
      order: 0
    },
    {
      id: 'sec-2',
      type: 'specs-link',
      title: 'Technical Specs',
      linkedFile: 'specs/technical.md',
      order: 1
    },
    {
      id: 'sec-3',
      type: 'code-block',
      title: 'Example Implementation',
      content: 'function example() { return true; }',
      order: 2
    }
  ]
};

const result = await codebolt.requirementPlan.update(filePath, planDocument);
if (result.success) {
  console.log('Complete requirement document saved');
}
```

### Managing Plan Sections

```typescript
const filePath = 'requirements/my-plan.plan';

// Get current plan
const planResult = await codebolt.requirementPlan.get(filePath);
if (!planResult.success) return;

const sections = planResult.data.sections;

// Add new section after the first one
await codebolt.requirementPlan.addSection(filePath, {
  type: 'markdown',
  title: 'New Section',
  content: 'New content...'
}, 0);

// Update a section
const sectionId = sections[1].id;
await codebolt.requirementPlan.updateSection(filePath, sectionId, {
  title: 'Updated Title',
  content: 'Updated content'
});

// Reorder sections
const sectionIds = sections.map(s => s.id).reverse();
await codebolt.requirementPlan.reorderSections(filePath, sectionIds);

console.log('Sections managed successfully');
```

### Listing and Working with Multiple Plans

```typescript
// List all plans
const listResult = await codebolt.requirementPlan.list();
if (!listResult.success) {
  console.error('Failed to list plans:', listResult.error);
  return;
}

console.log(`Found ${listResult.plans.length} requirement plans:`);

for (const plan of listResult.plans) {
  console.log(`- ${plan.fileName}`);

  // Get each plan's details
  const planResult = await codebolt.requirementPlan.get(plan.filePath);
  if (planResult.success) {
    console.log(`  Title: ${planResult.data.title}`);
    console.log(`  Sections: ${planResult.data.sections.length}`);
    console.log(`  Last updated: ${planResult.data.updatedAt}`);
  }

  // Request review if needed
  const reviewResult = await codebolt.requirementPlan.review(plan.filePath);
  if (reviewResult.success) {
    console.log(`  Review status: ${reviewResult.status}`);
  }
}
```

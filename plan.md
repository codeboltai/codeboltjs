# Plan Tool Gap Plan

Scope: only tools related to the Plan bottom bar:

- Tasks
- Action Plan
- Specs
- UI Flow
- Requirement Plan
- Roadmap

## Existing Plan Tools

| Tool name | SDK method | What it does | Why we need it |
| --- | --- | --- | --- |
| `task_create` | `codebolt.task.create(params)` | Creates a task. | Needed to convert planning work into executable work items. |
| `task_list` | `codebolt.task.list(params?)` | Lists tasks. | Needed to inspect existing planned or active work before creating new tasks. |
| `task_get` | `codebolt.task.get(taskId)` | Gets details for one task. | Needed before updating, assigning, or executing a specific task. |
| `task_update` | `codebolt.task.update(taskId, params)` | Updates a task. | Needed because task scope, status, priority, and details change during planning. |
| `task_delete` | `codebolt.task.delete(taskId)` | Deletes or removes a task. | Needed to clean up duplicate or obsolete planned work. |
| `task_assign` | `codebolt.task.assign(taskId, params)` | Assigns a task to an agent or owner. | Needed to route planned work to the right executor. |
| `task_execute` | `codebolt.task.execute(taskId, params)` | Starts execution for a task. | Needed to move from planning into implementation. |
| `action_plan_create` | `codebolt.actionPlan.create(params)` | Creates an action plan. | Needed to break a goal into ordered implementation steps. |
| `action_plan_get_all` | `codebolt.actionPlan.getAll(params?)` | Lists action plans. | Needed to find existing plans and avoid duplicate planning artifacts. |
| `action_plan_add_task` | `codebolt.actionPlan.addTask(planId, params)` | Adds a task to an action plan. | Needed to connect implementation tasks back to the plan. |
| `requirement_plan_create` | `codebolt.requirementPlan.create(params)` | Creates a requirement plan. | Needed to capture structured product or feature requirements. |
| `requirement_plan_list` | `codebolt.requirementPlan.list(params?)` | Lists requirement plans. | Needed to discover existing requirement plans for a project or feature. |
| `requirement_plan_get` | `codebolt.requirementPlan.get(planId)` | Gets one requirement plan. | Needed before editing, reviewing, or linking requirements. |
| `requirement_plan_update` | `codebolt.requirementPlan.update(planId, params)` | Updates a requirement plan. | Needed because requirements evolve during planning. |
| `requirement_plan_add_section` | `codebolt.requirementPlan.addSection(planId, params)` | Adds a section to a requirement plan. | Needed to incrementally build structured requirements. |
| `requirement_plan_update_section` | `codebolt.requirementPlan.updateSection(planId, sectionId, params)` | Updates one requirement section. | Needed for focused edits without replacing the whole plan. |
| `requirement_plan_remove_section` | `codebolt.requirementPlan.removeSection(planId, sectionId)` | Removes one requirement section. | Needed to clean up outdated or invalid requirement details. |
| `requirement_plan_reorder_sections` | `codebolt.requirementPlan.reorderSections(planId, params)` | Reorders requirement sections. | Needed to keep requirement documents readable and logically structured. |
| `requirement_plan_review` | `codebolt.requirementPlan.review(planId, params?)` | Reviews a requirement plan. | Needed to detect gaps, ambiguity, and readiness before implementation. |
| `roadmap_get` | `codebolt.roadmap.get(params?)` | Gets roadmap data. | Needed to understand product direction and planning context. |
| `roadmap_create_phase` | `codebolt.roadmap.createPhase(params)` | Creates a roadmap phase. | Needed to group planned work into larger delivery stages. |
| `roadmap_create_idea` | `codebolt.roadmap.createIdea(params)` | Creates a roadmap idea. | Needed to capture early product ideas before they become requirements or tasks. |

## Missing Specs Tools

| Tool name | SDK method | What it does | Why we need it |
| --- | --- | --- | --- |
| `specs_create` | `codebolt.specs.create(params)` | Creates a new spec. | Needed because Specs is visible in the Plan menu but agents do not have a first-class SDK tool to create specs. |
| `specs_list` | `codebolt.specs.list(params?)` | Lists specs. | Needed so agents can find existing specs before creating or updating planning artifacts. |
| `specs_get` | `codebolt.specs.get(specId)` | Gets one spec. | Needed so agents can read the complete spec before editing or linking it. |
| `specs_update` | `codebolt.specs.update(specId, params)` | Updates a spec. | Needed because specs change as requirements and implementation decisions change. |
| `specs_delete` | `codebolt.specs.delete(specId)` | Deletes or archives a spec. | Needed to remove duplicate or obsolete specs from the planning workspace. |
| `specs_review` | `codebolt.specs.review(specId, params?)` | Reviews a spec for completeness and implementation readiness. | Needed so agents can catch unclear or incomplete specs before creating tasks. |
| `specs_link_artifact` | `codebolt.specs.linkArtifact(params)` | Links a spec to tasks, action plans, requirement plans, roadmap items, or UI flows. | Needed to connect Specs with the rest of the Plan workflow. |

## Missing UI Flow Tools

| Tool name | SDK method | What it does | Why we need it |
| --- | --- | --- | --- |
| `ui_flow_create` | `codebolt.uiFlow.create(params)` | Creates a UI flow. | Needed because UI Flow is visible in the Plan menu but agents do not have a first-class SDK tool to create flows. |
| `ui_flow_list` | `codebolt.uiFlow.list(params?)` | Lists UI flows. | Needed so agents can find existing user flows before creating duplicates. |
| `ui_flow_get` | `codebolt.uiFlow.get(flowId)` | Gets one UI flow. | Needed so agents can inspect the current journey before updating or deriving implementation tasks. |
| `ui_flow_update` | `codebolt.uiFlow.update(flowId, params)` | Updates a UI flow. | Needed because screens, steps, and user journeys change during planning. |
| `ui_flow_delete` | `codebolt.uiFlow.delete(flowId)` | Deletes or archives a UI flow. | Needed to remove obsolete flows from the planning workspace. |
| `ui_flow_add_step` | `codebolt.uiFlow.addStep(flowId, params)` | Adds a step to a UI flow. | Needed for incremental flow building without replacing the whole flow. |
| `ui_flow_update_step` | `codebolt.uiFlow.updateStep(flowId, stepId, params)` | Updates one UI flow step. | Needed for precise edits to a single screen or interaction. |
| `ui_flow_remove_step` | `codebolt.uiFlow.removeStep(flowId, stepId)` | Removes one UI flow step. | Needed to cleanly remove outdated or wrong interactions. |
| `ui_flow_link_artifact` | `codebolt.uiFlow.linkArtifact(params)` | Links a UI flow to specs, tasks, action plans, requirement plans, or roadmap items. | Needed to connect user journeys with requirements and implementation work. |

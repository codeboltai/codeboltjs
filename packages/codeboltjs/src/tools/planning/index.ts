/**
 * Planning/Action Plan tools
 */

// Plan tools
export { PlanGetAllTool, type PlanGetAllToolParams } from './plan-get-all';
export { PlanGetDetailTool, type PlanGetDetailToolParams } from './plan-get-detail';
export { PlanCreateTool, type PlanCreateToolParams } from './plan-create';
export { PlanUpdateTool, type PlanUpdateToolParams } from './plan-update';
export { PlanAddTaskTool, type PlanAddTaskToolParams } from './plan-add-task';
export { PlanStartTaskTool, type PlanStartTaskToolParams } from './plan-start-task';

// Roadmap tools
export { RoadmapGetTool, type RoadmapGetToolParams } from './roadmap-get';
export { RoadmapGetPhasesTool, type RoadmapGetPhasesToolParams } from './roadmap-get-phases';
export { RoadmapCreatePhaseTool, type RoadmapCreatePhaseToolParams } from './roadmap-create-phase';
export { RoadmapUpdatePhaseTool, type RoadmapUpdatePhaseToolParams } from './roadmap-update-phase';
export { RoadmapDeletePhaseTool, type RoadmapDeletePhaseToolParams } from './roadmap-delete-phase';
export { RoadmapGetFeaturesTool, type RoadmapGetFeaturesToolParams } from './roadmap-get-features';
export { RoadmapCreateFeatureTool, type RoadmapCreateFeatureToolParams } from './roadmap-create-feature';
export { RoadmapUpdateFeatureTool, type RoadmapUpdateFeatureToolParams } from './roadmap-update-feature';
export { RoadmapGetIdeasTool, type RoadmapGetIdeasToolParams } from './roadmap-get-ideas';
export { RoadmapCreateIdeaTool, type RoadmapCreateIdeaToolParams } from './roadmap-create-idea';

// Create instances for convenience
import { PlanGetAllTool } from './plan-get-all';
import { PlanGetDetailTool } from './plan-get-detail';
import { PlanCreateTool } from './plan-create';
import { PlanUpdateTool } from './plan-update';
import { PlanAddTaskTool } from './plan-add-task';
import { PlanStartTaskTool } from './plan-start-task';

import { RoadmapGetTool } from './roadmap-get';
import { RoadmapGetPhasesTool } from './roadmap-get-phases';
import { RoadmapCreatePhaseTool } from './roadmap-create-phase';
import { RoadmapUpdatePhaseTool } from './roadmap-update-phase';
import { RoadmapDeletePhaseTool } from './roadmap-delete-phase';
import { RoadmapGetFeaturesTool } from './roadmap-get-features';
import { RoadmapCreateFeatureTool } from './roadmap-create-feature';
import { RoadmapUpdateFeatureTool } from './roadmap-update-feature';
import { RoadmapGetIdeasTool } from './roadmap-get-ideas';
import { RoadmapCreateIdeaTool } from './roadmap-create-idea';

/**
 * All planning/action plan tools
 */
export const planningTools = [
    // Plan tools
    new PlanGetAllTool(),
    new PlanGetDetailTool(),
    new PlanCreateTool(),
    new PlanUpdateTool(),
    new PlanAddTaskTool(),
    new PlanStartTaskTool(),
    // Roadmap tools
    new RoadmapGetTool(),
    new RoadmapGetPhasesTool(),
    new RoadmapCreatePhaseTool(),
    new RoadmapUpdatePhaseTool(),
    new RoadmapDeletePhaseTool(),
    new RoadmapGetFeaturesTool(),
    new RoadmapCreateFeatureTool(),
    new RoadmapUpdateFeatureTool(),
    new RoadmapGetIdeasTool(),
    new RoadmapCreateIdeaTool(),
];

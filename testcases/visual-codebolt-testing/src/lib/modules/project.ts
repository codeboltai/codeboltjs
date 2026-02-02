import { CodeboltModule, param, fn } from './types';

export const projectModule: CodeboltModule = {
  name: 'project',
  displayName: 'Project',
  description: 'Project settings and information',
  category: 'project',
  functions: [
    fn('getProjectSettings', 'Gets project settings', [], 'ProjectSettingsResponse'),
    fn('getProjectPath', 'Gets project path', [], 'ProjectPathResponse'),
    fn('getRepoMap', 'Gets repository map', [
      param('message', 'any', false, 'Message data'),
    ], 'RepoMapResponse'),
    fn('runProject', 'Runs the project', [], 'RunProjectResponse'),
    fn('getEditorFileStatus', 'Gets editor file status', [], 'EditorFileStatusResponse'),
  ],
};

export const projectStructureModule: CodeboltModule = {
  name: 'projectStructure',
  displayName: 'Project Structure',
  description: 'Project structure management',
  category: 'project',
  functions: [
    // Metadata
    fn('getMetadata', 'Gets project metadata', [
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'MetadataResponse'),
    fn('updateMetadata', 'Updates project metadata', [
      param('updates', 'object', true, 'Metadata updates'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'MetadataResponse'),
    // Packages
    fn('getPackages', 'Gets all packages', [
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'PackagesResponse'),
    fn('getPackage', 'Gets a package', [
      param('packageId', 'string', true, 'Package ID'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'PackageResponse'),
    fn('createPackage', 'Creates a package', [
      param('data', 'object', true, 'Package data'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'PackageResponse'),
    fn('updatePackage', 'Updates a package', [
      param('packageId', 'string', true, 'Package ID'),
      param('updates', 'object', true, 'Update data'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'PackageResponse'),
    fn('deletePackage', 'Deletes a package', [
      param('packageId', 'string', true, 'Package ID'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'DeleteResponse'),
    // API Routes
    fn('addRoute', 'Adds API route', [
      param('packageId', 'string', true, 'Package ID'),
      param('route', 'object', true, 'Route data'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'RouteResponse'),
    fn('updateRoute', 'Updates API route', [
      param('packageId', 'string', true, 'Package ID'),
      param('routeId', 'string', true, 'Route ID'),
      param('updates', 'object', true, 'Update data'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'RouteResponse'),
    fn('deleteRoute', 'Deletes API route', [
      param('packageId', 'string', true, 'Package ID'),
      param('routeId', 'string', true, 'Route ID'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'DeleteResponse'),
    // Database Tables
    fn('addTable', 'Adds database table', [
      param('packageId', 'string', true, 'Package ID'),
      param('table', 'object', true, 'Table data'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'TableResponse'),
    fn('updateTable', 'Updates database table', [
      param('packageId', 'string', true, 'Package ID'),
      param('tableId', 'string', true, 'Table ID'),
      param('updates', 'object', true, 'Update data'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'TableResponse'),
    fn('deleteTable', 'Deletes database table', [
      param('packageId', 'string', true, 'Package ID'),
      param('tableId', 'string', true, 'Table ID'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'DeleteResponse'),
    // Dependencies
    fn('addDependency', 'Adds dependency', [
      param('packageId', 'string', true, 'Package ID'),
      param('dependency', 'object', true, 'Dependency data'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'DependencyResponse'),
    fn('updateDependency', 'Updates dependency', [
      param('packageId', 'string', true, 'Package ID'),
      param('dependencyId', 'string', true, 'Dependency ID'),
      param('updates', 'object', true, 'Update data'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'DependencyResponse'),
    fn('deleteDependency', 'Deletes dependency', [
      param('packageId', 'string', true, 'Package ID'),
      param('dependencyId', 'string', true, 'Dependency ID'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'DeleteResponse'),
    // Run Commands
    fn('addCommand', 'Adds run command', [
      param('packageId', 'string', true, 'Package ID'),
      param('command', 'object', true, 'Command data'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'CommandResponse'),
    fn('updateCommand', 'Updates run command', [
      param('packageId', 'string', true, 'Package ID'),
      param('commandId', 'string', true, 'Command ID'),
      param('updates', 'object', true, 'Update data'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'CommandResponse'),
    fn('deleteCommand', 'Deletes run command', [
      param('packageId', 'string', true, 'Package ID'),
      param('commandId', 'string', true, 'Command ID'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'DeleteResponse'),
    // UI Routes
    fn('addUiRoute', 'Adds UI route', [
      param('packageId', 'string', true, 'Package ID'),
      param('route', 'object', true, 'Route data'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'UiRouteResponse'),
    fn('updateUiRoute', 'Updates UI route', [
      param('packageId', 'string', true, 'Package ID'),
      param('routeId', 'string', true, 'Route ID'),
      param('updates', 'object', true, 'Update data'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'UiRouteResponse'),
    fn('deleteUiRoute', 'Deletes UI route', [
      param('packageId', 'string', true, 'Package ID'),
      param('routeId', 'string', true, 'Route ID'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'DeleteResponse'),
    // Deployment
    fn('addDeployment', 'Adds deployment config', [
      param('packageId', 'string', true, 'Package ID'),
      param('config', 'object', true, 'Deployment config'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'DeploymentResponse'),
    fn('updateDeployment', 'Updates deployment config', [
      param('packageId', 'string', true, 'Package ID'),
      param('configId', 'string', true, 'Config ID'),
      param('updates', 'object', true, 'Update data'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'DeploymentResponse'),
    fn('deleteDeployment', 'Deletes deployment config', [
      param('packageId', 'string', true, 'Package ID'),
      param('configId', 'string', true, 'Config ID'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'DeleteResponse'),
    // Git & Design
    fn('updateGit', 'Updates git info', [
      param('gitInfo', 'object', true, 'Git info'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'GitInfoResponse'),
    fn('updateDesignGuidelines', 'Updates design guidelines', [
      param('packageId', 'string', true, 'Package ID'),
      param('guidelines', 'object', true, 'Design guidelines'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'GuidelinesResponse'),
    fn('updateFrontendFramework', 'Updates frontend framework', [
      param('packageId', 'string', true, 'Package ID'),
      param('framework', 'object', true, 'Framework info'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'FrameworkResponse'),
    fn('updateSection', 'Updates section', [
      param('packageId', 'string', true, 'Package ID'),
      param('section', 'string', true, 'Section name'),
      param('sectionData', 'any', true, 'Section data'),
      param('workspacePath', 'string', false, 'Workspace path'),
    ], 'SectionResponse'),
  ],
};

export const roadmapModule: CodeboltModule = {
  name: 'roadmap',
  displayName: 'Roadmap',
  description: 'Project roadmap management',
  category: 'project',
  functions: [
    // Roadmap
    fn('getRoadmap', 'Gets roadmap', [
      param('projectPath', 'string', false, 'Project path'),
    ], 'RoadmapResponse'),
    // Phases
    fn('getPhases', 'Gets roadmap phases', [
      param('projectPath', 'string', false, 'Project path'),
    ], 'PhasesResponse'),
    fn('createPhase', 'Creates a phase', [
      param('data', 'object', true, 'Phase data'),
      param('projectPath', 'string', false, 'Project path'),
    ], 'PhaseResponse'),
    fn('updatePhase', 'Updates a phase', [
      param('phaseId', 'string', true, 'Phase ID'),
      param('data', 'object', true, 'Update data'),
      param('projectPath', 'string', false, 'Project path'),
    ], 'PhaseResponse'),
    fn('deletePhase', 'Deletes a phase', [
      param('phaseId', 'string', true, 'Phase ID'),
      param('projectPath', 'string', false, 'Project path'),
    ], 'DeleteResponse'),
    // Features
    fn('getFeatures', 'Gets phase features', [
      param('phaseId', 'string', true, 'Phase ID'),
      param('projectPath', 'string', false, 'Project path'),
    ], 'FeaturesResponse'),
    fn('getAllFeatures', 'Gets all features', [
      param('projectPath', 'string', false, 'Project path'),
    ], 'FeaturesResponse'),
    fn('createFeature', 'Creates a feature', [
      param('phaseId', 'string', true, 'Phase ID'),
      param('data', 'object', true, 'Feature data'),
      param('projectPath', 'string', false, 'Project path'),
    ], 'FeatureResponse'),
    fn('updateFeature', 'Updates a feature', [
      param('featureId', 'string', true, 'Feature ID'),
      param('data', 'object', true, 'Update data'),
      param('projectPath', 'string', false, 'Project path'),
    ], 'FeatureResponse'),
    fn('deleteFeature', 'Deletes a feature', [
      param('featureId', 'string', true, 'Feature ID'),
      param('projectPath', 'string', false, 'Project path'),
    ], 'DeleteResponse'),
    fn('moveFeature', 'Moves a feature', [
      param('featureId', 'string', true, 'Feature ID'),
      param('data', 'object', true, 'Move data'),
      param('projectPath', 'string', false, 'Project path'),
    ], 'FeatureResponse'),
    // Ideas
    fn('getIdeas', 'Gets ideas', [
      param('projectPath', 'string', false, 'Project path'),
    ], 'IdeasResponse'),
    fn('createIdea', 'Creates an idea', [
      param('data', 'object', true, 'Idea data'),
      param('projectPath', 'string', false, 'Project path'),
    ], 'IdeaResponse'),
    fn('updateIdea', 'Updates an idea', [
      param('ideaId', 'string', true, 'Idea ID'),
      param('data', 'object', true, 'Update data'),
      param('projectPath', 'string', false, 'Project path'),
    ], 'IdeaResponse'),
    fn('deleteIdea', 'Deletes an idea', [
      param('ideaId', 'string', true, 'Idea ID'),
      param('projectPath', 'string', false, 'Project path'),
    ], 'DeleteResponse'),
    fn('reviewIdea', 'Reviews an idea', [
      param('ideaId', 'string', true, 'Idea ID'),
      param('data', 'object', true, 'Review data'),
      param('projectPath', 'string', false, 'Project path'),
    ], 'IdeaResponse'),
    fn('moveIdeaToRoadmap', 'Moves idea to roadmap', [
      param('ideaId', 'string', true, 'Idea ID'),
      param('data', 'object', true, 'Move data'),
      param('projectPath', 'string', false, 'Project path'),
    ], 'IdeaResponse'),
  ],
};

export const codemapModule: CodeboltModule = {
  name: 'codemap',
  displayName: 'Codemap',
  description: 'Code visualization management',
  category: 'project',
  functions: [
    fn('list', 'Lists codemaps', [
      param('projectPath', 'string', false, 'Project path'),
    ], 'CodemapListResponse'),
    fn('get', 'Gets a codemap', [
      param('codemapId', 'string', true, 'Codemap ID'),
      param('projectPath', 'string', false, 'Project path'),
    ], 'CodemapResponse'),
    fn('create', 'Creates a codemap', [
      param('data', 'object', true, 'Codemap data'),
      param('projectPath', 'string', false, 'Project path'),
    ], 'CodemapResponse'),
    fn('save', 'Saves a codemap', [
      param('codemapId', 'string', true, 'Codemap ID'),
      param('codemap', 'object', true, 'Codemap data'),
      param('projectPath', 'string', false, 'Project path'),
    ], 'CodemapResponse'),
    fn('setStatus', 'Sets codemap status', [
      param('codemapId', 'string', true, 'Codemap ID'),
      param('status', 'string', true, 'New status'),
      param('error', 'string', false, 'Error message'),
      param('projectPath', 'string', false, 'Project path'),
    ], 'CodemapResponse'),
    fn('update', 'Updates a codemap', [
      param('codemapId', 'string', true, 'Codemap ID'),
      param('data', 'object', true, 'Update data'),
      param('projectPath', 'string', false, 'Project path'),
    ], 'CodemapResponse'),
    fn('delete', 'Deletes a codemap', [
      param('codemapId', 'string', true, 'Codemap ID'),
      param('projectPath', 'string', false, 'Project path'),
    ], 'DeleteResponse'),
  ],
};

export const requirementPlanModule: CodeboltModule = {
  name: 'requirementPlan',
  displayName: 'Requirement Plan',
  description: 'Requirement plan document management',
  category: 'project',
  functions: [
    fn('create', 'Creates requirement plan', [
      param('fileName', 'string', true, 'File name'),
    ], 'RequirementPlanResponse'),
    fn('get', 'Gets requirement plan', [
      param('filePath', 'string', true, 'File path'),
    ], 'RequirementPlanResponse'),
    fn('update', 'Updates requirement plan', [
      param('filePath', 'string', true, 'File path'),
      param('content', 'any', true, 'Plan content'),
    ], 'RequirementPlanResponse'),
    fn('list', 'Lists requirement plans', [], 'RequirementPlanListResponse'),
    fn('addSection', 'Adds a section', [
      param('filePath', 'string', true, 'File path'),
      param('section', 'object', true, 'Section data'),
      param('afterIndex', 'number', false, 'Insert position'),
    ], 'RequirementPlanResponse'),
    fn('updateSection', 'Updates a section', [
      param('filePath', 'string', true, 'File path'),
      param('sectionId', 'string', true, 'Section ID'),
      param('updates', 'object', true, 'Update data'),
    ], 'RequirementPlanResponse'),
    fn('removeSection', 'Removes a section', [
      param('filePath', 'string', true, 'File path'),
      param('sectionId', 'string', true, 'Section ID'),
    ], 'RequirementPlanResponse'),
    fn('reorderSections', 'Reorders sections', [
      param('filePath', 'string', true, 'File path'),
      param('sectionIds', 'array', true, 'Section IDs in order'),
    ], 'RequirementPlanResponse'),
    fn('review', 'Requests review', [
      param('filePath', 'string', true, 'File path'),
    ], 'ReviewResponse'),
  ],
};

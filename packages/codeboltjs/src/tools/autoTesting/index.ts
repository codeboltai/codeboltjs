/**
 * Auto Testing Tools
 * 
 * Tools for managing test suites, test cases, and test runs.
 */

// Suite tools
export { AutoTestingCreateSuiteTool } from './autotesting-create-suite';
export { AutoTestingGetSuiteTool } from './autotesting-get-suite';
export { AutoTestingListSuitesTool } from './autotesting-list-suites';
export { AutoTestingUpdateSuiteTool } from './autotesting-update-suite';
export { AutoTestingDeleteSuiteTool } from './autotesting-delete-suite';
export { AutoTestingAddCaseToSuiteTool } from './autotesting-add-case-to-suite';
export { AutoTestingRemoveCaseFromSuiteTool } from './autotesting-remove-case-from-suite';

// Case tools
export { AutoTestingCreateCaseTool } from './autotesting-create-case';
export { AutoTestingGetCaseTool } from './autotesting-get-case';
export { AutoTestingListCasesTool } from './autotesting-list-cases';
export { AutoTestingUpdateCaseTool } from './autotesting-update-case';
export { AutoTestingDeleteCaseTool } from './autotesting-delete-case';

// Run tools
export { AutoTestingCreateRunTool } from './autotesting-create-run';
export { AutoTestingGetRunTool } from './autotesting-get-run';
export { AutoTestingListRunsTool } from './autotesting-list-runs';
export { AutoTestingUpdateRunStatusTool } from './autotesting-update-run-status';
export { AutoTestingUpdateRunCaseTool } from './autotesting-update-run-case';
export { AutoTestingUpdateRunStepTool } from './autotesting-update-run-step';

import { AutoTestingCreateSuiteTool } from './autotesting-create-suite';
import { AutoTestingGetSuiteTool } from './autotesting-get-suite';
import { AutoTestingListSuitesTool } from './autotesting-list-suites';
import { AutoTestingUpdateSuiteTool } from './autotesting-update-suite';
import { AutoTestingDeleteSuiteTool } from './autotesting-delete-suite';
import { AutoTestingAddCaseToSuiteTool } from './autotesting-add-case-to-suite';
import { AutoTestingRemoveCaseFromSuiteTool } from './autotesting-remove-case-from-suite';
import { AutoTestingCreateCaseTool } from './autotesting-create-case';
import { AutoTestingGetCaseTool } from './autotesting-get-case';
import { AutoTestingListCasesTool } from './autotesting-list-cases';
import { AutoTestingUpdateCaseTool } from './autotesting-update-case';
import { AutoTestingDeleteCaseTool } from './autotesting-delete-case';
import { AutoTestingCreateRunTool } from './autotesting-create-run';
import { AutoTestingGetRunTool } from './autotesting-get-run';
import { AutoTestingListRunsTool } from './autotesting-list-runs';
import { AutoTestingUpdateRunStatusTool } from './autotesting-update-run-status';
import { AutoTestingUpdateRunCaseTool } from './autotesting-update-run-case';
import { AutoTestingUpdateRunStepTool } from './autotesting-update-run-step';

/**
 * Array of all auto testing tools
 */
export const autoTestingTools = [
    new AutoTestingCreateSuiteTool(),
    new AutoTestingGetSuiteTool(),
    new AutoTestingListSuitesTool(),
    new AutoTestingUpdateSuiteTool(),
    new AutoTestingDeleteSuiteTool(),
    new AutoTestingAddCaseToSuiteTool(),
    new AutoTestingRemoveCaseFromSuiteTool(),
    new AutoTestingCreateCaseTool(),
    new AutoTestingGetCaseTool(),
    new AutoTestingListCasesTool(),
    new AutoTestingUpdateCaseTool(),
    new AutoTestingDeleteCaseTool(),
    new AutoTestingCreateRunTool(),
    new AutoTestingGetRunTool(),
    new AutoTestingListRunsTool(),
    new AutoTestingUpdateRunStatusTool(),
    new AutoTestingUpdateRunCaseTool(),
    new AutoTestingUpdateRunStepTool(),
];

/**
 * Job operations tools
 */

// Export tool classes and parameter types
export { JobCreateTool, type JobCreateToolParams } from './job-create';
export { JobGetTool, type JobGetToolParams } from './job-get';
export { JobUpdateTool, type JobUpdateToolParams } from './job-update';
export { JobDeleteTool, type JobDeleteToolParams } from './job-delete';
export { JobListTool, type JobListToolParams } from './job-list';
export { JobGroupCreateTool, type JobGroupCreateToolParams } from './job-group-create';
export { JobAddDependencyTool, type JobAddDependencyToolParams } from './job-add-dependency';
export { JobRemoveDependencyTool, type JobRemoveDependencyToolParams } from './job-remove-dependency';
export { JobGetReadyTool, type JobGetReadyToolParams } from './job-get-ready';
export { JobGetBlockedTool, type JobGetBlockedToolParams } from './job-get-blocked';
export { JobLockTool, type JobLockToolParams } from './job-lock';
export { JobUnlockTool, type JobUnlockToolParams } from './job-unlock';
export { JobBidAddTool, type JobBidAddToolParams } from './job-bid-add';

// Import tool classes for creating instances
import { JobCreateTool } from './job-create';
import { JobGetTool } from './job-get';
import { JobUpdateTool } from './job-update';
import { JobDeleteTool } from './job-delete';
import { JobListTool } from './job-list';
import { JobGroupCreateTool } from './job-group-create';
import { JobAddDependencyTool } from './job-add-dependency';
import { JobRemoveDependencyTool } from './job-remove-dependency';
import { JobGetReadyTool } from './job-get-ready';
import { JobGetBlockedTool } from './job-get-blocked';
import { JobLockTool } from './job-lock';
import { JobUnlockTool } from './job-unlock';
import { JobBidAddTool } from './job-bid-add';

/**
 * All job operation tools
 */
export const jobTools = [
    new JobCreateTool(),
    new JobGetTool(),
    new JobUpdateTool(),
    new JobDeleteTool(),
    new JobListTool(),
    new JobGroupCreateTool(),
    new JobAddDependencyTool(),
    new JobRemoveDependencyTool(),
    new JobGetReadyTool(),
    new JobGetBlockedTool(),
    new JobLockTool(),
    new JobUnlockTool(),
    new JobBidAddTool(),
];

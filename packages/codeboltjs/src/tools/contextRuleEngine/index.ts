/**
 * Context Rule Engine Tools
 * 
 * Tools for conditional memory inclusion.
 */

export { RuleCreateTool } from './rule-create';
export { RuleGetTool } from './rule-get';
export { RuleListTool } from './rule-list';
export { RuleUpdateTool } from './rule-update';
export { RuleDeleteTool } from './rule-delete';
export { RuleEvaluateTool } from './rule-evaluate';
export { RuleGetPossibleVariablesTool } from './rule-get-possible-variables';

import { RuleCreateTool } from './rule-create';
import { RuleGetTool } from './rule-get';
import { RuleListTool } from './rule-list';
import { RuleUpdateTool } from './rule-update';
import { RuleDeleteTool } from './rule-delete';
import { RuleEvaluateTool } from './rule-evaluate';
import { RuleGetPossibleVariablesTool } from './rule-get-possible-variables';

/**
 * Array of all context rule engine tools
 */
export const contextRuleEngineTools = [
    new RuleCreateTool(),
    new RuleGetTool(),
    new RuleListTool(),
    new RuleUpdateTool(),
    new RuleDeleteTool(),
    new RuleEvaluateTool(),
    new RuleGetPossibleVariablesTool(),
];

/**
 * Context rule engine tools
 */

export { ContextRuleCreateTool, type ContextRuleCreateToolParams } from './context-rule-create';
export { ContextRuleListTool, type ContextRuleListToolParams } from './context-rule-list';
export { ContextRuleEvaluateTool, type ContextRuleEvaluateToolParams } from './context-rule-evaluate';
export { ContextRuleGetTool, type ContextRuleGetToolParams } from './context-rule-get';
export { ContextRuleDeleteTool, type ContextRuleDeleteToolParams } from './context-rule-delete';

// Create instances for convenience
import { ContextRuleCreateTool } from './context-rule-create';
import { ContextRuleListTool } from './context-rule-list';
import { ContextRuleEvaluateTool } from './context-rule-evaluate';
import { ContextRuleGetTool } from './context-rule-get';
import { ContextRuleDeleteTool } from './context-rule-delete';

/**
 * All context rule engine tools
 */
export const contextTools = [
    new ContextRuleCreateTool(),
    new ContextRuleListTool(),
    new ContextRuleEvaluateTool(),
    new ContextRuleGetTool(),
    new ContextRuleDeleteTool(),
];

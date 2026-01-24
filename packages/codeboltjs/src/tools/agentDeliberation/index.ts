/**
 * Agent Deliberation Tools
 * 
 * Tools for agent collaboration and decision-making through deliberations.
 * Deliberations allow multiple agents to discuss topics, provide responses,
 * and vote on decisions.
 */

export { DeliberationCreateTool } from './deliberation-create';
export { DeliberationGetTool } from './deliberation-get';
export { DeliberationListTool } from './deliberation-list';
export { DeliberationUpdateTool } from './deliberation-update';
export { DeliberationRespondTool } from './deliberation-respond';
export { DeliberationVoteTool } from './deliberation-vote';
export { DeliberationGetWinnerTool } from './deliberation-get-winner';
export { DeliberationSummaryTool } from './deliberation-summary';

import { DeliberationCreateTool } from './deliberation-create';
import { DeliberationGetTool } from './deliberation-get';
import { DeliberationListTool } from './deliberation-list';
import { DeliberationUpdateTool } from './deliberation-update';
import { DeliberationRespondTool } from './deliberation-respond';
import { DeliberationVoteTool } from './deliberation-vote';
import { DeliberationGetWinnerTool } from './deliberation-get-winner';
import { DeliberationSummaryTool } from './deliberation-summary';

/**
 * Array of all agent deliberation tools
 */
export const agentDeliberationTools = [
    new DeliberationCreateTool(),
    new DeliberationGetTool(),
    new DeliberationListTool(),
    new DeliberationUpdateTool(),
    new DeliberationRespondTool(),
    new DeliberationVoteTool(),
    new DeliberationGetWinnerTool(),
    new DeliberationSummaryTool(),
];

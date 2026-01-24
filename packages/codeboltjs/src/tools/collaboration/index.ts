/**
 * Collaboration tools - Group feedback, agent deliberation, and portfolio operations
 */

export { FeedbackCreateTool, type FeedbackCreateToolParams } from './feedback-create';
export { FeedbackGetTool, type FeedbackGetToolParams } from './feedback-get';
export { FeedbackListTool, type FeedbackListToolParams } from './feedback-list';
export { FeedbackRespondTool, type FeedbackRespondToolParams } from './feedback-respond';

export { DeliberationCreateTool, type DeliberationCreateToolParams } from './deliberation-create';
export { DeliberationGetTool, type DeliberationGetToolParams } from './deliberation-get';
export { DeliberationListTool, type DeliberationListToolParams } from './deliberation-list';
export { DeliberationRespondTool, type DeliberationRespondToolParams } from './deliberation-respond';
export { DeliberationVoteTool, type DeliberationVoteToolParams } from './deliberation-vote';

export { PortfolioGetTool, type PortfolioGetToolParams } from './portfolio-get';
export { PortfolioAddTestimonialTool, type PortfolioAddTestimonialToolParams } from './portfolio-add-testimonial';
export { PortfolioAddKarmaTool, type PortfolioAddKarmaToolParams } from './portfolio-add-karma';
export { PortfolioAddTalentTool, type PortfolioAddTalentToolParams } from './portfolio-add-talent';
export { PortfolioEndorseTalentTool, type PortfolioEndorseTalentToolParams } from './portfolio-endorse-talent';
export { PortfolioGetRankingTool, type PortfolioGetRankingToolParams } from './portfolio-get-ranking';

// Create instances for convenience
import { FeedbackCreateTool } from './feedback-create';
import { FeedbackGetTool } from './feedback-get';
import { FeedbackListTool } from './feedback-list';
import { FeedbackRespondTool } from './feedback-respond';

import { DeliberationCreateTool } from './deliberation-create';
import { DeliberationGetTool } from './deliberation-get';
import { DeliberationListTool } from './deliberation-list';
import { DeliberationRespondTool } from './deliberation-respond';
import { DeliberationVoteTool } from './deliberation-vote';

import { PortfolioGetTool } from './portfolio-get';
import { PortfolioAddTestimonialTool } from './portfolio-add-testimonial';
import { PortfolioAddKarmaTool } from './portfolio-add-karma';
import { PortfolioAddTalentTool } from './portfolio-add-talent';
import { PortfolioEndorseTalentTool } from './portfolio-endorse-talent';
import { PortfolioGetRankingTool } from './portfolio-get-ranking';

/**
 * All collaboration tools
 */
export const collaborationTools = [
    new FeedbackCreateTool(),
    new FeedbackGetTool(),
    new FeedbackListTool(),
    new FeedbackRespondTool(),
    new DeliberationCreateTool(),
    new DeliberationGetTool(),
    new DeliberationListTool(),
    new DeliberationRespondTool(),
    new DeliberationVoteTool(),
    new PortfolioGetTool(),
    new PortfolioAddTestimonialTool(),
    new PortfolioAddKarmaTool(),
    new PortfolioAddTalentTool(),
    new PortfolioEndorseTalentTool(),
    new PortfolioGetRankingTool(),
];

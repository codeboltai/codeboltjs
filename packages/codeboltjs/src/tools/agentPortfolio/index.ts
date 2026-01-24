/**
 * Agent Portfolio Tools
 * 
 * Tools for managing agent portfolios, karma, talents, testimonials, and appreciations.
 */

export { PortfolioGetTool } from './portfolio-get';
export { PortfolioGetConversationsTool } from './portfolio-get-conversations';
export { PortfolioAddTestimonialTool } from './portfolio-add-testimonial';
export { PortfolioUpdateTestimonialTool } from './portfolio-update-testimonial';
export { PortfolioDeleteTestimonialTool } from './portfolio-delete-testimonial';
export { PortfolioAddKarmaTool } from './portfolio-add-karma';
export { PortfolioGetKarmaHistoryTool } from './portfolio-get-karma-history';
export { PortfolioAddAppreciationTool } from './portfolio-add-appreciation';
export { PortfolioAddTalentTool } from './portfolio-add-talent';
export { PortfolioEndorseTalentTool } from './portfolio-endorse-talent';
export { PortfolioGetTalentsTool } from './portfolio-get-talents';
export { PortfolioGetRankingTool } from './portfolio-get-ranking';
export { PortfolioGetByProjectTool } from './portfolio-get-by-project';
export { PortfolioUpdateProfileTool } from './portfolio-update-profile';

import { PortfolioGetTool } from './portfolio-get';
import { PortfolioGetConversationsTool } from './portfolio-get-conversations';
import { PortfolioAddTestimonialTool } from './portfolio-add-testimonial';
import { PortfolioUpdateTestimonialTool } from './portfolio-update-testimonial';
import { PortfolioDeleteTestimonialTool } from './portfolio-delete-testimonial';
import { PortfolioAddKarmaTool } from './portfolio-add-karma';
import { PortfolioGetKarmaHistoryTool } from './portfolio-get-karma-history';
import { PortfolioAddAppreciationTool } from './portfolio-add-appreciation';
import { PortfolioAddTalentTool } from './portfolio-add-talent';
import { PortfolioEndorseTalentTool } from './portfolio-endorse-talent';
import { PortfolioGetTalentsTool } from './portfolio-get-talents';
import { PortfolioGetRankingTool } from './portfolio-get-ranking';
import { PortfolioGetByProjectTool } from './portfolio-get-by-project';
import { PortfolioUpdateProfileTool } from './portfolio-update-profile';

/**
 * Array of all agent portfolio tools
 */
export const agentPortfolioTools = [
    new PortfolioGetTool(),
    new PortfolioGetConversationsTool(),
    new PortfolioAddTestimonialTool(),
    new PortfolioUpdateTestimonialTool(),
    new PortfolioDeleteTestimonialTool(),
    new PortfolioAddKarmaTool(),
    new PortfolioGetKarmaHistoryTool(),
    new PortfolioAddAppreciationTool(),
    new PortfolioAddTalentTool(),
    new PortfolioEndorseTalentTool(),
    new PortfolioGetTalentsTool(),
    new PortfolioGetRankingTool(),
    new PortfolioGetByProjectTool(),
    new PortfolioUpdateProfileTool(),
];

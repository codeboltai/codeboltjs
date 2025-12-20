import codebolt from '@codebolt/codeboltjs';
import { AgentContext, StructureProposal, DeliberationReview } from './types';
import { BOOTSTRAP_SWARM_PROMPT, DELIBERATION_REVIEW_PROMPT } from './prompts';
import { llmWithJsonRetry, formatProposalMessage } from './utils';

// ================================
// STRUCTURE DELIBERATION
// ================================

/**
 * Generate consistent deliberation title for a swarm
 */
function getDeliberationTitle(swarmId: string, swarmName?: string): string {
    // Use swarmId to ensure uniqueness, swarmName for readability
    const name = swarmName || 'Swarm';
    return `${name} Initial Teams [${swarmId}]`;
}

export async function findOrCreateStructureDeliberation(ctx: AgentContext): Promise<void> {
    codebolt.chat.sendMessage('🚀 No teams. Checking deliberations...', {});

    const expectedTitle = getDeliberationTitle(ctx.swarmId, ctx.swarmName);

    // Search by swarmId to ensure we find the right deliberation
    const delibResult = await codebolt.agentDeliberation.list({
        search: ctx.swarmId,
    });

    const deliberations = delibResult.payload?.deliberations || [];

    // Find deliberation that matches our swarmId and is not closed
    const structureDelib = deliberations.find((d) => {
        const matchesSwarmId = d.title.includes(ctx.swarmId);
        const matchesTitle = d.title.includes('Initial Teams');
        const isActive = d.status !== 'closed' && d.status !== 'completed';
        return matchesSwarmId && matchesTitle && isActive;
    });

    if (structureDelib) {
        codebolt.chat.sendMessage(`📖 Found existing deliberation: ${structureDelib.title}`, {});
        await reviewStructureDeliberation(ctx, structureDelib);
    } else {
        // Double-check by listing all deliberations (in case search missed it)
        const allDelibResult = await codebolt.agentDeliberation.list({});
        const allDelibs = allDelibResult.payload?.deliberations || [];

        const existingDelib = allDelibs.find((d) => {
            const matchesSwarmId = d.title.includes(ctx.swarmId);
            const matchesTitle = d.title.includes('Initial Teams');
            const isActive = d.status !== 'closed' && d.status !== 'completed';
            return matchesSwarmId && matchesTitle && isActive;
        });

        if (existingDelib) {
            codebolt.chat.sendMessage(`📖 Found existing deliberation: ${existingDelib.title}`, {});
            await reviewStructureDeliberation(ctx, existingDelib);
        } else {
            await createStructureDeliberation(ctx, expectedTitle);
        }
    }
}

async function createStructureDeliberation(ctx: AgentContext, title: string): Promise<void> {
    codebolt.chat.sendMessage('📋 Creating structure deliberation...', {});

    const prompt = BOOTSTRAP_SWARM_PROMPT.replace(/{{agentId}}/g, ctx.agentId)
        .replace(/{{capabilities}}/g, ctx.capabilities.join(', '))
        .replace(/{{projectRequirements}}/g, ctx.requirements);

    // Use retry logic for JSON parsing
    const proposal = await llmWithJsonRetry<StructureProposal>(prompt, 'Propose structure for this project. Respond with ONLY valid JSON.');

    if (!proposal) {
        codebolt.chat.sendMessage('❌ Failed to generate valid proposal', {});
        return;
    }

    // Validate proposal structure
    if (!proposal.roles?.length || !proposal.teams?.length) {
        codebolt.chat.sendMessage('❌ Invalid proposal: missing roles or teams', {});
        return;
    }

    // Final check before creating - another agent might have created it
    const finalCheck = await codebolt.agentDeliberation.list({
        search: ctx.swarmId,
    });

    const alreadyExists = (finalCheck.payload?.deliberations || []).find((d) => {
        return d.title.includes(ctx.swarmId) && d.title.includes('Initial Teams') &&
            d.status !== 'closed' && d.status !== 'completed';
    });

    if (alreadyExists) {
        codebolt.chat.sendMessage('ℹ️ Another agent already created the deliberation', {});
        await reviewStructureDeliberation(ctx, alreadyExists);
        return;
    }

    // Create deliberation with swarmId in title for unique identification
    const delibResult = await codebolt.agentDeliberation.create({
        deliberationType: 'shared-list',
        title,
        requestMessage: `SwarmId: ${ctx.swarmId}\nProject: ${ctx.requirements}\n\nPropose teams for this swarm.`,
        creatorId: ctx.agentId,
        creatorName: ctx.agentName,
        status: 'collecting-responses',
    });

    if (!delibResult.payload?.deliberation) {
        codebolt.chat.sendMessage('❌ Failed to create deliberation', {});
        return;
    }

    const deliberationId = delibResult.payload.deliberation.id;

    // Submit each team as a separate response
    for (const teamName of proposal.teams) {
        // const teamRoles = proposal.teamVacancies[teamName] || [];
        await codebolt.agentDeliberation.respond({
            deliberationId,
            responderId: ctx.agentId,
            responderName: ctx.agentName,
            body: teamName,
        });
    }

    codebolt.chat.sendMessage(`✅ Proposed: ${proposal.summary}`, {});
    codebolt.chat.sendMessage('⏳ Waiting for other agents to vote...', {});
}

async function reviewStructureDeliberation(ctx: AgentContext, deliberation: any): Promise<void> {
    const fullDelib = await codebolt.agentDeliberation.get({
        id: deliberation.id,
        view: 'full',
    });

    const responses = fullDelib.payload?.responses || [];
    const votes = fullDelib.payload?.votes || [];

    // Check if already participated
    const alreadyResponded = responses.some((r) => r.responderId === ctx.agentId);
    const alreadyVoted = votes.some((v) => v.voterId === ctx.agentId);

    if (alreadyResponded || alreadyVoted) {
        codebolt.chat.sendMessage('ℹ️ Already participated in this deliberation', {});
        codebolt.chat.sendMessage('⏳ Waiting for deliberation to complete...', {});
        return;
    }

    if (responses.length === 0) {
        // No responses yet - add first proposal
        codebolt.chat.sendMessage('📝 No proposals yet, adding first response...', {});

        const prompt = BOOTSTRAP_SWARM_PROMPT.replace(/{{agentId}}/g, ctx.agentId)
            .replace(/{{capabilities}}/g, ctx.capabilities.join(', '))
            .replace(/{{projectRequirements}}/g, ctx.requirements);

        const proposal = await llmWithJsonRetry<StructureProposal>(prompt, 'Propose structure. Respond with ONLY valid JSON.');

        if (proposal && proposal.roles?.length && proposal.teams?.length) {
            for (const teamName of proposal.teams) {
                // const teamRoles = proposal.teamVacancies[teamName] || [];
                await codebolt.agentDeliberation.respond({
                    deliberationId: deliberation.id,
                    responderId: ctx.agentId,
                    responderName: ctx.agentName,
                    body: teamName,
                });
            }
            codebolt.chat.sendMessage(`✅ Added proposal: ${proposal.summary}`, {});
        }
        codebolt.chat.sendMessage('⏳ Waiting for other agents to vote...', {});
        return;
    }

    // Format responses for LLM review
    const responseSummary = responses
        .map(
            (r, i) =>
                `[${i + 1}] ID: ${r.id} | By: ${r.responderName} | Votes: ${r.voteCount}\n${r.body}`
        )
        .join('\n\n');

    const prompt = DELIBERATION_REVIEW_PROMPT.replace(/{{agentId}}/g, ctx.agentId)
        .replace(/{{capabilities}}/g, ctx.capabilities.join(', '))
        .replace(/{{projectRequirements}}/g, ctx.requirements)
        .replace(/{{existingResponses}}/g, responseSummary);

    // Use retry logic for JSON parsing
    const decision = await llmWithJsonRetry<DeliberationReview>(
        prompt,
        'Review the proposals above. Vote if you agree with one, or submit your own. Respond with ONLY valid JSON.'
    );

    if (!decision) {
        codebolt.chat.sendMessage('❌ Failed to get valid decision after retries', {});
        return;
    }

    // Validate decision
    if (!decision.action) {
        codebolt.chat.sendMessage('❌ Invalid decision: missing action', {});
        return;
    }

    if (decision.action === 'vote') {
        if (!decision.responseId) {
            codebolt.chat.sendMessage('❌ Vote action requires responseId', {});
            return;
        }

        await codebolt.agentDeliberation.vote({
            deliberationId: deliberation.id,
            responseId: decision.responseId,
            voterId: ctx.agentId,
            voterName: ctx.agentName,
        });
        codebolt.chat.sendMessage(`✅ Voted for proposal: ${decision.reason || 'agreed'}`, {});
        codebolt.chat.sendMessage('⏳ Waiting for deliberation to complete...', {});

    } else if (decision.action === 'respond') {
        if (!decision.roles?.length || !decision.teams?.length) {
            codebolt.chat.sendMessage('❌ Respond action requires roles and teams', {});
            return;
        }

        const proposal: StructureProposal = {
            roles: decision.roles,
            teams: decision.teams,
            teamVacancies: decision.teamVacancies || {},
            myRole: decision.myRole || '',
            myTeam: decision.myTeam || '',
            summary: decision.summary || '',
        };

        // Submit each team as a separate response
        for (const teamName of proposal.teams) {
            // const teamRoles = proposal.teamVacancies[teamName] || [];
            await codebolt.agentDeliberation.respond({
                deliberationId: deliberation.id,
                responderId: ctx.agentId,
                responderName: ctx.agentName,
                body: teamName,
            });
        }
        codebolt.chat.sendMessage(`✅ Added alternative proposal: ${JSON.stringify(proposal.teams)}`, {});
        codebolt.chat.sendMessage('⏳ Waiting for other agents to vote...', {});
    }
}

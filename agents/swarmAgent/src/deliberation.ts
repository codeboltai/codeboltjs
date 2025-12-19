import codebolt from '@codebolt/codeboltjs';
import { AgentContext, StructureProposal, DeliberationReview } from './types';
import { BOOTSTRAP_SWARM_PROMPT, DELIBERATION_REVIEW_PROMPT } from './prompts';
import { llmWithJsonRetry, formatProposalMessage, parseProposalMessage } from './utils';

// ================================
// STRUCTURE DELIBERATION
// ================================

export async function findOrCreateStructureDeliberation(ctx: AgentContext): Promise<void> {
    codebolt.chat.sendMessage('🚀 No teams. Checking deliberations...', {});

    const searchTerm = ctx.swarmName ? `${ctx.swarmName} Initial Teams` : 'Initial Teams';

    // Check ALL deliberations to avoid duplicates
    const delibResult = await codebolt.agentDeliberation.list({
        search: searchTerm,
    });

    const deliberations = delibResult.payload?.deliberations || [];
    const structureDelib = deliberations.find(
        (d) => d.title.includes(searchTerm) && d.status !== 'closed'
    );

    if (structureDelib) {
        await reviewStructureDeliberation(ctx, structureDelib);
    } else {
        await createStructureDeliberation(ctx);
    }
}

async function createStructureDeliberation(ctx: AgentContext): Promise<void> {
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

    const title = ctx.swarmName ? `${ctx.swarmName} Initial Teams` : 'Swarm Initial Teams';

    // Create deliberation
    const delibResult = await codebolt.agentDeliberation.create({
        title,
        requestMessage: `Project: ${ctx.requirements}\n\nPropose roles, teams, and vacancies.`,
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
        const teamRoles = proposal.teamVacancies[teamName] || [];
        await codebolt.agentDeliberation.respond({
            deliberationId,
            responderId: ctx.agentId,
            responderName: ctx.agentName,
            body: `Team: ${teamName}\nRoles needed: ${teamRoles.join(', ')}`,
        });
    }

    codebolt.chat.sendMessage(`✅ Proposed: ${proposal.summary}`, {});
    codebolt.chat.sendMessage('⏳ Waiting for votes...', {});
}

async function reviewStructureDeliberation(ctx: AgentContext, deliberation: any): Promise<void> {
    codebolt.chat.sendMessage(`📖 Found existing deliberation: ${deliberation.title}`, {});

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
        await checkAndExecuteStructure(ctx, deliberation.id);
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
            await codebolt.agentDeliberation.respond({
                deliberationId: deliberation.id,
                responderId: ctx.agentId,
                responderName: ctx.agentName,
                body: formatProposalMessage(proposal),
            });
            codebolt.chat.sendMessage(`✅ Added proposal: ${proposal.summary}`, {});
        }
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
        await checkAndExecuteStructure(ctx, deliberation.id);
        
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

        await codebolt.agentDeliberation.respond({
            deliberationId: deliberation.id,
            responderId: ctx.agentId,
            responderName: ctx.agentName,
            body: formatProposalMessage(proposal),
        });
        codebolt.chat.sendMessage(`✅ Added alternative proposal: ${proposal.summary}`, {});
    }
}

export async function checkAndExecuteStructure(
    ctx: AgentContext,
    deliberationId: string
): Promise<void> {
    const winnerResult = await codebolt.agentDeliberation.getWinner({ deliberationId });
    const winner = winnerResult.payload?.winner;
    const votes = winnerResult.payload?.votes || [];

    if (winner && votes.length >= 2) {
        codebolt.chat.sendMessage(`🏆 Winner! ${votes.length} votes. Executing...`, {});

        await codebolt.agentDeliberation.update({
            deliberationId,
            status: 'completed',
        });

        const proposal = parseProposalMessage(winner.body);
        if (proposal) {
            await executeStructure(ctx, proposal);
        }
    } else {
        codebolt.chat.sendMessage(`⏳ ${votes.length}/2 votes needed`, {});
    }
}

async function executeStructure(ctx: AgentContext, proposal: StructureProposal): Promise<void> {
    const roleIdMap: Record<string, string> = {};
    const teamIdMap: Record<string, string> = {};

    // Create roles
    codebolt.chat.sendMessage('🎭 Creating roles...', {});
    for (const roleName of proposal.roles) {
        const result = await codebolt.swarm.createRole(ctx.swarmId, {
            name: roleName,
            description: `${roleName} role`,
            createdBy: ctx.agentId,
        });
        if (result.success && result.data?.role) {
            roleIdMap[roleName] = result.data.role.id;
            codebolt.chat.sendMessage(`  ✅ ${roleName}`, {});
        }
    }

    // Create teams
    codebolt.chat.sendMessage('🏢 Creating teams...', {});
    for (const teamName of proposal.teams) {
        const result = await codebolt.swarm.createTeam(ctx.swarmId, {
            name: teamName,
            description: `${teamName}`,
            createdBy: ctx.agentId,
        });
        if (result.success && result.data?.team) {
            teamIdMap[teamName] = result.data.team.id;
            codebolt.chat.sendMessage(`  ✅ ${teamName}`, {});
        }
    }

    // Create vacancies
    codebolt.chat.sendMessage('📋 Creating vacancies...', {});
    for (const [teamName, roles] of Object.entries(proposal.teamVacancies)) {
        const teamId = teamIdMap[teamName];
        for (const roleName of roles) {
            const roleId = roleIdMap[roleName];
            if (roleId && teamId) {
                await codebolt.swarm.createVacancy(ctx.swarmId, {
                    roleId,
                    title: `${roleName} - ${teamName}`,
                    description: `${roleName} needed for ${teamName}`,
                    createdBy: ctx.agentId,
                    metadata: { teamId, teamName },
                });
                codebolt.chat.sendMessage(`  ✅ ${roleName} @ ${teamName}`, {});
            }
        }
    }

    // Assign self
    const myRoleId = roleIdMap[proposal.myRole];
    const myTeamId = teamIdMap[proposal.myTeam];
    if (myRoleId) await codebolt.swarm.assignRole(ctx.swarmId, myRoleId, ctx.agentId);
    if (myTeamId) await codebolt.swarm.joinTeam(ctx.swarmId, myTeamId, ctx.agentId);

    codebolt.chat.sendMessage(`✅ Joined as ${proposal.myRole} in ${proposal.myTeam}`, {});
}

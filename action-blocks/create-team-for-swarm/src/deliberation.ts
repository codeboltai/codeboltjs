import codebolt from '@codebolt/codeboltjs';
import { AgentContext, StructureProposal, DeliberationReview } from './types';
import { BOOTSTRAP_SWARM_PROMPT, DELIBERATION_REVIEW_PROMPT } from './prompts';
import { llmWithJsonRetry } from './utils';

function getDeliberationTitle(swarmId: string, swarmName?: string): string {
    const name = swarmName || 'Swarm';
    return `${name} Initial Teams [${swarmId}]`;
}

export async function findOrCreateStructureDeliberation(ctx: AgentContext): Promise<void> {
    codebolt.chat.sendMessage('No teams. Checking deliberations...', {});

    const expectedTitle = getDeliberationTitle(ctx.swarmId, ctx.swarmName);

    const delibResult = await codebolt.agentDeliberation.list({
        search: ctx.swarmId,
    });

    const deliberations = delibResult.payload?.deliberations || [];

    const structureDelib = deliberations.find((d) => {
        const matchesSwarmId = d.title.includes(ctx.swarmId);
        const matchesTitle = d.title.includes('Initial Teams');
        const isActive = d.status !== 'closed' && d.status !== 'completed';
        return matchesSwarmId && matchesTitle && isActive;
    });

    if (structureDelib) {
        codebolt.chat.sendMessage(`Found existing deliberation: ${structureDelib.title}`, {});
        await reviewStructureDeliberation(ctx, structureDelib);
    } else {
        const allDelibResult = await codebolt.agentDeliberation.list({});
        const allDelibs = allDelibResult.payload?.deliberations || [];

        const existingDelib = allDelibs.find((d) => {
            const matchesSwarmId = d.title.includes(ctx.swarmId);
            const matchesTitle = d.title.includes('Initial Teams');
            const isActive = d.status !== 'closed' && d.status !== 'completed';
            return matchesSwarmId && matchesTitle && isActive;
        });

        if (existingDelib) {
            codebolt.chat.sendMessage(`Found existing deliberation: ${existingDelib.title}`, {});
            await reviewStructureDeliberation(ctx, existingDelib);
        } else {
            await createStructureDeliberation(ctx, expectedTitle);
        }
    }
}

async function createStructureDeliberation(ctx: AgentContext, title: string): Promise<void> {
    codebolt.chat.sendMessage('Creating structure deliberation...', {});

    const prompt = BOOTSTRAP_SWARM_PROMPT.replace(/{{agentId}}/g, ctx.agentId)
        .replace(/{{capabilities}}/g, ctx.capabilities.join(', '))
        .replace(/{{projectRequirements}}/g, ctx.requirements);

    const proposal = await llmWithJsonRetry<StructureProposal>(prompt, 'Propose structure for this project. Respond with ONLY valid JSON.');
    codebolt.chat.sendMessage(JSON.stringify(proposal));

    if (!proposal) {
        codebolt.chat.sendMessage('Failed to generate valid proposal', {});
        return;
    }

    if (!proposal.roles?.length || !proposal.teams?.length) {
        codebolt.chat.sendMessage('Invalid proposal: missing roles or teams', {});
        return;
    }

    codebolt.chat.sendMessage('checking for deliberation');

    const finalCheck = await codebolt.agentDeliberation.list({
        search: ctx.swarmId,
    });
    codebolt.chat.sendMessage(`${JSON.stringify(finalCheck)}`);

    const alreadyExists = (finalCheck.payload?.deliberations || []).find((d) => {
        return d.title.includes(ctx.swarmId) && d.title.includes('Initial Teams') &&
            d.status !== 'closed' && d.status !== 'completed';
    });

    if (alreadyExists) {
        codebolt.chat.sendMessage('Another agent already created the deliberation', {});
        await reviewStructureDeliberation(ctx, alreadyExists);
        return;
    }

    const delibResult = await codebolt.agentDeliberation.create({
        deliberationType: 'shared-list',
        title,
        requestMessage: `SwarmId: ${ctx.swarmId}\nProject: ${ctx.requirements}\n\nPropose teams for this swarm.`,
        creatorId: ctx.agentId,
        creatorName: ctx.agentName,
        status: 'collecting-responses',
    });

    if (!delibResult.payload?.deliberation) {
        codebolt.chat.sendMessage('Failed to create deliberation', {});
        return;
    }

    const deliberationId = delibResult.payload.deliberation.id;

    for (const teamName of proposal.teams) {
        await codebolt.agentDeliberation.respond({
            deliberationId,
            responderId: ctx.agentId,
            responderName: ctx.agentName,
            body: teamName,
        });
    }

    codebolt.chat.sendMessage(`Proposed: ${proposal.summary}`, {});

    await checkAndFinalizeDeliberation(ctx, deliberationId);
}

async function reviewStructureDeliberation(ctx: AgentContext, deliberation: any): Promise<void> {
    const fullDelib = await codebolt.agentDeliberation.get({
        id: deliberation.id,
        view: 'full',
    });

    const responses = fullDelib.payload?.responses || [];
    const votes = fullDelib.payload?.votes || [];

    const alreadyContributed = responses.some((r: any) => {
        if (r.contributors && Array.isArray(r.contributors)) {
            return r.contributors.some((c: { id: string }) => c.id === ctx.agentId);
        }
        return r.responderId === ctx.agentId;
    });
    const alreadyVoted = votes.some((v) => v.voterId === ctx.agentId);

    if (alreadyContributed || alreadyVoted) {
        codebolt.chat.sendMessage('Already participated in this deliberation', {});
        await checkAndFinalizeDeliberation(ctx, deliberation.id);
        return;
    }

    if (responses.length === 0) {
        codebolt.chat.sendMessage('No proposals yet, adding first response...', {});

        const prompt = BOOTSTRAP_SWARM_PROMPT.replace(/{{agentId}}/g, ctx.agentId)
            .replace(/{{capabilities}}/g, ctx.capabilities.join(', '))
            .replace(/{{projectRequirements}}/g, ctx.requirements);

        const proposal = await llmWithJsonRetry<StructureProposal>(prompt, 'Propose structure. Respond with ONLY valid JSON.');

        if (proposal && proposal.roles?.length && proposal.teams?.length) {
            for (const teamName of proposal.teams) {
                await codebolt.agentDeliberation.respond({
                    deliberationId: deliberation.id,
                    responderId: ctx.agentId,
                    responderName: ctx.agentName,
                    body: teamName,
                });
            }
            codebolt.chat.sendMessage(`Added proposal: ${proposal.summary}`, {});
        }

        await checkAndFinalizeDeliberation(ctx, deliberation.id);
        return;
    }

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

    const decision = await llmWithJsonRetry<DeliberationReview>(
        prompt,
        'Review the proposals above. Vote if you agree with one, or submit your own. Respond with ONLY valid JSON.'
    );

    if (!decision) {
        codebolt.chat.sendMessage('Failed to get valid decision after retries', {});
        return;
    }

    if (!decision.action) {
        codebolt.chat.sendMessage('Invalid decision: missing action', {});
        return;
    }

    if (decision.action === 'vote') {
        if (!decision.responseId) {
            codebolt.chat.sendMessage('Vote action requires responseId', {});
            return;
        }

        await codebolt.agentDeliberation.vote({
            deliberationId: deliberation.id,
            responseId: decision.responseId,
            voterId: ctx.agentId,
            voterName: ctx.agentName,
        });
        codebolt.chat.sendMessage(`Voted for proposal: ${decision.reason || 'agreed'}`, {});

    } else if (decision.action === 'respond') {
        if (!decision.roles?.length || !decision.teams?.length) {
            codebolt.chat.sendMessage('Respond action requires roles and teams', {});
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

        for (const teamName of proposal.teams) {
            await codebolt.agentDeliberation.respond({
                deliberationId: deliberation.id,
                responderId: ctx.agentId,
                responderName: ctx.agentName,
                body: teamName,
            });
        }
        codebolt.chat.sendMessage(`Added alternative proposal: ${JSON.stringify(proposal.teams)}`, {});
    }

    await checkAndFinalizeDeliberation(ctx, deliberation.id);
}

export async function checkAndFinalizeDeliberation(ctx: AgentContext, deliberationId: string): Promise<void> {
    const agentsResult: any = await codebolt.swarm.getSwarm(ctx.swarmId);
    const totalAgentCount = agentsResult.data.swarm.configuration?.maxAgents || 1;

    const fullDelib = await codebolt.agentDeliberation.get({
        id: deliberationId,
        view: 'full',
    });

    const responses = fullDelib.payload?.responses || [];
    const votes = fullDelib.payload?.votes || [];

    const participantIds = new Set<string>();

    responses.forEach((r: any) => {
        if (r.contributors && Array.isArray(r.contributors)) {
            r.contributors.forEach((c: { id: string }) => participantIds.add(c.id));
        } else {
            participantIds.add(r.responderId);
        }
    });

    votes.forEach((v) => participantIds.add(v.voterId));

    const participantCount = participantIds.size;

    codebolt.chat.sendMessage(`Deliberation status: ${participantCount}/${totalAgentCount} agents participated`, {});

    if (participantCount < totalAgentCount) {
        codebolt.chat.sendMessage('Waiting for other agents to participate...', {});
        return;
    }

    codebolt.chat.sendMessage('All agents participated! Finalizing deliberation...', {});

    const teamsResult = await codebolt.swarm.listTeams(ctx.swarmId);
    const existingTeams = teamsResult.data?.teams || [];

    if (existingTeams.length > 0) {
        codebolt.chat.sendMessage('Teams already created by another agent', {});
        return;
    }

    const sortedResponses = [...responses].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));

    const teamNamesToCreate = new Set<string>();

    const hasVotes = sortedResponses.some((r) => (r.voteCount || 0) > 0);

    if (hasVotes) {
        for (const response of sortedResponses) {
            if ((response.voteCount || 0) > 0) {
                const teamName = response.body?.trim();
                if (teamName && !teamName.includes('\n')) {
                    teamNamesToCreate.add(teamName);
                }
            }
        }
    } else {
        for (const response of sortedResponses) {
            const teamName = response.body?.trim();
            if (teamName && !teamName.includes('\n')) {
                teamNamesToCreate.add(teamName);
            }
        }
    }

    if (teamNamesToCreate.size === 0) {
        codebolt.chat.sendMessage('No valid team proposals found', {});
        return;
    }

    codebolt.chat.sendMessage(`Creating ${teamNamesToCreate.size} teams from deliberation...`, {});

    for (const teamName of teamNamesToCreate) {
        try {
            const createResult = await codebolt.swarm.createTeam(ctx.swarmId, {
                name: teamName,
                description: `Team created from deliberation`,
                createdBy: ctx.agentId,
            });

            if (createResult.success) {
                codebolt.chat.sendMessage(`Created team: ${teamName}`, {});
            } else {
                codebolt.chat.sendMessage(`Failed to create team: ${teamName}`, {});
            }
        } catch (error) {
            codebolt.chat.sendMessage(`Error creating team ${teamName}: ${error}`, {});
        }
    }

    try {
        await codebolt.agentDeliberation.update({
            deliberationId: deliberationId,
            status: 'completed',
        });
        codebolt.chat.sendMessage('Deliberation completed and teams created!', {});
    } catch (error) {
        codebolt.chat.sendMessage(`Could not close deliberation: ${error}`, {});
    }
}

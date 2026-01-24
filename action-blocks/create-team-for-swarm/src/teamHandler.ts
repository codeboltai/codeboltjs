import codebolt from '@codebolt/codeboltjs';
import { AgentContext, RoleDecision, TeamDecision, StructureProposal } from './types';
import { ROLE_ASSIGNMENT_PROMPT, TEAM_DECISION_PROMPT } from './prompts';
import { llmWithJsonRetry, formatTeamProposalMessage } from './utils';
import { createTeamMailThread, joinTeamMailThread } from './mailHandler';

export async function handleJoinSwarm(ctx: AgentContext, teams: any[]): Promise<void> {
    codebolt.chat.sendMessage('Joining existing swarm...', {});

    const assignedRole = await assignRole(ctx);

    await findTeam(ctx, teams, assignedRole);
}

async function assignRole(ctx: AgentContext): Promise<string> {
    const rolesResult = await codebolt.swarm.listRoles(ctx.swarmId);
    const roles = rolesResult.data?.roles || [];

    const rolePrompt = ROLE_ASSIGNMENT_PROMPT.replace(/{{agentId}}/g, ctx.agentId)
        .replace(/{{agentName}}/g, ctx.agentName)
        .replace(/{{capabilities}}/g, ctx.capabilities.join(', '))
        .replace(
            /{{existingRoles}}/g,
            roles.map((r) => `${r.id}: ${r.name}`).join('\n') || 'None'
        );

    const roleDecision = await llmWithJsonRetry<RoleDecision>(
        rolePrompt,
        'Choose your role. Respond with ONLY valid JSON.'
    );

    let assignedRole = '';

    if (roleDecision) {
        if (!roleDecision.action) {
            codebolt.chat.sendMessage('Invalid role decision: missing action', {});
            return '';
        }

        if (roleDecision.action === 'assign_role' && roleDecision.roleId) {
            await codebolt.swarm.assignRole(ctx.swarmId, roleDecision.roleId, ctx.agentId);
            assignedRole = roleDecision.roleName;
        } else if (roleDecision.action === 'create_role' && roleDecision.roleName) {
            const result = await codebolt.swarm.createRole(ctx.swarmId, {
                name: roleDecision.roleName,
                description: roleDecision.roleDescription,
                createdBy: ctx.agentId,
            });
            if (result.success && result.data?.role) {
                await codebolt.swarm.assignRole(ctx.swarmId, result.data.role.id, ctx.agentId);
                assignedRole = roleDecision.roleName;
            }
        }
        codebolt.chat.sendMessage(`Role: ${assignedRole}`, {});
    }

    return assignedRole;
}

async function findTeam(ctx: AgentContext, teams: any[], assignedRole: string): Promise<void> {
    const vacanciesResult = await codebolt.swarm.listVacancies(ctx.swarmId);
    const openVacancies = (vacanciesResult.data?.vacancies || []).filter(
        (v) => v.status === 'open'
    );

    const teamPrompt = TEAM_DECISION_PROMPT.replace(/{{agentId}}/g, ctx.agentId)
        .replace(/{{assignedRole}}/g, assignedRole)
        .replace(/{{existingTeams}}/g, teams.map((t) => `${t.id}: ${t.name}`).join('\n'))
        .replace(
            /{{openVacancies}}/g,
            openVacancies
                .map((v) => `${v.id}: ${v.title} (${v.metadata?.teamName || 'Unknown team'})`)
                .join('\n') || 'None'
        );

    const teamDecision = await llmWithJsonRetry<TeamDecision>(
        teamPrompt,
        'Find your team. Respond with ONLY valid JSON.'
    );

    if (!teamDecision) {
        codebolt.chat.sendMessage('Failed to get valid team decision', {});
        return;
    }

    if (!teamDecision.action) {
        codebolt.chat.sendMessage('Invalid team decision: missing action', {});
        return;
    }

    codebolt.chat.sendMessage(`${teamDecision.action}: ${teamDecision.reasoning || ''}`, {});

    switch (teamDecision.action) {
        case 'apply_vacancy':
            if (teamDecision.vacancyId) {
                await codebolt.swarm.applyForVacancy(
                    ctx.swarmId,
                    teamDecision.vacancyId,
                    ctx.agentId,
                    teamDecision.message
                );
                codebolt.chat.sendMessage(`Applied for vacancy`, {});
                codebolt.chat.sendMessage('Waiting for application review...', {});
            } else {
                codebolt.chat.sendMessage('apply_vacancy requires vacancyId', {});
            }
            break;

        case 'join_team':
            if (teamDecision.teamId) {
                await codebolt.swarm.joinTeam(ctx.swarmId, teamDecision.teamId, ctx.agentId);
                codebolt.chat.sendMessage(`Joined team`, {});

                const team = teams.find((t) => t.id === teamDecision.teamId);
                if (team) {
                    await joinTeamMailThread(ctx, team.name, team.id);
                }
            } else {
                codebolt.chat.sendMessage('join_team requires teamId', {});
            }
            break;

        case 'propose_team':
            if (teamDecision.teamName) {
                await proposeTeamViaDeliberation(
                    ctx,
                    teamDecision.teamName,
                    teamDecision.teamDescription || '',
                    teamDecision.neededRoles || []
                );
            } else {
                codebolt.chat.sendMessage('propose_team requires teamName', {});
            }
            break;

        case 'wait':
            codebolt.chat.sendMessage(`Waiting for opportunities...`, {});
            break;

        default:
            codebolt.chat.sendMessage(`Unknown action: ${teamDecision.action}`, {});
    }
}

async function proposeTeamViaDeliberation(
    ctx: AgentContext,
    teamName: string,
    teamDescription: string,
    neededRoles: string[]
): Promise<void> {
    codebolt.chat.sendMessage(`Looking for team deliberation: ${teamName}`, {});

    const delibResult = await codebolt.agentDeliberation.list({
        search: teamName,
    });

    const existing = delibResult.payload?.deliberations?.find(
        (d) => d.title.toLowerCase().includes(teamName.toLowerCase()) && d.status !== 'closed'
    );

    if (existing) {
        codebolt.chat.sendMessage(`Found existing deliberation for ${teamName}`, {});

        const fullDelib = await codebolt.agentDeliberation.get({
            id: existing.id,
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
            await checkAndFinalizeTeamDeliberation(ctx, existing.id, teamName, teamDescription);
            return;
        }

        if (responses.length > 0) {
            const topProposal = responses.reduce((a, b) =>
                a.voteCount > b.voteCount ? a : b
            );

            await codebolt.agentDeliberation.vote({
                deliberationId: existing.id,
                responseId: topProposal.id,
                voterId: ctx.agentId,
                voterName: ctx.agentName,
            });
            codebolt.chat.sendMessage(
                `Voted for existing proposal by ${topProposal.responderName}`,
                {}
            );
        } else {
            await codebolt.agentDeliberation.respond({
                deliberationId: existing.id,
                responderId: ctx.agentId,
                responderName: ctx.agentName,
                body: formatTeamProposalMessage(teamName, teamDescription, neededRoles),
            });
            codebolt.chat.sendMessage(`Added first proposal to deliberation`, {});
        }

        await checkAndFinalizeTeamDeliberation(ctx, existing.id, teamName, teamDescription);

    } else {
        codebolt.chat.sendMessage(`No deliberation found, creating new...`, {});

        const createResult = await codebolt.agentDeliberation.create({
            deliberationType: 'voting',
            title: `Team: ${teamName}`,
            requestMessage: `Proposal to create team "${teamName}"`,
            creatorId: ctx.agentId,
            creatorName: ctx.agentName,
            status: 'collecting-responses',
        });

        if (createResult.payload?.deliberation) {
            const deliberationId = createResult.payload.deliberation.id;

            await codebolt.agentDeliberation.respond({
                deliberationId,
                responderId: ctx.agentId,
                responderName: ctx.agentName,
                body: formatTeamProposalMessage(teamName, teamDescription, neededRoles),
            });
            codebolt.chat.sendMessage(`Created team deliberation with proposal`, {});

            await checkAndFinalizeTeamDeliberation(ctx, deliberationId, teamName, teamDescription);
        }
    }
}

async function checkAndFinalizeTeamDeliberation(
    ctx: AgentContext,
    deliberationId: string,
    teamName: string,
    teamDescription: string
): Promise<void> {
    const agentsResult = await codebolt.swarm.getSwarmAgents(ctx.swarmId);
    const allAgents = agentsResult.data?.agents || [];
    const totalAgentCount = allAgents.length;

    if (totalAgentCount === 0) {
        return;
    }

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

    if (participantCount < totalAgentCount) {
        codebolt.chat.sendMessage('Waiting for other agents to participate...', {});
        return;
    }

    codebolt.chat.sendMessage('All agents participated! Checking team creation...', {});

    const teamsResult = await codebolt.swarm.listTeams(ctx.swarmId);
    const existingTeam = (teamsResult.data?.teams || []).find(
        (t) => t.name.toLowerCase() === teamName.toLowerCase()
    );

    if (existingTeam) {
        codebolt.chat.sendMessage(`Team "${teamName}" already exists`, {});
        return;
    }

    const hasApproval = responses.some((r) => (r.voteCount || 0) > 0) || responses.length > 0;

    if (hasApproval) {
        try {
            const createResult = await codebolt.swarm.createTeam(ctx.swarmId, {
                name: teamName,
                description: teamDescription || `Team created from deliberation`,
                createdBy: ctx.agentId,
            });

            if (createResult.success) {
                codebolt.chat.sendMessage(`Created team: ${teamName}`, {});

                const teamId = createResult.data?.team?.id || '';
                await createTeamMailThread(ctx, teamId, teamName);

                await codebolt.agentDeliberation.update({
                    deliberationId,
                    status: 'completed',
                });
            }
        } catch (error) {
            codebolt.chat.sendMessage(`Error creating team: ${error}`, {});
        }
    }
}

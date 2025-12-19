import codebolt from '@codebolt/codeboltjs';
import { AgentContext, RoleDecision, TeamDecision } from './types';
import { ROLE_ASSIGNMENT_PROMPT, TEAM_DECISION_PROMPT } from './prompts';
import { llmWithJsonRetry, formatTeamProposalMessage } from './utils';

// ================================
// JOIN EXISTING SWARM
// ================================

export async function handleJoinSwarm(ctx: AgentContext, teams: any[]): Promise<void> {
    codebolt.chat.sendMessage('🔗 Joining existing swarm...', {});

    // Phase 1: Role Assignment
    const assignedRole = await assignRole(ctx);

    // Phase 2: Team Decision
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

    // Use retry logic
    const roleDecision = await llmWithJsonRetry<RoleDecision>(
        rolePrompt,
        'Choose your role. Respond with ONLY valid JSON.'
    );

    let assignedRole = '';

    if (roleDecision) {
        if (!roleDecision.action) {
            codebolt.chat.sendMessage('❌ Invalid role decision: missing action', {});
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
        codebolt.chat.sendMessage(`✅ Role: ${assignedRole}`, {});
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

    // Use retry logic
    const teamDecision = await llmWithJsonRetry<TeamDecision>(
        teamPrompt,
        'Find your team. Respond with ONLY valid JSON.'
    );

    if (!teamDecision) {
        codebolt.chat.sendMessage('❌ Failed to get valid team decision', {});
        return;
    }

    if (!teamDecision.action) {
        codebolt.chat.sendMessage('❌ Invalid team decision: missing action', {});
        return;
    }

    codebolt.chat.sendMessage(`🎯 ${teamDecision.action}: ${teamDecision.reasoning || ''}`, {});

    switch (teamDecision.action) {
        case 'apply_vacancy':
            if (teamDecision.vacancyId) {
                await codebolt.swarm.applyForVacancy(
                    ctx.swarmId,
                    teamDecision.vacancyId,
                    ctx.agentId,
                    teamDecision.message
                );
                codebolt.chat.sendMessage(`✅ Applied for vacancy`, {});
                codebolt.chat.sendMessage('⏳ Waiting for application review...', {});
            } else {
                codebolt.chat.sendMessage('❌ apply_vacancy requires vacancyId', {});
            }
            break;

        case 'join_team':
            if (teamDecision.teamId) {
                await codebolt.swarm.joinTeam(ctx.swarmId, teamDecision.teamId, ctx.agentId);
                codebolt.chat.sendMessage(`✅ Joined team`, {});
            } else {
                codebolt.chat.sendMessage('❌ join_team requires teamId', {});
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
                codebolt.chat.sendMessage('❌ propose_team requires teamName', {});
            }
            break;

        case 'wait':
            codebolt.chat.sendMessage(`⏳ Waiting for opportunities...`, {});
            break;

        default:
            codebolt.chat.sendMessage(`❌ Unknown action: ${teamDecision.action}`, {});
    }
}

async function proposeTeamViaDeliberation(
    ctx: AgentContext,
    teamName: string,
    teamDescription: string,
    neededRoles: string[]
): Promise<void> {
    codebolt.chat.sendMessage(`📋 Looking for team deliberation: ${teamName}`, {});

    // Check ALL deliberations to avoid duplicates
    const delibResult = await codebolt.agentDeliberation.list({
        search: teamName,
    });

    const existing = delibResult.payload?.deliberations?.find(
        (d) => d.title.toLowerCase().includes(teamName.toLowerCase()) && d.status !== 'closed'
    );

    if (existing) {
        codebolt.chat.sendMessage(`📖 Found existing deliberation for ${teamName}`, {});

        const fullDelib = await codebolt.agentDeliberation.get({
            id: existing.id,
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

        if (responses.length > 0) {
            // Vote for top proposal
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
                `✅ Voted for existing proposal by ${topProposal.responderName}`,
                {}
            );
        } else {
            // No responses yet - add first one
            await codebolt.agentDeliberation.respond({
                deliberationId: existing.id,
                responderId: ctx.agentId,
                responderName: ctx.agentName,
                body: formatTeamProposalMessage(teamName, teamDescription, neededRoles),
            });
            codebolt.chat.sendMessage(`✅ Added first proposal to deliberation`, {});
        }
        
        codebolt.chat.sendMessage('⏳ Waiting for deliberation to complete...', {});
        
    } else {
        // No deliberation exists - create new one
        codebolt.chat.sendMessage(`📝 No deliberation found, creating new...`, {});

        const createResult = await codebolt.agentDeliberation.create({
            deliberationType: 'voting',
            title: `Team: ${teamName}`,
            requestMessage: `Proposal to create team "${teamName}"`,
            creatorId: ctx.agentId,
            creatorName: ctx.agentName,
            status: 'collecting-responses',
        });

        if (createResult.payload?.deliberation) {
            await codebolt.agentDeliberation.respond({
                deliberationId: createResult.payload.deliberation.id,
                responderId: ctx.agentId,
                responderName: ctx.agentName,
                body: formatTeamProposalMessage(teamName, teamDescription, neededRoles),
            });
            codebolt.chat.sendMessage(`✅ Created team deliberation with proposal`, {});
            codebolt.chat.sendMessage('⏳ Waiting for other agents to vote...', {});
        }
    }
}

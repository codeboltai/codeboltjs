export interface RoleDecision {
    action: 'assign_role' | 'create_role';
    roleId?: string;
    roleName: string;
    roleDescription?: string;
    reasoning: string;
}

export interface StructureProposal {
    roles: string[];
    teams: string[];
    teamVacancies: Record<string, string[]>;
    myRole: string;
    myTeam: string;
    summary: string;
}

export interface DeliberationReview {
    action: 'vote' | 'respond';
    responseId?: string;
    reason?: string;
    roles?: string[];
    teams?: string[];
    teamVacancies?: Record<string, string[]>;
    myRole?: string;
    myTeam?: string;
    summary?: string;
}

export interface TeamDecision {
    action: 'apply_vacancy' | 'propose_team' | 'join_team' | 'wait';
    vacancyId?: string;
    teamId?: string;
    teamName?: string;
    teamDescription?: string;
    neededRoles?: string[];
    message?: string;
    reasoning: string;
}

export interface AgentContext {
    swarmId: string;
    swarmName: string;
    agentId: string;
    agentName: string;
    capabilities: string[];
    requirements: string;
}

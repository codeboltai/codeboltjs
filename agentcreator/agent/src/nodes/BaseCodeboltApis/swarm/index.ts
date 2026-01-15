import { BaseCreateSwarmNode, BaseListSwarmsNode, BaseGetSwarmNode, BaseRegisterSwarmAgentNode, BaseUnregisterAgentNode, BaseCreateTeamNode, BaseListTeamsNode, BaseCreateRoleNode, BaseAssignRoleNode, BaseUpdateAgentStatusNode, BaseGetSwarmStatusSummaryNode, BaseGetDefaultJobGroupNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class CreateSwarmNode extends BaseCreateSwarmNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const name = this.getInputData(1) as string;
            const description = this.getInputData(2) as string;
            const result = await codebolt.swarm.createSwarm({ name, description } as any);
            this.setOutputData(1, (result as any).swarm);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('CreateSwarmNode error:', error); this.setOutputData(2, false); }
    }
}

export class ListSwarmsNode extends BaseListSwarmsNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const result = await codebolt.swarm.listSwarms();
            this.setOutputData(1, (result as any).swarms);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('ListSwarmsNode error:', error); this.setOutputData(2, false); }
    }
}

export class GetSwarmNode extends BaseGetSwarmNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const swarmId = this.getInputData(1) as string;
            const result = await codebolt.swarm.getSwarm(swarmId);
            this.setOutputData(1, (result as any).swarm);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('GetSwarmNode error:', error); this.setOutputData(2, false); }
    }
}

export class RegisterSwarmAgentNode extends BaseRegisterSwarmAgentNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const swarmId = this.getInputData(1) as string;
            const agentData = this.getInputData(2) as any;
            const result = await codebolt.swarm.registerAgent(swarmId, agentData);
            this.setOutputData(1, (result as any).agentId);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('RegisterSwarmAgentNode error:', error); this.setOutputData(2, false); }
    }
}

export class UnregisterAgentNode extends BaseUnregisterAgentNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const swarmId = this.getInputData(1) as string;
            const agentId = this.getInputData(2) as string;
            await codebolt.swarm.unregisterAgent(swarmId, agentId);
            this.setOutputData(1, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('UnregisterAgentNode error:', error); this.setOutputData(1, false); }
    }
}

export class CreateTeamNode extends BaseCreateTeamNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const swarmId = this.getInputData(1) as string;
            const teamData = this.getInputData(2) as any;
            const result = await codebolt.swarm.createTeam(swarmId, teamData);
            this.setOutputData(1, (result as any).team);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('CreateTeamNode error:', error); this.setOutputData(2, false); }
    }
}

export class ListTeamsNode extends BaseListTeamsNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const swarmId = this.getInputData(1) as string;
            const result = await codebolt.swarm.listTeams(swarmId);
            this.setOutputData(1, (result as any).teams);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('ListTeamsNode error:', error); this.setOutputData(2, false); }
    }
}

export class CreateRoleNode extends BaseCreateRoleNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const swarmId = this.getInputData(1) as string;
            const roleData = this.getInputData(2) as any;
            const result = await codebolt.swarm.createRole(swarmId, roleData);
            this.setOutputData(1, (result as any).role);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('CreateRoleNode error:', error); this.setOutputData(2, false); }
    }
}

export class AssignRoleNode extends BaseAssignRoleNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const swarmId = this.getInputData(1) as string;
            const roleId = this.getInputData(2) as string;
            const agentId = this.getInputData(3) as string;
            await codebolt.swarm.assignRole(swarmId, roleId, agentId);
            this.setOutputData(1, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('AssignRoleNode error:', error); this.setOutputData(1, false); }
    }
}

export class UpdateAgentStatusNode extends BaseUpdateAgentStatusNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const swarmId = this.getInputData(1) as string;
            const agentId = this.getInputData(2) as string;
            const statusData = this.getInputData(3) as any;
            await codebolt.swarm.updateAgentStatus(swarmId, agentId, statusData);
            this.setOutputData(1, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('UpdateAgentStatusNode error:', error); this.setOutputData(1, false); }
    }
}

export class GetSwarmStatusSummaryNode extends BaseGetSwarmStatusSummaryNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const swarmId = this.getInputData(1) as string;
            const result = await codebolt.swarm.getSwarmStatusSummary(swarmId);
            this.setOutputData(1, (result as any).summary || result);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('GetSwarmStatusSummaryNode error:', error); this.setOutputData(2, false); }
    }
}

export class GetDefaultJobGroupNode extends BaseGetDefaultJobGroupNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const swarmId = this.getInputData(1) as string;
            const result = await codebolt.swarm.getDefaultJobGroup(swarmId);
            this.setOutputData(1, (result as any).jobGroupId);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('GetDefaultJobGroupNode error:', error); this.setOutputData(2, false); }
    }
}

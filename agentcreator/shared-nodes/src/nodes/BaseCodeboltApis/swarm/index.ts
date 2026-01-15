import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Swarm Management
export class BaseCreateSwarmNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/swarm/createSwarm", title: "Create Swarm", category: "codebolt/swarm", description: "Create a new swarm", icon: "🐝", color: "#FF9800" };
    constructor() {
        super(BaseCreateSwarmNode.metadata.title, BaseCreateSwarmNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("name", "string");
        this.addInput("description", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("swarm", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseListSwarmsNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/swarm/listSwarms", title: "List Swarms", category: "codebolt/swarm", description: "List all swarms", icon: "📋", color: "#FF9800" };
    constructor() {
        super(BaseListSwarmsNode.metadata.title, BaseListSwarmsNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("swarms", "array");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseGetSwarmNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/swarm/getSwarm", title: "Get Swarm", category: "codebolt/swarm", description: "Get swarm details", icon: "🔍", color: "#FF9800" };
    constructor() {
        super(BaseGetSwarmNode.metadata.title, BaseGetSwarmNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("swarmId", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("swarm", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// Agent Registration
export class BaseRegisterSwarmAgentNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/swarm/registerAgent", title: "Register Agent", category: "codebolt/swarm", description: "Register agent to swarm", icon: "➕", color: "#FF9800" };
    constructor() {
        super(BaseRegisterSwarmAgentNode.metadata.title, BaseRegisterSwarmAgentNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("swarmId", "string");
        this.addInput("agentData", "object");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("agentId", "string");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseUnregisterAgentNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/swarm/unregisterAgent", title: "Unregister Agent", category: "codebolt/swarm", description: "Unregister agent from swarm", icon: "➖", color: "#FF9800" };
    constructor() {
        super(BaseUnregisterAgentNode.metadata.title, BaseUnregisterAgentNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("swarmId", "string");
        this.addInput("agentId", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// Team Management
export class BaseCreateTeamNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/swarm/createTeam", title: "Create Team", category: "codebolt/swarm", description: "Create a team in swarm", icon: "👥", color: "#FF9800" };
    constructor() {
        super(BaseCreateTeamNode.metadata.title, BaseCreateTeamNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("swarmId", "string");
        this.addInput("teamData", "object");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("team", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseListTeamsNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/swarm/listTeams", title: "List Teams", category: "codebolt/swarm", description: "List teams in swarm", icon: "📋", color: "#FF9800" };
    constructor() {
        super(BaseListTeamsNode.metadata.title, BaseListTeamsNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("swarmId", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("teams", "array");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// Role Management
export class BaseCreateRoleNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/swarm/createRole", title: "Create Role", category: "codebolt/swarm", description: "Create a role in swarm", icon: "🎭", color: "#FF9800" };
    constructor() {
        super(BaseCreateRoleNode.metadata.title, BaseCreateRoleNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("swarmId", "string");
        this.addInput("roleData", "object");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("role", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseAssignRoleNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/swarm/assignRole", title: "Assign Role", category: "codebolt/swarm", description: "Assign role to agent", icon: "🏷️", color: "#FF9800" };
    constructor() {
        super(BaseAssignRoleNode.metadata.title, BaseAssignRoleNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("swarmId", "string");
        this.addInput("roleId", "string");
        this.addInput("agentId", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// Status Management
export class BaseUpdateAgentStatusNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/swarm/updateAgentStatus", title: "Update Agent Status", category: "codebolt/swarm", description: "Update agent status in swarm", icon: "📊", color: "#FF9800" };
    constructor() {
        super(BaseUpdateAgentStatusNode.metadata.title, BaseUpdateAgentStatusNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("swarmId", "string");
        this.addInput("agentId", "string");
        this.addInput("statusData", "object");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseGetSwarmStatusSummaryNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/swarm/getSwarmStatusSummary", title: "Get Swarm Status", category: "codebolt/swarm", description: "Get swarm status summary", icon: "📈", color: "#FF9800" };
    constructor() {
        super(BaseGetSwarmStatusSummaryNode.metadata.title, BaseGetSwarmStatusSummaryNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("swarmId", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("summary", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseGetDefaultJobGroupNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/swarm/getDefaultJobGroup", title: "Get Default Job Group", category: "codebolt/swarm", description: "Get default job group for swarm", icon: "📁", color: "#FF9800" };
    constructor() {
        super(BaseGetDefaultJobGroupNode.metadata.title, BaseGetDefaultJobGroupNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("swarmId", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("jobGroupId", "string");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

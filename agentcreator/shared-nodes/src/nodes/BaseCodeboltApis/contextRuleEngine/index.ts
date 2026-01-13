import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Rule Engine Evaluate Node
export class BaseRuleEngineEvaluateNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/contextRuleEngine/evaluate",
        title: "Evaluate Rules",
        category: "codebolt/contextRuleEngine",
        description: "Evaluate context rules against variables",
        icon: "⚙️",
        color: "#607D8B"
    };
    constructor() {
        super(BaseRuleEngineEvaluateNode.metadata.title, BaseRuleEngineEvaluateNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("params", "object");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("evaluation", "object");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// Rule Engine List Node
export class BaseRuleEngineListNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/contextRuleEngine/list",
        title: "List Rule Engines",
        category: "codebolt/contextRuleEngine",
        description: "List all context rule engines",
        icon: "📋",
        color: "#607D8B"
    };
    constructor() {
        super(BaseRuleEngineListNode.metadata.title, BaseRuleEngineListNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("ruleEngines", "array");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

// Rule Engine Get Variables Node
export class BaseRuleEngineGetVariablesNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/contextRuleEngine/getVariables",
        title: "Get Rule Variables",
        category: "codebolt/contextRuleEngine",
        description: "Get all possible variables for rule configuration",
        icon: "📊",
        color: "#607D8B"
    };
    constructor() {
        super(BaseRuleEngineGetVariablesNode.metadata.title, BaseRuleEngineGetVariablesNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("variables", "array");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

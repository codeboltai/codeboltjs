import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base ResolveBlocker Node
export class BaseResolveBlockerNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/job/resolveblocker",
        title: "Resolve Blocker",
        category: "codebolt/job",
        description: "Resolves a blocker on a job using codebolt.job.resolveBlocker",
        icon: "✔️",
        color: "#4CAF50"
    };

    constructor() {
        super(BaseResolveBlockerNode.metadata.title, BaseResolveBlockerNode.metadata.type);
        this.title = BaseResolveBlockerNode.metadata.title;
        this.size = [220, 140];

        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("jobId", "string");
        this.addInput("blockerId", "string");
        this.addInput("resolvedBy", "string");

        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("job", "object");
        this.addOutput("success", "boolean");
    }

    mode = LiteGraph.ON_TRIGGER;
}

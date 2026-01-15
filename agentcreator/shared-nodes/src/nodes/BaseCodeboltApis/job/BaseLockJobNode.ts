import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base LockJob Node
export class BaseLockJobNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/job/lockjob",
        title: "Lock Job",
        category: "codebolt/job",
        description: "Acquires a lock on a job using codebolt.job.lockJob",
        icon: "🔒",
        color: "#FF5722"
    };

    constructor() {
        super(BaseLockJobNode.metadata.title, BaseLockJobNode.metadata.type);
        this.title = BaseLockJobNode.metadata.title;
        this.size = [220, 140];

        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("jobId", "string");
        this.addInput("agentId", "string");
        this.addInput("agentName", "string");

        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("job", "object");
        this.addOutput("success", "boolean");
    }

    mode = LiteGraph.ON_TRIGGER;
}

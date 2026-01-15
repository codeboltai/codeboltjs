import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base UnlockJob Node
export class BaseUnlockJobNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/job/unlockjob",
        title: "Unlock Job",
        category: "codebolt/job",
        description: "Releases a lock on a job using codebolt.job.unlockJob",
        icon: "🔓",
        color: "#4CAF50"
    };

    constructor() {
        super(BaseUnlockJobNode.metadata.title, BaseUnlockJobNode.metadata.type);
        this.title = BaseUnlockJobNode.metadata.title;
        this.size = [200, 120];

        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("jobId", "string");
        this.addInput("agentId", "string");

        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("job", "object");
        this.addOutput("success", "boolean");
    }

    mode = LiteGraph.ON_TRIGGER;
}

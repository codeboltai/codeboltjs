import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base CheckJobLock Node
export class BaseCheckJobLockNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/job/checkjoblock",
        title: "Check Job Lock",
        category: "codebolt/job",
        description: "Checks if a job is locked using codebolt.job.isJobLocked",
        icon: "❓",
        color: "#607D8B"
    };

    constructor() {
        super(BaseCheckJobLockNode.metadata.title, BaseCheckJobLockNode.metadata.type);
        this.title = BaseCheckJobLockNode.metadata.title;
        this.size = [200, 100];

        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("jobId", "string");

        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("isLocked", "boolean");
        this.addOutput("lock", "object");
    }

    mode = LiteGraph.ON_TRIGGER;
}

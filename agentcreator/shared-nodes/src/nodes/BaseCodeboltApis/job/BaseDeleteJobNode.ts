import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base DeleteJob Node - Calls codebolt.job.deleteJob
export class BaseDeleteJobNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/job/deletejob",
        title: "Delete Job",
        category: "codebolt/job",
        description: "Deletes a job using codebolt.job.deleteJob",
        icon: "🗑️",
        color: "#F44336"
    };

    constructor() {
        super(BaseDeleteJobNode.metadata.title, BaseDeleteJobNode.metadata.type);
        this.title = BaseDeleteJobNode.metadata.title;
        this.size = [200, 100];

        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("jobId", "string");

        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("deleted", "boolean");
    }

    mode = LiteGraph.ON_TRIGGER;
}

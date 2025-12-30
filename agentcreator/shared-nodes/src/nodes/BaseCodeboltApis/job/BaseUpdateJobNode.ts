import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base UpdateJob Node - Calls codebolt.job.updateJob
export class BaseUpdateJobNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/job/updatejob",
        title: "Update Job",
        category: "codebolt/job",
        description: "Updates a job using codebolt.job.updateJob",
        icon: "✏️",
        color: "#FF9800"
    };

    constructor() {
        super(BaseUpdateJobNode.metadata.title, BaseUpdateJobNode.metadata.type);
        this.title = BaseUpdateJobNode.metadata.title;
        this.size = [220, 160];

        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("jobId", "string");
        this.addInput("data", "object");
        this.addInput("status", "string");
        this.addInput("priority", "number");

        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("job", "object");
        this.addOutput("success", "boolean");
    }

    mode = LiteGraph.ON_TRIGGER;
}

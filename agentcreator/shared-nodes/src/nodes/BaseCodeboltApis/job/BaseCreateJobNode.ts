import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base CreateJob Node - Calls codebolt.job.createJob
export class BaseCreateJobNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/job/createjob",
        title: "Create Job",
        category: "codebolt/job",
        description: "Creates a new job using codebolt.job.createJob",
        icon: "📋",
        color: "#9C27B0"
    };

    constructor() {
        super(BaseCreateJobNode.metadata.title, BaseCreateJobNode.metadata.type);
        this.title = BaseCreateJobNode.metadata.title;
        this.size = [240, 180];

        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("groupId", "string");
        this.addInput("name", "string");
        this.addInput("type", "string");
        this.addInput("priority", "number");
        this.addInput("description", "string");

        this.addOutput("jobCreated", LiteGraph.EVENT);
        this.addOutput("job", "object");
        this.addOutput("success", "boolean");
    }

    mode = LiteGraph.ON_TRIGGER;
}

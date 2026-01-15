import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetJob Node - Calls codebolt.job.getJob
export class BaseGetJobNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/job/getjob",
        title: "Get Job",
        category: "codebolt/job",
        description: "Gets job details using codebolt.job.getJob",
        icon: "🔍",
        color: "#2196F3"
    };

    constructor() {
        super(BaseGetJobNode.metadata.title, BaseGetJobNode.metadata.type);
        this.title = BaseGetJobNode.metadata.title;
        this.size = [200, 100];

        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("jobId", "string");

        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("job", "object");
        this.addOutput("success", "boolean");
    }

    mode = LiteGraph.ON_TRIGGER;
}

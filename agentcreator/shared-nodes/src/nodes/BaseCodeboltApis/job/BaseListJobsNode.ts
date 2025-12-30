import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base ListJobs Node - Calls codebolt.job.listJobs
export class BaseListJobsNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/job/listjobs",
        title: "List Jobs",
        category: "codebolt/job",
        description: "Lists jobs with optional filters using codebolt.job.listJobs",
        icon: "📜",
        color: "#4CAF50"
    };

    constructor() {
        super(BaseListJobsNode.metadata.title, BaseListJobsNode.metadata.type);
        this.title = BaseListJobsNode.metadata.title;
        this.size = [220, 140];

        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("filters", "object");
        this.addInput("groupId", "string");
        this.addInput("status", "string");

        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("jobs", "array");
        this.addOutput("totalCount", "number");
    }

    mode = LiteGraph.ON_TRIGGER;
}

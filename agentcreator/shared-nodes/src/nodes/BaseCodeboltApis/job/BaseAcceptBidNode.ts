import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base AcceptBid Node
export class BaseAcceptBidNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/job/acceptbid",
        title: "Accept Bid",
        category: "codebolt/job",
        description: "Accepts a bid on a job using codebolt.job.acceptBid",
        icon: "✅",
        color: "#4CAF50"
    };

    constructor() {
        super(BaseAcceptBidNode.metadata.title, BaseAcceptBidNode.metadata.type);
        this.title = BaseAcceptBidNode.metadata.title;
        this.size = [200, 120];

        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("jobId", "string");
        this.addInput("bidId", "string");

        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("job", "object");
        this.addOutput("success", "boolean");
    }

    mode = LiteGraph.ON_TRIGGER;
}

import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base ListBids Node
export class BaseListBidsNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/job/listbids",
        title: "List Bids",
        category: "codebolt/job",
        description: "Lists all bids on a job using codebolt.job.listBids",
        icon: "📊",
        color: "#E91E63"
    };

    constructor() {
        super(BaseListBidsNode.metadata.title, BaseListBidsNode.metadata.type);
        this.title = BaseListBidsNode.metadata.title;
        this.size = [200, 100];

        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("jobId", "string");

        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("bids", "array");
    }

    mode = LiteGraph.ON_TRIGGER;
}

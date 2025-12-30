import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base DepositPheromone Node
export class BaseDepositPheromoneNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/job/depositpheromone",
        title: "Deposit Pheromone",
        category: "codebolt/job",
        description: "Deposits a pheromone on a job using codebolt.job.depositPheromone",
        icon: "🧪",
        color: "#8BC34A"
    };

    constructor() {
        super(BaseDepositPheromoneNode.metadata.title, BaseDepositPheromoneNode.metadata.type);
        this.title = BaseDepositPheromoneNode.metadata.title;
        this.size = [240, 160];

        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("jobId", "string");
        this.addInput("type", "string");
        this.addInput("intensity", "number");
        this.addInput("depositedBy", "string");

        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("job", "object");
        this.addOutput("success", "boolean");
    }

    mode = LiteGraph.ON_TRIGGER;
}

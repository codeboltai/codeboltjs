import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetPheromones Node
export class BaseGetPheromonesNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/job/getpheromones",
        title: "Get Pheromones",
        category: "codebolt/job",
        description: "Gets pheromones on a job using codebolt.job.getPheromones",
        icon: "🔬",
        color: "#8BC34A"
    };

    constructor() {
        super(BaseGetPheromonesNode.metadata.title, BaseGetPheromonesNode.metadata.type);
        this.title = BaseGetPheromonesNode.metadata.title;
        this.size = [200, 100];

        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("jobId", "string");

        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("pheromones", "array");
    }

    mode = LiteGraph.ON_TRIGGER;
}

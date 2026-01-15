import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base SearchJobsByPheromone Node
export class BaseSearchJobsByPheromoneNode extends LGraphNode {
    static metadata: NodeMetadata = {
        type: "codebolt/job/searchjobsbypheromone",
        title: "Search Jobs By Pheromone",
        category: "codebolt/job",
        description: "Searches jobs by pheromone type using codebolt.job.listJobsByPheromone",
        icon: "🔎",
        color: "#8BC34A"
    };

    constructor() {
        super(BaseSearchJobsByPheromoneNode.metadata.title, BaseSearchJobsByPheromoneNode.metadata.type);
        this.title = BaseSearchJobsByPheromoneNode.metadata.title;
        this.size = [260, 120];

        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("type", "string");
        this.addInput("minIntensity", "number");

        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("jobs", "array");
        this.addOutput("totalCount", "number");
    }

    mode = LiteGraph.ON_TRIGGER;
}

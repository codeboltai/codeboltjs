import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

export class BaseAddEpisodeNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/episodicMemory/addEpisode", title: "Add Episode", category: "codebolt/episodicMemory", description: "Add an episode to memory", icon: "🧠", color: "#9C27B0" };
    constructor() {
        super(BaseAddEpisodeNode.metadata.title, BaseAddEpisodeNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("episode", "object");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("episodeId", "string");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

export class BaseSearchEpisodesNode extends LGraphNode {
    static metadata: NodeMetadata = { type: "codebolt/episodicMemory/searchEpisodes", title: "Search Episodes", category: "codebolt/episodicMemory", description: "Search episodic memory", icon: "🔍", color: "#9C27B0" };
    constructor() {
        super(BaseSearchEpisodesNode.metadata.title, BaseSearchEpisodesNode.metadata.type);
        this.addInput("onTrigger", LiteGraph.ACTION);
        this.addInput("query", "string");
        this.addOutput("onComplete", LiteGraph.EVENT);
        this.addOutput("episodes", "array");
        this.addOutput("success", "boolean");
    }
    mode = LiteGraph.ON_TRIGGER;
}

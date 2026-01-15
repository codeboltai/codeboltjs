import { BaseAddEpisodeNode, BaseSearchEpisodesNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class AddEpisodeNode extends BaseAddEpisodeNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const episode = this.getInputData(1) as any;
            const result = await (codebolt as any).episodicMemory?.addEpisode?.(episode);
            this.setOutputData(1, (result as any)?.episodeId);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('AddEpisodeNode error:', error); this.setOutputData(2, false); }
    }
}

export class SearchEpisodesNode extends BaseSearchEpisodesNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const query = this.getInputData(1) as string;
            const result = await (codebolt as any).episodicMemory?.searchEpisodes?.(query);
            this.setOutputData(1, (result as any)?.episodes || []);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('SearchEpisodesNode error:', error); this.setOutputData(2, false); }
    }
}

import { BaseCreateEventNode, BaseListEventsNode, BaseGetUpcomingEventsNode, BaseMarkEventCompleteNode, BaseDeleteEventNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class CreateEventNode extends BaseCreateEventNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const title = this.getInputData(1) as string;
            const startTime = this.getInputData(2) as string;
            const eventType = this.getInputData(3) as string;
            const result = await codebolt.calendar.createEvent({ title, startTime, eventType } as any);
            this.setOutputData(1, (result as any).data?.event || result);
            this.setOutputData(2, (result as any).success ?? true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('CreateEventNode error:', error); this.setOutputData(2, false); }
    }
}

export class ListEventsNode extends BaseListEventsNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const result = await codebolt.calendar.listEvents({});
            this.setOutputData(1, (result as any).data?.events || result);
            this.setOutputData(2, (result as any).success ?? true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('ListEventsNode error:', error); this.setOutputData(2, false); }
    }
}

export class GetUpcomingEventsNode extends BaseGetUpcomingEventsNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const withinMinutes = this.getInputData(1) as number || 60;
            const result = await codebolt.calendar.getUpcomingEvents({ withinMinutes });
            this.setOutputData(1, (result as any).data?.events || result);
            this.setOutputData(2, (result as any).success ?? true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('GetUpcomingEventsNode error:', error); this.setOutputData(2, false); }
    }
}

export class MarkEventCompleteNode extends BaseMarkEventCompleteNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const eventId = this.getInputData(1) as string;
            const result = await codebolt.calendar.markEventComplete({ eventId });
            this.setOutputData(1, (result as any).success ?? true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('MarkEventCompleteNode error:', error); this.setOutputData(1, false); }
    }
}

export class DeleteEventNode extends BaseDeleteEventNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const eventId = this.getInputData(1) as string;
            const result = await codebolt.calendar.deleteEvent({ eventId });
            this.setOutputData(1, (result as any).success ?? true);
            this.triggerSlot(0, null, null);
        } catch (error) { console.error('DeleteEventNode error:', error); this.setOutputData(1, false); }
    }
}

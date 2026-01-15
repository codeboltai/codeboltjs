import { BaseCreateThreadNode, BaseGetThreadListNode, BaseGetThreadDetailNode, BaseStartThreadNode, BaseUpdateThreadNode, BaseDeleteThreadNode, BaseGetThreadMessagesNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class CreateThreadNode extends BaseCreateThreadNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const title = this.getInputData(1) as string;
            const agentId = this.getInputData(2) as string;
            const result = await codebolt.thread.createThread({ title, agentId } as any);
            this.setOutputData(1, (result as any).thread);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('CreateThreadNode error:', error);
            this.setOutputData(2, false);
        }
    }
}

export class GetThreadListNode extends BaseGetThreadListNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const result = await codebolt.thread.getThreadList({});
            this.setOutputData(1, (result as any).threads);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('GetThreadListNode error:', error);
            this.setOutputData(2, false);
        }
    }
}

export class GetThreadDetailNode extends BaseGetThreadDetailNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const taskId = this.getInputData(1) as string;
            const result = await codebolt.thread.getThreadDetail({ taskId });
            this.setOutputData(1, (result as any).thread);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('GetThreadDetailNode error:', error);
            this.setOutputData(2, false);
        }
    }
}

export class StartThreadNode extends BaseStartThreadNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const threadId = this.getInputData(1) as string;
            const result = await codebolt.thread.startThread(threadId);
            this.setOutputData(1, true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('StartThreadNode error:', error);
            this.setOutputData(1, false);
        }
    }
}

export class UpdateThreadNode extends BaseUpdateThreadNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const threadId = this.getInputData(1) as string;
            const updates = this.getInputData(2) as object;
            const result = await codebolt.thread.updateThread(threadId, updates as any);
            this.setOutputData(1, (result as any).thread);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('UpdateThreadNode error:', error);
            this.setOutputData(2, false);
        }
    }
}

export class DeleteThreadNode extends BaseDeleteThreadNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const threadId = this.getInputData(1) as string;
            const result = await codebolt.thread.deleteThread(threadId);
            this.setOutputData(1, true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('DeleteThreadNode error:', error);
            this.setOutputData(1, false);
        }
    }
}

export class GetThreadMessagesNode extends BaseGetThreadMessagesNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const taskId = this.getInputData(1) as string;
            const result = await codebolt.thread.getThreadMessages({ taskId });
            this.setOutputData(1, (result as any).messages);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('GetThreadMessagesNode error:', error);
            this.setOutputData(2, false);
        }
    }
}

import codebolt from '@codebolt/codeboltjs';
import { AgentContext } from './types';

function getSwarmThreadSubject(swarmName: string): string {
    return `Swarm: ${swarmName}`;
}

function getTeamThreadSubject(teamName: string): string {
    return `Team: ${teamName}`;
}

function formatSwarmGreeting(agentName: string): string {
    return `${agentName} has joined the swarm!`;
}

function formatTeamCreatedMessage(teamName: string, agentName: string): string {
    return `Team "${teamName}" has been created by ${agentName}`;
}

function formatTeamJoinMessage(_agentName: string): string {
    return `hi`;
}

export async function sendMessageToThread(
    ctx: AgentContext,
    threadId: string,
    subject: string,
    message: string
): Promise<boolean> {
    try {
        const payload = {
            threadId,
            senderId: ctx.agentId,
            senderName: ctx.agentName,
            recipients: [],
            body: message,
            subject,
        };
        codebolt.chat.sendMessage(`Sending message: ${JSON.stringify(payload)}`, {});
        const result = await codebolt.mail.sendMessage(payload);
        codebolt.chat.sendMessage(`sendMessage result: ${JSON.stringify(result)}`, {});
        return result.success === true;
    } catch (error) {
        codebolt.chat.sendMessage(`Send message error: ${error}`, {});
        return false;
    }
}

export async function findOrCreateSwarmThread(ctx: AgentContext): Promise<string | null> {
    const subject = getSwarmThreadSubject(ctx.swarmName);

    try {
        const mail = codebolt.mail as any;
        codebolt.chat.sendMessage(`Finding or creating swarm thread: ${subject}`, {});

        const result: any = await mail.findOrCreateThread({
            subject,
            participants: [ctx.agentId],
            type: 'broadcast',
            metadata: {
                type: 'swarm',
                swarmId: ctx.swarmId,
                swarmName: ctx.swarmName,
            },
        });

        codebolt.chat.sendMessage(`findOrCreateThread response: ${JSON.stringify(result)}`, {});

        const thread = result.payload?.thread || result.thread;
        const created = result.payload?.created ?? result.created;
        const success = result.payload?.success ?? result.success;

        if (success && thread?.id) {
            const threadId = thread.id;
            if (created) {
                codebolt.chat.sendMessage(`Created new swarm thread: ${subject}`, {});
            } else {
                codebolt.chat.sendMessage(`Found existing swarm thread: ${subject}`, {});
            }
            await sendMessageToThread(ctx, threadId, subject, formatSwarmGreeting(ctx.agentName));
            return threadId;
        }

        codebolt.chat.sendMessage(`Failed to find/create thread. Success: ${success}, Thread: ${JSON.stringify(thread)}`, {});
        return null;
    } catch (error) {
        codebolt.chat.sendMessage(`Swarm thread error: ${error}`, {});
        return null;
    }
}

export async function createTeamMailThread(
    ctx: AgentContext,
    teamId: string,
    teamName: string
): Promise<string | null> {
    const subject = getTeamThreadSubject(teamName);

    try {
        const mail = codebolt.mail as any;
        codebolt.chat.sendMessage(`Finding or creating team thread: ${subject}`, {});

        const result = await mail.findOrCreateThread({
            subject,
            participants: [ctx.agentId],
            type: 'agent-to-agent',
            metadata: {
                type: 'team',
                swarmId: ctx.swarmId,
                swarmName: ctx.swarmName,
                teamId,
                teamName,
            },
        });

        codebolt.chat.sendMessage(`findOrCreateThread response: ${JSON.stringify(result)}`, {});

        const thread = result.payload?.thread || result.thread;
        const success = result.payload?.success ?? result.success;

        if (success && thread?.id) {
            const threadId = thread.id;
            codebolt.chat.sendMessage(`Created team thread: ${teamName}`, {});
            await sendMessageToThread(
                ctx,
                threadId,
                subject,
                formatTeamCreatedMessage(teamName, ctx.agentName)
            );
            return threadId;
        }

        return null;
    } catch (error) {
        codebolt.chat.sendMessage(`Team thread creation error: ${error}`, {});
        return null;
    }
}

export async function joinTeamMailThread(
    ctx: AgentContext,
    teamName: string,
    teamId?: string
): Promise<string | null> {
    const subject = getTeamThreadSubject(teamName);

    try {
        const mail = codebolt.mail as any;
        codebolt.chat.sendMessage(`Joining team thread: ${subject}`, {});

        const result = await mail.findOrCreateThread({
            subject,
            participants: [ctx.agentId],
            type: 'agent-to-agent',
            metadata: {
                type: 'team',
                swarmId: ctx.swarmId,
                swarmName: ctx.swarmName,
                teamId,
                teamName,
            },
        });

        const thread = result.payload?.thread || result.thread;
        const created = result.payload?.created ?? result.created;
        const success = result.payload?.success ?? result.success;

        if (success && thread?.id) {
            const threadId = thread.id;
            if (created) {
                codebolt.chat.sendMessage(`Team thread not found, created: ${subject}`, {});
            } else {
                codebolt.chat.sendMessage(`Joined team thread: ${subject}`, {});
            }
            await sendMessageToThread(ctx, threadId, subject, formatTeamJoinMessage(ctx.agentName));
            return threadId;
        }

        return null;
    } catch (error) {
        codebolt.chat.sendMessage(`Join team thread error: ${error}`, {});
        return null;
    }
}

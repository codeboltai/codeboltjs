import codebolt from '@codebolt/codeboltjs';
import { AgentContext } from './types';

// ================================
// MAIL THREAD HELPER FUNCTIONS
// ================================

/**
 * Get the thread subject for a swarm-level thread
 */
export function getSwarmThreadSubject(swarmName: string): string {
    return `Swarm: ${swarmName}`;
}

/**
 * Get the thread subject for a team-level thread
 */
export function getTeamThreadSubject(teamName: string): string {
    return `Team: ${teamName}`;
}

/**
 * Format greeting message for swarm thread
 */
export function formatSwarmGreeting(agentName: string): string {
    return `👋 ${agentName} has joined the swarm!`;
}

/**
 * Format team creation announcement message
 */
export function formatTeamCreatedMessage(teamName: string, agentName: string): string {
    return `🎉 Team "${teamName}" has been created by ${agentName}`;
}

/**
 * Format team join announcement message
 */
export function formatTeamJoinMessage(agentName: string): string {
    return `👋 ${agentName} has joined the team!`;
}

// ================================
// MAIL THREAD OPERATIONS
// ================================

/**
 * Find or create a swarm-level mail thread and send greeting
 */
export async function findOrCreateSwarmThread(ctx: AgentContext): Promise<string | null> {
    const subject = getSwarmThreadSubject(ctx.swarmName);

    try {
        const mail = codebolt.mail as any;

        codebolt.chat.sendMessage(`📧 Finding or creating swarm thread: ${subject}`, {});

        // Use atomic findOrCreateThread to prevent race conditions
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

        codebolt.chat.sendMessage(`📧 findOrCreateThread response: ${JSON.stringify(result)}`, {});

        // Handle both direct response and payload-wrapped response
        const thread = result.payload?.thread || result.thread;
        const created = result.payload?.created ?? result.created;
        const success = result.payload?.success ?? result.success;

        if (success && thread?.id) {
            const threadId = thread.id;
            if (created) {
                codebolt.chat.sendMessage(`✅ Created new swarm thread: ${subject}`, {});
            } else {
                codebolt.chat.sendMessage(`📧 Found existing swarm thread: ${subject}`, {});
            }

            // Send greeting message
            await sendMessageToThread(ctx, threadId, subject, formatSwarmGreeting(ctx.agentName));

            return threadId;
        }

        codebolt.chat.sendMessage(`❌ Failed to find/create thread. Success: ${success}, Thread: ${JSON.stringify(thread)}`, {});
        return null;
    } catch (error) {
        codebolt.chat.sendMessage(`⚠️ Swarm thread error: ${error}`, {});
        return null;
    }
}

/**
 * Create a mail thread for a newly created team
 */
export async function createTeamMailThread(
    ctx: AgentContext,
    teamId: string,
    teamName: string
): Promise<string | null> {
    const subject = getTeamThreadSubject(teamName);

    try {
        const mail = codebolt.mail as any;

        codebolt.chat.sendMessage(`📧 Finding or creating team thread: ${subject}`, {});

        // Use atomic findOrCreateThread to prevent race conditions
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
        codebolt.chat.sendMessage(`📧 findOrCreateThread response: ${JSON.stringify(result)}`, {});

        // Handle both direct response and payload-wrapped response
        const thread = result.payload?.thread || result.thread;
        const created = result.payload?.created ?? result.created;
        const success = result.payload?.success ?? result.success;

        if (success && thread?.id) {
            const threadId = thread.id;
            if (threadId) {
                codebolt.chat.sendMessage(`✅ Created team thread: ${teamName}`, {});
                // Send team creation announcement only if we created it
                await sendMessageToThread(
                    ctx,
                    threadId,
                    subject,
                    formatTeamCreatedMessage(teamName, ctx.agentName)
                );
            } else {
                codebolt.chat.sendMessage(`📧 Team thread already exists: ${subject}`, {});
            }

            return threadId;
        }

        return null;
    } catch (error) {
        codebolt.chat.sendMessage(`⚠️ Team thread creation error: ${error}`, {});
        return null;
    }
}

/**
 * Join an existing team mail thread (or create if not found)
 */
export async function joinTeamMailThread(
    ctx: AgentContext,
    teamName: string,
    teamId?: string
): Promise<string | null> {
    const subject = getTeamThreadSubject(teamName);

    try {
        const mail = codebolt.mail as any;

        codebolt.chat.sendMessage(`📧 Joining team thread: ${subject}`, {});

        // Use atomic findOrCreateThread - if thread exists, we join it; if not, we create it
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

        // Handle both direct response and payload-wrapped response
        const thread = result.payload?.thread || result.thread;
        const created = result.payload?.created ?? result.created;
        const success = result.payload?.success ?? result.success;

        if (success && thread?.id) {
            const threadId = thread.id;
            if (created) {
                codebolt.chat.sendMessage(`⚠️ Team thread not found, created: ${subject}`, {});
            } else {
                codebolt.chat.sendMessage(`📧 Joined team thread: ${subject}`, {});
            }

            // Send join message
            await sendMessageToThread(ctx, threadId, subject, formatTeamJoinMessage(ctx.agentName));

            return threadId;
        }

        return null;
    } catch (error) {
        codebolt.chat.sendMessage(`⚠️ Join team thread error: ${error}`, {});
        return null;
    }
}

/**
 * Send a message to a mail thread
 */
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
        codebolt.chat.sendMessage(`📨 Sending message: ${JSON.stringify(payload)}`, {});

        const result = await codebolt.mail.sendMessage(payload);

        codebolt.chat.sendMessage(`📨 sendMessage result: ${JSON.stringify(result)}`, {});

        return result.success === true;
    } catch (error) {
        codebolt.chat.sendMessage(`⚠️ Send message error: ${error}`, {});
        return false;
    }
}

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
        // Search for existing swarm thread using mail.listThreads
        const mail = codebolt.mail as any;
        const listResult = await mail.listThreads({ search: subject });
        const existingThread = listResult.threads?.find(
            (t: any) => t.subject === subject
        );

        let threadId: string | null = null;

        if (existingThread) {
            codebolt.chat.sendMessage(`📧 Found existing swarm thread: ${subject}`, {});
            threadId = existingThread.id;
        } else {
            // Create new swarm thread
            codebolt.chat.sendMessage(`📧 Creating swarm thread: ${subject}`, {});
            const createResult = await mail.createThread({
                subject,
                participants: [ctx.agentId],
                type: 'broadcast',
                metadata: {
                    type: 'swarm',
                    swarmId: ctx.swarmId,
                    swarmName: ctx.swarmName,
                },
            });

            if (createResult.success && createResult.thread?.id) {
                threadId = createResult.thread.id;
                codebolt.chat.sendMessage(`✅ Created swarm thread`, {});
            }
        }

        // Send greeting message
        if (threadId) {
            await sendMessageToThread(ctx, threadId, formatSwarmGreeting(ctx.agentName));
        }

        return threadId;
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
        
        // Check if team thread already exists
        const listResult = await mail.listThreads({ search: subject });
        const existingThread = listResult.threads?.find(
            (t: any) => t.subject === subject
        );

        if (existingThread) {
            codebolt.chat.sendMessage(`📧 Team thread already exists: ${subject}`, {});
            return existingThread.id;
        }

        // Create new team thread
        codebolt.chat.sendMessage(`📧 Creating team thread: ${subject}`, {});
        const createResult = await mail.createThread({
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

        if (createResult.success && createResult.thread?.id) {
            const threadId = createResult.thread.id;
            codebolt.chat.sendMessage(`✅ Created team thread: ${teamName}`, {});

            // Send team creation announcement
            await sendMessageToThread(
                ctx,
                threadId,
                formatTeamCreatedMessage(teamName, ctx.agentName)
            );

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
        
        // Search for existing team thread
        const listResult = await mail.listThreads({ search: subject });
        const teamThread = listResult.threads?.find(
            (t: any) => t.subject === subject
        );

        if (teamThread) {
            codebolt.chat.sendMessage(`📧 Joining team thread: ${subject}`, {});

            // Send join message
            await sendMessageToThread(
                ctx,
                teamThread.id,
                formatTeamJoinMessage(ctx.agentName)
            );

            return teamThread.id;
        }

        // Thread not found - create it as fallback
        codebolt.chat.sendMessage(`⚠️ Team thread not found, creating: ${subject}`, {});
        if (teamId) {
            return await createTeamMailThread(ctx, teamId, teamName);
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
    message: string
): Promise<boolean> {
    try {
        const result = await codebolt.mail.sendMessage({
            threadId,
            senderId: ctx.agentId,
            senderName: ctx.agentName,
            recipients: [],
            body: message,
        });

        return result.success === true;
    } catch (error) {
        codebolt.chat.sendMessage(`⚠️ Send message error: ${error}`, {});
        return false;
    }
}

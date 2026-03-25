import codebolt from '@codebolt/codeboltjs';
import type { LinearAgentClient } from '../linear/client.js';
import type { AgentSession, AgentSignalType } from '../linear/types.js';

interface ParsedContext {
    issueIdentifier: string;
    issueTitle: string;
    issueDescription: string;
    teamName: string;
    projectName: string;
    labels: string[];
    comments: string[];
    mentionBody: string;
}

export class SessionHandler {
    private client: LinearAgentClient;
    private activeSessions: Map<string, AbortController> = new Map();

    constructor(client: LinearAgentClient) {
        this.client = client;
    }

    async handleNewSession(session: AgentSession): Promise<void> {
        // Guard against duplicate handling
        if (this.activeSessions.has(session.id)) {
            console.log(`[SessionHandler] Session ${session.id} already being handled, skipping`);
            return;
        }

        const issueLabel = session.issue?.identifier ?? session.issueId;
        console.log(`[SessionHandler] Handling new session ${session.id} for issue ${issueLabel}`);

        // 1. Emit initial thought immediately (Linear expects response within 10s)
        await this.client.emitActivity(session.id, {
            type: 'thought',
            content: `Received issue ${issueLabel}. Analyzing context and preparing to work on it...`,
        });

        // 2. Transition to active
        try {
            await this.client.updateSessionState(session.id, 'active');
        } catch (err) {
            console.error(`[SessionHandler] Failed to set session active:`, err);
        }

        // 3. Parse context
        const context = this.parsePromptContext(session);

        // 4. Set up abort controller
        const abort = new AbortController();
        this.activeSessions.set(session.id, abort);

        try {
            // 5. Create plan on Linear
            const planSteps = [
                { title: 'Analyze issue context', status: 'completed' },
                { title: 'Process with CodeBolt agent', status: 'inProgress' },
                { title: 'Report results', status: 'pending' },
            ];
            await this.client.upsertPlan(session.id, planSteps);

            // 6. Emit action activity
            await this.client.emitActivity(session.id, {
                type: 'action',
                content: `Invoking CodeBolt agent to work on: ${context.issueTitle}`,
            });

            if (abort.signal.aborted) return;

            // 7. Bridge to CodeBolt agent
            const agentResult = await this.invokeCodeBoltAgent(context, abort.signal);

            if (abort.signal.aborted) return;

            // 8. Update plan — mark processing complete
            await this.client.upsertPlan(session.id, [
                { title: 'Analyze issue context', status: 'completed' },
                { title: 'Process with CodeBolt agent', status: 'completed' },
                { title: 'Report results', status: 'completed' },
            ]);

            // 9. Emit final response
            await this.client.emitActivity(session.id, {
                type: 'response',
                content: agentResult,
            });

            // 10. Mark session complete
            await this.client.updateSessionState(session.id, 'complete');
            console.log(`[SessionHandler] Session ${session.id} completed`);
        } catch (err) {
            if (!abort.signal.aborted) {
                const errorMsg = err instanceof Error ? err.message : String(err);
                console.error(`[SessionHandler] Session ${session.id} failed:`, errorMsg);

                await this.client.emitActivity(session.id, {
                    type: 'error',
                    content: `Failed to process issue: ${errorMsg}`,
                }).catch(() => {});

                await this.client.updateSessionState(session.id, 'error').catch(() => {});
            }
        } finally {
            this.activeSessions.delete(session.id);
        }
    }

    handleSignal(sessionId: string, signalType: AgentSignalType): void {
        if (signalType === 'stop') {
            console.log(`[SessionHandler] Received stop signal for session ${sessionId}`);
            const abort = this.activeSessions.get(sessionId);
            if (abort) {
                abort.abort();
            }
        }
    }

    cancelAll(): void {
        for (const [sessionId, abort] of this.activeSessions) {
            console.log(`[SessionHandler] Cancelling session ${sessionId}`);
            abort.abort();
        }
        this.activeSessions.clear();
    }

    get activeSessionCount(): number {
        return this.activeSessions.size;
    }

    private parsePromptContext(session: AgentSession): ParsedContext {
        const issue = session.issue;
        const xml = session.promptContext ?? '';

        // Extract mention body from promptContext XML if available
        let mentionBody = '';
        const mentionMatch = xml.match(/<comment[^>]*primary="true"[^>]*>([\s\S]*?)<\/comment>/i);
        if (mentionMatch) {
            mentionBody = mentionMatch[1].trim();
        }

        // Extract comments
        const comments: string[] = [];
        const commentRegex = /<comment[^>]*>([\s\S]*?)<\/comment>/gi;
        let match: RegExpExecArray | null;
        while ((match = commentRegex.exec(xml)) !== null) {
            comments.push(match[1].trim());
        }

        return {
            issueIdentifier: issue?.identifier ?? '',
            issueTitle: issue?.title ?? '',
            issueDescription: issue?.description ?? '',
            teamName: issue?.team?.name ?? '',
            projectName: issue?.project?.name ?? '',
            labels: issue?.labels?.map((l) => l.name) ?? [],
            comments,
            mentionBody,
        };
    }

    private async invokeCodeBoltAgent(
        context: ParsedContext,
        signal: AbortSignal
    ): Promise<string> {
        // Build a prompt from the issue context
        const prompt = this.buildAgentPrompt(context);

        console.log(`[SessionHandler] Sending to CodeBolt agent: ${context.issueIdentifier}`);

        try {
            // Send the issue context as a chat message to the active CodeBolt agent
            const response = await (codebolt as any).chat.sendMessage(prompt);

            if (signal.aborted) {
                return 'Processing was cancelled.';
            }

            // Extract the agent's response
            if (response && typeof response === 'object' && response.message) {
                return response.message;
            }
            if (typeof response === 'string') {
                return response;
            }

            return `Processed issue ${context.issueIdentifier}: ${context.issueTitle}. The CodeBolt agent has analyzed the request.`;
        } catch (err) {
            console.error('[SessionHandler] CodeBolt agent invocation failed:', err);
            // Return a meaningful fallback
            return [
                `Analyzed issue **${context.issueIdentifier}**: ${context.issueTitle}`,
                '',
                context.issueDescription
                    ? `**Description:** ${context.issueDescription.substring(0, 500)}`
                    : '',
                context.mentionBody
                    ? `**Request:** ${context.mentionBody}`
                    : '',
                context.labels.length
                    ? `**Labels:** ${context.labels.join(', ')}`
                    : '',
                '',
                '_Note: The CodeBolt agent integration encountered an issue. Please check the plugin logs for details._',
            ]
                .filter(Boolean)
                .join('\n');
        }
    }

    private buildAgentPrompt(context: ParsedContext): string {
        const parts: string[] = [
            `You are working on Linear issue ${context.issueIdentifier}: ${context.issueTitle}`,
        ];

        if (context.teamName) {
            parts.push(`Team: ${context.teamName}`);
        }
        if (context.projectName) {
            parts.push(`Project: ${context.projectName}`);
        }
        if (context.labels.length) {
            parts.push(`Labels: ${context.labels.join(', ')}`);
        }
        if (context.issueDescription) {
            parts.push(`\nIssue Description:\n${context.issueDescription}`);
        }
        if (context.mentionBody) {
            parts.push(`\nUser Request:\n${context.mentionBody}`);
        }
        if (context.comments.length > 0) {
            parts.push(`\nRelevant Comments:\n${context.comments.join('\n---\n')}`);
        }

        parts.push(
            `\nPlease analyze this issue and provide a detailed response with any actions taken or recommendations.`
        );

        return parts.join('\n');
    }
}

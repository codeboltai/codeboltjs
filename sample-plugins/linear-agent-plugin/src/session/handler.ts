import codebolt from '@codebolt/codeboltjs';
import type { WorkerClient, SessionCreatedEvent } from '../ws/workerClient.js';
import type { AgentSignalType } from '../linear/types.js';

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
    private workerClient: WorkerClient;
    private activeSessions: Map<string, AbortController> = new Map();

    constructor(workerClient: WorkerClient) {
        this.workerClient = workerClient;
    }

    async handleNewSession(event: SessionCreatedEvent): Promise<void> {
        const { sessionId, session } = event;

        // Guard against duplicate handling
        if (this.activeSessions.has(sessionId)) {
            console.log(`[SessionHandler] Session ${sessionId} already being handled, skipping`);
            return;
        }

        const issueLabel = session.issue?.identifier ?? session.issueId ?? sessionId;
        console.log(`[SessionHandler] Handling new session ${sessionId} for issue ${issueLabel}`);

        // Set up abort controller
        const abort = new AbortController();
        this.activeSessions.set(sessionId, abort);

        try {
            // 1. Parse context from the session
            const context = this.parseSessionContext(session);

            // 2. Create plan on Linear (via worker)
            this.workerClient.sendPlanUpdate(sessionId, [
                { content: 'Analyze issue context', status: 'completed' },
                { content: 'Process with CodeBolt agent', status: 'inProgress' },
                { content: 'Report results', status: 'pending' },
            ]);

            // 3. Emit action activity (via worker)
            this.workerClient.sendActivity(sessionId, {
                type: 'action',
                action: 'Processing',
                parameter: context.issueTitle,
            });

            if (abort.signal.aborted) return;

            // 4. Bridge to CodeBolt agent
            const agentResult = await this.invokeCodeBoltAgent(context, abort.signal);

            if (abort.signal.aborted) return;

            // 5. Update plan — mark processing complete
            this.workerClient.sendPlanUpdate(sessionId, [
                { content: 'Analyze issue context', status: 'completed' },
                { content: 'Process with CodeBolt agent', status: 'completed' },
                { content: 'Report results', status: 'completed' },
            ]);

            // 6. Emit final response (via worker)
            this.workerClient.sendActivity(sessionId, {
                type: 'response',
                body: agentResult,
            });

            // 7. Mark session complete (via worker)
            this.workerClient.sendStateUpdate(sessionId, 'complete');
            console.log(`[SessionHandler] Session ${sessionId} completed`);
        } catch (err) {
            if (!abort.signal.aborted) {
                const errorMsg = err instanceof Error ? err.message : String(err);
                console.error(`[SessionHandler] Session ${sessionId} failed:`, errorMsg);

                this.workerClient.sendActivity(sessionId, {
                    type: 'error',
                    body: `Failed to process issue: ${errorMsg}`,
                });

                this.workerClient.sendStateUpdate(sessionId, 'error');
            }
        } finally {
            this.activeSessions.delete(sessionId);
        }
    }

    /**
     * Handle a follow-up prompt from a user on an existing session.
     */
    async handlePrompted(sessionId: string, message: string): Promise<void> {
        console.log(`[SessionHandler] Prompted on session ${sessionId}: ${message.substring(0, 100)}`);

        // Emit a thought to acknowledge
        this.workerClient.sendActivity(sessionId, {
            type: 'thought',
            body: `Received follow-up: "${message.substring(0, 100)}". Processing...`,
        });

        try {
            // Send the follow-up message to the CodeBolt agent
            const response = await (codebolt as any).chat.sendMessage(message);

            const result = response?.message ?? (typeof response === 'string' ? response : 'Processed follow-up.');

            this.workerClient.sendActivity(sessionId, {
                type: 'response',
                body: result,
            });
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            this.workerClient.sendActivity(sessionId, {
                type: 'error',
                body: `Failed to process follow-up: ${errorMsg}`,
            });
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

    private parseSessionContext(session: SessionCreatedEvent['session']): ParsedContext {
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
        const prompt = this.buildAgentPrompt(context);

        console.log(`[SessionHandler] Sending to CodeBolt agent: ${context.issueIdentifier}`);

        try {
            const response = await (codebolt as any).chat.sendMessage(prompt);

            if (signal.aborted) {
                return 'Processing was cancelled.';
            }

            if (response && typeof response === 'object' && response.message) {
                return response.message;
            }
            if (typeof response === 'string') {
                return response;
            }

            return `Processed issue ${context.issueIdentifier}: ${context.issueTitle}. The CodeBolt agent has analyzed the request.`;
        } catch (err) {
            console.error('[SessionHandler] CodeBolt agent invocation failed:', err);
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

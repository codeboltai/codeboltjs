import type { CodeboltMessage, CodeboltInstance, IExecutor, IFormatter, IDispatcher } from '../types.js';

/**
 * MessageStream bridges an executor, formatter, and dispatcher into
 * an AsyncIterable<CodeboltMessage>.
 *
 * For each raw line from the executor:
 * 1. The formatter parses it into CodeboltMessage(s)
 * 2. The dispatcher sends each message to codebolt.notify.* (if autoDispatch)
 * 3. The message is yielded to the consumer for optional additional processing
 */
export async function* createMessageStream(
    executor: IExecutor,
    formatter: IFormatter,
    dispatcher: IDispatcher | null,
    codebolt: CodeboltInstance | null,
    prompt: string,
): AsyncGenerator<CodeboltMessage> {
    console.log(`[message-stream] Starting stream for prompt: "${prompt.substring(0, 80)}"`);
    let messageCount = 0;

    for await (const line of executor.execute(prompt)) {
        const ts = new Date().toISOString();
        const messages = formatter.parseLine(line, ts);

        for (const msg of messages) {
            messageCount++;
            console.log(`[message-stream] #${messageCount} type=${msg.type}${msg.toolName ? ` tool=${msg.toolName}` : ''}${msg.sessionId ? ` session=${msg.sessionId}` : ''}`);

            // Capture session ID from init messages
            if (msg.type === 'init' && msg.sessionId) {
                executor.setSessionId?.(msg.sessionId);
            }

            // Auto-dispatch to codebolt
            if (dispatcher && codebolt) {
                dispatcher.dispatch(msg, codebolt);
            }

            yield msg;
        }
    }

    console.log(`[message-stream] Stream ended. Total messages: ${messageCount}`);
}

import WebSocket from 'ws';

const DEFAULT_AGENT = 'c4d3fdb9-cf9e-4f82-8a1d-0160bbfc9ae9';

export interface ChatOptions {
  message: string;
  agent?: string;
  thread?: string;
  timeout?: string;
  json?: boolean;
  host: string;
  port: string;
}

function buildMessagePayload(opts: ChatOptions) {
  const agentName = opts.agent || DEFAULT_AGENT;
  return {
    type: 'messageResponse',
    message: {
      userMessage: opts.message,
      type: 'messageResponse',
      templateType: 'userChat',
      selectedAgent: { id: agentName, name: agentName },
      mentionedAgents: [{ name: agentName }],
      mentionedFiles: [],
      mentionedFolders: [],
      mentionedMultiFile: [],
      mentionedMCPs: [],
      uploadedImages: [],
      actions: [],
      links: [],
      controlFiles: [],
      currentFile: '',
      selection: null,
    },
  };
}

/**
 * Non-streaming chat: sends message, waits for completion,
 * outputs summary with file paths.
 */
export async function chatSend(opts: ChatOptions): Promise<void> {
  const wsUrl = `ws://${opts.host}:${opts.port}/chat`;
  const timeoutMs = parseInt(opts.timeout || '600000', 10);

  return new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let completed = false;
    let threadId = opts.thread || 'unknown';
    let agentInstanceId = '';

    const timer = setTimeout(() => {
      if (!completed) {
        completed = true;
        const msg = 'Timeout: Agent did not finish within the specified time.';
        if (opts.json) {
          process.stdout.write(JSON.stringify({ status: 'timeout', message: msg }) + '\n');
        } else {
          process.stderr.write(msg + '\n');
        }
        ws.close();
        resolve();
      }
    }, timeoutMs);

    ws.on('open', () => {
      const payload = buildMessagePayload(opts);
      ws.send(JSON.stringify(payload));
    });

    ws.on('message', async (data: WebSocket.Data) => {
      if (completed) return;
      try {
        const msg = JSON.parse(data.toString());
        const type = msg.type || '';
        const actionType = msg.actionType || '';

        if (msg.threadId) {
          threadId = msg.threadId;
        }
        if (msg.agentInstanceId) {
          agentInstanceId = msg.agentInstanceId;
        }

        if (type === 'processStoped' || actionType === 'ProcessStoped') {
          completed = true;
          clearTimeout(timer);

          // Fetch debug instance details (includes projectPath, threadChatPath, childAgents)
          let agentDetails: any = null;
          if (agentInstanceId) {
            try {
              const resp = await fetch(`http://${opts.host}:${opts.port}/agent-debug/instances/${agentInstanceId}`);
              if (resp.ok) {
                agentDetails = await resp.json();
              }
            } catch {
              // ignore fetch errors
            }
          } else {
            // Fallback to fetching by thread if agentInstanceId is not available
            try {
              const resp = await fetch(`http://${opts.host}:${opts.port}/agent-debug/by-thread/${threadId}`);
              if (resp.ok) {
                const instances = await resp.json() as any[];
                if (instances && instances.length > 0) {
                  agentDetails = instances[0];
                }
              }
            } catch {
              // ignore fetch errors
            }
          }

          const debugLogPaths = agentDetails?.logFilePath ? [agentDetails.logFilePath] : [];
          const projectPath = agentDetails?.projectPath || '';
          const threadChatPath = agentDetails?.threadChatPath || '';
          const childAgents = agentDetails?.childAgents || [];

          if (opts.json) {
            process.stdout.write(JSON.stringify({
              status: 'completed',
              threadId,
              debugLogPaths,
              projectPath,
              threadChatPath,
              childAgents: childAgents.map((child: any) => ({
                agentInstanceId: child.agentInstanceId,
                agentId: child.agentId,
                agentName: child.agentName,
                agentType: child.agentType,
                threadId: child.threadId,
                status: child.status,
                logFilePath: child.logFilePath,
                projectPath: child.projectPath,
                threadChatPath: child.threadChatPath,
              })),
              message: 'Chat completed successfully.',
            }) + '\n');
          } else {
            console.log('Chat completed successfully.');
            console.log(`Thread ID: ${threadId}`);
            if (projectPath) {
              console.log(`Project Path: ${projectPath}`);
            }
            if (threadChatPath) {
              console.log(`Thread Chat Path: ${threadChatPath}`);
            }
            if (debugLogPaths.length > 0) {
              console.log('Debug Logs:');
              debugLogPaths.forEach((p: string) => console.log(`  ${p}`));
            }
            if (childAgents.length > 0) {
              console.log(`\nChild Agents (${childAgents.length}):`);
              childAgents.forEach((child: any, i: number) => {
                console.log(`  [${i + 1}] ${child.agentName || child.agentId}`);
                console.log(`      Thread ID: ${child.threadId}`);
                console.log(`      Agent Instance ID: ${child.agentInstanceId}`);
                console.log(`      Status: ${child.status}`);
                if (child.projectPath) console.log(`      Project Path: ${child.projectPath}`);
                if (child.threadChatPath) console.log(`      Thread Chat Path: ${child.threadChatPath}`);
                if (child.logFilePath) console.log(`      Debug Log: ${child.logFilePath}`);
              });
            }
          }

          ws.close();
          resolve();
        }
      } catch {
        // ignore parse errors
      }
    });

    ws.on('error', (err: Error) => {
      if (!completed) {
        completed = true;
        clearTimeout(timer);
        if (opts.json) {
          process.stdout.write(JSON.stringify({ status: 'error', message: err.message }) + '\n');
        } else {
          process.stderr.write(`WebSocket error: ${err.message}\n`);
        }
        reject(err);
      }
    });

    ws.on('close', () => {
      if (!completed) {
        completed = true;
        clearTimeout(timer);
        resolve();
      }
    });
  });
}

/**
 * Streaming chat: sends message, streams agent response in real-time,
 * exits on completion.
 */
export async function chatSendStreaming(opts: ChatOptions): Promise<void> {
  const wsUrl = `ws://${opts.host}:${opts.port}/chat`;
  const timeoutMs = parseInt(opts.timeout || '600000', 10);

  return new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let completed = false;
    let receivedAny = false;
    let threadId = opts.thread;
    let agentInstanceId = '';

    const timer = setTimeout(() => {
      if (!completed) {
        completed = true;
        process.stderr.write('\nTimeout: Agent did not finish within the specified time.\n');
        ws.close();
        resolve();
      }
    }, timeoutMs);

    ws.on('open', () => {
      const payload = {
        type: 'message',
        actionType: 'SendMessage',
        message: opts.message,
        threadId: threadId,
        metadata: {
          clientId: 'cli-client',
          timestamp: Date.now()
        }
      };
      
      if (opts.agent) {
        Object.assign(payload, { agentId: opts.agent });
      }

      ws.send(JSON.stringify(payload));
      if (!opts.json) {
        console.log('Prompt sent, waiting for agent...\n');
      }
    });

    ws.on('message', async (data: WebSocket.Data) => {
      if (completed) return;
      try {
        const msg = JSON.parse(data.toString());
        const tpl = msg.templateType || '';
        const type = msg.type || '';
        const actionType = msg.actionType || '';

        if (msg.threadId) {
          threadId = msg.threadId;
        }
        if (msg.agentInstanceId) {
          agentInstanceId = msg.agentInstanceId;
        }

        const isAgent =
          tpl === 'agentChat' ||
          tpl === 'agentChatWithButton' ||
          tpl === 'agentResponse' ||
          msg.sender?.senderType === 'agent' ||
          (type === 'message' && actionType === 'SendMessage');

        if (isAgent && msg.content) {
          receivedAny = true;
          const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
          if (opts.json) {
            process.stdout.write(JSON.stringify({ type: 'stream', content }) + '\n');
          } else {
            process.stdout.write(content + '\n');
          }
        }

        if (type === 'processStoped' || actionType === 'ProcessStoped') {
          completed = true;
          clearTimeout(timer);

          if (msg.content && !receivedAny) {
            const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
            process.stdout.write(content + '\n');
          }

          // Fetch debug instance details (includes projectPath, threadChatPath, childAgents)
          let agentDetails: any = null;
          if (agentInstanceId) {
            try {
              const resp = await fetch(`http://${opts.host}:${opts.port}/agent-debug/instances/${agentInstanceId}`);
              if (resp.ok) {
                agentDetails = await resp.json();
              }
            } catch {
              // ignore fetch errors
            }
          } else if (threadId) {
            try {
              const resp = await fetch(`http://${opts.host}:${opts.port}/agent-debug/by-thread/${threadId}`);
              if (resp.ok) {
                const instances = await resp.json() as any[];
                if (instances && instances.length > 0) {
                  agentDetails = instances[0];
                }
              }
            } catch {
              // ignore fetch errors
            }
          }

          const debugLogPaths = agentDetails?.logFilePath ? [agentDetails.logFilePath] : [];
          const projectPath = agentDetails?.projectPath || '';
          const threadChatPath = agentDetails?.threadChatPath || '';
          const childAgents = agentDetails?.childAgents || [];

          if (!opts.json) {
            console.log('\n--- Agent Finished ---');
            if (threadId) console.log(`Thread ID: ${threadId}`);
            if (projectPath) console.log(`Project Path: ${projectPath}`);
            if (threadChatPath) console.log(`Thread Chat Path: ${threadChatPath}`);
            if (debugLogPaths.length > 0) {
              console.log('Debug Logs:');
              debugLogPaths.forEach((p: string) => console.log(`  ${p}`));
            }
            if (childAgents.length > 0) {
              console.log(`\nChild Agents (${childAgents.length}):`);
              childAgents.forEach((child: any, i: number) => {
                console.log(`  [${i + 1}] ${child.agentName || child.agentId}`);
                console.log(`      Thread ID: ${child.threadId}`);
                console.log(`      Agent Instance ID: ${child.agentInstanceId}`);
                console.log(`      Status: ${child.status}`);
                if (child.projectPath) console.log(`      Project Path: ${child.projectPath}`);
                if (child.threadChatPath) console.log(`      Thread Chat Path: ${child.threadChatPath}`);
                if (child.logFilePath) console.log(`      Debug Log: ${child.logFilePath}`);
              });
            }
          } else {
            process.stdout.write(JSON.stringify({
              type: 'done',
              threadId,
              debugLogPaths,
              projectPath,
              threadChatPath,
              childAgents: childAgents.map((child: any) => ({
                agentInstanceId: child.agentInstanceId,
                agentId: child.agentId,
                agentName: child.agentName,
                agentType: child.agentType,
                threadId: child.threadId,
                status: child.status,
                logFilePath: child.logFilePath,
                projectPath: child.projectPath,
                threadChatPath: child.threadChatPath,
              })),
            }) + '\n');
          }

          ws.close();
          resolve();
        }

        if (type === 'message' && msg.content && !isAgent) {
          if (tpl === 'infoWithLink' || tpl === 'error' || tpl === 'warning') {
            const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
            if (opts.json) {
              process.stdout.write(JSON.stringify({ type: tpl, content }) + '\n');
            } else {
              console.log(`[${tpl}] ${content}`);
            }
          }
        }
      } catch {
        // ignore parse errors
      }
    });

    ws.on('error', (err: Error) => {
      if (!completed) {
        completed = true;
        clearTimeout(timer);
        if (opts.json) {
          process.stdout.write(JSON.stringify({ status: 'error', message: err.message }) + '\n');
        } else {
          process.stderr.write(`WebSocket error: ${err.message}\n`);
        }
        reject(err);
      }
    });

    ws.on('close', () => {
      if (!completed) {
        completed = true;
        clearTimeout(timer);
        if (!receivedAny) {
          console.log('Connection closed without agent response.');
        }
        resolve();
      }
    });
  });
}

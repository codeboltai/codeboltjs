// ── Core output functions ──

export function output(data: unknown, opts: { json?: boolean }): void {
  if (opts.json) {
    process.stdout.write(JSON.stringify(data, null, 2) + '\n');
  } else {
    prettyPrint(data);
  }
}

export function errorOutput(message: string, opts: { json?: boolean }): void {
  if (opts.json) {
    process.stderr.write(JSON.stringify({ error: message }) + '\n');
  } else {
    process.stderr.write(`Error: ${message}\n`);
  }
  process.exit(1);
}

export function successMessage(message: string, opts: { json?: boolean }): void {
  if (opts.json) {
    process.stdout.write(JSON.stringify({ status: 'success', message }) + '\n');
  } else {
    process.stdout.write(message + '\n');
  }
}

// ── Pretty printer with smart detection ──

function prettyPrint(data: unknown): void {
  if (data === null || data === undefined) {
    console.log('(no data)');
    return;
  }

  if (typeof data !== 'object') {
    console.log(String(data));
    return;
  }

  const obj = data as Record<string, unknown>;

  // Detect known response shapes and use specialized formatters
  if (isThreadsInfoResponse(obj)) return printThreadsInfo(obj);
  if (isChatMessagesResponse(obj)) return printChatMessages(obj);
  if (isTaskSearchResponse(obj)) return printTaskSearch(obj);
  if (isAgentListResponse(data)) return printAgentList(data as any[]);
  if (isLlmProviderResponse(data)) return printLlmProviders(data as any[]);

  // Generic array → table
  if (Array.isArray(data)) {
    if (data.length === 0) {
      console.log('(empty)');
      return;
    }
    printTable(data);
    return;
  }

  // Generic object → key-value
  printKeyValue(obj);
}

// ── Type detectors ──

function isThreadsInfoResponse(obj: Record<string, unknown>): boolean {
  return 'visibleThreads' in obj && 'stats' in obj;
}

function isChatMessagesResponse(obj: Record<string, unknown>): boolean {
  return 'threadId' in obj && 'chats' in obj && Array.isArray(obj.chats);
}

function isTaskSearchResponse(obj: Record<string, unknown>): boolean {
  return 'success' in obj && 'data' in obj && 'pagination' in obj;
}

function isAgentListResponse(data: unknown): boolean {
  return Array.isArray(data) && data.length > 0 && 'unique_id' in data[0] && 'title' in data[0];
}

function isLlmProviderResponse(data: unknown): boolean {
  return Array.isArray(data) && data.length > 0 && 'name' in data[0] && ('apikey' in data[0] || 'id' in data[0]);
}

// ── Specialized formatters ──

function printThreadsInfo(obj: Record<string, unknown>): void {
  const stats = obj.stats as any;
  const threads = obj.visibleThreads as any[];
  const active = obj.activeThread as any;

  console.log(`Threads: ${stats?.totalThreads || 0} total`);
  if (stats?.threadsByStatus) {
    const statuses = Object.entries(stats.threadsByStatus)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    if (statuses) console.log(`Status:  ${statuses}`);
  }
  if (active) {
    console.log(`Active:  ${active.name || active.threadId} (${active.threadId})`);
  }

  if (threads && threads.length > 0) {
    console.log('');
    console.log(pad('ID', 38) + pad('Name', 30) + pad('Status', 10) + pad('Messages', 10) + 'Updated');
    console.log('-'.repeat(110));
    for (const t of threads) {
      const updated = t.lastActivity ? timeAgo(t.lastActivity) : '';
      console.log(
        pad(t.threadId, 38) +
        pad(truncate(t.name || '', 28), 30) +
        pad(t.status || '', 10) +
        pad(String(t.messageCount || 0), 10) +
        updated
      );
    }
  }
}

function printChatMessages(obj: Record<string, unknown>): void {
  const threadId = obj.threadId as string;
  const chats = obj.chats as any[];

  console.log(`Thread: ${threadId}`);
  console.log(`Messages: ${chats.length}`);
  console.log('');

  for (const msg of chats) {
    const sender = msg.sender?.senderType || msg.type || 'system';
    const tpl = msg.templateType || '';

    // Skip internal/observability messages
    if (tpl === 'threadObservability' || tpl === 'aiStream') continue;

    const content = extractContent(msg);
    if (!content) continue;

    const prefix = formatSender(sender, tpl);
    const time = formatTimestamp(msg.timestamp);

    console.log(`${dim(time)} ${prefix} ${content}`);
  }
}

function printTaskSearch(obj: Record<string, unknown>): void {
  const tasks = (obj.data as any[]) || [];
  const pagination = obj.pagination as any;

  if (tasks.length === 0) {
    console.log('No tasks found.');
    if (pagination) console.log(`Total: ${pagination.total}`);
    return;
  }

  console.log(pad('ID', 38) + pad('Title', 35) + pad('Status', 15) + 'Priority');
  console.log('-'.repeat(100));
  for (const t of tasks) {
    console.log(
      pad(t.id || t.taskId || '', 38) +
      pad(truncate(t.title || '', 33), 35) +
      pad(t.status || '', 15) +
      (t.priority || '')
    );
  }
  if (pagination) {
    console.log(`\n${pagination.total} total, showing ${pagination.offset}-${pagination.offset + tasks.length}`);
  }
}

function printAgentList(agents: any[]): void {
  console.log(`${agents.length} agent(s) installed\n`);
  console.log(pad('Name', 30) + pad('ID', 35) + pad('Type', 15) + 'Tags');
  console.log('-'.repeat(100));
  for (const a of agents) {
    console.log(
      pad(truncate(a.title || a.name || '', 28), 30) +
      pad(a.unique_id || a.id || '', 35) +
      pad(a.agentType || '', 15) +
      (a.tags || []).join(', ')
    );
  }
}

function printLlmProviders(providers: any[]): void {
  console.log(`${providers.length} provider(s)\n`);
  console.log(pad('Name', 25) + pad('ID', 10) + 'API Key');
  console.log('-'.repeat(60));
  for (const p of providers) {
    const hasKey = p.apikey ? 'configured' : 'not set';
    console.log(
      pad(p.name || '', 25) +
      pad(String(p.id || ''), 10) +
      hasKey
    );
  }
}

// ── Generic formatters ──

function printTable(data: any[]): void {
  // Pick relevant columns (skip large/nested objects)
  const sample = data[0];
  const keys = Object.keys(sample).filter(k => {
    const v = sample[k];
    if (Array.isArray(v)) return false;
    if (typeof v === 'object' && v !== null) {
      // Allow small objects
      return JSON.stringify(v).length < 80;
    }
    return true;
  }).slice(0, 8); // Max 8 columns

  if (keys.length === 0) {
    // Fallback: just show count
    console.log(`${data.length} item(s)`);
    return;
  }

  // Calculate column widths
  const widths = keys.map(k => {
    const maxVal = Math.max(...data.map(row => {
      const v = row[k];
      return String(v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : v).length;
    }));
    return Math.min(Math.max(k.length, maxVal), 40);
  });

  // Header
  console.log(keys.map((k, i) => pad(k, widths[i] + 2)).join(''));
  console.log(keys.map((_, i) => '-'.repeat(widths[i])).join('  '));

  // Rows
  for (const row of data) {
    const vals = keys.map((k, i) => {
      const v = row[k];
      if (v === null || v === undefined) return pad('', widths[i] + 2);
      const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
      return pad(truncate(s, widths[i]), widths[i] + 2);
    });
    console.log(vals.join(''));
  }
  console.log(`\n${data.length} item(s)`);
}

function printKeyValue(obj: Record<string, unknown>): void {
  const maxKeyLen = Math.max(...Object.keys(obj).map(k => k.length));
  for (const [key, value] of Object.entries(obj)) {
    const label = pad(key, maxKeyLen + 2);
    if (value === null || value === undefined) {
      console.log(`${label}(none)`);
    } else if (Array.isArray(value)) {
      console.log(`${label}[${value.length} items]`);
    } else if (typeof value === 'object') {
      const s = JSON.stringify(value);
      console.log(`${label}${s.length > 100 ? s.substring(0, 100) + '...' : s}`);
    } else {
      console.log(`${label}${value}`);
    }
  }
}

// ── Chat message helpers ──

function extractContent(msg: any): string {
  // User messages
  if (msg.templateType === 'userChat') {
    return msg.data?.text || msg.message?.userMessage || '';
  }
  // Agent final response / processStoped
  if (msg.type === 'processStoped') {
    return msg.content || msg.data?.text || '';
  }
  // Agent chat / info messages
  if (msg.content && typeof msg.content === 'string') {
    return msg.content;
  }
  if (msg.data?.text && typeof msg.data.text === 'string') {
    return msg.data.text;
  }
  return '';
}

function formatSender(sender: string, tpl: string): string {
  if (tpl === 'userChat') return bold('You:');
  if (tpl === 'processStarted') return dim('[started]');
  if (sender === 'processStoped' || tpl === 'processStoped') return bold('Agent (final):');
  if (tpl === 'agentChat' || tpl === 'agentChatWithButton') return bold('Agent:');
  if (tpl === 'informationWithUILink') return dim('[info]');
  if (tpl === 'error') return dim('[error]');
  if (tpl === 'warning') return dim('[warn]');
  return dim(`[${tpl || sender}]`);
}

function formatTimestamp(ts: string | number | undefined): string {
  if (!ts) return '         ';
  const d = new Date(typeof ts === 'string' && /^\d+$/.test(ts) ? parseInt(ts) : ts);
  if (isNaN(d.getTime())) return '         ';
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ── Utility helpers ──

function pad(s: string, width: number): string {
  if (s.length >= width) return s.substring(0, width);
  return s + ' '.repeat(width - s.length);
}

function truncate(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s;
  return s.substring(0, maxLen - 2) + '..';
}

function timeAgo(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diff = now - then;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function bold(s: string): string {
  return `\x1b[1m${s}\x1b[0m`;
}

function dim(s: string): string {
  return `\x1b[2m${s}\x1b[0m`;
}

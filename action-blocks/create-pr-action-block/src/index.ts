import codebolt from '@codebolt/codeboltjs';

type AnyRecord = Record<string, any>;

interface PullRequestInputs {
  hookInput?: AnyRecord;
  cwd?: string;
  worktreePath?: string;
  workspaceRoot?: string;
  workspace_root?: string;
  baseBranch?: string;
  commitMessage?: string;
  prTitle?: string;
  generatePrTitle?: boolean;
  prTitleLlmRole?: string;
  prBody?: string;
  owner?: string;
  repo?: string;
  repository?: string;
  draft?: boolean;
  push?: boolean;
  createGithubPr?: boolean;
  githubToolbox?: string;
  githubToolName?: string;
  allowGhCli?: boolean;
}

interface StepResult {
  name: string;
  success: boolean;
  message?: string;
  data?: any;
}

interface TerminalResult {
  success: boolean;
  stdout: string;
  stderr: string;
  error?: string;
}

function asObject(value: unknown): AnyRecord {
  return value && typeof value === 'object' ? value as AnyRecord : {};
}

function debugLog(message: string, data?: unknown): void {
  if (data === undefined) {
    console.log(`[create-pr-action-block] ${message}`);
    return;
  }

  try {
    console.log(`[create-pr-action-block] ${message}`, JSON.stringify(data, null, 2));
  } catch {
    console.log(`[create-pr-action-block] ${message}`, data);
  }
}

function getResponseError(response: any): string | undefined {
  if (!response) return 'No response returned';
  if (response.success === false) {
    return response.error || response.message || 'Operation failed';
  }
  if (response.type === 'error' || response.type === 'commandError') {
    return response.error || response.message || 'Operation failed';
  }
  return undefined;
}

function unwrapStatus(response: any): AnyRecord {
  return asObject(response?.status || response?.data?.status || response?.data || response);
}

function changedFilesFromStatus(status: AnyRecord): string[] {
  const names = new Set<string>();
  const fields = ['not_added', 'conflicted', 'created', 'deleted', 'modified', 'renamed', 'staged'];

  for (const field of fields) {
    const value = status[field];
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string') names.add(item);
        else if (item?.path) names.add(String(item.path));
        else if (item?.from || item?.to) names.add(String(item.to || item.from));
      }
    }
  }

  if (Array.isArray(status.files)) {
    for (const file of status.files) {
      if (file?.path) names.add(String(file.path));
    }
  }

  return Array.from(names).sort();
}

function hasWorkingTreeChanges(status: AnyRecord): boolean {
  return changedFilesFromStatus(status).length > 0;
}

function statusCurrentBranch(status: AnyRecord): string {
  return typeof status.current === 'string' && status.current.trim() ? status.current.trim() : '';
}

function inferBaseBranch(inputs: PullRequestInputs, status: AnyRecord): string {
  if (inputs.baseBranch?.trim()) return inputs.baseBranch.trim();
  const tracking = typeof status.tracking === 'string' ? status.tracking : '';
  const trackingBranch = tracking.includes('/') ? tracking.split('/').slice(1).join('/') : tracking;
  if (trackingBranch && trackingBranch !== statusCurrentBranch(status)) return trackingBranch;
  return 'main';
}

function makeCommitMessage(inputs: PullRequestInputs, hookInput: AnyRecord): string {
  if (inputs.commitMessage?.trim()) return inputs.commitMessage.trim();
  const agent = hookInput.agent_id ? ` by ${hookInput.agent_id}` : '';
  return `Create PR for agent changes${agent}`;
}

function fallbackPrTitle(changedFiles: string[], branchName: string): string {
  if (!changedFiles.length) return `Update ${branchName.replace(/^codebolt\/local-threadpool-/, '')}`;

  const topLevelNames = Array.from(new Set(changedFiles.map(file => file.split('/')[0]).filter(Boolean)));
  const fileNames = changedFiles.map(file => file.split('/').pop() || file);

  if (changedFiles.length === 1) {
    return `Update ${fileNames[0]}`;
  }

  if (topLevelNames.length === 1) {
    return `Update ${topLevelNames[0]} files`;
  }

  return `Update ${Math.min(changedFiles.length, 99)} project files`;
}

function cleanPrTitle(value: string): string {
  return value
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/^title:\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

function extractLlmText(response: any): string {
  const candidates = [
    response?.completion?.content,
    response?.data?.completion?.content,
    response?.data?.content,
    response?.content,
    response?.message,
    response?.result
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  return '';
}

async function generatePrTitleWithLlm(
  inputs: PullRequestInputs,
  hookInput: AnyRecord,
  branchName: string,
  baseBranch: string,
  changedFiles: string[],
  diffStat: string | undefined,
  steps: StepResult[]
): Promise<string> {
  const fallbackTitle = fallbackPrTitle(changedFiles, branchName);

  if (inputs.prTitle?.trim()) {
    return cleanPrTitle(inputs.prTitle);
  }

  if (inputs.generatePrTitle === false) {
    return fallbackTitle;
  }

  const prompt = [
    'Generate a concise, meaningful GitHub pull request title for code changes.',
    'Rules:',
    '- Return only the title text.',
    '- Do not include quotes, markdown, prefixes, branch names, ticket IDs, or trailing punctuation.',
    '- Use imperative style when possible, like "Add calculator history" or "Fix input validation".',
    '- Maximum 72 characters.',
    '',
    `Base branch: ${baseBranch}`,
    `Worktree branch: ${branchName}`,
    `Hook event: ${hookInput.hook_event_name || 'unknown'}`,
    `Thread: ${hookInput.thread_id || hookInput.session_id || 'unknown'}`,
    '',
    'Changed files:',
    ...(changedFiles.length ? changedFiles.slice(0, 40).map(file => `- ${file}`) : ['- No changed files reported']),
    '',
    diffStat ? `Diff stat:\n${diffStat}` : ''
  ].filter(Boolean).join('\n');

  try {
    debugLog('Generating PR title with LLM', { branchName, baseBranch, changedFiles, diffStat });
    const response = await codebolt.llm.inference({
      messages: [
        {
          role: 'system',
          content: 'You write short, specific GitHub pull request titles.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 40,
      temperature: 0.2,
      stream: false,
      saveToContext: false,
      llmrole: inputs.prTitleLlmRole
    });

    const generatedTitle = cleanPrTitle(extractLlmText(response));
    steps.push({
      name: 'Generate PR title with CodeBolt LLM',
      success: !!generatedTitle,
      message: generatedTitle || 'LLM did not return a title; using fallback title',
      data: response
    });

    return generatedTitle || fallbackTitle;
  } catch (error) {
    steps.push({
      name: 'Generate PR title with CodeBolt LLM',
      success: false,
      message: (error as Error).message,
      data: { error: (error as Error).message }
    });
    return fallbackTitle;
  }
}

function makePrBody(inputs: PullRequestInputs, hookInput: AnyRecord, changedFiles: string[]): string {
  if (inputs.prBody?.trim()) return inputs.prBody.trim();

  const lines = [
    'This pull request was created by the CodeBolt create-pr-action-block.',
    '',
    `Hook event: ${hookInput.hook_event_name || 'manual'}`,
    `Thread: ${hookInput.thread_id || hookInput.session_id || 'unknown'}`,
    '',
    'Changed files:',
    ...(changedFiles.length ? changedFiles.map(file => `- ${file}`) : ['- No uncommitted file changes were reported by git status.'])
  ];

  return lines.join('\n');
}

function normalizeRepository(inputs: PullRequestInputs, remoteUrl?: string): { owner?: string; repo?: string; repository?: string } {
  const repository = inputs.repository?.trim() || (inputs.owner && inputs.repo ? `${inputs.owner}/${inputs.repo}` : '');
  const fromInput = parseRepository(repository);
  if (fromInput.owner && fromInput.repo) return fromInput;

  const fromRemote = parseRepository(remoteUrl || '');
  if (fromRemote.owner && fromRemote.repo) return fromRemote;

  return {};
}

function parseRepository(value: string): { owner?: string; repo?: string; repository?: string } {
  const trimmed = value.trim();
  if (!trimmed) return {};

  const httpsMatch = trimmed.match(/github\.com[:/]([^/\s]+)\/([^/\s]+?)(?:\.git)?(?:$|[?#])/);
  if (httpsMatch) {
    return {
      owner: httpsMatch[1],
      repo: httpsMatch[2].replace(/\.git$/, ''),
      repository: `${httpsMatch[1]}/${httpsMatch[2].replace(/\.git$/, '')}`
    };
  }

  const sshMatch = trimmed.match(/git@github\.com:([^/\s]+)\/([^/\s]+?)(?:\.git)?$/);
  if (sshMatch) {
    return {
      owner: sshMatch[1],
      repo: sshMatch[2].replace(/\.git$/, ''),
      repository: `${sshMatch[1]}/${sshMatch[2].replace(/\.git$/, '')}`
    };
  }

  const ownerRepoMatch = trimmed.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (ownerRepoMatch) {
    return {
      owner: ownerRepoMatch[1],
      repo: ownerRepoMatch[2].replace(/\.git$/, ''),
      repository: `${ownerRepoMatch[1]}/${ownerRepoMatch[2].replace(/\.git$/, '')}`
    };
  }

  return {};
}

function buildCompareUrl(repository: string | undefined, baseBranch: string, branchName: string): string | undefined {
  if (!repository) return undefined;
  return `https://github.com/${repository}/compare/${encodeURIComponent(baseBranch)}...${encodeURIComponent(branchName)}?expand=1`;
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function terminalText(response: any): TerminalResult {
  const stdout = String(response?.stdout || response?.output || response?.message || '').trim();
  const stderr = String(response?.stderr || '').trim();
  const error = response?.error ? String(response.error) : undefined;
  const exitCode = typeof response?.exitCode === 'number' ? response.exitCode : typeof response?.code === 'number' ? response.code : undefined;
  const success = response?.success !== false && response?.type !== 'commandError' && !error && (exitCode === undefined || exitCode === 0);
  return { success, stdout, stderr, error };
}

async function runTerminal(command: string): Promise<TerminalResult> {
  debugLog('Running terminal command', { command });
  const response = await codebolt.terminal.executeCommand(command, true);
  const result = terminalText(response);
  debugLog('Terminal command result', { command, result, raw: response });
  return result;
}

function resolveWorktreePath(inputs: PullRequestInputs, hookInput: AnyRecord): string {
  const candidates = [
    inputs.worktreePath,
    inputs.cwd,
    hookInput.cwd,
    inputs.workspaceRoot,
    inputs.workspace_root,
    hookInput.workspace_root
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  return '';
}

function runGit(worktreePath: string, args: string): Promise<TerminalResult> {
  return runTerminal(`git -C ${shellQuote(worktreePath)} ${args}`);
}

function runInWorktree(worktreePath: string, command: string): Promise<TerminalResult> {
  return runTerminal(`cd ${shellQuote(worktreePath)} && ${command}`);
}

function parseBranchLine(line: string): AnyRecord {
  const body = line.replace(/^##\s*/, '').trim();
  const detached = /^HEAD\b|\(no branch\)/i.test(body);
  const result: AnyRecord = {
    current: '',
    tracking: undefined,
    ahead: 0,
    behind: 0,
    detached
  };

  if (detached) {
    result.current = 'HEAD';
    return result;
  }

  const [branchPart, metaPart = ''] = body.split('...');
  result.current = branchPart.trim();

  if (metaPart) {
    const tracking = metaPart.split(/\s+\[/)[0].trim();
    if (tracking) result.tracking = tracking;
  }

  const aheadMatch = body.match(/ahead\s+(\d+)/i);
  const behindMatch = body.match(/behind\s+(\d+)/i);
  result.ahead = aheadMatch ? Number(aheadMatch[1]) : 0;
  result.behind = behindMatch ? Number(behindMatch[1]) : 0;

  return result;
}

function parsePorcelainStatus(output: string): AnyRecord {
  const status: AnyRecord = {
    not_added: [],
    conflicted: [],
    created: [],
    deleted: [],
    modified: [],
    renamed: [],
    files: [],
    staged: [],
    ahead: 0,
    behind: 0,
    current: '',
    tracking: undefined,
    detached: false
  };

  for (const rawLine of output.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (!line) continue;

    if (line.startsWith('##')) {
      Object.assign(status, parseBranchLine(line));
      continue;
    }

    const index = line[0] || ' ';
    const workingDir = line[1] || ' ';
    const rawPath = line.slice(3);
    const pathName = rawPath.includes(' -> ') ? rawPath.split(' -> ').pop() || rawPath : rawPath;
    const file = { path: pathName, index, working_dir: workingDir };
    status.files.push(file);

    if (index === '?' || workingDir === '?') status.not_added.push(pathName);
    if (index === 'U' || workingDir === 'U' || (index === 'A' && workingDir === 'A') || (index === 'D' && workingDir === 'D')) status.conflicted.push(pathName);
    if (index === 'A' || workingDir === 'A') status.created.push(pathName);
    if (index === 'D' || workingDir === 'D') status.deleted.push(pathName);
    if (index === 'M' || workingDir === 'M') status.modified.push(pathName);
    if (index === 'R' || workingDir === 'R') status.renamed.push(pathName);
    if (index !== ' ' && index !== '?' && index !== '!') status.staged.push(pathName);
  }

  return status;
}

async function readGitStatus(worktreePath: string, steps: StepResult[], name: string): Promise<AnyRecord> {
  const response = await runGit(worktreePath, 'status --porcelain=v1 --branch');
  const status = parsePorcelainStatus(response.stdout);
  steps.push({
    name,
    success: response.success,
    message: response.success ? 'Git status retrieved successfully from hook cwd' : response.error || response.stderr,
    data: { ...response, status }
  });

  if (!response.success) {
    throw new Error(`${name} failed: ${response.error || response.stderr || 'git status failed'}`);
  }

  return status;
}

async function countCommitsAhead(worktreePath: string, baseBranch: string, steps: StepResult[]): Promise<number | undefined> {
  const refsToTry = [baseBranch, `origin/${baseBranch}`];

  for (const baseRef of refsToTry) {
    const response = await runGit(worktreePath, `rev-list --count ${shellQuote(baseRef)}..HEAD`);
    if (response.success) {
      const count = Number(response.stdout.trim());
      steps.push({
        name: `Check commits ahead of ${baseRef}`,
        success: true,
        message: Number.isFinite(count) ? `${count} commits ahead of ${baseRef}` : response.stdout,
        data: response
      });
      return Number.isFinite(count) ? count : undefined;
    }

    steps.push({
      name: `Check commits ahead of ${baseRef}`,
      success: false,
      message: response.error || response.stderr,
      data: response
    });
  }

  return undefined;
}

async function readDiffStat(worktreePath: string, baseBranch: string, steps: StepResult[]): Promise<string | undefined> {
  const refsToTry = [`${baseBranch}...HEAD`, `origin/${baseBranch}...HEAD`, 'HEAD'];

  for (const ref of refsToTry) {
    const response = await runGit(worktreePath, `diff --stat ${shellQuote(ref)}`);
    if (response.success) {
      steps.push({
        name: `Read diff stat for ${ref}`,
        success: true,
        message: response.stdout || 'No diff stat output',
        data: response
      });
      return response.stdout || undefined;
    }

    steps.push({
      name: `Read diff stat for ${ref}`,
      success: false,
      message: response.error || response.stderr,
      data: response
    });
  }

  return undefined;
}

async function sendProgress(message: string): Promise<void> {
  try {
    debugLog('Sending progress message', { message });
    await codebolt.chat.sendMessage(message);
  } catch {
    // Chat progress is best-effort; ActionBlock completion carries the real result.
  }
}

async function runGitStep(name: string, operation: () => Promise<any>, steps: StepResult[]): Promise<any> {
  debugLog(`Starting step: ${name}`);
  const response = await operation();
  const error = getResponseError(response);
  steps.push({ name, success: !error, message: error || response?.message, data: response });
  if (error) throw new Error(`${name} failed: ${error}`);
  debugLog(`Finished step: ${name}`, response);
  return response;
}

async function pushBranch(worktreePath: string, branchName: string, steps: StepResult[]): Promise<void> {
  const upstreamPush = await runGit(worktreePath, `push -u origin ${shellQuote(branchName)}`);
  steps.push({
    name: 'Push branch with CodeBolt terminal API',
    success: upstreamPush.success,
    message: upstreamPush.success ? upstreamPush.stdout || 'Branch pushed with upstream' : upstreamPush.error || upstreamPush.stderr,
    data: upstreamPush
  });

  if (!upstreamPush.success) {
    throw new Error(`Push failed: ${upstreamPush.error || upstreamPush.stderr}`);
  }
}

async function getRemoteUrl(worktreePath: string, steps: StepResult[]): Promise<string | undefined> {
  const remote = await runGit(worktreePath, 'config --get remote.origin.url');
  steps.push({
    name: 'Read origin remote with CodeBolt terminal API',
    success: remote.success,
    message: remote.success ? remote.stdout : remote.error || remote.stderr,
    data: remote
  });
  return remote.success ? remote.stdout.trim() : undefined;
}

async function findGithubMcpTool(inputs: PullRequestInputs): Promise<{ toolbox: string; toolName: string } | undefined> {
  if (inputs.githubToolbox && inputs.githubToolName) {
    return { toolbox: inputs.githubToolbox, toolName: inputs.githubToolName };
  }

  try {
    const toolsResponse = await codebolt.mcp.getMcpTools(inputs.githubToolbox ? [inputs.githubToolbox] : undefined);
    const tools = Array.isArray((toolsResponse as any).tools) ? (toolsResponse as any).tools : [];
    for (const tool of tools) {
      const fullName = String(tool?.function?.name || tool?.name || '');
      if (!/github/i.test(fullName) && !inputs.githubToolbox) continue;
      if (!/(create[_-]?pull[_-]?request|create[_-]?pr)/i.test(fullName)) continue;

      const parts = fullName.split('--');
      if (parts.length >= 2) {
        return { toolbox: parts[0], toolName: parts.slice(1).join('--') };
      }
      return { toolbox: inputs.githubToolbox || 'github', toolName: fullName };
    }
  } catch {
    return undefined;
  }

  return undefined;
}

async function createGithubPrWithMcp(
  inputs: PullRequestInputs,
  repoInfo: { owner?: string; repo?: string; repository?: string },
  baseBranch: string,
  branchName: string,
  title: string,
  body: string,
  steps: StepResult[]
): Promise<{ created: boolean; url?: string; data?: any; error?: string }> {
  if (!repoInfo.owner || !repoInfo.repo) {
    return { created: false, error: 'GitHub repository owner/repo could not be determined' };
  }

  const tool = await findGithubMcpTool(inputs);
  if (!tool) {
    return { created: false, error: 'No GitHub MCP create pull request tool is configured' };
  }

  const params = {
    owner: repoInfo.owner,
    repo: repoInfo.repo,
    title,
    body,
    head: branchName,
    base: baseBranch,
    draft: inputs.draft === true
  };

  const response = await codebolt.mcp.executeTool(tool.toolbox, tool.toolName, params);
  const rawError = getResponseError(response) || (response?.status === 'error' ? response?.error || response?.result : undefined);
  const error = rawError ? String(rawError) : undefined;
  const responseText = typeof response?.result === 'string' ? response.result : JSON.stringify(response || {});
  const urlMatch = responseText.match(/https:\/\/github\.com\/[^\s)"']+\/pull\/\d+/);

  steps.push({
    name: `Create GitHub PR with ${tool.toolbox} MCP`,
    success: !error,
    message: error || urlMatch?.[0] || 'GitHub MCP pull request tool completed',
    data: response
  });

  return {
    created: !error,
    url: urlMatch?.[0],
    data: response,
    error
  };
}

async function createGithubPrWithGhCli(
  inputs: PullRequestInputs,
  worktreePath: string,
  baseBranch: string,
  branchName: string,
  title: string,
  body: string,
  steps: StepResult[]
): Promise<{ created: boolean; url?: string; error?: string; data?: any }> {
  if (inputs.allowGhCli === false) {
    return { created: false, error: 'gh CLI fallback disabled by input' };
  }

  const command = [
    'gh pr create',
    '--base', shellQuote(baseBranch),
    '--head', shellQuote(branchName),
    '--title', shellQuote(title),
    '--body', shellQuote(body)
  ].join(' ');

  const response = await runInWorktree(worktreePath, command);
  const urlMatch = response.stdout.match(/https:\/\/github\.com\/[^\s)"']+\/pull\/\d+/);

  steps.push({
    name: 'Create GitHub PR with gh via CodeBolt terminal API',
    success: response.success,
    message: response.success ? urlMatch?.[0] || response.stdout || 'gh pr create completed' : response.error || response.stderr,
    data: response
  });

  return {
    created: response.success,
    url: urlMatch?.[0],
    error: response.success ? undefined : response.error || response.stderr || 'gh pr create failed',
    data: response
  };
}

async function handleInvocation(threadContext: any, metadata: any): Promise<any> {
  const params = asObject(threadContext?.params);
  const inputs = params as PullRequestInputs;
  const hookInput = asObject(inputs.hookInput);
  const steps: StepResult[] = [];

  debugLog('ActionBlock invocation received', { params, metadata });
  await sendProgress('Create PR ActionBlock started');

  const worktreePath = resolveWorktreePath(inputs, hookInput);
  steps.push({
    name: 'Resolve hook worktree path',
    success: !!worktreePath,
    message: worktreePath ? `Using hook cwd: ${worktreePath}` : 'No hook cwd/worktree path was provided',
    data: {
      cwd: hookInput.cwd,
      workspace_root: hookInput.workspace_root,
      inputCwd: inputs.cwd,
      inputWorktreePath: inputs.worktreePath
    }
  });

  if (!worktreePath) {
    throw new Error('Could not determine worktree path from hook input cwd');
  }

  const initialStatus = await readGitStatus(worktreePath, steps, 'Read git status from hook cwd');
  const initialChangedFiles = changedFilesFromStatus(initialStatus);
  const currentBranch = statusCurrentBranch(initialStatus);
  const baseBranch = inferBaseBranch(inputs, initialStatus);
  let branchName = currentBranch;

  if (!currentBranch) {
    throw new Error('Could not determine current worktree branch from CodeBolt git status');
  }

  if (currentBranch === baseBranch) {
    const message = `Current worktree branch is the same as base branch ${baseBranch}; PR was not created.`;
    return {
      success: true,
      skipped: true,
      message,
      steps,
      hookSpecificOutput: {
        hookEventName: hookInput.hook_event_name,
        additionalContext: message
      }
    };
  }

  if (hasWorkingTreeChanges(initialStatus)) {
    const addResult = await runGit(worktreePath, 'add -A');
    steps.push({
      name: 'Stage files with CodeBolt terminal API',
      success: addResult.success,
      message: addResult.success ? 'Files staged successfully' : addResult.error || addResult.stderr,
      data: addResult
    });
    if (!addResult.success) throw new Error(`Stage files failed: ${addResult.error || addResult.stderr}`);

    const commitResult = await runGit(worktreePath, `commit -m ${shellQuote(makeCommitMessage(inputs, hookInput))}`);
    steps.push({
      name: 'Commit files with CodeBolt terminal API',
      success: commitResult.success,
      message: commitResult.success ? commitResult.stdout || 'Files committed successfully' : commitResult.error || commitResult.stderr,
      data: commitResult
    });
    if (!commitResult.success) throw new Error(`Commit failed: ${commitResult.error || commitResult.stderr}`);
  }

  const finalStatus = await readGitStatus(worktreePath, steps, 'Read final git status from hook cwd');
  branchName = statusCurrentBranch(finalStatus) || branchName;

  const commitsAhead = await countCommitsAhead(worktreePath, baseBranch, steps);
  if (commitsAhead === 0 && !hasWorkingTreeChanges(finalStatus)) {
    const message = `Current worktree branch ${branchName} has no commits or file changes ahead of ${baseBranch}; PR was not created.`;
    return {
      success: true,
      skipped: true,
      worktreePath,
      branchName,
      baseBranch,
      message,
      steps,
      hookSpecificOutput: {
        hookEventName: hookInput.hook_event_name,
        additionalContext: message
      }
    };
  }

  if (inputs.push !== false) {
    await pushBranch(worktreePath, branchName, steps);
  }

  const remoteUrl = await getRemoteUrl(worktreePath, steps);
  const repoInfo = normalizeRepository(inputs, remoteUrl);
  const diffStat = await readDiffStat(worktreePath, baseBranch, steps);
  const title = await generatePrTitleWithLlm(inputs, hookInput, branchName, baseBranch, initialChangedFiles, diffStat, steps);
  const body = makePrBody(inputs, hookInput, initialChangedFiles);
  const compareUrl = buildCompareUrl(repoInfo.repository, baseBranch, branchName);

  let pullRequest = {
    created: false,
    url: undefined as string | undefined,
    compareUrl,
    error: undefined as string | undefined,
    method: 'none'
  };

  if (inputs.createGithubPr !== false) {
    const mcpResult = await createGithubPrWithMcp(inputs, repoInfo, baseBranch, branchName, title, body, steps);
    if (mcpResult.created) {
      pullRequest = { created: true, url: mcpResult.url, compareUrl, error: undefined, method: 'github-mcp' };
    } else {
      const ghResult = await createGithubPrWithGhCli(inputs, worktreePath, baseBranch, branchName, title, body, steps);
      pullRequest = {
        created: ghResult.created,
        url: ghResult.url,
        compareUrl,
        error: ghResult.created ? undefined : ghResult.error || mcpResult.error,
        method: ghResult.created ? 'gh-cli' : 'compare-url'
      };
    }
  }

  const summaryLines = [
    pullRequest.created
      ? `GitHub pull request created: ${pullRequest.url || '(URL not returned)'}`
      : `Branch prepared for PR: ${branchName}`,
    compareUrl ? `Compare URL: ${compareUrl}` : '',
    pullRequest.error && !pullRequest.created ? `PR creation fallback reason: ${pullRequest.error}` : ''
  ].filter(Boolean);

  await sendProgress(summaryLines.join('\n'));

  return {
    success: pullRequest.created || !!compareUrl,
    worktreePath,
    branchName,
    baseBranch,
    changedFiles: initialChangedFiles,
    pullRequest,
    metadata,
    steps,
    hookSpecificOutput: {
      hookEventName: hookInput.hook_event_name,
      additionalContext: summaryLines.join('\n')
    }
  };
}

codebolt.onActionBlockInvocation(async (threadContext: any, metadata: any) => {
  try {
    return await handleInvocation(threadContext, metadata);
  } catch (error) {
    const message = `Create PR ActionBlock failed: ${(error as Error).message}`;
    await sendProgress(message);
    return {
      success: false,
      error: message,
      hookSpecificOutput: {
        hookEventName: threadContext?.params?.hookInput?.hook_event_name,
        additionalContext: message
      }
    };
  }
});

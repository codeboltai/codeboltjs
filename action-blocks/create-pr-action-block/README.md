# create-pr-action-block

Creates a GitHub pull request from the current local git worktree branch where the agent made changes.

The implementation uses CodeBoltJS APIs for the runtime work:

- `codebolt.terminal.executeCommand` for worktree-scoped `git -C <hook cwd> ...` commands
- `codebolt.llm.inference` to generate a meaningful PR title when `prTitle` is not provided
- `codebolt.mcp` to create the PR through a configured GitHub MCP tool
- `codebolt.terminal.executeCommand` for `gh pr create` fallback
- `codebolt.chat.sendMessage` for progress messages

## Hook Usage

Configure the hook handler with the ActionBlock id:

```json
{
  "type": "actionBlock",
  "actionBlockId": "create-pr-action-block",
  "inputs": {
    "baseBranch": "main",
    "repository": "owner/repo",
    "generatePrTitle": true
  }
}
```

The hook runner automatically passes `hookInput` into the ActionBlock.

## Inputs

- `baseBranch`: remote/base branch that the current worktree branch should target. Defaults to the tracked branch when it differs from the current branch, otherwise `main`.
- `commitMessage`: commit message for uncommitted changes.
- `prTitle`: explicit GitHub PR title. If omitted, the ActionBlock asks the configured CodeBolt LLM for a meaningful title.
- `generatePrTitle`: set `false` to disable LLM PR title generation and use a deterministic fallback.
- `prTitleLlmRole`: optional CodeBolt LLM role to use for PR title generation.
- `prBody`: GitHub PR body.
- `repository`: GitHub `owner/repo`. If omitted, the action block reads `remote.origin.url`.
- `githubToolbox`: optional GitHub MCP toolbox name.
- `githubToolName`: optional GitHub MCP create pull request tool name.
- `push`: set `false` to skip pushing.
- `createGithubPr`: set `false` to only prepare the branch and compare URL.
- `allowGhCli`: set `false` to disable `gh pr create` fallback.

## Behavior

1. Resolves the hook worktree from `hookInput.cwd`.
2. Reads git status with `git -C <hook cwd> status --porcelain=v1 --branch` through CodeBolt terminal API.
3. Uses the current local worktree branch as the PR head branch.
4. Fails early when the current branch is the same as the base branch.
5. Stages and commits uncommitted changes with worktree-scoped git commands.
6. Generates a meaningful PR title through `codebolt.llm.inference` unless `prTitle` is provided or `generatePrTitle` is false.
7. Pushes the current worktree branch to origin.
8. Creates a GitHub PR through a GitHub MCP create pull request tool when available.
9. Falls back to `gh pr create` through CodeBolt terminal API.
10. If no GitHub creation method is available, returns a GitHub compare URL.

## Output

The result includes:

```json
{
  "success": true,
  "branchName": "worktree-agent-branch",
  "baseBranch": "main",
  "changedFiles": ["src/example.ts"],
  "pullRequest": {
    "created": true,
    "url": "https://github.com/owner/repo/pull/123",
    "compareUrl": "https://github.com/owner/repo/compare/main...worktree-agent-branch?expand=1",
    "method": "github-mcp"
  }
}
```

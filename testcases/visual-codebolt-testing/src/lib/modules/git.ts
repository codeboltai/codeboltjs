import { CodeboltModule, param, fn } from './types';

export const gitModule: CodeboltModule = {
  name: 'git',
  displayName: 'Git',
  description: 'Git version control operations',
  category: 'version-control',
  functions: [
    fn('init', 'Initializes git repository', [
      param('path', 'string', true, 'Path to initialize'),
    ], 'InitResponse'),
    fn('pull', 'Pulls changes from remote', [], 'PullResponse'),
    fn('push', 'Pushes changes to remote', [], 'PushResponse'),
    fn('status', 'Gets repository status', [], 'StatusResponse'),
    fn('addAll', 'Stages all changes', [], 'AddResponse'),
    fn('commit', 'Commits staged changes', [
      param('message', 'string', true, 'Commit message'),
    ], 'CommitResponse'),
    fn('checkout', 'Checks out branch', [
      param('branch', 'string', true, 'Branch name'),
    ], 'CheckoutResponse'),
    fn('branch', 'Creates a new branch', [
      param('branch', 'string', true, 'Branch name'),
    ], 'BranchResponse'),
    fn('logs', 'Gets commit logs', [
      param('path', 'string', false, 'Path to get logs for'),
    ], 'LogsResponse'),
    fn('diff', 'Gets commit diff', [
      param('commitHash', 'string', true, 'Commit hash'),
    ], 'DiffResponse'),
    fn('clone', 'Clones a repository', [
      param('url', 'string', true, 'Repository URL'),
      param('path', 'string', false, 'Clone destination path'),
    ], 'CloneResponse'),
  ],
};

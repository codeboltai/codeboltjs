# Example Provider Implementations

Examples showing the provider pattern for different environment types.

## Table of Contents
- [Minimal Provider](#minimal-provider)
- [Docker Provider](#docker-provider)
- [Git Worktree Provider](#git-worktree-provider)
- [SSH Provider](#ssh-provider)
- [AWS EC2 Provider](#aws-ec2-provider)
- [WSL Provider](#wsl-provider)

---

## Minimal Provider

Simplest possible provider using local filesystem.

```typescript
import { BaseProvider } from '@codebolt/provider';
import codebolt from '@codebolt/codeboltjs';
import * as fs from 'fs/promises';
import * as path from 'path';

class MinimalProvider extends BaseProvider {
  private workDir: string | null = null;

  constructor() {
    super({ agentServerPort: 3001, transport: 'websocket' });
  }

  protected async setupEnvironment(initVars: ProviderInitVars): Promise<void> {
    this.workDir = `/tmp/codebolt-${initVars.environmentName}`;
    await fs.mkdir(this.workDir, { recursive: true });
    this.state.workspacePath = this.workDir;
  }

  protected async resolveProjectContext(initVars: ProviderInitVars): Promise<void> {
    this.state.projectPath = initVars.projectPath as string || process.cwd();
  }

  async onGetDiffFiles(): Promise<any> {
    return { files: [] };
  }

  protected async teardownEnvironment(): Promise<void> {
    if (this.workDir) {
      await fs.rm(this.workDir, { recursive: true, force: true });
    }
  }
}

const provider = new MinimalProvider();
codebolt.onProviderStart((v) => provider.onProviderStart(v));
codebolt.onProviderStop((v) => provider.onProviderStop(v));
```

---

## Docker Provider

Container-based isolated environment.

```typescript
import Docker from 'dockerode';

class DockerProvider extends BaseProvider {
  private docker = new Docker();
  private container: Docker.Container | null = null;
  private containerPort: number = 0;

  protected async setupEnvironment(initVars: ProviderInitVars): Promise<void> {
    const containerName = `codebolt-${initVars.environmentName}`;

    // Create container
    this.container = await this.docker.createContainer({
      Image: 'codebolt-executor:latest',
      name: containerName,
      Env: [
        `ENVIRONMENT_NAME=${initVars.environmentName}`,
        'AGENT_SERVER_PORT=3001',
      ],
      ExposedPorts: { '3001/tcp': {} },
      HostConfig: {
        Binds: initVars.projectPath
          ? [`${initVars.projectPath}:/workspace:rw`]
          : [],
        PortBindings: {
          '3001/tcp': [{ HostPort: '0' }],  // Dynamic port
        },
        AutoRemove: true,
      },
    });

    await this.container.start();

    // Get assigned port
    const info = await this.container.inspect();
    this.containerPort = parseInt(
      info.NetworkSettings.Ports['3001/tcp'][0].HostPort
    );

    // Update config to use container port
    (this.config as any).agentServerPort = this.containerPort;

    this.state.workspacePath = '/workspace';
  }

  protected async ensureAgentServer(): Promise<void> {
    // Agent server runs inside container, wait for it
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(
          `http://localhost:${this.containerPort}/health`
        );
        if (response.ok) return;
      } catch {}
      await new Promise(r => setTimeout(r, 1000));
    }
    throw new Error('Container agent server failed to start');
  }

  protected async teardownEnvironment(): Promise<void> {
    if (this.container) {
      try {
        await this.container.stop({ t: 10 });
      } catch {}
      try {
        await this.container.remove({ force: true });
      } catch {}
    }
  }

  async onGetDiffFiles(): Promise<any> {
    // Execute git diff inside container
    const exec = await this.container!.exec({
      Cmd: ['git', 'diff', '--name-status'],
      AttachStdout: true,
    });
    const stream = await exec.start({});
    // Parse output...
    return { files: [] };
  }
}
```

---

## Git Worktree Provider

Branch-based isolation using git worktrees.

```typescript
import { execAsync } from './utils';

class GitWorktreeProvider extends BaseProvider {
  private baseRepoPath: string = '';
  private worktreePath: string | null = null;
  private branchName: string | null = null;

  protected async resolveProjectContext(initVars: ProviderInitVars): Promise<void> {
    this.baseRepoPath = initVars.projectPath as string;
    this.state.projectPath = this.baseRepoPath;
  }

  protected async setupEnvironment(initVars: ProviderInitVars): Promise<void> {
    this.branchName = initVars.environmentName;
    this.worktreePath = path.join(
      path.dirname(this.baseRepoPath),
      '.worktrees',
      initVars.environmentName
    );

    // Create worktree with new branch
    await execAsync(
      `git worktree add -b "${this.branchName}" "${this.worktreePath}"`,
      { cwd: this.baseRepoPath }
    );

    this.state.workspacePath = this.worktreePath;
  }

  protected async teardownEnvironment(): Promise<void> {
    if (this.worktreePath) {
      // Remove worktree
      await execAsync(
        `git worktree remove --force "${this.worktreePath}"`,
        { cwd: this.baseRepoPath }
      );

      // Delete branch
      if (this.branchName) {
        await execAsync(
          `git branch -D "${this.branchName}"`,
          { cwd: this.baseRepoPath }
        ).catch(() => {});
      }
    }
  }

  async onGetDiffFiles(): Promise<any> {
    const { stdout } = await execAsync(
      'git diff --name-status HEAD',
      { cwd: this.worktreePath! }
    );

    const files = stdout.trim().split('\n')
      .filter(Boolean)
      .map(line => {
        const [status, ...pathParts] = line.split('\t');
        return { status, path: pathParts.join('\t') };
      });

    return { files, hasChanges: files.length > 0 };
  }
}
```

---

## SSH Provider

Remote server via SSH.

```typescript
import { Client as SSHClient } from 'ssh2';

class SSHProvider extends BaseProvider {
  private ssh: SSHClient | null = null;
  private remotePath: string | null = null;
  private localTunnelPort: number = 0;

  protected async setupEnvironment(initVars: ProviderInitVars): Promise<void> {
    const { host, username, privateKey } = initVars as any;

    // Connect via SSH
    this.ssh = new SSHClient();
    await new Promise<void>((resolve, reject) => {
      this.ssh!.on('ready', resolve);
      this.ssh!.on('error', reject);
      this.ssh!.connect({ host, username, privateKey });
    });

    // Create remote directory
    this.remotePath = `/tmp/codebolt-${initVars.environmentName}`;
    await this.sshExec(`mkdir -p ${this.remotePath}`);

    // Sync project files
    if (initVars.projectPath) {
      await this.rsync(
        initVars.projectPath as string,
        `${username}@${host}:${this.remotePath}`
      );
    }

    // Start agent server on remote
    await this.sshExec(
      `cd ${this.remotePath} && nohup node agent-server.js --port 3001 > /dev/null 2>&1 &`
    );

    // Set up SSH tunnel for local access
    this.localTunnelPort = await this.findFreePort();
    await this.setupTunnel(this.localTunnelPort, 3001);

    (this.config as any).agentServerPort = this.localTunnelPort;
    this.state.workspacePath = this.remotePath;
  }

  protected async teardownEnvironment(): Promise<void> {
    if (this.ssh) {
      // Kill remote agent server
      await this.sshExec('pkill -f agent-server.js').catch(() => {});

      // Clean up remote directory
      await this.sshExec(`rm -rf ${this.remotePath}`).catch(() => {});

      this.ssh.end();
    }
  }

  private async sshExec(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.ssh!.exec(command, (err, stream) => {
        if (err) return reject(err);
        let output = '';
        stream.on('data', (data: Buffer) => output += data.toString());
        stream.on('close', () => resolve(output));
      });
    });
  }
}
```

---

## AWS EC2 Provider

Cloud VM environment.

```typescript
import { EC2Client, RunInstancesCommand, TerminateInstancesCommand } from '@aws-sdk/client-ec2';

class EC2Provider extends BaseProvider {
  private ec2 = new EC2Client({});
  private instanceId: string | null = null;
  private publicIp: string | null = null;

  protected async setupEnvironment(initVars: ProviderInitVars): Promise<void> {
    // Launch EC2 instance
    const result = await this.ec2.send(new RunInstancesCommand({
      ImageId: 'ami-codebolt-executor',
      InstanceType: 't3.medium',
      MinCount: 1,
      MaxCount: 1,
      TagSpecifications: [{
        ResourceType: 'instance',
        Tags: [{ Key: 'Name', Value: `codebolt-${initVars.environmentName}` }],
      }],
      UserData: Buffer.from(`#!/bin/bash
        cd /opt/codebolt
        node agent-server.js --port 3001
      `).toString('base64'),
    }));

    this.instanceId = result.Instances![0].InstanceId!;

    // Wait for instance to be running
    await this.waitForInstance();

    // Get public IP
    this.publicIp = await this.getInstancePublicIp();

    // Update config to connect to EC2
    (this.config as any).agentServerHost = this.publicIp;
    this.state.workspacePath = '/opt/codebolt/workspace';
  }

  protected async teardownEnvironment(): Promise<void> {
    if (this.instanceId) {
      await this.ec2.send(new TerminateInstancesCommand({
        InstanceIds: [this.instanceId],
      }));
    }
  }
}
```

---

## WSL Provider

Windows Subsystem for Linux environment.

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

class WSLProvider extends BaseProvider {
  private distro: string = 'Ubuntu';
  private wslPath: string | null = null;

  protected async setupEnvironment(initVars: ProviderInitVars): Promise<void> {
    this.wslPath = `/tmp/codebolt-${initVars.environmentName}`;

    // Create directory in WSL
    await execAsync(`wsl -d ${this.distro} mkdir -p ${this.wslPath}`);

    // Copy project files to WSL
    if (initVars.projectPath) {
      const windowsPath = initVars.projectPath as string;
      const wslSourcePath = this.windowsToWslPath(windowsPath);
      await execAsync(
        `wsl -d ${this.distro} cp -r ${wslSourcePath}/* ${this.wslPath}/`
      );
    }

    // Start agent server in WSL
    await execAsync(
      `wsl -d ${this.distro} bash -c "cd ${this.wslPath} && nohup node agent-server.js --port 3001 > /dev/null 2>&1 &"`
    );

    this.state.workspacePath = this.wslPath;
  }

  protected async teardownEnvironment(): Promise<void> {
    if (this.wslPath) {
      // Kill agent server
      await execAsync(
        `wsl -d ${this.distro} pkill -f agent-server.js`
      ).catch(() => {});

      // Clean up directory
      await execAsync(
        `wsl -d ${this.distro} rm -rf ${this.wslPath}`
      ).catch(() => {});
    }
  }

  private windowsToWslPath(windowsPath: string): string {
    // Convert C:\Users\... to /mnt/c/Users/...
    return windowsPath
      .replace(/^([A-Z]):/i, (_, drive) => `/mnt/${drive.toLowerCase()}`)
      .replace(/\\/g, '/');
  }
}
```

---

## Key Patterns Summary

| Environment | setupEnvironment | teardownEnvironment | Agent Server |
|-------------|------------------|---------------------|--------------|
| Local | Create temp dir | Remove dir | Local process |
| Docker | Create container | Stop/remove container | Inside container |
| Git Worktree | Create worktree | Remove worktree | Local process |
| SSH | Connect + create remote dir | Clean remote + disconnect | On remote server |
| AWS EC2 | Launch instance | Terminate instance | On instance |
| WSL | Create WSL dir | Clean WSL dir | In WSL |

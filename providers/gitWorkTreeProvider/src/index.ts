
import codebolt from "@codebolt/codeboltjs"
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

// Import types
type DiffResult = {
    files: Array<{
        file: string;
        changes: number;
        insertions: number;
        deletions: number;
        binary: boolean;
        status?: 'added' | 'modified' | 'deleted' | 'renamed' | 'copied';
        oldFile?: string;
        diff?: string;
    }>;
    insertions: number;
    deletions: number;
    changed: number;
    rawDiff?: string;
};

// Promisify exec for async/await usage
const execAsync = promisify(exec);

// Store the created worktree path and branch for cleanup
let createdWorktreePath: string | null = null;
let createdWorktreeBranch: string | null = null;

// Register CodeBolt event handlers
console.log('[Git WorkTree Provider] Registering event handlers...');

/**
 * Provider start handler - onProviderStart
 */
codebolt.onProviderStart(onProviderStart);

/**
 * Provider agent start handler - starts agent loop with sandbox
 */
codebolt.onProviderAgentStart(onProviderAgentStart);

/**
 * Get diff files handler - uses sandbox git
 */
codebolt.onGetDiffFiles(onGetDiffFiles);

/**
 * Close signal handler - destroys sandbox
 */
codebolt.onCloseSignal(onCloseSignal);

/**
 * Create patch request handler
 */
codebolt.onCreatePatchRequest(onCreatePatchRequest);

/**
 * Create pull request handler
 */
codebolt.onCreatePullRequestRequest(onCreatePullRequestRequest);

async function onProviderStart(initvars: { environmentName: string }) {
    console.log('[Git WorkTree Provider] Starting provider with environment:', initvars.environmentName);

    let {projectPath} = await codebolt.project.getProjectPath();
    
    if (!projectPath) {
        throw new Error('Project path is not available');
    }
    
    try {
        // Create .worktree directory inside project if it doesn't exist
        const worktreeBaseDir = path.join(projectPath, '.worktree');
        if (!fs.existsSync(worktreeBaseDir)) {
            console.log('[Git WorkTree Provider] Creating .worktree directory at:', worktreeBaseDir);
            fs.mkdirSync(worktreeBaseDir, { recursive: true });
        }
        
        // Create worktree path inside .worktree folder
        const worktreePath = path.join(worktreeBaseDir, initvars.environmentName);
        console.log('[Git WorkTree Provider] Creating worktree at:', worktreePath);
        
        // Validate that we're in a git repository
        console.log('[Git WorkTree Provider] Validating git repository...');
        
        try {
            await execAsync('git rev-parse --git-dir', { 
                cwd: projectPath,
                timeout: 10000
            });
            console.log('[Git WorkTree Provider] Valid git repository found, proceeding...');
        } catch (error: any) {
            throw new Error('Not a valid git repository. Please initialize git first.');
        }
        
        // Create a branch name using just the environment name
        const worktreeBranch = initvars.environmentName;
        console.log('[Git WorkTree Provider] Creating worktree branch:', worktreeBranch);
        
        // Execute git worktree add command with new branch creation
        // This creates a new branch with the environment name and checks it out in the worktree
        const command = `git worktree add -b "${worktreeBranch}" "${worktreePath}"`;
        console.log('[Git WorkTree Provider] Executing command:', command);
        
        try {
            const { stdout, stderr } = await execAsync(command, { 
                cwd: projectPath,
                timeout: 30000 // 30 second timeout
            });
            
            console.log('[Git WorkTree Provider] Worktree created successfully at:', worktreePath);
            if (stdout) console.log('[Git WorkTree Provider] Command output:', stdout.trim());
            if (stderr) console.log('[Git WorkTree Provider] Command stderr:', stderr.trim());
            
            // Store the created worktree path and branch for cleanup
            createdWorktreePath = worktreePath;
            createdWorktreeBranch = worktreeBranch;
            
        } catch (error: any) {
            console.error('[Git WorkTree Provider] Failed to create worktree:', error.message);
            if (error.stdout) console.error('[Git WorkTree Provider] stdout:', error.stdout);
            if (error.stderr) console.error('[Git WorkTree Provider] stderr:', error.stderr);
            throw new Error(`Git worktree creation failed: ${error.message}`);
        }
        
        return {
            success: true,
            worktreePath: worktreePath,
            environmentName: initvars.environmentName
        };
        
    } catch (error) {
        console.error('[Git WorkTree Provider] Error during provider start:', error);
        throw error;
    }
}

function onProviderAgentStart(initvars: any) {
    throw new Error("Function not implemented.");
}


async function onGetDiffFiles(): Promise<DiffResult> {
    console.log('[Git WorkTree Provider] Getting diff files from worktree');
    
    try {
        // Get project path
        let {projectPath} = await codebolt.project.getProjectPath();
        
        if (!projectPath) {
            throw new Error('Project path is not available');
        }
        
        // Check if we have a created worktree
        if (!createdWorktreePath) {
            throw new Error('No worktree available - provider not initialized');
        }
        
        // Get git status from the worktree
        const statusCommand = 'git status --porcelain';
        console.log('[Git WorkTree Provider] Getting git status:', statusCommand);
        
        const { stdout: statusOutput } = await execAsync(statusCommand, {
            cwd: createdWorktreePath,
            timeout: 15000
        });
        
        // Get full diff from the worktree
        const diffCommand = 'git diff HEAD';
        console.log('[Git WorkTree Provider] Getting git diff:', diffCommand);
        
        const { stdout: rawDiff } = await execAsync(diffCommand, {
            cwd: createdWorktreePath,
            timeout: 15000
        });
        
        // Parse git status output
        const statusLines = statusOutput.trim().split('\n').filter(line => line.trim());
        const files = [];
        
        for (const line of statusLines) {
            if (!line.trim()) continue;
            
            const status = line.substring(0, 2);
            const filename = line.substring(3);
            
            // Determine file status
            let fileStatus: 'added' | 'modified' | 'deleted' | 'renamed' = 'modified';
            if (status.includes('A')) fileStatus = 'added';
            else if (status.includes('D')) fileStatus = 'deleted';
            else if (status.includes('R')) fileStatus = 'renamed';
            
            // Extract file-specific diff content
            const filePattern = new RegExp(
                `diff --git a/${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} b/${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?(?=(?:diff --git)|$)`,
                'g'
            );
            const fileDiffMatch = rawDiff.match(filePattern);
            const fileDiff = fileDiffMatch ? fileDiffMatch[0] : '';
            
            // Count insertions and deletions from diff
            const insertions = (fileDiff.match(/^\+(?!\+\+)/gm) || []).length;
            const deletions = (fileDiff.match(/^-(?!--)/gm) || []).length;
            
            files.push({
                file: filename,
                changes: insertions + deletions,
                insertions,
                deletions,
                binary: false, // TODO: Detect binary files
                status: fileStatus,
                diff: fileDiff
            });
        }
        
        const result = {
            files,
            insertions: files.reduce((sum, file) => sum + file.insertions, 0),
            deletions: files.reduce((sum, file) => sum + file.deletions, 0),
            changed: files.length,
            rawDiff
        };
        
        console.log('[Git WorkTree Provider] Found', result.changed, 'changed files');
        console.log('[Git WorkTree Provider] Total insertions:', result.insertions);
        console.log('[Git WorkTree Provider] Total deletions:', result.deletions);
        
        return result;
        
    } catch (error: any) {
        console.error('[Git WorkTree Provider] Error getting diff files:', error.message);
        if (error.stdout) console.error('[Git WorkTree Provider] stdout:', error.stdout);
        if (error.stderr) console.error('[Git WorkTree Provider] stderr:', error.stderr);
        throw new Error(`Failed to get diff files: ${error.message}`);
    }
}

async function onCloseSignal() {
    console.log('[Git WorkTree Provider] Received close signal, cleaning up worktree...');
    
    try {
        // Clean up the worktree we created, if any
        if (createdWorktreePath) {
            console.log('[Git WorkTree Provider] Removing worktree at:', createdWorktreePath);
            
            // Get project path for working directory
            let {projectPath} = await codebolt.project.getProjectPath();
            
            if (!projectPath) {
                console.error('[Git WorkTree Provider] Project path not available during cleanup');
                return;
            }
            
            try {
                const removeCommand = `git worktree remove "${createdWorktreePath}"`;
                const { stdout, stderr } = await execAsync(removeCommand, { 
                    cwd: projectPath,
                    timeout: 15000 // 15 second timeout for cleanup
                });
                
                console.log('[Git WorkTree Provider] Successfully removed worktree:', createdWorktreePath);
                if (stdout) console.log('[Git WorkTree Provider] Remove output:', stdout.trim());
                if (stderr) console.log('[Git WorkTree Provider] Remove stderr:', stderr.trim());
                
                // Also delete the created branch
                if (createdWorktreeBranch) {
                    try {
                        console.log('[Git WorkTree Provider] Deleting worktree branch:', createdWorktreeBranch);
                        const deleteBranchCommand = `git branch -D "${createdWorktreeBranch}"`;
                        const { stdout: branchStdout, stderr: branchStderr } = await execAsync(deleteBranchCommand, { 
                            cwd: projectPath,
                            timeout: 10000
                        });
                        
                        console.log('[Git WorkTree Provider] Successfully deleted branch:', createdWorktreeBranch);
                        if (branchStdout) console.log('[Git WorkTree Provider] Branch delete output:', branchStdout.trim());
                        if (branchStderr) console.log('[Git WorkTree Provider] Branch delete stderr:', branchStderr.trim());
                        
                    } catch (branchError: any) {
                        console.warn('[Git WorkTree Provider] Failed to delete branch:', createdWorktreeBranch, branchError.message);
                    }
                }
                
                createdWorktreePath = null;
                createdWorktreeBranch = null;
                
            } catch (error: any) {
                console.warn('[Git WorkTree Provider] Failed to remove worktree:', createdWorktreePath, error.message);
                
                // Try force removal if normal removal fails
                try {
                    const forceRemoveCommand = `git worktree remove --force "${createdWorktreePath}"`;
                    const { stdout, stderr } = await execAsync(forceRemoveCommand, { 
                        cwd: projectPath,
                        timeout: 15000 
                    });
                    
                    console.log('[Git WorkTree Provider] Force removed worktree:', createdWorktreePath);
                    if (stdout) console.log('[Git WorkTree Provider] Force remove output:', stdout.trim());
                    if (stderr) console.log('[Git WorkTree Provider] Force remove stderr:', stderr.trim());
                    
                    // Also delete the created branch after force removal
                    if (createdWorktreeBranch) {
                        try {
                            console.log('[Git WorkTree Provider] Force deleting worktree branch:', createdWorktreeBranch);
                            const deleteBranchCommand = `git branch -D "${createdWorktreeBranch}"`;
                            const { stdout: branchStdout, stderr: branchStderr } = await execAsync(deleteBranchCommand, { 
                                cwd: projectPath,
                                timeout: 10000
                            });
                            
                            console.log('[Git WorkTree Provider] Successfully force deleted branch:', createdWorktreeBranch);
                            if (branchStdout) console.log('[Git WorkTree Provider] Force branch delete output:', branchStdout.trim());
                            if (branchStderr) console.log('[Git WorkTree Provider] Force branch delete stderr:', branchStderr.trim());
                            
                        } catch (branchError: any) {
                            console.warn('[Git WorkTree Provider] Failed to force delete branch:', createdWorktreeBranch, branchError.message);
                        }
                    }
                    
                    createdWorktreePath = null;
                    createdWorktreeBranch = null;
                    
                } catch (forceError: any) {
                    console.error('[Git WorkTree Provider] Failed to force remove worktree:', forceError.message);
                    if (forceError.stdout) console.error('[Git WorkTree Provider] Force stdout:', forceError.stdout);
                    if (forceError.stderr) console.error('[Git WorkTree Provider] Force stderr:', forceError.stderr);
                }
            }
        } else {
            console.log('[Git WorkTree Provider] No worktree to clean up');
        }
        
    } catch (error) {
        console.error('[Git WorkTree Provider] Error during cleanup:', error);
        // Don't throw error during cleanup to avoid blocking shutdown
    }
}

function onCreatePatchRequest() {
    throw new Error("Function not implemented.");
}

function onCreatePullRequestRequest() {
    throw new Error("Function not implemented.");
}


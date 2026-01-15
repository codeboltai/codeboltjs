/**
 * Execute Command Utility - Executes shell commands
 */

/**
 * Parameters for the ExecuteCommand utility
 */
export interface ExecuteCommandParams {
    /**
     * The shell command to execute
     */
    command: string;
}

/**
 * Executes a shell command with the provided parameters
 */
export async function executeCommand(
    params: ExecuteCommandParams
): Promise<{ llmContent: string; returnDisplay: string; error?: any }> {
    try {
        // Execute command using node:child_process
        const { spawn } = await import('node:child_process');
        
        // Split command into executable and arguments
        const [executable, ...args] = params.command.split(' ');
        
        return new Promise((resolve) => {
            const child = spawn(executable, args, {
                cwd: process.cwd(),
                env: process.env,
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true
            });
            
            let stdout = '';
            let stderr = '';
            
            child.stdout?.on('data', (data) => {
                stdout += data.toString();
            });
            
            child.stderr?.on('data', (data) => {
                stderr += data.toString();
            });
            
            child.on('close', (code) => {
                if (code === 0) {
                    resolve({
                        llmContent: stdout || 'Command executed successfully',
                        returnDisplay: stdout || 'Command executed successfully'
                    });
                } else {
                    resolve({
                        llmContent: '',
                        returnDisplay: '',
                        error: {
                            type: 'SHELL_EXECUTE_ERROR',
                            message: stderr || `Command failed with exit code ${code}`
                        }
                    });
                }
            });
            
            child.on('error', (error) => {
                resolve({
                    llmContent: '',
                    returnDisplay: '',
                    error: {
                        type: 'SHELL_EXECUTE_ERROR',
                        message: `Failed to execute command: ${error.message}`
                    }
                });
            });
        });
    } catch (error) {
        return {
            llmContent: '',
            returnDisplay: '',
            error: {
                type: 'SHELL_EXECUTE_ERROR',
                message: `Failed to execute command: ${error instanceof Error ? error.message : String(error)}`
            }
        };
    }
}
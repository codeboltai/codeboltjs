import { ProcessedMessage, PostToolCallProcessorInput, PostToolCallProcessorOutput, ToolResult } from "@codebolt/types/agent";
import { BasePostToolCallProcessor } from "../base";
import { MessageObject } from "@codebolt/types/sdk";
import { exec } from 'child_process';
import { promisify } from 'util';

export interface ShellProcessorOptions {
    enableShellExecution?: boolean;
    maxExecutionTime?: number;
    allowedCommands?: string[];
    blockedCommands?: string[];
    workingDirectory?: string;
}

export class ShellProcessorModifier extends BasePostToolCallProcessor {
    private readonly options: ShellProcessorOptions;
    private readonly execAsync = promisify(exec);
    private readonly SHELL_TRIGGER = '!{';
    private readonly SHELL_CLOSE = '}';
    private readonly ARGS_PLACEHOLDER = '{{args}}';

    constructor(options: ShellProcessorOptions = {}){
        super()
        this.options = {
            enableShellExecution: options.enableShellExecution || false, // Disabled by default for security
            maxExecutionTime: options.maxExecutionTime || 10000, // 10 seconds
            allowedCommands: options.allowedCommands || ['ls', 'pwd', 'echo', 'cat', 'head', 'tail', 'grep', 'find', 'wc'],
            blockedCommands: options.blockedCommands || ['rm', 'del', 'format', 'sudo', 'su', 'chmod', 'chown', 'kill', 'killall'],
            workingDirectory: options.workingDirectory || process.cwd()
        };
    }

    async modify(input: PostToolCallProcessorInput): Promise<PostToolCallProcessorOutput> {
        try {
            const { nextPrompt, toolResults } = input;

            // Process shell commands in tool results if they exist
            let processedNextPrompt = nextPrompt;
            let shouldExit = false;

            if (toolResults && toolResults.length > 0) {
                // Look for shell-related tool results or commands in the content
                const shellResults = toolResults.filter(result => 
                    // Check if the tool call ID suggests it's a shell command
                    (result.tool_call_id && (
                        result.tool_call_id.includes('run_terminal_cmd') || 
                        result.tool_call_id.includes('shell')
                    )) ||
                    // Check if content contains shell triggers or placeholders
                    (result.content && typeof result.content === 'string' && 
                     (result.content.includes(this.SHELL_TRIGGER) || result.content.includes(this.ARGS_PLACEHOLDER)))
                );

                if (shellResults.length > 0) {
                    processedNextPrompt = await this.processShellInToolResults(nextPrompt, shellResults);
                }
            }

            // Also process any shell injections in the next prompt messages
            const updatedMessages: MessageObject[] = [];
            let contentModified = false;

            for (const message of processedNextPrompt.message.messages) {
                if (typeof message.content === 'string') {
                    let processedContent = message.content;
                    
                    // Replace {{args}} placeholders if metadata has args
                    const args = processedNextPrompt.metadata?.['args'] as string || '';
                    if (processedContent.includes(this.ARGS_PLACEHOLDER)) {
                        processedContent = processedContent.replace(
                            new RegExp(this.escapeRegex(this.ARGS_PLACEHOLDER), 'g'), 
                            args
                        );
                        contentModified = true;
                    }
                    
                    // Process shell injections if enabled
                    if (this.options.enableShellExecution && processedContent.includes(this.SHELL_TRIGGER)) {
                        processedContent = await this.processShellInjections(processedContent, args);
                        contentModified = true;
                    }

                    updatedMessages.push({
                        ...message,
                        content: processedContent
                    });
                } else {
                    updatedMessages.push(message);
                }
            }

            if (contentModified) {
                processedNextPrompt = {
                    message: {
                        ...processedNextPrompt.message,
                        messages: updatedMessages
                    },
                    metadata: {
                        ...processedNextPrompt.metadata,
                        shellProcessed: true,
                        argsReplaced: true
                    }
                };
            }

            return {
                nextPrompt: processedNextPrompt,
                shouldExit
            };
        } catch (error) {
            console.error('Error in ShellProcessorModifier:', error);
            return {
                nextPrompt: input.nextPrompt,
                shouldExit: false
            };
        }
    }

    private async processShellInToolResults(nextPrompt: ProcessedMessage, shellResults: ToolResult[]): Promise<ProcessedMessage> {
        // Process shell commands found in tool results
        let processedPrompt = nextPrompt;
        
        for (const result of shellResults) {
            if (result.content && typeof result.content === 'string') {
                const args = processedPrompt.metadata?.['args'] as string || '';
                
                // Process any shell injections in the tool result content
                if (result.content.includes(this.SHELL_TRIGGER)) {
                    const processedContent = await this.processShellInjections(result.content, args);
                    
                    // Add the processed result as a system message
                    const systemMessage: MessageObject = {
                        role: 'system',
                        content: `[Shell Tool Result]: ${processedContent}`
                    };

                    processedPrompt = {
                        message: {
                            ...processedPrompt.message,
                            messages: [...processedPrompt.message.messages, systemMessage]
                        },
                        metadata: {
                            ...processedPrompt.metadata,
                            shellToolResultsProcessed: true
                        }
                    };
                }
            }
        }
        
        return processedPrompt;
    }

    private async processShellInjections(content: string, args: string): Promise<string> {
        let processedContent = content;
        const injections = this.extractShellInjections(content);

        // Process injections in reverse order to maintain correct indices
        for (let i = injections.length - 1; i >= 0; i--) {
            const injection = injections[i];
            if (!injection) continue;

            try {
                // Replace {{args}} in the command with shell-escaped args
                const command = injection.command.replace(new RegExp(this.escapeRegex(this.ARGS_PLACEHOLDER), 'g'), this.escapeShellArg(args));

                // Validate and execute command
                this.validateCommand(command);
                const result = await this.executeCommand(command);

                const replacement = result;

                processedContent = processedContent.substring(0, injection.startIndex) +
                                replacement +
                                processedContent.substring(injection.endIndex);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                const replacement = `[Shell command error: ${errorMessage}]`;

                processedContent = processedContent.substring(0, injection.startIndex) +
                                replacement +
                                processedContent.substring(injection.endIndex);
            }
        }

        return processedContent;
    }

    private extractShellInjections(content: string): Array<{startIndex: number, endIndex: number, command: string}> {
        const injections: Array<{startIndex: number, endIndex: number, command: string}> = [];
        let searchIndex = 0;

        while (true) {
            const startIndex = content.indexOf(this.SHELL_TRIGGER, searchIndex);
            if (startIndex === -1) break;

            const contentStart = startIndex + this.SHELL_TRIGGER.length;
            const endIndex = content.indexOf(this.SHELL_CLOSE, contentStart);
            
            if (endIndex === -1) {
                // No closing brace found, skip this occurrence
                searchIndex = contentStart;
                continue;
            }

            const command = content.substring(contentStart, endIndex).trim();
            
            if (command.length > 0) {
                injections.push({
                    startIndex,
                    endIndex: endIndex + this.SHELL_CLOSE.length,
                    command
                });
            }

            searchIndex = endIndex + this.SHELL_CLOSE.length;
        }

        return injections;
    }

    private validateCommand(command: string): void {
        if (!this.options.enableShellExecution) {
            throw new Error('Shell execution is disabled');
        }

        // Extract the base command (first word)
        const baseCommand = command.trim().split(/\s+/)[0] ?? '';

        // Check blocked commands
        if (this.options.blockedCommands!.some(blocked => baseCommand.includes(blocked))) {
            throw new Error(`Command '${baseCommand}' is blocked for security reasons`);
        }

        // Check allowed commands (if allowlist is defined)
        if (this.options.allowedCommands!.length > 0 &&
            !this.options.allowedCommands!.some(allowed => baseCommand.includes(allowed))) {
            throw new Error(`Command '${baseCommand}' is not in the allowed commands list`);
        }

        // Additional security checks
        if (command.includes('&&') || command.includes('||') || command.includes(';') || command.includes('|')) {
            throw new Error('Command chaining and piping are not allowed');
        }
    }

    private async executeCommand(command: string): Promise<string> {
        try {
            const { stdout, stderr } = await this.execAsync(command, {
                cwd: this.options.workingDirectory,
                timeout: this.options.maxExecutionTime,
                maxBuffer: 1024 * 1024 // 1MB buffer
            });

            let result = stdout;
            if (stderr) {
                result += `\n[stderr]: ${stderr}`;
            }

            return result || '[Command executed successfully with no output]';
        } catch (error: any) {
            if (error.killed && error.signal === 'SIGTERM') {
                throw new Error(`Command timed out after ${this.options.maxExecutionTime}ms`);
            }
            throw new Error(`Command failed: ${error.message}`);
        }
    }

    private escapeShellArg(arg: string): string {
        // Basic shell escaping - in production, use a proper shell escaping library
        return `"${arg.replace(/"/g, '\\"')}"`;
    }

    private escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

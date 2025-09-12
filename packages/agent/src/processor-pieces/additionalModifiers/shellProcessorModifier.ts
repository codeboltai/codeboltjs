import { ProcessedMessage } from "@codebolt/types/agent";
import { BaseMessageModifier } from "../base";
import { FlatUserMessage, MessageObject } from "@codebolt/types/sdk";
import { exec } from 'child_process';
import { promisify } from 'util';

export interface ShellProcessorOptions {
    enableShellExecution?: boolean;
    maxExecutionTime?: number;
    allowedCommands?: string[];
    blockedCommands?: string[];
    workingDirectory?: string;
}

export class ShellProcessorModifier extends BaseMessageModifier {
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

    async modify(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage> {
        try {
            // Get the user message content to process
            const userMessage = createdMessage.message.messages.find(msg => msg.role === 'user');
            if (!userMessage || typeof userMessage.content !== 'string') {
                return createdMessage;
            }

            const content = userMessage.content;
            const args = createdMessage.metadata?.args as string || '';
            
            // First, replace {{args}} placeholders
            let processedContent = content.replace(new RegExp(this.escapeRegex(this.ARGS_PLACEHOLDER), 'g'), args);
            
            // Then process shell injections if enabled
            if (this.options.enableShellExecution && processedContent.includes(this.SHELL_TRIGGER)) {
                processedContent = await this.processShellInjections(processedContent, args);
            }

            // If content was modified, update the message
            if (processedContent !== content) {
                const updatedMessages = createdMessage.message.messages.map(msg => {
                    if (msg.role === 'user' && typeof msg.content === 'string' && msg.content === content) {
                        return {
                            ...msg,
                            content: processedContent
                        };
                    }
                    return msg;
                });

                return Promise.resolve({
                    message: {
                        ...createdMessage.message,
                        messages: updatedMessages
                    },
                    metadata: {
                        ...createdMessage.metadata,
                        shellProcessed: true,
                        argsReplaced: content.includes(this.ARGS_PLACEHOLDER)
                    }
                });
            }

            return createdMessage;
        } catch (error) {
            console.error('Error in ShellProcessorModifier:', error);
            return createdMessage;
        }
    }

    private async processShellInjections(content: string, args: string): Promise<string> {
        let processedContent = content;
        const injections = this.extractShellInjections(content);

        // Process injections in reverse order to maintain correct indices
        for (let i = injections.length - 1; i >= 0; i--) {
            const injection = injections[i];
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
        const baseCommand = command.trim().split(/\s+/)[0];
        
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

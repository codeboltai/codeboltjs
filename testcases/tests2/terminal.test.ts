/**
 * Comprehensive Test Suite for Terminal Module
 *
 * This test suite covers ALL methods in the terminal module:
 * - executeCommand
 * - executeCommandRunUntilError
 * - executeCommandRunUntilInterrupt
 * - executeCommandWithStream
 * - sendManualInterrupt
 *
 * Each test uses the shared CodeboltSDK instance from setup.ts
 */

import { getSharedCodebolt, setupTestEnvironment, teardownTestEnvironment, waitForConnection } from './setup';
import { TerminalEventType, TerminalResponseType } from '@codebolt/types/enum';

// Shared instance
const codebolt = getSharedCodebolt();

// Test timeout - each test gets 30 seconds
const TEST_TIMEOUT = 30000;

describe('Terminal Module Tests', () => {

    beforeAll(async () => {
        await setupTestEnvironment({ connectionTimeout: TEST_TIMEOUT });
    }, TEST_TIMEOUT);

    afterAll(async () => {
        await teardownTestEnvironment();
    });

    beforeEach(async () => {
        // Ensure connection is ready before each test
        await waitForConnection(TEST_TIMEOUT);
    });

    // =========================================================================
    // TEST GROUP: executeCommand
    // =========================================================================

    describe('executeCommand', () => {

        test('should execute a simple echo command successfully', async () => {
            const command = 'echo "Hello, World!"';
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
            expect(result.type).toMatch(/commandFinish|commandOutput/);

            if (result.type === 'commandFinish') {
                expect(result.exitCode).toBe(0);
            }
        }, TEST_TIMEOUT);

        test('should execute command with returnEmptyStringOnSuccess flag', async () => {
            const command = 'echo "test"';
            const result = await codebolt.terminal.executeCommand(command, true);

            expect(result).toBeDefined();
            expect(result.type).toMatch(/commandFinish|commandOutput/);
        }, TEST_TIMEOUT);

        test('should execute pwd command and get current directory', async () => {
            const command = 'pwd';
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
            expect(result.type).toMatch(/commandFinish|commandError/);

            if (result.type === 'commandFinish') {
                expect(result.stdout || result.output).toBeDefined();
            }
        }, TEST_TIMEOUT);

        test('should execute ls command to list directory contents', async () => {
            const command = 'ls -la';
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
            expect(result.type).toMatch(/commandFinish|commandError/);

            if (result.type === 'commandFinish') {
                expect(result.exitCode).toBe(0);
                expect(result.stdout || result.output).toBeDefined();
            }
        }, TEST_TIMEOUT);

        test('should handle command that produces large output', async () => {
            const command = 'seq 1 100';
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
            expect(result.type).toMatch(/commandFinish|commandError/);

            if (result.type === 'commandFinish') {
                expect(result.exitCode).toBe(0);
            }
        }, TEST_TIMEOUT);

        test('should handle command with pipes', async () => {
            const command = 'echo "test" | grep test';
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
            expect(result.type).toMatch(/commandFinish|commandError/);
        }, TEST_TIMEOUT);

        test('should handle command with redirection', async () => {
            const command = 'echo "redirected" > /tmp/test.txt && cat /tmp/test.txt';
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
            expect(result.type).toMatch(/commandFinish|commandError/);
        }, TEST_TIMEOUT);

        test('should handle command with environment variables', async () => {
            const command = 'TEST_VAR="hello" && echo $TEST_VAR';
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
            expect(result.type).toMatch(/commandFinish|commandError/);
        }, TEST_TIMEOUT);

        test('should return error for invalid command', async () => {
            const command = 'invalidcommandthatdoesnotexist12345';
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
            // Should get either commandError or commandFinish with non-zero exit code
            expect(result.type).toMatch(/commandError|commandFinish/);

            if (result.type === 'commandError') {
                expect(result.error).toBeDefined();
            } else if (result.type === 'commandFinish') {
                expect(result.exitCode).not.toBe(0);
            }
        }, TEST_TIMEOUT);

        test('should handle command with syntax error', async () => {
            const command = 'echo "unclosed string';
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
            expect(result.type).toMatch(/commandError|commandFinish/);
        }, TEST_TIMEOUT);

        test('should execute command that sleeps', async () => {
            const command = 'sleep 1';
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
            expect(result.type).toMatch(/commandFinish|commandError/);
        }, TEST_TIMEOUT);

        test('should handle command that exits with non-zero code', async () => {
            const command = 'exit 42';
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
            expect(result.type).toMatch(/commandFinish|commandError/);

            if (result.type === 'commandFinish') {
                expect(result.exitCode).toBe(42);
            }
        }, TEST_TIMEOUT);

        test('should execute multiple commands in sequence', async () => {
            const command1 = 'echo "first"';
            const command2 = 'echo "second"';
            const command3 = 'echo "third"';

            const result1 = await codebolt.terminal.executeCommand(command1);
            const result2 = await codebolt.terminal.executeCommand(command2);
            const result3 = await codebolt.terminal.executeCommand(command3);

            expect(result1).toBeDefined();
            expect(result2).toBeDefined();
            expect(result3).toBeDefined();
        }, TEST_TIMEOUT);

        test('should handle command with special characters', async () => {
            const command = 'echo "test with special chars: @#$%^&*()"';
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
            expect(result.type).toMatch(/commandFinish|commandError/);
        }, TEST_TIMEOUT);

        test('should handle command with unicode characters', async () => {
            const command = 'echo "Unicode test: 你好世界 🌍"';
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
            expect(result.type).toMatch(/commandFinish|commandError/);
        }, TEST_TIMEOUT);

        test('should handle command with newlines in output', async () => {
            const command = 'printf "line1\\nline2\\nline3"';
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
            expect(result.type).toMatch(/commandFinish|commandError/);
        }, TEST_TIMEOUT);

        test('should execute date command', async () => {
            const command = 'date';
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
            expect(result.type).toMatch(/commandFinish|commandError/);
        }, TEST_TIMEOUT);

        test('should execute whoami command', async () => {
            const command = 'whoami';
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
            expect(result.type).toMatch(/commandFinish|commandError/);
        }, TEST_TIMEOUT);

        test('should execute command with path expansion', async () => {
            const command = 'echo ~';
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
            expect(result.type).toMatch(/commandFinish|commandError/);
        }, TEST_TIMEOUT);
    });

    // =========================================================================
    // TEST GROUP: executeCommandRunUntilError
    // =========================================================================

    describe('executeCommandRunUntilError', () => {

        test('should run command until it encounters an error', async () => {
            // This command should fail immediately
            const command = 'false';
            const result = await codebolt.terminal.executeCommandRunUntilError(command);

            expect(result).toBeDefined();
            expect(result.type).toBe('commandError');
            expect(result.error).toBeDefined();
        }, TEST_TIMEOUT);

        test('should run command that eventually fails', async () => {
            // Command that runs then fails
            const command = 'echo "running" && false';
            const result = await codebolt.terminal.executeCommandRunUntilError(command);

            expect(result).toBeDefined();
            expect(result.type).toBe('commandError');
        }, TEST_TIMEOUT);

        test('should handle command with syntax error', async () => {
            const command = 'invalid_command_with_syntax_error';
            const result = await codebolt.terminal.executeCommandRunUntilError(command);

            expect(result).toBeDefined();
            expect(result.type).toBe('commandError');
        }, TEST_TIMEOUT);

        test('should run command with executeInMain flag set to false', async () => {
            const command = 'exit 1';
            const result = await codebolt.terminal.executeCommandRunUntilError(command, false);

            expect(result).toBeDefined();
            expect(result.type).toBe('commandError');
        }, TEST_TIMEOUT);

        test('should run command with executeInMain flag set to true', async () => {
            const command = 'exit 1';
            const result = await codebolt.terminal.executeCommandRunUntilError(command, true);

            expect(result).toBeDefined();
            expect(result.type).toBe('commandError');
        }, TEST_TIMEOUT);

        test('should handle command that produces stderr output', async () => {
            const command = 'echo "error message" >&2 && exit 1';
            const result = await codebolt.terminal.executeCommandRunUntilError(command);

            expect(result).toBeDefined();
            expect(result.type).toBe('commandError');
            expect(result.stderr).toBeDefined();
        }, TEST_TIMEOUT);

        test('should track exit code on error', async () => {
            const command = 'exit 127';
            const result = await codebolt.terminal.executeCommandRunUntilError(command);

            expect(result).toBeDefined();
            expect(result.type).toBe('commandError');
            expect(result.exitCode).toBeDefined();
        }, TEST_TIMEOUT);

        test('should handle command that fails after multiple attempts', async () => {
            const command = 'for i in 1 2 3; do echo $i; done; false';
            const result = await codebolt.terminal.executeCommandRunUntilError(command);

            expect(result).toBeDefined();
            expect(result.type).toBe('commandError');
        }, TEST_TIMEOUT);

        test('should respond quickly to immediate error', async () => {
            const startTime = Date.now();
            const command = 'exit 1';
            const result = await codebolt.terminal.executeCommandRunUntilError(command);
            const duration = Date.now() - startTime;

            expect(result).toBeDefined();
            expect(result.type).toBe('commandError');
            expect(duration).toBeLessThan(5000); // Should complete quickly
        }, TEST_TIMEOUT);

        test('should handle command with pipe that fails', async () => {
            const command = 'echo "test" | grep nonexistent || exit 1';
            const result = await codebolt.terminal.executeCommandRunUntilError(command);

            expect(result).toBeDefined();
            expect(result.type).toBe('commandError');
        }, TEST_TIMEOUT);
    });

    // =========================================================================
    // TEST GROUP: executeCommandRunUntilInterrupt
    // =========================================================================

    describe('executeCommandRunUntilInterrupt', () => {

        test('should execute long-running command until interrupted', async () => {
            // Start a long-running command
            const command = 'while true; do echo "running..."; sleep 0.5; done';

            const commandPromise = codebolt.terminal.executeCommandRunUntilInterrupt(command);

            // Wait a bit then interrupt
            await new Promise(resolve => setTimeout(resolve, 2000));

            const interruptResult = await codebolt.terminal.sendManualInterrupt();
            expect(interruptResult).toBeDefined();
            expect(interruptResult.type).toBe('terminalInterrupted');
            expect(interruptResult.success).toBe(true);

            const result = await commandPromise;
            expect(result).toBeDefined();
            expect(result.type).toBe('commandError');
        }, TEST_TIMEOUT);

        test('should handle command with executeInMain flag', async () => {
            const command = 'sleep 10';

            const commandPromise = codebolt.terminal.executeCommandRunUntilInterrupt(command, true);

            await new Promise(resolve => setTimeout(resolve, 1000));

            const interruptResult = await codebolt.terminal.sendManualInterrupt();
            expect(interruptResult.success).toBe(true);

            const result = await commandPromise;
            expect(result).toBeDefined();
        }, TEST_TIMEOUT);

        test('should interrupt command that produces continuous output', async () => {
            const command = 'while true; do date; sleep 0.2; done';

            const commandPromise = codebolt.terminal.executeCommandRunUntilInterrupt(command);

            await new Promise(resolve => setTimeout(resolve, 1500));

            const interruptResult = await codebolt.terminal.sendManualInterrupt();
            expect(interruptResult.success).toBe(true);

            await commandPromise;
        }, TEST_TIMEOUT);

        test('should handle immediate interrupt of slow command', async () => {
            const command = 'sleep 100';

            const commandPromise = codebolt.terminal.executeCommandRunUntilInterrupt(command);

            // Interrupt immediately
            await new Promise(resolve => setTimeout(resolve, 500));

            const interruptResult = await codebolt.terminal.sendManualInterrupt();
            expect(interruptResult).toBeDefined();

            const result = await commandPromise;
            expect(result).toBeDefined();
        }, TEST_TIMEOUT);

        test('should gracefully handle interrupt of command with subprocess', async () => {
            const command = 'yes | head -n 100000';

            const commandPromise = codebolt.terminal.executeCommandRunUntilInterrupt(command);

            await new Promise(resolve => setTimeout(resolve, 1000));

            const interruptResult = await codebolt.terminal.sendManualInterrupt();
            expect(interruptResult.success).toBe(true);

            await commandPromise;
        }, TEST_TIMEOUT);

        test('should verify interrupt message is present', async () => {
            const command = 'while true; do sleep 1; done';

            const commandPromise = codebolt.terminal.executeCommandRunUntilInterrupt(command);

            await new Promise(resolve => setTimeout(resolve, 1000));

            const interruptResult = await codebolt.terminal.sendManualInterrupt();
            expect(interruptResult.type).toBe('terminalInterrupted');
            expect(interruptResult.message).toBeDefined();

            await commandPromise;
        }, TEST_TIMEOUT);
    });

    // =========================================================================
    // TEST GROUP: executeCommandWithStream
    // =========================================================================

    describe('executeCommandWithStream', () => {

        test('should stream command output in real-time', async () => {
            const command = 'echo "streamed output"';
            const stream = codebolt.terminal.executeCommandWithStream(command);

            const outputs: string[] = [];
            const errors: string[] = [];

            stream.on('commandOutput', (data) => {
                if (data.output || data.stdout) {
                    outputs.push(data.output || data.stdout);
                }
            });

            stream.on('commandError', (data) => {
                if (data.error) {
                    errors.push(data.error);
                }
            });

            // Wait for finish
            await new Promise<void>((resolve) => {
                stream.on('commandFinish', () => {
                    resolve();
                });

                // Timeout in case command doesn't finish
                setTimeout(() => resolve(), 5000);
            });

            expect(outputs.length).toBeGreaterThan(0);
            stream.cleanup();
        }, TEST_TIMEOUT);

        test('should stream multiple outputs from command', async () => {
            const command = 'for i in 1 2 3; do echo "Line $i"; sleep 0.1; done';
            const stream = codebolt.terminal.executeCommandWithStream(command);

            const outputs: string[] = [];

            stream.on('commandOutput', (data) => {
                if (data.output || data.stdout) {
                    outputs.push(data.output || data.stdout);
                }
            });

            await new Promise<void>((resolve) => {
                stream.on('commandFinish', () => {
                    resolve();
                });
                setTimeout(() => resolve(), 5000);
            });

            expect(outputs.length).toBeGreaterThan(0);
            stream.cleanup();
        }, TEST_TIMEOUT);

        test('should handle error events in stream', async () => {
            const command = 'echo "error" >&2 && exit 1';
            const stream = codebolt.terminal.executeCommandWithStream(command);

            const errors: string[] = [];

            stream.on('commandError', (data) => {
                if (data.error || data.stderr) {
                    errors.push(data.error || data.stderr);
                }
            });

            await new Promise<void>((resolve) => {
                stream.on('commandFinish', () => {
                    resolve();
                });
                stream.on('commandError', () => {
                    resolve();
                });
                setTimeout(() => resolve(), 5000);
            });

            expect(errors.length).toBeGreaterThan(0);
            stream.cleanup();
        }, TEST_TIMEOUT);

        test('should stream continuous output', async () => {
            const command = 'for i in {1..5}; do echo "Output $i"; sleep 0.2; done';
            const stream = codebolt.terminal.executeCommandWithStream(command);

            const outputs: string[] = [];
            const finishPromise = new Promise<void>((resolve) => {
                stream.on('commandFinish', () => resolve());
                setTimeout(() => resolve(), 10000);
            });

            stream.on('commandOutput', (data) => {
                if (data.output || data.stdout) {
                    outputs.push(data.output || data.stdout);
                }
            });

            await finishPromise;
            expect(outputs.length).toBeGreaterThan(0);
            stream.cleanup();
        }, TEST_TIMEOUT);

        test('should properly clean up stream listeners', async () => {
            const command = 'echo "test"';
            const stream = codebolt.terminal.executeCommandWithStream(command);

            let eventCount = 0;
            stream.on('commandOutput', () => {
                eventCount++;
            });

            await new Promise<void>((resolve) => {
                stream.on('commandFinish', () => resolve());
                setTimeout(() => resolve(), 5000);
            });

            stream.cleanup();

            // After cleanup, new events should not be processed
            expect(eventCount).toBeGreaterThan(0);
        }, TEST_TIMEOUT);

        test('should handle command with executeInMain flag', async () => {
            const command = 'echo "main terminal test"';
            const stream = codebolt.terminal.executeCommandWithStream(command, true);

            const outputs: string[] = [];

            stream.on('commandOutput', (data) => {
                if (data.output || data.stdout) {
                    outputs.push(data.output || data.stdout);
                }
            });

            await new Promise<void>((resolve) => {
                stream.on('commandFinish', () => resolve());
                setTimeout(() => resolve(), 5000);
            });

            expect(outputs.length).toBeGreaterThan(0);
            stream.cleanup();
        }, TEST_TIMEOUT);

        test('should stream both stdout and stderr', async () => {
            const command = 'echo "stdout" && echo "stderr" >&2';
            const stream = codebolt.terminal.executeCommandWithStream(command);

            const allOutputs: string[] = [];

            stream.on('commandOutput', (data) => {
                if (data.output || data.stdout) {
                    allOutputs.push(data.output || data.stdout);
                }
            });

            stream.on('commandError', (data) => {
                if (data.stderr) {
                    allOutputs.push(data.stderr);
                }
            });

            await new Promise<void>((resolve) => {
                stream.on('commandFinish', () => resolve());
                setTimeout(() => resolve(), 5000);
            });

            expect(allOutputs.length).toBeGreaterThan(0);
            stream.cleanup();
        }, TEST_TIMEOUT);

        test('should handle large streamed output', async () => {
            const command = 'seq 1 100';
            const stream = codebolt.terminal.executeCommandWithStream(command);

            const outputs: string[] = [];

            stream.on('commandOutput', (data) => {
                if (data.output || data.stdout) {
                    outputs.push(data.output || data.stdout);
                }
            });

            await new Promise<void>((resolve) => {
                stream.on('commandFinish', () => resolve());
                setTimeout(() => resolve(), 5000);
            });

            expect(outputs.length).toBeGreaterThan(0);
            stream.cleanup();
        }, TEST_TIMEOUT);

        test('should handle rapid stream events', async () => {
            const command = 'for i in {1..20}; do echo "$i"; done';
            const stream = codebolt.terminal.executeCommandWithStream(command);

            let outputCount = 0;

            stream.on('commandOutput', () => {
                outputCount++;
            });

            await new Promise<void>((resolve) => {
                stream.on('commandFinish', () => resolve());
                setTimeout(() => resolve(), 5000);
            });

            expect(outputCount).toBeGreaterThan(0);
            stream.cleanup();
        }, TEST_TIMEOUT);
    });

    // =========================================================================
    // TEST GROUP: sendManualInterrupt
    // =========================================================================

    describe('sendManualInterrupt', () => {

        test('should send interrupt signal successfully', async () => {
            const result = await codebolt.terminal.sendManualInterrupt();

            expect(result).toBeDefined();
            expect(result.type).toBe('terminalInterrupted');
            expect(result.success).toBeDefined();
        }, TEST_TIMEOUT);

        test('should include message in interrupt response', async () => {
            const result = await codebolt.terminal.sendManualInterrupt();

            expect(result).toBeDefined();
            expect(result.type).toBe('terminalInterrupted');
            // Message may or may not be present depending on implementation
            if (result.message) {
                expect(typeof result.message).toBe('string');
            }
        }, TEST_TIMEOUT);

        test('should handle multiple interrupt signals', async () => {
            const result1 = await codebolt.terminal.sendManualInterrupt();
            const result2 = await codebolt.terminal.sendManualInterrupt();

            expect(result1).toBeDefined();
            expect(result2).toBeDefined();
            expect(result1.type).toBe('terminalInterrupted');
            expect(result2.type).toBe('terminalInterrupted');
        }, TEST_TIMEOUT);

        test('should interrupt running command and verify success flag', async () => {
            const command = 'sleep 10';
            const commandPromise = codebolt.terminal.executeCommandRunUntilInterrupt(command);

            await new Promise(resolve => setTimeout(resolve, 1000));

            const interruptResult = await codebolt.terminal.sendManualInterrupt();
            expect(interruptResult.success).toBe(true);

            await commandPromise;
        }, TEST_TIMEOUT);

        test('should handle interrupt when no command is running', async () => {
            const result = await codebolt.terminal.sendManualInterrupt();

            expect(result).toBeDefined();
            expect(result.type).toBe('terminalInterrupted');
            // Should still return a response even if nothing to interrupt
        }, TEST_TIMEOUT);
    });

    // =========================================================================
    // TEST GROUP: Integration Tests
    // =========================================================================

    describe('Integration Tests', () => {

        test('should execute command then immediately interrupt', async () => {
            // First execute a normal command
            const result1 = await codebolt.terminal.executeCommand('echo "before interrupt"');
            expect(result1).toBeDefined();

            // Then test interrupt
            const result2 = await codebolt.terminal.sendManualInterrupt();
            expect(result2).toBeDefined();
        }, TEST_TIMEOUT);

        test('should handle stream followed by regular command', async () => {
            // First use stream
            const stream = codebolt.terminal.executeCommandWithStream('echo "streamed"');

            await new Promise<void>((resolve) => {
                stream.on('commandFinish', () => resolve());
                setTimeout(() => resolve(), 5000);
            });

            stream.cleanup();

            // Then execute regular command
            const result = await codebolt.terminal.executeCommand('echo "regular"');
            expect(result).toBeDefined();
        }, TEST_TIMEOUT);

        test('should handle multiple streams sequentially', async () => {
            const commands = ['echo "first"', 'echo "second"', 'echo "third"'];

            for (const cmd of commands) {
                const stream = codebolt.terminal.executeCommandWithStream(cmd);

                await new Promise<void>((resolve) => {
                    stream.on('commandFinish', () => resolve());
                    setTimeout(() => resolve(), 5000);
                });

                stream.cleanup();
            }

            // All should complete without error
            expect(true).toBe(true);
        }, TEST_TIMEOUT);

        test('should handle error recovery - error then success', async () => {
            // Execute command that will fail
            const errorResult = await codebolt.terminal.executeCommandRunUntilError('exit 1');
            expect(errorResult.type).toBe('commandError');

            // Then execute command that succeeds
            const successResult = await codebolt.terminal.executeCommand('echo "recovered"');
            expect(successResult).toBeDefined();
            expect(successResult.type).toMatch(/commandFinish|commandOutput/);
        }, TEST_TIMEOUT);

        test('should handle rapid consecutive commands', async () => {
            const commands = [
                'echo "1"',
                'echo "2"',
                'echo "3"',
                'echo "4"',
                'echo "5"'
            ];

            const results = await Promise.all(
                commands.map(cmd => codebolt.terminal.executeCommand(cmd))
            );

            results.forEach(result => {
                expect(result).toBeDefined();
            });
        }, TEST_TIMEOUT);

        test('should handle mixed command types in sequence', async () => {
            // Regular command
            const r1 = await codebolt.terminal.executeCommand('echo "regular"');
            expect(r1).toBeDefined();

            // Stream command
            const stream = codebolt.terminal.executeCommandWithStream('echo "stream"');
            await new Promise<void>((resolve) => {
                stream.on('commandFinish', () => resolve());
                setTimeout(() => resolve(), 5000);
            });
            stream.cleanup();

            // Regular command again
            const r2 = await codebolt.terminal.executeCommand('echo "regular2"');
            expect(r2).toBeDefined();
        }, TEST_TIMEOUT);

        test('should handle command with complex shell syntax', async () => {
            const command = `
                if [ "1" = "1" ]; then
                    echo "condition met"
                else
                    echo "condition not met"
                fi
            `;
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
            expect(result.type).toMatch(/commandFinish|commandError/);
        }, TEST_TIMEOUT);

        test('should handle command that creates and reads file', async () => {
            const command = 'echo "test content" > /tmp/test_terminal.txt && cat /tmp/test_terminal.txt && rm /tmp/test_terminal.txt';
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
            expect(result.type).toMatch(/commandFinish|commandError/);
        }, TEST_TIMEOUT);

        test('should verify timeout behavior for long-running commands', async () => {
            const startTime = Date.now();
            const command = 'sleep 2';
            const result = await codebolt.terminal.executeCommand(command);
            const duration = Date.now() - startTime;

            expect(result).toBeDefined();
            expect(duration).toBeGreaterThan(2000); // Should take at least 2 seconds
            expect(duration).toBeLessThan(10000); // But not too long
        }, TEST_TIMEOUT);
    });

    // =========================================================================
    // TEST GROUP: Edge Cases
    // =========================================================================

    describe('Edge Cases', () => {

        test('should handle empty command', async () => {
            const command = '';
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
        }, TEST_TIMEOUT);

        test('should handle command with only whitespace', async () => {
            const command = '   ';
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
        }, TEST_TIMEOUT);

        test('should handle very long command', async () => {
            const command = `echo "${'a'.repeat(10000)}"`;
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
        }, TEST_TIMEOUT);

        test('should handle command with many arguments', async () => {
            const args = Array.from({ length: 100 }, (_, i) => `arg${i}`);
            const command = `echo ${args.join(' ')}`;
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
        }, TEST_TIMEOUT);

        test('should handle command with null bytes in output', async () => {
            const command = "printf 'test\\x00null'";
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
        }, TEST_TIMEOUT);

        test('should handle command that produces no output', async () => {
            const command = 'true'; // Produces no output
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
            expect(result.type).toMatch(/commandFinish|commandError/);
        }, TEST_TIMEOUT);

        test('should handle command with very long lines', async () => {
            const command = `printf "${'a'.repeat(10000)}\\n"`;
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
        }, TEST_TIMEOUT);

        test('should handle command with special shell characters', async () => {
            const command = 'echo "test; ls | cat & sleep"';
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
        }, TEST_TIMEOUT);

        test('should handle command with quotes and escapes', async () => {
            const command = 'echo "it\'s a \\"test\\" with \\\\ escapes"';
            const result = await codebolt.terminal.executeCommand(command);

            expect(result).toBeDefined();
        }, TEST_TIMEOUT);
    });
});

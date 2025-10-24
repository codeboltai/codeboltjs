import codebolt from '@codebolt/codeboltjs';

import { FlatUserMessage } from "@codebolt/types/sdk";
import { CreateTaskOptions } from '@codebolt/types/agent-to-app-ws-schema';

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
    console.log('Received message:', reqMessage);
    
    try {
        // Extract test tool name from message or default to testing all
        const testTool = reqMessage.userMessage?.toLowerCase() || 'all';
        
        console.log(`\n=== Testing Codebolt Tools ===${testTool ? ` [${testTool}]` : ''}\n`);

        // Test read_file tool
        if (testTool === 'all' || testTool.includes('read_file')) {
            console.log('Testing read_file tool...');
            const readResult = await codebolt.mcp.executeTool('codebolt', 'read_file', {
                absolute_path: '/Users/ravirawat/Documents/codeboltai/codeboltjs/package.json'
            });
            console.log('read_file result:', JSON.stringify(readResult, null, 2));
        }

        // Test write_file tool
        if (testTool === 'all' || testTool.includes('write_file')) {
            console.log('\nTesting write_file tool...');
            const writeResult = await codebolt.mcp.executeTool('codebolt', 'write_file', {
                file_path: '/Users/ravirawat/Documents/codeboltai/codeboltjs/test-output.txt',
                content: 'Hello from CliTestAgent!\nTesting write_file tool.'
            });
            console.log('write_file result:', JSON.stringify(writeResult, null, 2));
        }

        // Test replace (edit) tool
        if (testTool === 'all' || testTool.includes('replace')) {
            console.log('\nTesting replace tool...');
            const editResult = await codebolt.mcp.executeTool('codebolt', 'replace', {
                file_path: '/Users/ravirawat/Documents/codeboltai/codeboltjs/test-output.txt',
                old_string: 'Hello from CliTestAgent!',
                new_string: 'Modified by CliTestAgent!'
            });
            console.log('replace result:', JSON.stringify(editResult, null, 2));
        }

        // Test list_directory tool
        if (testTool === 'all' || testTool.includes('list_directory')) {
            console.log('\nTesting list_directory tool...');
            const lsResult = await codebolt.mcp.executeTool('codebolt', 'list_directory', {
                path: '/Users/ravirawat/Documents/codeboltai/codeboltjs/remoteexecutor/updatedAgentServer'
            });
            console.log('list_directory result:', JSON.stringify(lsResult, null, 2));
        }

        // Test read_many_files tool
        if (testTool === 'all' || testTool.includes('read_many_files')) {
            console.log('\nTesting read_many_files tool...');
            const readManyResult = await codebolt.mcp.executeTool('codebolt', 'read_many_files', {
                paths: ['/Users/ravirawat/Documents/codeboltai/codeboltjs/package.json']
            });
            console.log('read_many_files result:', JSON.stringify(readManyResult, null, 2));
        }

        // Test search_file_content (grep) tool
        if (testTool === 'all' || testTool.includes('search_file_content')) {
            console.log('\nTesting search_file_content tool...');
            const grepResult = await codebolt.mcp.executeTool('codebolt', 'search_file_content', {
                pattern: 'codebolt',
                path: '/Users/ravirawat/Documents/codeboltai/codeboltjs'
            });
            console.log('search_file_content result:', JSON.stringify(grepResult, null, 2));
        }

        // Test glob tool
        if (testTool === 'all' || testTool.includes('glob')) {
            console.log('\nTesting glob tool...');
            const globResult = await codebolt.mcp.executeTool('codebolt', 'glob', {
                pattern: '*.json',
                path: '/Users/ravirawat/Documents/codeboltai/codeboltjs/remoteexecutor/updatedAgentServer'
            });
            console.log('glob result:', JSON.stringify(globResult, null, 2));
        }

        // Test search_files tool
        if (testTool === 'all' || testTool.includes('search_files')) {
            console.log('\nTesting search_files tool...');
            const searchResult = await codebolt.mcp.executeTool('codebolt', 'search_files', {
                path: '/Users/ravirawat/Documents/codeboltai/codeboltjs/remoteexecutor/updatedAgentServer',
                regex: 'codebolt'
            });
            console.log('search_files result:', JSON.stringify(searchResult, null, 2));
        }

        // Test list_files tool
        if (testTool === 'all' || testTool.includes('list_files')) {
            console.log('\nTesting list_files tool...');
            const listFilesResult = await codebolt.mcp.executeTool('codebolt', 'list_files', {
                path: '/Users/ravirawat/Documents/codeboltai/codeboltjs',
                recursive: 'false'
            });
            console.log('list_files result:', JSON.stringify(listFilesResult, null, 2));
        }

        // Test git_action tool (status is safe to test)
        if (testTool === 'all' || testTool.includes('git_action')) {
            console.log('\nTesting git_action tool (status)...');
            const gitResult = await codebolt.mcp.executeTool('codebolt', 'git_action', {
                action: 'status'
            });
            console.log('git_action result:', JSON.stringify(gitResult, null, 2));
        }

        // Test attempt_completion tool
        if (testTool === 'all' || testTool.includes('attempt_completion')) {
            console.log('\nTesting attempt_completion tool...');
            const completionResult = await codebolt.mcp.executeTool('codebolt', 'attempt_completion', {
                result: 'All tool tests completed successfully!'
            });
            console.log('attempt_completion result:', JSON.stringify(completionResult, null, 2));
        }

        // Test todo_write tool
        if (testTool === 'all' || testTool.includes('todo_write')) {
            console.log('\nTesting todo_write tool...');
            const todoResult = await codebolt.mcp.executeTool('codebolt', 'todo_write', {
                todos: [
                    { content: 'Test todo item 1', status: 'pending' },
                    { content: 'Test todo item 2', status: 'in_progress' },
                    { content: 'Test todo item 3', status: 'completed' }
                ],
                threadId: 'test-thread-123'
            });
            console.log('todo_write result:', JSON.stringify(todoResult, null, 2));
        }

        // Test explain_next_action tool
        if (testTool === 'all' || testTool.includes('explain_next_action')) {
            console.log('\nTesting explain_next_action tool...');
            const explainResult = await codebolt.mcp.executeTool('codebolt', 'explain_next_action', {
                explanation: 'Testing all available tools in the codebolt MCP server.'
            });
            console.log('explain_next_action result:', JSON.stringify(explainResult, null, 2));
        }

        console.log('\n=== All Tool Tests Completed ===\n');
        
        // Send success notification
        codebolt.notify.chat.AgentTextResponseNotify('Tool testing completed successfully!', false);
        
        return {
            success: true,
            message: 'Tool testing completed'
        };
        
    } catch (error) {
        console.error('Error during tool testing:', error);
        
        // Send error notification
        codebolt.notify.chat.AgentTextResponseNotify(
            `Tool testing failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 
            true
        );
        
        return {
            success: false,
            message: 'Tool testing failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
})

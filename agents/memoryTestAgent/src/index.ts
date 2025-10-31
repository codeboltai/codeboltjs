import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from "@codebolt/types/sdk";

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
    console.log('Received message:', reqMessage);
    
    try {
        codebolt.chat.sendMessage("Starting memory test agent", {});
        
        // Test JSON Memory
        console.log('Testing JSON memory...');
        const jsonData = {
            testKey: 'testValue',
            nested: {
                data: [1, 2, 3],
                timestamp: new Date().toISOString()
            }
        };
        const jsonSaveResult = await codebolt.memory.json.save(jsonData);
        console.log('JSON Save Result:', jsonSaveResult);
        codebolt.chat.sendMessage(`JSON Memory Saved: ${jsonSaveResult.memoryId}`, {});
        
        if (jsonSaveResult.success && jsonSaveResult.memoryId) {
            // Test JSON Update
            const updatedJsonData = { ...jsonData, updated: true };
            const jsonUpdateResult = await codebolt.memory.json.update(jsonSaveResult.memoryId, updatedJsonData);
            console.log('JSON Update Result:', jsonUpdateResult);
            codebolt.chat.sendMessage(`JSON Memory Updated: ${jsonUpdateResult.success}`, {});
            
            // Test JSON List
            const jsonListResult = await codebolt.memory.json.list();
            console.log('JSON List Result:', jsonListResult);
            codebolt.chat.sendMessage(`JSON Memory Items: ${jsonListResult.items?.length || 0}`, {});
        }
        
        // Test Markdown Memory
        console.log('Testing Markdown memory...');
        const markdownContent = `# Test Markdown
        
This is a test markdown document.

## Features
- Testing markdown save
- Testing markdown update
- Testing markdown list

Created at: ${new Date().toISOString()}
`;
        const markdownSaveResult = await codebolt.memory.markdown.save(markdownContent, { title: 'Test Markdown Doc' });
        console.log('Markdown Save Result:', markdownSaveResult);
        codebolt.chat.sendMessage(`Markdown Memory Saved: ${markdownSaveResult.memoryId}`, {});
        
        if (markdownSaveResult.success && markdownSaveResult.memoryId) {
            // Test Markdown Update
            const updatedMarkdown = markdownContent + '\n\n## Updated Section\nThis section was added later.';
            const markdownUpdateResult = await codebolt.memory.markdown.update(markdownSaveResult.memoryId, updatedMarkdown);
            console.log('Markdown Update Result:', markdownUpdateResult);
            codebolt.chat.sendMessage(`Markdown Memory Updated: ${markdownUpdateResult.success}`, {});
            
            // Test Markdown List
            const markdownListResult = await codebolt.memory.markdown.list();
            console.log('Markdown List Result:', markdownListResult);
            codebolt.chat.sendMessage(`Markdown Memory Items: ${markdownListResult.items?.length || 0}`, {});
        }
        
        // Test Todo Memory
        console.log('Testing Todo memory...');
        const todoData = [
            {
                title: 'Test Todo Item 1',
                priority: 'high' as const,
                tags: ['test', 'memory'],
                status: 'pending' as const
            },
            {
                title: 'Test Todo Item 2',
                priority: 'medium' as const,
                tags: ['test'],
                status: 'pending' as const
            }
        ];
        const todoSaveResult = await codebolt.memory.todo.save(todoData, { title: 'Test Todo List' });
        console.log('Todo Save Result:', todoSaveResult);
        codebolt.chat.sendMessage(`Todo Memory Saved: ${todoSaveResult.memoryId}`, {});
        
        if (todoSaveResult.success && todoSaveResult.memoryId) {
            // Test Todo Update (if we have todo items)
            if (Array.isArray(todoSaveResult.data) && todoSaveResult.data.length > 0) {
                const firstTodo = todoSaveResult.data[0] as any;
                if (firstTodo.id) {
                    const updatedTodo = {
                        id: firstTodo.id,
                        title: 'Updated Todo Item',
                        priority: 'medium' as const,
                        status: 'completed' as const,
                        tags: ['test', 'updated']
                    };
                    const todoUpdateResult = await codebolt.memory.todo.update(firstTodo.id, updatedTodo);
                    console.log('Todo Update Result:', todoUpdateResult);
                    codebolt.chat.sendMessage(`Todo Memory Updated: ${todoUpdateResult.success}`, {});
                }
            }
            
            // Test Todo List
            const todoListResult = await codebolt.memory.todo.list();
            console.log('Todo List Result:', todoListResult);
            codebolt.chat.sendMessage(`Todo Memory Items: ${todoListResult.items?.length || 0}`, {});
        }
        
        codebolt.chat.sendMessage("Memory test completed successfully!", {});
        
        return {
            success: true,
            message: 'Memory tests completed successfully'
        };
        
    } catch (error) {
        console.error('Error testing memory:', error);
        
        // Send error notification
        codebolt.notify.chat.AgentTextResponseNotify(
            `Failed to test memory: ${error instanceof Error ? error.message : 'Unknown error'}`,
            true
        );
        
        return {
            success: false,
            message: 'Failed to test memory',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
});

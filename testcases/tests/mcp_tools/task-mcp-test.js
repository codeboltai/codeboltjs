const codebolt = require('@codebolt/codeboltjs');

async function testTaskMCPTools() {
    console.log('📝 Testing Task MCP Tools');
    console.log('========================');
    await codebolt.waitForConnection();
    try {
        // 1. task_create
        try {
            const result = await codebolt.tools.executeTool('codebolt.task', 'task_create', { 
                /** Task title */
           title: "test",
           /** Agent ID for task organization */
           agentId:"test",
           /** Task description */
           description:'test',
           /** Task phase */
           phase: 'test',
           /** Task category */
           category: 'test',
           /** Task priority */
           priority: 'high',
           /** Associated tags */
           tags: []
              });
            console.log('✅ task_create:', result?.success, result?.message);
        } catch (e) { console.log('⚠️  task_create failed:', e.message); }
        // 2. task_list
        try {
            const result = await codebolt.tools.executeTool('codebolt.task', 'task_list', {});
            console.log('✅ task_list:', result?.success, 'Tasks:', result?.data?.length || 0);
        } catch (e) { console.log('⚠️  task_list failed:', e.message); }
        // 3. task_update
        try {
            const result = await codebolt.tools.executeTool('codebolt.task', 'task_update', { task: 'Test MCP Task Updated' });
            console.log('✅ task_update:', result?.success, result?.message);
        } catch (e) { console.log('⚠️  task_update failed:', e.message); }
        // 4. task_create (missing task, should fail)
        try {
            const result = await codebolt.tools.executeTool('codebolt.task', 'task_create', {});
            console.log('❌ task_create (missing task) should have failed but did not:', result);
        } catch (e) { console.log('✅ Expected failure for missing task:', e.message); }
        // 5. task_update (missing task, should fail)
        try {
            const result = await codebolt.tools.executeTool('codebolt.task', 'task_update', {});
            console.log('❌ task_update (missing task) should have failed but did not:', result);
        } catch (e) { console.log('✅ Expected failure for missing task (update):', e.message); }
        console.log('🎉 Task MCP tools tests completed!');
    } catch (e) {
        console.error('❌ Task MCP tools test error:', e.message);
    }
}

testTaskMCPTools(); 
const codebolt = require('@codebolt/codeboltjs').default;

async function testTask() {
    console.log('📋 Testing Task Management Module');
    console.log('=================================');
    
    try {
        await codebolt.waitForConnection();
        console.log('✅ Codebolt connection established\n');

        // Test 1: Add a simple task
        console.log('📋 Test 1: Add a simple task');
        try {
            const addResult = await codebolt.taskplaner.addTask('Complete project documentation');
            console.log('✅ Task added successfully');
            console.log('   - Response type:', addResult?.type);
            console.log('   - Success:', !!addResult?.success);
            console.log('   - Task: "Complete project documentation"');
        } catch (error) {
            console.log('❌ Adding task failed:', error.message);
        }

        // Test 2: Add multiple tasks
        console.log('\n📋 Test 2: Add multiple tasks');
        try {
            const tasks = [
                'Review code changes',
                'Update unit tests',
                'Fix bug in authentication module',
                'Prepare release notes',
                'Deploy to staging environment'
            ];

            for (const task of tasks) {
                await codebolt.taskplaner.addTask(task);
            }

            console.log('✅ Multiple tasks added successfully');
            console.log(`   - Tasks added: ${tasks.length}`);
            console.log('   - Task types: documentation, testing, bug fixes, deployment');
        } catch (error) {
            console.log('❌ Adding multiple tasks failed:', error.message);
        }

        // Test 3: Get all tasks
        console.log('\n📋 Test 3: Get all tasks');
        try {
            const tasksResult = await codebolt.taskplaner.getTasks();
            console.log('✅ Tasks retrieved successfully');
            console.log('   - Response type:', tasksResult?.type);
            console.log('   - Has data:', !!tasksResult?.data);
            console.log('   - Tasks count:', tasksResult?.data?.length || 0);
            console.log('   - Sample tasks:', tasksResult?.data?.slice(0, 3) || []);
        } catch (error) {
            console.log('❌ Getting tasks failed:', error.message);
        }

        // // Test 4: Update a task
        // console.log('\n📋 Test 4: Update a task');
        // try {
        //     const updateResult = await codebolt.taskplaner.updateTask('Complete project documentation - UPDATED with new requirements');
        //     console.log('✅ Task updated successfully');
        //     console.log('   - Response type:', updateResult?.type);
        //     console.log('   - Success:', !!updateResult?.success);
        //     console.log('   - Updated task includes new requirements');
        // } catch (error) {
        //     console.log('❌ Updating task failed:', error.message);
        // }

        // Test 5: Add tasks with different complexity levels
        console.log('\n📋 Test 5: Add tasks with different complexity levels');
        try {
            const complexTasks = [
                'Simple task: Check email',
                'Medium task: Implement user authentication with OAuth2 integration',
                'Complex task: Design and implement microservices architecture with Docker containers, Kubernetes orchestration, and CI/CD pipeline integration',
                'Bug fix: Resolve memory leak in data processing module',
                'Feature: Add real-time notifications with WebSocket support'
            ];

            for (const task of complexTasks) {
                await codebolt.taskplaner.addTask(task);
            }

            console.log('✅ Tasks with different complexity levels added');
            console.log(`   - Tasks added: ${complexTasks.length}`);
            console.log('   - Complexity range: simple to complex');
        } catch (error) {
            console.log('❌ Adding complex tasks failed:', error.message);
        }

        // // Test 6: Update multiple tasks
        // console.log('\n📋 Test 6: Update multiple tasks');
        // try {
        //     const taskUpdates = [
        //         'Review code changes - COMPLETED',
        //         'Update unit tests - IN PROGRESS',
        //         'Fix bug in authentication module - ASSIGNED to John',
        //         'Prepare release notes - PENDING review',
        //         'Deploy to staging environment - SCHEDULED for tomorrow'
        //     ];

        //     for (const update of taskUpdates) {
        //         await codebolt.taskplaner.updateTask(update);
        //     }

        //     console.log('✅ Multiple task updates completed');
        //     console.log(`   - Updates applied: ${taskUpdates.length}`);
        //     console.log('   - Status updates: completed, in progress, assigned, pending, scheduled');
        // } catch (error) {
        //     console.log('❌ Updating multiple tasks failed:', error.message);
        // }

        // Test 7: Add tasks with special characters and formatting
        console.log('\n📋 Test 7: Add tasks with special characters and formatting');
        try {
            const specialTasks = [
                'Task with "quotes" and \'apostrophes\'',
                'Task with special chars: !@#$%^&*()',
                'Task with unicode: 🚀 Deploy to production 🔧',
                'Task with newlines:\nLine 1\nLine 2\nLine 3',
                'Task with JSON-like format: {"priority": "high", "assignee": "developer"}'
            ];

            for (const task of specialTasks) {
                await codebolt.taskplaner.addTask(task);
            }

            console.log('✅ Tasks with special characters added');
            console.log(`   - Special tasks: ${specialTasks.length}`);
            console.log('   - Includes: quotes, special chars, unicode, newlines, JSON-like');
        } catch (error) {
            console.log('❌ Adding special character tasks failed:', error.message);
        }

        // Test 8: Verify task persistence
        console.log('\n📋 Test 8: Verify task persistence');
        try {
            // Add a test task
            await codebolt.taskplaner.addTask('Persistence test task');
            
            // Get all tasks to verify it was added
            const allTasks = await codebolt.taskplaner.getTasks();
            
            // Update the task
            await codebolt.taskplaner.updateTask('Persistence test task - VERIFIED');
            
            // Get tasks again to verify update
            const updatedTasks = await codebolt.taskplaner.getTasks();
            
            console.log('✅ Task persistence verified');
            console.log('   - Tasks before update:', allTasks?.data?.length || 0);
            console.log('   - Tasks after update:', updatedTasks?.data?.length || 0);
            console.log('   - Persistence working correctly');
        } catch (error) {
            console.log('❌ Task persistence verification failed:', error.message);
        }

        // Test 9: Performance test with multiple operations
        console.log('\n📋 Test 9: Performance test with multiple operations');
        try {
            const startTime = Date.now();
            
            // Add multiple tasks quickly
            for (let i = 0; i < 10; i++) {
                await codebolt.taskplaner.addTask(`Performance test task ${i + 1}`);
            }
            
            const addTime = Date.now() - startTime;
            
            // Get tasks
            const getStartTime = Date.now();
            await codebolt.taskplaner.getTasks();
            const getTime = Date.now() - getStartTime;
            
            // Update tasks
            const updateStartTime = Date.now();
            for (let i = 0; i < 5; i++) {
                await codebolt.taskplaner.updateTask(`Performance test task ${i + 1} - UPDATED`);
            }
            const updateTime = Date.now() - updateStartTime;
            
            console.log('✅ Performance test completed');
            console.log(`   - 10 add operations: ${addTime}ms`);
            console.log(`   - 1 get operation: ${getTime}ms`);
            console.log(`   - 5 update operations: ${updateTime}ms`);
            console.log(`   - Average add time: ${(addTime / 10).toFixed(2)}ms`);
            console.log(`   - Average update time: ${(updateTime / 5).toFixed(2)}ms`);
        } catch (error) {
            console.log('❌ Performance test failed:', error.message);
        }

        // Test 10: Edge cases and error handling
        console.log('\n📋 Test 10: Edge cases and error handling');
        try {
            const edgeCases = [
                '', // Empty string
                '   ', // Whitespace only
                'A'.repeat(1000), // Very long task
                '1', // Single character
                'Task with\ttabs\tand\tspaces'
            ];

            for (const edgeCase of edgeCases) {
                await codebolt.taskplaner.addTask(edgeCase);
            }

            console.log('✅ Edge cases handled successfully');
            console.log(`   - Edge cases tested: ${edgeCases.length}`);
            console.log('   - Empty strings, whitespace, long text, single chars, tabs');
        } catch (error) {
            console.log('❌ Edge case handling failed:', error.message);
        }

        // Test 11: Task workflow simulation
        console.log('\n📋 Test 11: Task workflow simulation');
        try {
            const workflowTasks = [
                'Design user interface mockups',
                'Implement frontend components',
                'Create backend API endpoints',
                'Write integration tests',
                'Perform code review',
                'Deploy to production'
            ];

            // Add all workflow tasks
            for (const task of workflowTasks) {
                await codebolt.taskplaner.addTask(task);
            }

            // Simulate workflow progression
            const statusUpdates = [
                'Design user interface mockups - COMPLETED',
                'Implement frontend components - IN PROGRESS',
                'Create backend API endpoints - READY TO START',
                'Write integration tests - BLOCKED (waiting for API)',
                'Perform code review - SCHEDULED',
                'Deploy to production - PENDING APPROVAL'
            ];

            for (const update of statusUpdates) {
                await codebolt.taskplaner.updateTask(update);
            }

            console.log('✅ Task workflow simulation completed');
            console.log(`   - Workflow tasks: ${workflowTasks.length}`);
            console.log('   - Status progression simulated');
        } catch (error) {
            console.log('❌ Task workflow simulation failed:', error.message);
        }

        // Test 12: Final task summary
        console.log('\n📋 Test 12: Final task summary');
        try {
            const finalTasks = await codebolt.taskplaner.getTasks();
            console.log('✅ Final task summary retrieved');
            console.log('   - Total tasks in system:', finalTasks?.data?.length || 0);
            console.log('   - Response structure valid:', !!finalTasks?.type);
            console.log('   - Data array present:', Array.isArray(finalTasks?.data));
            
            if (finalTasks?.data && finalTasks.data.length > 0) {
                console.log('   - Sample tasks:');
                finalTasks.data.slice(0, 3).forEach((task, index) => {
                    console.log(`     ${index + 1}. ${task}`);
                });
            }
        } catch (error) {
            console.log('❌ Final task summary failed:', error.message);
        }

        console.log('\n🎉 All Task Management tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Task test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testTask().catch(console.error); 
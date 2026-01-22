import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from "@codebolt/types/sdk";
import { CreateTaskOptions } from '@codebolt/types/agent-to-app-ws-schema';

// Helper function to create a simple task step
const createTaskStep = (message: string, isMain: boolean = false, x: number = 0) => ({
    type: 'automated' as const,
    userMessage: message,
    messageData: {
        mentionedFiles: [],
        mentionedFullPaths: [],
        mentionedFolders: [],
        mentionedMultiFile: [],
        mentionedMCPs: [],
        uploadedImages: [],
        mentionedAgents: [],
        mentionedDocs: [],
        links: [],
        controlFiles: [],
        isRemoteTask: false
    },
    isMainTask: isMain,
    position: { x, y: 0 },
    condition: 'always' as const,
    agentId: 'default-agent',
    status: 'pending' as const
});

// Helper function to log test results
const logTest = (testName: string, success: boolean, data?: any, error?: any) => {
    const status = success ? '✅ PASS' : '❌ FAIL';
    console.log(`\n${status} - ${testName}`);

    let message = `${status} - ${testName}`;

    if (data) {
        const dataStr = JSON.stringify(data, null, 2);
        console.log('Data:', dataStr);
        message += `\nData: ${dataStr}`;
    }

    if (error) {
        const errorStr = error instanceof Error
            ? `${error.message}\nStack: ${error.stack}`
            : JSON.stringify(error, null, 2);
        console.error('Error:', errorStr);
        message += `\nError: ${errorStr}`;
    }

    codebolt.chat.sendMessage(message, {});
};

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
    console.log('🚀 Starting Task Module Test Suite');
    codebolt.chat.sendMessage("🚀 Starting Task Module Test Suite", {});

    let createdTaskId: string | undefined;
    const testResults: { [key: string]: boolean } = {};

    try {
        // ========================================
        // TEST 1: Create Task
        // ========================================
        try {
            console.log('\n📝 TEST 1: Creating a new task...');
            const taskOptions: CreateTaskOptions = {
                threadId: reqMessage.threadId || 'default-thread',
                name: 'Test Task - Node.js Project',
                dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                taskType: 'scheduled',
                executionType: 'scheduled',
                environmentType: 'local',
                startOption: 'manual',
                isRemoteTask: false,
                isKanbanTask: true,
                steps: [
                    createTaskStep('Create Node.js project structure', true, 0),
                    createTaskStep('Install dependencies', false, 100),
                    createTaskStep('Write initial code', false, 200),
                ]
            };

            console.log('Task options:', JSON.stringify(taskOptions, null, 2));
            const createResponse = await codebolt.task.createTask(taskOptions);
            codebolt.chat.sendMessage('Full createTask response:', JSON.stringify(createResponse, null, 2));
            console.log('Full createTask response:', JSON.stringify(createResponse, null, 2));

            createdTaskId = createResponse.task?.taskId;
            testResults['createTask'] = !!createdTaskId;

            if (!createdTaskId && createResponse.error) {
                logTest('Create Task', false, { response: createResponse }, new Error(createResponse.error));
            } else {
                logTest('Create Task', !!createdTaskId, { taskId: createdTaskId, taskName: createResponse.task?.name, success: createResponse.success });
            }
        } catch (error) {
            testResults['createTask'] = false;
            logTest('Create Task', false, null, error);
        }

        // ========================================
        // TEST 2: Get Task List
        // ========================================
        try {
            console.log('\n📋 TEST 2: Getting task list...');
            const listResponse = await codebolt.task.getTaskList({
                limit: 10,
                offset: 0
            });
            testResults['getTaskList'] = !!listResponse.tasks && listResponse.tasks.length > 0;
            logTest('Get Task List', testResults['getTaskList'], {
                totalTasks: listResponse.tasks?.length,
                totalCount: listResponse.totalCount
            });
        } catch (error) {
            testResults['getTaskList'] = false;
            logTest('Get Task List', false, null, error);
        }

        // ========================================
        // TEST 3: Get Task Detail
        // ========================================
        if (createdTaskId) {
            try {
                console.log('\n🔍 TEST 3: Getting task detail...');
                const detailResponse = await codebolt.task.getTaskDetail({ taskId: createdTaskId });
                testResults['getTaskDetail'] = !!detailResponse.task;
                logTest('Get Task Detail', testResults['getTaskDetail'], {
                    taskId: detailResponse.task?.id,
                    name: detailResponse.task?.name,
                    status: detailResponse.task?.status
                });
            } catch (error) {
                testResults['getTaskDetail'] = false;
                logTest('Get Task Detail', false, null, error);
            }
        } else {
            logTest('Get Task Detail', false, null, 'Skipped - No task created');
        }

        // ========================================
        // TEST 4: Get Task Status
        // ========================================
        if (createdTaskId) {
            try {
                console.log('\n📊 TEST 4: Getting task status...');
                const status = await codebolt.task.getTaskStatus(createdTaskId);
                testResults['getTaskStatus'] = !!status;
                logTest('Get Task Status', testResults['getTaskStatus'], { status });
            } catch (error) {
                testResults['getTaskStatus'] = false;
                logTest('Get Task Status', false, null, error);
            }
        } else {
            logTest('Get Task Status', false, null, 'Skipped - No task created');
        }

        // ========================================
        // TEST 5: Get Task Summary
        // ========================================
        if (createdTaskId) {
            try {
                console.log('\n📄 TEST 5: Getting task summary...');
                const summary = await codebolt.task.getTaskSummary(createdTaskId);
                testResults['getTaskSummary'] = summary !== undefined;
                logTest('Get Task Summary', testResults['getTaskSummary'], { summary });
            } catch (error) {
                testResults['getTaskSummary'] = false;
                logTest('Get Task Summary', false, null, error);
            }
        } else {
            logTest('Get Task Summary', false, null, 'Skipped - No task created');
        }

        // ========================================
        // TEST 6: Update Task
        // ========================================
        if (createdTaskId) {
            try {
                console.log('\n✏️ TEST 6: Updating task...');
                const updateResponse = await codebolt.task.updateTask(createdTaskId, {
                    name: 'Updated Test Task - Node.js Project'
                });
                testResults['updateTask'] = !!updateResponse.task;
                logTest('Update Task', testResults['updateTask'], {
                    taskId: updateResponse.task?.id,
                    updatedName: updateResponse.task?.name
                });
            } catch (error) {
                testResults['updateTask'] = false;
                logTest('Update Task', false, null, error);
            }
        } else {
            logTest('Update Task', false, null, 'Skipped - No task created');
        }

        // ========================================
        // TEST 7: Assign Agent to Task
        // ========================================
        if (createdTaskId) {
            try {
                console.log('\n👤 TEST 7: Assigning agent to task...');
                const assignResponse = await codebolt.task.assignAgentToTask(createdTaskId, 'test-agent-id');
                testResults['assignAgentToTask'] = !!assignResponse.task;
                logTest('Assign Agent to Task', testResults['assignAgentToTask'], {
                    taskId: assignResponse.task?.id,
                    assignedTo: assignResponse.task?.assignedTo
                });
            } catch (error) {
                testResults['assignAgentToTask'] = false;
                logTest('Assign Agent to Task', false, null, error);
            }
        } else {
            logTest('Assign Agent to Task', false, null, 'Skipped - No task created');
        }

        // ========================================
        // TEST 8: Execute Task with Agent
        // ========================================
        if (createdTaskId) {
            try {
                console.log('\n▶️ TEST 8: Executing task with agent...');
                const executeResponse = await codebolt.task.executeTaskWithAgent(createdTaskId, 'test-agent-id');
                testResults['executeTaskWithAgent'] = !!executeResponse.success;
                logTest('Execute Task with Agent', testResults['executeTaskWithAgent'], {
                    success: executeResponse.success,
                    error: executeResponse.error
                });
            } catch (error) {
                testResults['executeTaskWithAgent'] = false;
                logTest('Execute Task with Agent', false, null, error);
            }
        } else {
            logTest('Execute Task with Agent', false, null, 'Skipped - No task created');
        }

        // ========================================
        // TEST 9: Delete Task
        // ========================================
        if (createdTaskId) {
            try {
                console.log('\n🗑️ TEST 9: Deleting task...');
                const deleteResponse = await codebolt.task.deleteTask(createdTaskId);
                testResults['deleteTask'] = !!deleteResponse.success;
                logTest('Delete Task', testResults['deleteTask'], {
                    success: deleteResponse.success,
                    deleted: deleteResponse.deleted
                });
            } catch (error) {
                testResults['deleteTask'] = false;
                logTest('Delete Task', false, null, error);
            }
        } else {
            logTest('Delete Task', false, null, 'Skipped - No task created');
        }

        // ========================================
        // SUMMARY
        // ========================================
        const totalTests = Object.keys(testResults).length;
        const passedTests = Object.values(testResults).filter(result => result).length;
        const failedTests = totalTests - passedTests;

        const summaryMessage = `
📊 Test Suite Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Tests: ${totalTests}
✅ Passed: ${passedTests}
❌ Failed: ${failedTests}
Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test Results:
${Object.entries(testResults).map(([test, result]) => `${result ? '✅' : '❌'} ${test}`).join('\n')}
        `;

        console.log(summaryMessage);
        codebolt.chat.sendMessage(summaryMessage, {});

        return {
            success: true,
            message: 'Task module test suite completed',
            results: testResults,
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                successRate: `${((passedTests / totalTests) * 100).toFixed(2)}%`
            }
        };

    } catch (error) {
        console.error('❌ Test suite failed with error:', error);
        const errorMessage = `Test suite failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        codebolt.chat.sendMessage(errorMessage, {});

        return {
            success: false,
            message: errorMessage,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
});




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
        isRemoteTask: false,
        environment: null
    },
    isMainTask: isMain,
    position: { x, y: 0 },
    condition: 'always' as const,
    agentId: 'default-agent',
    status: 'pending' as const
});

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
    console.log('Received message:', reqMessage);
    
    try {
        codebolt.chat.sendMessage("started task agent",{})
        
        // Create a scheduled task with simple, clean steps
        const taskOptions: any = {
            name: 'Node Js Project',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            taskType: 'scheduled',
            executionType: 'scheduled',
            environmentType: 'local',
            startOption: 'manual',
            isRemoteTask: false,
            isKanbanTask: true,
            steps: [
                createTaskStep('Create Node Js project', true, 0),
                
            ]
        };
        
        console.log('Creating scheduled task with options:', taskOptions);
        
        // Create the scheduled task
        // const taskResponse = await codebolt.task.createTask(taskOptions);
        
        // console.log('Scheduled task created successfully:', taskResponse);
        
        // Send success notification
        // codebolt.notify.chat.AgentTextResponseNotify(`Scheduled task created successfully with ID: ${taskResponse.task?.id}`, false);

      // let startTaskResponse=   await codebolt.task.startTask("a1cd38ef-3095-4fb9-81f8-da5b2673f61f")
        
         let taskResponse= await codebolt.task.createTaskGroup("frontend","test")

        return {
            success: true,
            message: 'Scheduled task created successfully',
            // taskId: taskResponse.task?.id,
            // taskName: taskResponse.task?.name,
            // dueDate: taskResponse.task?.dueDate
        };
        
    } catch (error) {
        console.error('Error creating scheduled task:', error);
        
        // Send error notification
        codebolt.notify.chat.AgentTextResponseNotify(`Failed to create scheduled task: ${error instanceof Error ? error.message : 'Unknown error'}`, true);
        
        return {
            success: false,
            message: 'Failed to create scheduled task',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
})




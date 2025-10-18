import codebolt from '@codebolt/codeboltjs';

import { FlatUserMessage } from "@codebolt/types/sdk";
import { CreateTaskOptions } from '@codebolt/types/agent-to-app-ws-schema';

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
    console.log('Received message:', reqMessage);
    
    try {
       await codebolt.fs.readFile('/Users/utkarshshukla/Codebolt/codeboltjs/common/types/src/wstypes/app-to-agent-ws/fsServiceResponses.ts')
    //    await codebolt.fs.writeToFile('/Users/utkarshshukla/Codebolt/codeboltjs/test.ts','hellots')
       
       // codebolt.chat.sendMessage("started task agent",{})
        return {
            success: true,
            message: 'Task agent stop '
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
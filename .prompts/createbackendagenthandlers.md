In @updatedAgentServer/src/handlers/agentMessaging/routerforMessageReceivedFromAgent.ts, create a new handler for handling Create File. 

The Agent will send a message to this router for Create File in the Format as in @codebolt/types/agent-to-app-ws-types.ts 

Please create the file handler in  @   
This will check if the File Handling permission is present. If the Permission is not present then if TUi is enabled or app is enabled then it will send the REquest permission to the Tui or App in the format of @codebolt/types/agent-to-app-ws-types.ts

Also in @updatedAgentServer/src/handlers/agentMessaging/routerforMessageReceivedFromtui.ts we will have a router for Approval of file System Read Request in the format of @ 

Once we get the Approval request then we should call the REad File Service. Create a Read File Service in @ . Once the create File Service is completed, then send the message back to Agent in the format of @codebolt/types/agent-to-app-ws-types.ts


Details:
- Message Format of Message Received from Agent is in @codebolt/types/agent-to-app-ws-types.ts
    * Typing:
        {
            "type": "message",
            "actionType": "CREATEFILE",
            "sender": "agent",
            "messageId": "123",
            "threadId": "123",
            "templateType": "CREATEFILE",
            "timestamp": "123"
        }
 - Message format of 

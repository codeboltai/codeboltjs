In @updatedAgentServer/src/handlers/agentMessaging/routerforMessageReceivedFromAgent.ts, create a new handler for handling Create File. 

The Agent will send a message to this router for Create File in the Format as in [text](../common/types/src/wstypes/agent-to-app-ws/actions/fsEventSchemas.ts) as CreateFileEvent 

Please create the file handler in  @  remoteexecutor/updatedAgentServer/src/localAgentRequestFulfilment 
This will check if the File Handling permission is present. If the Permission is not present then if TUi is enabled or app is enabled then it will send the REquest permission to the Tui or App in the format of /Users/ravirawat/Documents/codeboltai/codeboltjs/common/types/src/wstypes/app-to-ui-ws/fileMessageSchemas.ts fileReadConfirmationSchema

Also in @updatedAgentServer/src/handlers/agentMessaging/routerforMessageReceivedFromtui.ts we will have a router for Approval of file System Read Request in the format of @ 

Once we get the Approval request then we should call the Read File Service. Create a Read File Service in @ . Once the create File Service is completed, then send the message back to Agent in the format of [text](../common/types/src/wstypes/app-to-agent-ws/fsServiceResponses.ts) ReadFileSuccessResultResponseSchema


Details:
- Message Format of Message Received from Agent is in [text](../common/types/src/wstypes/agent-to-app-ws/actions/fsEventSchemas.ts)
    * Typing:
    ```ts
    export interface CreateFileEvent {
      type: 'fsEvent';
      action: 'createFile';
      requestId: string;
      message: {
        filePath: string;
      }
    }
    ```


        
 - Message format of 

 Message Format of Message Received to TUI form agent server  for confirmation of file read request
 ```ts
interface FileReadConfirmation {
  // Base message properties
  type: 'message';
  actionType: 'READFILE';
  sender: 'agent';
  messageId: string;
  threadId: string;
  templateType: 'READFILE';
  timestamp: string | number;
  agentInstanceId?: string;
  agentId?: string;
  parentAgentInstanceId?: string;
  parentId?: string;
  parentAgentId?: string;
  
  // Payload properties
  payload: {
    type: 'file';
    path: string;
    content: string;
    originalContent?: string;
    stateEvent: 'ASK_FOR_CONFIRMATION';
    diff?: string;
    language?: string;
    size?: number;
    encoding?: string;
  };
}
```
Message Format of Message Received from Agent for successful file read

```ts
interface FileReadSuccess {
  // Base message properties
  type: 'message';
  actionType: 'READFILE';
  sender: 'agent';
  messageId: string;
  threadId: string;
  templateType: 'READFILE';
  timestamp: string | number;
  agentInstanceId?: string;
  agentId?: string;
  parentAgentInstanceId?: string;
  parentId?: string;
  parentAgentId?: string;
  
  // Payload properties
  payloadType?: string;
  payloadPath?: string;
  payloadContent?: string;
  payloadCommand?: string;
  payloadActionType?: string;
  payloadProcessId?: number;
  stateEvent: 'FILE_READ';
  payloadToolName?: string;
  payloadServerName?: string;
  payloadParams?: Record<string, any>;
  
  // File-specific payload properties
  path: string;
  content: string;
  originalContent?: string;
  diff?: string;
  language?: string;
  size?: number;
  encoding?: string;

}
```

createbackendagenthandlers.md
In [text](../remoteexecutor/updatedAgentServer/src/handlers/agentMessaging/routerforMessageReceivedFromAgent.ts), create a new handler for handling ReadFile File. 

The Agent will send a message to this router for Read File in the Format as in [text](../common/types/src/wstypes/agent-to-app-ws/actions/fsEventSchemas.ts) as ReadFileEvent 

Please create the file handler in  [text](../remoteexecutor/updatedAgentServer/src/localAgentRequestFulfilment) 
This will check if the File Handling permission is present. If the Permission is not present then if TUi is enabled or app is enabled then it will send the REquest permission to the Tui or App in the format of [text](../codeboltjs/common/types/src/wstypes/app-to-ui-ws/fileMessageSchemas.ts) fileReadConfirmationSchema

Also in @updatedAgentServer/src/handlers/agentMessaging/routerforMessageReceivedFromtui.ts we will have a router for Approval of file System Read Request in the format of [text](../codeboltjs/common/types/src/wstypes/app-to-ui-ws/fileMessageSchemas.ts)

Once we get the Approval request then we should call the Read File Service. Create a Read File Service in [text](../codeboltjs/remoteexecutor/updatedAgentServer/src/agentRequestHandlers). Once the create File Service is completed, then send the message back to Agent in the format of [text](../common/types/src/wstypes/app-to-agent-ws/fsServiceResponses.ts) ReadFileSuccessResultResponseSchema


Details:
- Message Format of Message Received from Agent is in [text](../common/types/src/wstypes/agent-to-app-ws/actions/fsEventSchemas.ts)
    * Typing:
    ```ts
    export interface ReadFileEvent {
      type: 'fsEvent';
      action: 'readFile';
      requestId: string;
      message: {
        filePath: string;
      }
    }
    ```

 - Message format of 

 ### Message Format of Message Received to TUI form agent server  for confirmation of file read request
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


in [text](../remoteexecutor/updatedAgentServer/src/handlers/tuiMessaging/routerforMessageReceivedFromTui.ts)

## Handling Confirmation Responses from TUI

When receiving a confirmation response from the TUI, we need to:

1. Check if a message with the same `messageId` is waiting for approval in the readFileHandler
2. Verify that the message type is `confirmationResponse`
3. Process the request based on the user's approval decision is `userMessage` is `"approve"` or `"reject"` and call the respective function in readFileHandler

### Message Format for Confirmation Response from TUI
```ts
type ConfirmationResponse = {
    type: "confirmationResponse";
    path?: string;
    action?: string;
    agentId: string;
    userMessage: string;
    threadId: string;
    processId?: string;
    messageId: string;
    agentInstanceId: string;
}
```

### If User Approves the Request

When the user approves the request and the content is successfully retrieved from readFileHandler, send the following success message to the Agent:

#### Success Message Format
```
{
  "type": "readFileResponse";
  "requestId": string;
  "content": string;
  "success": boolean;
  "message": string;
  "data"?: any,
  "error"?: string
}
```

### If User Rejects the Request or an Error Occurs

When the user rejects the request or an error occurs in readFileHandler, send the following error message to the Agent:

#### Error Message Format
```
{
  "type": "readFileResponse";
  "requestId": string;
  "success": boolean;
  "message": string;
  "data"?: any,
  "error"?: string
}
```

### Notification to Remote

In both accept and reject cases, the remote should also be notified. This ensures that remote clients are aware of the user's decision regarding file operations.

### Message Format for Successful File Read Event

When a file is successfully read, the Agent receives the following message format:

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
```
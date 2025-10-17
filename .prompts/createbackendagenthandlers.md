
createbackendagenthandlers.md
In [text](../remoteexecutor/updatedAgentServer/src/handlers/agentMessaging/routerforMessageReceivedFromAgent.ts), create a new handler for handling ReadFile File. 

The Agent will send a message to this router for Read File in the Format as in [text](../common/types/src/wstypes/agent-to-app-ws/actions/fsEventSchemas.ts) as ReadFileEvent 

Please create the file handler in  [text](../remoteexecutor/updatedAgentServer/src/localAgentRequestFulfilment) 
This will check if the File Handling permission is present. If the Permission is not present then if TUi is enabled or app is enabled then it will send the REquest permission to the Tui or App in the format of [text](../common/types/src/wstypes/app-to-ui-ws/fileMessageSchemas.ts) fileReadConfirmationSchema

Also in @updatedAgentServer/src/handlers/agentMessaging/routerforMessageReceivedFromtui.ts we will have a router for Approval of file System Read Request in the format of [text](../common/types/src/wstypes/app-to-ui-ws/fileMessageSchemas.ts)

Once we get the Approval request then we should call the Read File Service. Create a Read File Service in [text](../remoteexecutor/updatedAgentServer/src/Please create the file handler in  [text](../remoteexecutor/updatedAgentServer/src/localAgentRequestFulfilment) 
). Once the create File Service is completed, then send the message back to Agent in the format of [text](../common/types/src/wstypes/app-to-agent-ws/fsServiceResponses.ts) ReadFileSuccessResultResponseSchema


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

### Scquence Mermaid Diangram

```mermaid
sequenceDiagram
    participant Agent
    participant Router
    participant HandleReadFile
    participant PerformReadFile
    participant HandleFileCreationApproval
    participant TUI
    participant App
    participant Remote
 
    Agent->>HandleReadFile: Agent Message Received (function: RouterForMessageReceivedByAgent)
    alt Needs Approval
        alt Agent Started by TUI
            HandleReadFile->>TUI: Send for Approval (function: SendToTUI)
            TUI->>HandleFileCreationApproval: Approval/Rejection
            alt Approved
                HandleFileCreationApproval->>PerformReadFile: Perform Read File
                PerformReadFile->>Agent: Success/Fail
                PerformReadFile->>TUI: Send to TUI (Success/Fail)
                PerformReadFile->>Remote: Success/Fail
            else Rejected
                HandleFileCreationApproval->>Agent: Rejected
                HandleFileCreationApproval->>Remote: Rejected
            end
        else Agent Started by App
            HandleReadFile->>App: Send for Approval
            App->>HandleFileCreationApproval: Approval/Rejection
            alt Approved
                HandleFileCreationApproval->>PerformReadFile: Perform Read File
                PerformReadFile->>Agent: Success/Fail
                PerformReadFile->>App: Send to App (Success/Fail)
                PerformReadFile->>Remote: Success/Fail
            else Rejected
                HandleFileCreationApproval->>Agent: Rejected
                HandleFileCreationApproval->>Remote: Rejected
            end
        end
    else No Approval Needed
        HandleReadFile->>PerformReadFile: Perform Read File
        PerformReadFile->>Agent: Success/Fail
        PerformReadFile->>Remote: Success/Fail
        alt Agent Started by TUI
            PerformReadFile->>TUI: Send to TUI (Success/Fail)
        else Agent Started by App
            PerformReadFile->>App: Send to App (Success/Fail)
 
        end
 
    end
```

About the Flow:
The concept here is that the process starts from AGent Sending message to Router for Message received By Agent. This in turn checks that if it is type of Read File then it sends to Handle Read File function. the Handle Read File function checks if it has permission to Read File. If it does not have permission to read File, then it will send A Message For Approval. It will check if the agent was started by TUI then it will Send to Tui which will send to the TUI using TUI websocket. The TUI will get the user to accept or reject and that message will come to Router for Message received from TUI. That will check the message type and if it is read File Type, then it will send to HandleFileCreationApproval. This function will check that if it approved then it it will call Perform read File. If the Approval is rejected then it will send a rejected message to send to Agent which will send it back to the agent. Also When the Perform read File is Called, it will actually perform the action and send the Success or fail response to the Agent. it will also send a Success or fail Message to Sent To Tui to send to TUI. Also note hat if handle read File does not needs approval then it will automatically send the message to PerformRead File. Also along with that PerformReadFile will send a Success or Fail Message to Remote. Also if the Approval or reject is called and it is rejected, then also send a message to Remote.
Also If the AGent in RouterForMessageReceivedByAgent is started By App instead of TUI, then in that case The handleReadFile will not send to Tui instead Send to App for Approval Which wil return approval or rejection to RouterForMessageReceivedFromApp. If the request is approved, then it will call Handle File Creation Approval, which will agent if approved will call PerformReadFile. The Perform Read File If Successful will send a success or fail message to Send to App. It will also Send Success or Fail Message to Agent. It will also send Success it will send to remote.
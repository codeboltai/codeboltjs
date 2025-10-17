In [text](../tui/gotui) we have a bubbletea based TUI. This is getting the messages from Updated Agent Server and it shows them in Chat. We have various types of Messages coming, and we need to create templates for displaying each of them.

The Templates are present in  [text](../tui/gotui/internal/components/chattemplates)

We need to create a new template for File Write. There Will be multiple types of messages:
1. File Read Request Confirmation Message
2. File Read Success Message
3. File Read Failure Message

The Message Rendering is handeled by [text](../tui/gotui/internal/components/chattemplates/manager.go) and the main chat is Controlled by [text](../tui/gotui/internal/components/chat/chat.go)

The Request Confirmation Message will be in the Format of [text](../common/types/src/wstypes/app-to-ui-ws/fileMessageSchemas.ts) FileReadConfirmation
Request Confirmation Message Schema:
   
```ts
   type FileReadConfirmation = {
    type?: "message";
    actionType?: "READFILE";
    sender?: "agent";
    messageId?: string;
    threadId?: string;
    templateType?: "READFILE";
    timestamp?: string;
    agentInstanceId?: string;
    agentId?: string;
    parentAgentInstanceId?: string;
    parentId?: string;
    parentAgentId?: string;
    payload?: {
        type?: "file";
        actionType?: string;
        params?: Record<string, any>;
        path?: string;
        content?: string;
        command?: string;
        processId?: number;
        stateEvent?: "ASK_FOR_CONFIRMATION";
        toolName?: string;
        serverName?: string;
        originalContent?: string;
        diff?: string;
        language?: string;
        size?: number;
        encoding?: string;
    } 
}
```

The Please note that Request Confirmation Message will be of type confirmation Messagae. The Confirmation Messages will show the message and also give the user options to approve or reject the request or always allow. Also when the Confirmation Messages are shown then the chatInput is not visible. That allows the user to focus on the confirmation message. 

The Confirmation Message for Write File will show the File Path and the Diff content of the File. The Diff Content can be rendered using @gotui/internal/components/uicomponents/diffview components.

The Sucess message will be in format of [text](../common/types/src/wstypes/app-to-agent-ws/fsServiceResponses.ts) FileReadSuccess
- Success Message Schema:
    ```ts
  type FileReadSuccess = {
    type?: "message";
    actionType?: "READFILE";
    sender?: "agent";
    messageId?: string;
    threadId?: string;
    templateType?: "READFILE";
    timestamp?: string;
    agentInstanceId?: string;
    agentId?: string;
    parentAgentInstanceId?: string;
    parentId?: string;
    parentAgentId?: string;
    payload?: {
        type?: "file";
        actionType?: string;
        params?: Record<string, any>;
        path?: string;
        content?: string;
        command?: string;
        processId?: number;
        stateEvent?: "FILE_READ";
        toolName?: string;
        serverName?: string;
        originalContent?: string;
        diff?: string;
        language?: string;
        size?: number;
        encoding?: string;
    } 
}
    ```
The Success Message Template Will Have A Text saying File Read and then the path of the file that was written.


Similarly for Failure Message will be in format of [text](../common/types/src/wstypes/app-to-agent-ws/fsServiceResponses.ts) FileReadError
- Failure Message Schema:
   ```ts
     type FileReadSuccess = {
    type?: "message";
    actionType?: "READFILE";
    sender?: "agent";
    messageId?: string;
    threadId?: string;
    templateType?: "READFILE";
    timestamp?: string;
    agentInstanceId?: string;
    agentId?: string;
    parentAgentInstanceId?: string;
    parentId?: string;
    parentAgentId?: string;
    payload?: {
        type?: "file";
        actionType?: string;
        params?: Record<string, any>;
        path?: string;
        content?: string;
        command?: string;
        processId?: number;
        stateEvent?: "FILE_READ_ERROR";
        toolName?: string;
        serverName?: string;
        originalContent?: string;
        diff?: string;
        language?: string;
        size?: number;
        encoding?: string;
    } 
}
   ```

The Failure Message Template Will Have A Text saying File Write Failed and then the path of the file that was written.


When the user Approves or rejects the Request then a message will be sent to the UpdatedAgentServer using websocket.
The Format of the Message will be in the format of:
- Approval Message Schema:
    ```ts
    {
        "type": "confirmationResponse",
        "path": "path/to/file",
        "action": "WRITEFILE",
        "agentId": "123",
        "userMessage": "approve",
        "threadId": "123",
        "processId": "123",
        "messageId": "123"
    }
    ```



When the user Approves or rejects the Request then a message will be sent to the UpdatedAgentServer using websocket.
The Format of the Message will be in the format of:
- Approval Message Schema:
 ```ts
    {
        "type": "confirmationResponse",
        "path": "path/to/file",
        "action": "WRITEFILE",
        "agentId": "123",
        "userMessage": "approve",
        "threadId": "123",
        "processId": "123",
        "messageId": "123"
    }
    ```

    

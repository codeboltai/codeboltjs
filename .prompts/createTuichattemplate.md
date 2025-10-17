In [text](../tui/gotui) we have a bubbletea based TUI. This is getting the messages from Updated Agent Server and it shows them in Chat. We have various types of Messages coming, and we need to create templates for displaying each of them.

The Templates are present in  [text](../tui/gotui/internal/components/chattemplates)

We need to create a new template for File Write. There Will be multiple types of messages:
1. File Read Request Confirmation Message
2. File Read Success Message
3. File Read Failure Message

The Message Rendering is handeled by [text](../tui/gotui/internal/components/chattemplates/manager.go) and the main chat is Controlled by [text](../tui/gotui/internal/components/chat/chat.go)

The Request Confirmation Message will be in the Format of [text](../common/types/src/wstypes/app-to-ui-ws/fileMessageSchemas.ts)
- Request Confirmation Message Schema:
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

The Please note that Request Confirmation Message will be of type confirmation Messagae. The Confirmation Messages will show the message and also give the user options to approve or reject the request or always allow. Also when the Confirmation Messages are shown then the chatInput is not visible. That allows the user to focus on the confirmation message. 

The Confirmation Message for Write File will show the File Path and the Diff content of the File. The Diff Content can be rendered using @gotui/internal/components/uicomponents/diffview components.

The Sucess message will be in format of @codebolt/types/agent-to-app-ws-types.ts
- Success Message Schema:
    {
        "type": "message",
        "actionType": "WRITEFILE",
        "sender": "agent",
        "messageId": "123",
        "threadId": "123",
        "templateType": "WRITEFILE",
        "timestamp": "123",
        "payload": {
            "type": "file",

The Success Message Template Will Have A Text saying File Write and then the path of the file that was written.


Similarly for Failure Message will be in format of @codebolt/types/agent-to-app-ws-types.ts
- Failure Message Schema:
    {
        "type": "message",
        "actionType": "WRITEFILE",
        "sender": "agent",
        "messageId": "123",
        "threadId": "123",
        "templateType": "WRITEFILE",
        "timestamp": "123",
        "payload": {
            "type": "file",

The Failure Message Template Will Have A Text saying File Write Failed and then the path of the file that was written.


When the user Approves or rejects the Request then a message will be sent to the UpdatedAgentServer using websocket.
The Format of the Message will be in the format of:
- Approval Message Schema:
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
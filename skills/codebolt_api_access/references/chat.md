# codebolt.chat - Chat & WebSocket Communication Module

The `codebolt.chat` module provides WebSocket-based communication with the Codebolt server, enabling real-time chat functionality, message handling, process lifecycle management, confirmation dialogs, and notification events.

## Response Types

### ChatMessage

Returned when retrieving chat history for a thread.

```typescript
interface ChatMessage {
  type: string;
  threadId: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'tool' | 'system';
    content: string | Array<{
      type: string;
      text?: string;
      image_url?: { url: string; };
    }>;
    tool_call_id?: string;
    tool_calls?: Array<{
      id: string;
      type: 'function';
      function: {
        name: string;
        arguments: string;
      };
    }>;
    name?: string;
  }>;
}
```

### UserMessage

Returned when waiting for a reply from a user.

```typescript
interface UserMessage {
  type: string;
  message: {
    userMessage: string;
    currentFile?: string;
    selectedAgent: {
      id: string;
      name: string;
      lastMessage?: Record<string, any>;
      agentType?: 'marketplace' | 'local-zip' | 'local-path' | 'server-zip';
      agentDetails?: string;
    };
    mentionedFiles: string[];
    mentionedFullPaths: string[];
    mentionedFolders: string[];
    mentionedMultiFile?: string[];
    mentionedMCPs: string[];
    uploadedImages: string[];
    actions?: any[];
    mentionedAgents: any[];
    mentionedDocs?: any[];
    links?: any[];
    universalAgentLastMessage?: string;
    selection?: any | null;
    controlFiles?: any[];
    feedbackMessage?: string;
    terminalMessage?: string;
    messageId: string;
    threadId: string;
    templateType?: string;
    processId?: string;
    shadowGitHash?: string;
    remixPrompt?: any;
    activeFile?: string;
    openedFiles?: string[];
  };
  sender: {
    senderType: string;
    senderInfo: Record<string, any>;
  };
  templateType: string;
  data: {
    text: string;
    [key: string]: any;
  };
  messageId: string;
  threadId: string;
  timestamp: string;
}
```

### ConfirmationResponse

Returned when sending a confirmation request or asking a question.

```typescript
interface ConfirmationResponse {
  success?: boolean;
  message?: string;
  error?: string;
  response?: string;
  feedback?: string;
}
```

### SteeringMessage

Represents a steering message received from the server.

```typescript
interface SteeringMessage {
  [key: string]: any;
}
```

## Methods

### `getChatHistory(threadId)`

Retrieves the chat history for a specific thread.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| threadId | string | Yes | The ID of the thread to retrieve history for |

**Response:**
```typescript
{
  type: string;
  threadId: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'tool' | 'system';
    content: string | Array<{
      type: string;
      text?: string;
      image_url?: { url: string; };
    }>;
    tool_call_id?: string;
    tool_calls?: Array<{
      id: string;
      type: 'function';
      function: { name: string; arguments: string; };
    }>;
    name?: string;
  }>;
}
```

```typescript
const history = await codebolt.chat.getChatHistory('thread-123');
if (history.messages) {
  console.log(`Found ${history.messages.length} messages`);
}
```

---

### `setRequestHandler(handler)`

Sets a global request handler for all incoming WebSocket messages. The handler receives requests and can send responses back.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| handler | (request: any, response: (data: any) => void) => Promise<void> | Yes | Async handler function to process incoming messages |

```typescript
codebolt.chat.setRequestHandler(async (request, response) => {
  console.log('Received:', request);
  response({ success: true, data: 'Processed' });
});
```

---

### `sendMessage(message, payload?)`

Sends a message through the WebSocket connection without waiting for a response.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| message | string | Yes | The message content to send |
| payload | any | No | Optional additional data to send with the message |

```typescript
codebolt.chat.sendMessage('Hello, world!', { userId: '123' });
```

---

### `waitforReply(message)`

Sends a message and waits for a reply from the user.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| message | string | Yes | The message to send |

**Response:**
```typescript
{
  type: string;
  message: {
    userMessage: string;
    currentFile?: string;
    selectedAgent: { id: string; name: string; ... };
    mentionedFiles: string[];
    mentionedFullPaths: string[];
    mentionedFolders: string[];
    mentionedMCPs: string[];
    uploadedImages: string[];
    messageId: string;
    threadId: string;
    ...
  };
  sender: {
    senderType: string;
    senderInfo: Record<string, any>;
  };
  data: { text: string; [key: string]: any; };
  messageId: string;
  threadId: string;
  timestamp: string;
}
```

```typescript
const reply = await codebolt.chat.waitforReply('What should I do next?');
if (reply.message) {
  console.log('User replied:', reply.message.userMessage);
}
```

---

### `processStarted(onStopClicked?)`

Notifies the server that a process has started and optionally sets up a listener for stop events.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| onStopClicked | (message: any) => void | No | Callback function to handle stop process events |

**Response:**
```typescript
{
  stopProcess: () => void;
  cleanup?: () => void;
}
```

```typescript
const process = codebolt.chat.processStarted((message) => {
  console.log('Stop clicked, stopping process...');
});

process.stopProcess();
process.cleanup();
```

---

### `stopProcess()`

Stops the ongoing process by sending a process stopped event to the server.

```typescript
codebolt.chat.stopProcess();
```

---

### `processFinished()`

Notifies the server that the current process has finished.

```typescript
codebolt.chat.processFinished();
```

---

### `sendConfirmationRequest(confirmationMessage, buttons?, withFeedback?)`

Sends a confirmation request to the server with customizable buttons and optional feedback.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| confirmationMessage | string | Yes | The message to display in the confirmation dialog |
| buttons | string[] | No | Array of button labels (default: []) |
| withFeedback | boolean | No | Whether to request feedback from user (default: false) |

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  response?: string;
  feedback?: string;
}
```

```typescript
const result = await codebolt.chat.sendConfirmationRequest(
  'Do you want to proceed?',
  ['Yes', 'No'],
  false
);
if (result.response === 'Yes') {
  console.log('User confirmed');
}
```

---

### `askQuestion(question, buttons?, withFeedback?)`

Alias for `sendConfirmationRequest` - sends a question to the user with customizable buttons.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| question | string | Yes | The question to ask |
| buttons | string[] | No | Array of button labels (default: []) |
| withFeedback | boolean | No | Whether to request feedback from user (default: false) |

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  response?: string;
  feedback?: string;
}
```

```typescript
const answer = await codebolt.chat.askQuestion('Which feature do you want?', ['Feature A', 'Feature B']);
console.log('Selected:', answer.response);
```

---

### `sendNotificationEvent(notificationMessage, type)`

Sends a notification event to the server with a specific type.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| notificationMessage | string | Yes | The message to display in the notification |
| type | 'debug' \| 'git' \| 'planner' \| 'browser' \| 'editor' \| 'terminal' \| 'preview' | Yes | The type/category of the notification |

```typescript
codebolt.chat.sendNotificationEvent('File saved successfully', 'editor');
codebolt.chat.sendNotificationEvent('Git push completed', 'git');
```

---

### `checkForSteeringMessage()`

Checks if any steering message has been received without waiting. Returns the message if available, otherwise returns null.

**Response:**
```typescript
{
  [key: string]: any;
}
```

```typescript
const steering = codebolt.chat.checkForSteeringMessage();
if (steering) {
  console.log('Steering message received:', steering);
}
```

---

### `onSteeringMessageReceived()`

Waits for a steering message to be received. Returns immediately if a message is already available, otherwise waits for the next one.

**Response:**
```typescript
{
  [key: string]: any;
}
```

```typescript
const message = await codebolt.chat.onSteeringMessageReceived();
console.log('Steering message:', message);
```

---

## Examples

### Basic Chat Workflow

```typescript
async function handleChatConversation() {
  const threadId = 'thread-123';

  const history = await codebolt.chat.getChatHistory(threadId);
  console.log(`Loaded ${history.messages?.length || 0} messages`);

  const reply = await codebolt.chat.waitforReply('What would you like to do?');
  console.log('User said:', reply.message.userMessage);
}
```

### Process Management with Cleanup

```typescript
async function runLongProcess() {
  const process = codebolt.chat.processStarted((message) => {
    console.log('User requested to stop');
    process.stopProcess();
  });

  try {
    await performWork();
  } finally {
    codebolt.chat.processFinished();
    process.cleanup();
  }
}
```

### Interactive Confirmation

```typescript
async function confirmAction() {
  const result = await codebolt.chat.sendConfirmationRequest(
    'Delete these files?',
    ['Yes', 'Cancel'],
    false
  );

  if (result.response === 'Yes') {
    await codebolt.fs.deleteFile('/path/to/file');
    codebolt.chat.sendNotificationEvent('File deleted', 'editor');
  }
}
```

### Setting Up Global Message Handler

```typescript
codebolt.chat.setRequestHandler(async (request, response) => {
  if (request.type === 'customEvent') {
    const processed = await processData(request.data);
    response({ success: true, result: processed });
  }
});
```

### Polling for Steering Messages

```typescript
async function monitorSteeringMessages() {
  while (true) {
    const message = await codebolt.chat.onSteeringMessageReceived();
    if (message.action === 'pause') {
      console.log('Pausing...');
      await waitForResume();
    }
  }
}
```
import CbWS from './websocket';
import { EventEmitter } from 'events';
import { ChatMessage, UserMessage } from '@codebolt/types';
declare class CustomEventEmitter extends EventEmitter {
}
declare class Chat {
    private wsManager;
    private ws;
    private eventEmitter;
    constructor(wsManager: CbWS);
    getChatHistory: () => Promise<ChatMessage[]>;
    onActionMessage: () => CustomEventEmitter | undefined;
    sendMessage: (message: string) => void;
    waitforReply: (message: string) => Promise<UserMessage>;
    processStarted: () => {
        event: CustomEventEmitter;
        stopProcess: () => void;
    };
    stopProcess: () => void;
    processFinished: () => void;
    sendConfirmationRequest: (confirmationMessage: string, buttons?: string[]) => Promise<string>;
    sendNotificationEvent: (notificationMessage: string, type: "debug" | "git" | "planner" | "browser" | "editor" | "terminal" | "preview") => void;
}
export default Chat;

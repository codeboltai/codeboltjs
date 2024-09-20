import CbWS from './websocket';
import { EventEmitter } from 'events';
import { ChatMessage, UserMessage } from '@codebolt/types';

class CustomEventEmitter extends EventEmitter {}

class Chat {
    private wsManager: CbWS;
    private ws: any;
    private eventEmitter: CustomEventEmitter;

    constructor(wsManager: CbWS) {
        this.wsManager = wsManager;
        // this.ws = this.wsManager.getWebsocket();
        this.eventEmitter = new CustomEventEmitter();
    }

    getChatHistory = (): Promise<ChatMessage[]> => {
        return new Promise((resolve, reject) => {
            this.wsManager.send(JSON.stringify({
                "type": "getChatHistory"
            }));
            this.wsManager.on((data) => {
                const response = JSON.parse(data);
                if (response.type === "getChatHistoryResponse") {
                    resolve(response);
                }
            });
        });
    }

    onActionMessage = () => {
        if (!this.ws) return;
        this.wsManager.on((data: string) => {
            const response = JSON.parse(data);
            if (response.type === "messageResponse") {
                this.eventEmitter.emit("userMessage", response, (message: string) => {
                    console.log("Callback function invoked with message:", message);
                    this.wsManager.send(JSON.stringify({
                        "type": "processStoped"
                    }));
                });
            }
        });
        return this.eventEmitter;
    }

    sendMessage = (message: string) => {
        console.log(message);
        this.wsManager.send(JSON.stringify({
            "type": "sendMessage",
            "message": message
        }));
    }

    waitforReply = (message: string): Promise<UserMessage> => {
        return new Promise((resolve, reject) => {
            this.wsManager.send(JSON.stringify({
                "type": "waitforReply",
                "message": message
            }));
            this.wsManager.on((data: string) => {
                const response = JSON.parse(data);
                if (response.type === "waitFormessageResponse") {
                    resolve(response);
                }
            });
        });
    }

    processStarted = () => {
        this.wsManager.send(JSON.stringify({
            "type": "processStarted"
        }));
        this.wsManager.on((data: string) => {
            const message = JSON.parse(data);
            console.log("Received message:", message);
            if (message.type === 'stopProcessClicked') {
                this.eventEmitter.emit("stopProcessClicked", message);
            }
        });

        return {
            event: this.eventEmitter,
            stopProcess: this.stopProcess
        };
    }

    stopProcess = () => {
        console.log("Stopping process...");
        this.wsManager.send(JSON.stringify({
            "type": "processStoped"
        }));
    }

    processFinished = () => {
        console.log("Process Finished ...");
        this.wsManager.send(JSON.stringify({
            "type": "processFinished"
        }));
    }

    sendConfirmationRequest = (confirmationMessage: string, buttons: string[] = []): Promise<string> => {
        return new Promise((resolve, reject) => {
            this.wsManager.send(JSON.stringify({
                "type": "confirmationRequest",
                "message": confirmationMessage,
                buttons: buttons
            }));
            this.wsManager.on((data: string) => {
                const response = JSON.parse(data);
                if (response.type === "confirmationResponse") {
                    resolve(response);
                }
            });
        });
    }

    sendNotificationEvent = (notificationMessage: string, type: 'debug' | 'git' | 'planner' | 'browser' | 'editor' | 'terminal' | 'preview'): void => {
        this.wsManager.send(JSON.stringify({
            "type": "notificationEvent",
            "message": notificationMessage,
            "eventType": type
        }));
    }
}

export default Chat;
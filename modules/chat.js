"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class CustomEventEmitter extends events_1.EventEmitter {
}
class Chat {
    constructor(wsManager) {
        this.getChatHistory = () => {
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
        };
        this.onActionMessage = () => {
            if (!this.ws)
                return;
            this.wsManager.on((data) => {
                const response = JSON.parse(data);
                if (response.type === "messageResponse") {
                    this.eventEmitter.emit("userMessage", response, (message) => {
                        console.log("Callback function invoked with message:", message);
                        this.wsManager.send(JSON.stringify({
                            "type": "processStoped"
                        }));
                    });
                }
            });
            return this.eventEmitter;
        };
        this.sendMessage = (message) => {
            console.log(message);
            this.wsManager.send(JSON.stringify({
                "type": "sendMessage",
                "message": message
            }));
        };
        this.waitforReply = (message) => {
            return new Promise((resolve, reject) => {
                this.wsManager.send(JSON.stringify({
                    "type": "waitforReply",
                    "message": message
                }));
                this.wsManager.on((data) => {
                    const response = JSON.parse(data);
                    if (response.type === "waitFormessageResponse") {
                        resolve(response);
                    }
                });
            });
        };
        this.processStarted = () => {
            this.wsManager.send(JSON.stringify({
                "type": "processStarted"
            }));
            this.wsManager.on((data) => {
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
        };
        this.stopProcess = () => {
            console.log("Stopping process...");
            this.wsManager.send(JSON.stringify({
                "type": "processStoped"
            }));
        };
        this.processFinished = () => {
            console.log("Process Finished ...");
            this.wsManager.send(JSON.stringify({
                "type": "processFinished"
            }));
        };
        this.sendConfirmationRequest = (confirmationMessage, buttons = []) => {
            return new Promise((resolve, reject) => {
                this.wsManager.send(JSON.stringify({
                    "type": "confirmationRequest",
                    "message": confirmationMessage,
                    buttons: buttons
                }));
                this.wsManager.on((data) => {
                    const response = JSON.parse(data);
                    if (response.type === "confirmationResponse") {
                        resolve(response);
                    }
                });
            });
        };
        this.sendNotificationEvent = (notificationMessage, type) => {
            this.wsManager.send(JSON.stringify({
                "type": "notificationEvent",
                "message": notificationMessage,
                "eventType": type
            }));
        };
        this.wsManager = wsManager;
        // this.ws = this.wsManager.getWebsocket();
        this.eventEmitter = new CustomEventEmitter();
    }
}
exports.default = Chat;

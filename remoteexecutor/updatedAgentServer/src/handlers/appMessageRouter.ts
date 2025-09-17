import { ClientConnection, Message } from "@codebolt/shared-types";

export class AppMessageRouter {
    constructor(){

    }
    handleAppResponse(app: ClientConnection, message: Message): void {
  // Handle all typed events from agents
    const action =  message.type;
    switch (action) {

    }
    }
}
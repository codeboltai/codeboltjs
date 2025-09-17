import { ClientConnection, formatLogMessage, Message } from "@codebolt/shared-types";



export class AgentMessageRouter {

    constructor() {

    }

    /**
     * Handle requests from agents (asking app to do file operations)
     * This method implements the functionality of fsService.handleFsEvents within the switch cases
     */
    async handleAgentRequest(agent: ClientConnection, message: Message | any) {
        console.log(formatLogMessage('info', 'MessageRouter', `Handling agent request: ${message.type || message.action} from ${agent.id}`));
    }
}
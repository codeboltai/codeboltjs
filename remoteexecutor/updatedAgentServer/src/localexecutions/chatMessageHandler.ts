
import MultillmModule, { getProviders } from '@arrowai/multillm';
const Multillm = (MultillmModule as any).default;
import type {
    InferenceEvent
} from '@codebolt/types/wstypes/agent-to-app-ws/actions/llmEventSchemas'
import type {
    LLMResponse
} from '@codebolt/types/wstypes/app-to-agent-ws/llmServiceResponses'
import { LLMProviderService } from '../../main/services/LLMProviderService';
import { NotificationService } from '../../main/services/NotificationService';
import type { ClientConnection } from '../types';
import { logger } from '@/main/utils/logger';
import { ConnectionManager } from '@/main/core/connectionManagers/connectionManager';
import { ChatEvent, SendMessageEvent } from '@codebolt/types/agent-to-app-ws-types';
import type {ChatNotification} from '@codebolt/types/wstypes/agent-to-app-ws/notification/chatNotificationSchemas'


export class ChatMessageHandler {
    private connectionManager = ConnectionManager.getInstance();
    private llmProviderService: LLMProviderService;
    private notificationService: NotificationService;
    constructor() {
        this.llmProviderService = LLMProviderService.getInstance();
        this.notificationService = NotificationService.getInstance();
    }
    async handleChatMessageRequest(agent: ClientConnection, request: SendMessageEvent): Promise<string> {
        try {
            // Send initial notification - request started
            if (agent) {
                this.notificationService.sendChatMessageNotification({
                    agent,
                    messageId: request.requestId,
                    agentId: agent.id,
                    threadId: agent.threadId,
                    agentInstanceId: agent.instanceId,
                    parentAgentInstanceId: agent.parentAgentInstanceId || '',
                    message: request.message,
                    parentId: agent?.parentId || '',
                    requestId: request.requestId
                });
            }
            return request.type
        } catch (error) {
            logger.info("error process request", error)

           return "error process request"
        }
    }


}
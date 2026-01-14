
import MultillmModule, { getProviders } from '@arrowai/multillm';
const Multillm = (MultillmModule as any).default;
import type {
    InferenceEvent
} from '@codebolt/types/wstypes/agent-to-app-ws/actions/llmEventSchemas'
import type {
    LLMResponse
} from '@codebolt/types/wstypes/app-to-agent-ws/llmServiceResponses'
import { LLMProviderService } from '../main/services/LLMProviderService';
import { NotificationService } from '../main/services/NotificationService';
import type { ClientConnection } from '../types';
import { logger } from '@/main/utils/logger';
import { ConnectionManager } from '@/main/core/connectionManagers/connectionManager';

const prepareLLmRequest = (finalMessage: InferenceEvent, model: string) => {
    try {
        if (finalMessage.message.prompt.full || finalMessage.message.prompt.tools) {
            const data: any = {
                model: model || "",
                messages: finalMessage.message.prompt.messages,
            };

            if (finalMessage.message.prompt.tools) {
                data.tools = finalMessage.message.prompt.tools;
            }


            if (finalMessage?.message?.prompt?.tools?.length && finalMessage.message.prompt.tool_choice) {
                data.tool_choice = finalMessage.message.prompt.tool_choice;
            }

            if (finalMessage.message.prompt.max_tokens) {
                data.max_tokens = finalMessage.message.prompt.max_tokens;
            }

            return data;
        }

        else
            return {
                model: model,
                messages: finalMessage.message.prompt.messages || (Array.isArray(finalMessage.message.prompt) ? finalMessage.message.prompt : [{ role: 'system', content: finalMessage.message.prompt }]),
                tools: finalMessage.message.prompt.tools,
                tool_choice: finalMessage.message.prompt.tool_choice || 'auto',
                stream: false,
            };
    } catch (error) {
        logger.error("error", error)
    }

}
export class AIRequesteHandler {
    private connectionManager = ConnectionManager.getInstance();
    private llmProviderService: LLMProviderService;
    private notificationService: NotificationService;
    constructor() {
        this.llmProviderService = LLMProviderService.getInstance();
        this.notificationService = NotificationService.getInstance();
    }
    async handleAiRequest(agent: ClientConnection, request: any): Promise<LLMResponse> {
        let messageId = new Date().getTime().toString();

        try {
            // Send initial notification - request started
            if (agent) {
                this.notificationService.sendAiRequestNotification({
                    agent,
                    messageId: messageId,
                    agentId: agent.id,
                    threadId:  agent.threadId,
                    agentInstanceId: agent.instanceId,
                    parentAgentInstanceId: agent.parentAgentInstanceId,
                    message: `Sending Request To AI: View Logs.`,
                    parentId: agent?.parentId,
                    requestId: request.requestId
                });
            }

            // Get configured LLM providers and custom model config
            const { providers, custom_model_config } = await this.llmProviderService.getConfiguredLLMProviders();

            // if (providers.length === 0) {
            //     throw new Error('No LLM providers configured');
            // }

            // Use the first available provider
            const provider = providers[0];

            // Create Multillm instance with provider configuration
            // const CodeboltAi = new Multillm(
            //    "zai" as any,
            //     provider.key || '',
            //     null,
            //     ''
            // );


            const finalRequest = prepareLLmRequest(request, 'glm-4.6');
           
            const CodeboltAi = new Multillm('zai', 'gml-4.6', null, provider.key);

           
            const response = await CodeboltAi.createCompletion(finalRequest);

            // Extract the first choice's message content
            const content = response.choices?.[0]?.message?.content || '';

            // Send success notification
            if (agent) {
                this.notificationService.sendAiRequestSuccessNotification({
                    agent,
                    messageId: messageId,
                    agentId: agent.id,
                    threadId:  agent.threadId,
                    agentInstanceId: agent.instanceId,
                    parentAgentInstanceId: agent.parentAgentInstanceId ,
                    message: "Response From AI: View Logs.",
                    parentId: request?.parentId ,
                    requestId: request.requestId
                });
            }

            // Return properly typed LLMResponse
            let llmResponse:LLMResponse = {
                type: 'llmResponse',
                content: content,
                role: 'assistant',
                model: finalRequest.model,
                usage: response.usage,
                finish_reason: response.choices?.[0]?.finish_reason,
                completion: response,
                requestId: request.requestId,
                success: true,
                
            } ;

           
            this.connectionManager.sendToConnection(agent.id, llmResponse);
            return llmResponse
        } catch (error) {
            logger.info("error process request", error)

            // Send error notification
            if (agent) {
                this.notificationService.sendAiRequestErrorNotification({
                    agent,
                    messageId: messageId,
                    agentId: agent.id,
                    threadId:  agent.threadId,
                    agentInstanceId: agent.instanceId,
                    parentAgentInstanceId: agent.parentAgentInstanceId ,
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                    parentId: agent?.parentId ,
                    requestId: request.requestId
                });
            }
            let errorResponse={
                type: 'llmResponse',
                content: '',
                role: 'assistant',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            } as LLMResponse;
            this.connectionManager.sendToConnection(agent.id, errorResponse);

            return errorResponse
        }
    }


}
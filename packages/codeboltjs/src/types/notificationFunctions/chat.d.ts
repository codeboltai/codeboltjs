import { AgentTextResponseNotification, GetChatHistoryRequestNotification } from '../notifications/chat';
/**
 * Interface for chat notification functions
 */
export interface ChatNotifications {
    UserMessageRequestNotify(message: string, payload?: any, toolUseId?: string): void;
    AgentTextResponseNotify(content: string | any, isError?: boolean, toolUseId?: string, data?: AgentTextResponseNotification['data']): void;
    GetChatHistoryRequestNotify(data?: GetChatHistoryRequestNotification['data'], toolUseId?: string): void;
    GetChatHistoryResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
}

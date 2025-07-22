import {
    SummarizePreviousConversationRequestNotification,
    SummarizeCurentMessageRequestNotification
} from '../notifications/history';

/**
 * Interface for history notification functions
 */
export interface HistoryNotifications {
    summarizePreviousConversation(data?: SummarizePreviousConversationRequestNotification['data'], toolUseId?: string): void;
    sendSummarizePreviousResult(content: string | any, isError?: boolean, toolUseId?: string): void;
    summarizeCurrentMessage(data: SummarizeCurentMessageRequestNotification['data'], toolUseId?: string): void;
    sendSummarizeCurrentResult(content: string | any, isError?: boolean, toolUseId?: string): void;
}
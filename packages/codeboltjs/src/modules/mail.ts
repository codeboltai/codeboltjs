import cbws from '../core/websocket';
import { MailAction, MailResponseType } from '@codebolt/types/mail';
import {
    IRegisterAgentParams, IRegisterAgentResponse,
    IFetchInboxParams, IFetchInboxResponse,
    ISendMessageParams, ISendMessageResponse,
    IReplyMessageParams, IReplyMessageResponse,
    IMarkReadParams, IMarkReadResponse,
    IAcknowledgeParams, IAcknowledgeResponse,
    ISearchParams, ISearchResponse,
    ISummarizeThreadParams, ISummarizeThreadResponse,
    IReserveFilesParams, IReserveFilesResponse,
    IReleaseFilesParams, IReleaseFilesResponse,
    IForceReserveFilesParams, IForceReserveFilesResponse,
    IListReservationsParams, IListReservationsResponse,
    ICheckConflictsParams, ICheckConflictsResponse
} from '@codebolt/types/sdk';

// Additional interfaces for new functions
export interface IListAgentsResponse {
    success: boolean;
    agents?: any[];
    error?: string;
}

export interface IGetAgentParams {
    agentId: string;
}

export interface IGetAgentResponse {
    success: boolean;
    agent?: any;
    error?: string;
}

export interface ICreateThreadParams {
    subject: string;
    participants: string[];
    type?: 'agent-to-agent' | 'agent-to-user' | 'broadcast';
    metadata?: Record<string, unknown>;
}

export interface ICreateThreadResponse {
    success: boolean;
    thread?: any;
    error?: string;
}

export interface IListThreadsParams {
    type?: 'agent-to-agent' | 'agent-to-user' | 'broadcast';
    status?: 'open' | 'closed' | 'archived';
    participant?: string;
    search?: string;
    limit?: number;
    offset?: number;
}

export interface IListThreadsResponse {
    success: boolean;
    threads?: any[];
    total?: number;
    error?: string;
}

export interface IGetThreadParams {
    threadId: string;
}

export interface IGetThreadResponse {
    success: boolean;
    thread?: any;
    error?: string;
}

export interface IUpdateThreadStatusParams {
    threadId: string;
    status: 'open' | 'closed' | 'archived';
}

export interface IUpdateThreadStatusResponse {
    success: boolean;
    thread?: any;
    error?: string;
}

export interface IArchiveThreadParams {
    threadId: string;
}

export interface IArchiveThreadResponse {
    success: boolean;
    error?: string;
}

export interface IGetMessageParams {
    messageId: string;
}

export interface IGetMessageResponse {
    success: boolean;
    message?: any;
    error?: string;
}

export interface IGetMessagesParams {
    threadId: string;
}

export interface IGetMessagesResponse {
    success: boolean;
    messages?: any[];
    error?: string;
}

const cbmail = {
    // Agent operations
    registerAgent: async (params: IRegisterAgentParams): Promise<IRegisterAgentResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: MailAction.REGISTER_AGENT,
                ...params
            },
            MailResponseType.REGISTER_AGENT_RESPONSE
        );
    },

    listAgents: async (): Promise<IListAgentsResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'mail.list_agents'
            },
            'mail.list_agents.response'
        );
    },

    getAgent: async (params: IGetAgentParams): Promise<IGetAgentResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'mail.get_agent',
                ...params
            },
            'mail.get_agent.response'
        );
    },

    // Thread operations
    createThread: async (params: ICreateThreadParams): Promise<ICreateThreadResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'mail.create_thread',
                ...params
            },
            'mail.create_thread.response'
        );
    },

    listThreads: async (params: IListThreadsParams = {}): Promise<IListThreadsResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'mail.list_threads',
                ...params
            },
            'mail.list_threads.response'
        );
    },

    getThread: async (params: IGetThreadParams): Promise<IGetThreadResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'mail.get_thread',
                ...params
            },
            'mail.get_thread.response'
        );
    },

    updateThreadStatus: async (params: IUpdateThreadStatusParams): Promise<IUpdateThreadStatusResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'mail.update_thread_status',
                ...params
            },
            'mail.update_thread_status.response'
        );
    },

    archiveThread: async (params: IArchiveThreadParams): Promise<IArchiveThreadResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'mail.archive_thread',
                ...params
            },
            'mail.archive_thread.response'
        );
    },

    // Message operations
    fetchInbox: async (params: IFetchInboxParams): Promise<IFetchInboxResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: MailAction.FETCH_INBOX,
                ...params
            },
            MailResponseType.FETCH_INBOX_RESPONSE
        );
    },

    sendMessage: async (params: ISendMessageParams): Promise<ISendMessageResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: MailAction.SEND_MESSAGE,
                ...params
            },
            MailResponseType.SEND_MESSAGE_RESPONSE
        );
    },

    replyMessage: async (params: IReplyMessageParams): Promise<IReplyMessageResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: MailAction.REPLY_MESSAGE,
                ...params
            },
            MailResponseType.REPLY_MESSAGE_RESPONSE
        );
    },

    getMessage: async (params: IGetMessageParams): Promise<IGetMessageResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'mail.get_message',
                ...params
            },
            'mail.get_message.response'
        );
    },

    getMessages: async (params: IGetMessagesParams): Promise<IGetMessagesResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'mail.get_messages',
                ...params
            },
            'mail.get_messages.response'
        );
    },

    markRead: async (params: IMarkReadParams): Promise<IMarkReadResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: MailAction.MARK_READ,
                ...params
            },
            MailResponseType.MARK_READ_RESPONSE
        );
    },

    acknowledge: async (params: IAcknowledgeParams): Promise<IAcknowledgeResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: MailAction.ACKNOWLEDGE,
                ...params
            },
            MailResponseType.ACKNOWLEDGE_RESPONSE
        );
    },

    search: async (params: ISearchParams): Promise<ISearchResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: MailAction.SEARCH,
                ...params
            },
            MailResponseType.SEARCH_RESPONSE
        );
    },

    summarizeThread: async (params: ISummarizeThreadParams): Promise<ISummarizeThreadResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: MailAction.SUMMARIZE_THREAD,
                ...params
            },
            MailResponseType.SUMMARIZE_THREAD_RESPONSE
        );
    },

    // File reservation operations
    reserveFiles: async (params: IReserveFilesParams): Promise<IReserveFilesResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: MailAction.RESERVE_FILES,
                ...params
            },
            MailResponseType.RESERVE_FILES_RESPONSE
        );
    },

    releaseFiles: async (params: IReleaseFilesParams): Promise<IReleaseFilesResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: MailAction.RELEASE_FILES,
                ...params
            },
            MailResponseType.RELEASE_FILES_RESPONSE
        );
    },

    forceReserveFiles: async (params: IForceReserveFilesParams): Promise<IForceReserveFilesResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: MailAction.FORCE_RESERVE_FILES,
                ...params
            },
            MailResponseType.FORCE_RESERVE_FILES_RESPONSE
        );
    },

    listReservations: async (params: IListReservationsParams): Promise<IListReservationsResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: MailAction.LIST_RESERVATIONS,
                ...params
            },
            MailResponseType.LIST_RESERVATIONS_RESPONSE
        );
    },

    checkConflicts: async (params: ICheckConflictsParams): Promise<ICheckConflictsResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: MailAction.CHECK_CONFLICTS,
                ...params
            },
            MailResponseType.CHECK_CONFLICTS_RESPONSE
        );
    }
};

export default cbmail;

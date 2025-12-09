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

const cbmail = {
    registerAgent: async (params: IRegisterAgentParams): Promise<IRegisterAgentResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: MailAction.REGISTER_AGENT,
                ...params
            },
            MailResponseType.REGISTER_AGENT_RESPONSE
        );
    },
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

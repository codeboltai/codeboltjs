import { BaseApplicationResponse } from './baseappResponse';

export interface IRegisterAgentParams {
    id: string;
    name: string;
    program?: string;
    model?: string;
}

export interface IRegisterAgentResponse extends BaseApplicationResponse {
    success?: boolean;
    agentId?: string;
    error?: string;
}

export interface IFetchInboxParams {
    agentId: string;
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
}

export interface IFetchInboxResponse extends BaseApplicationResponse {
    success?: boolean;
    messages?: any[];
    error?: string;
}

export interface ISendMessageParams {
    senderId: string;
    senderName: string;
    recipients: string[];
    body: string;
    threadId?: string;
    subject?: string;
    importance?: 'low' | 'normal' | 'high';
    ackRequired?: boolean;
    fileReferences?: string[];
}

export interface ISendMessageResponse extends BaseApplicationResponse {
    success?: boolean;
    messageId?: string;
    threadId?: string;
    error?: string;
}

export interface IReplyMessageParams {
    messageId: string;
    senderId: string;
    senderName: string;
    body: string;
    fileReferences?: string[];
}

export interface IReplyMessageResponse extends BaseApplicationResponse {
    success?: boolean;
    messageId?: string;
    error?: string;
}

export interface IMarkReadParams {
    messageId: string;
    agentId: string;
}

export interface IMarkReadResponse extends BaseApplicationResponse {
    success?: boolean;
    error?: string;
}

export interface IAcknowledgeParams {
    messageId: string;
    agentId: string;
}

export interface IAcknowledgeResponse extends BaseApplicationResponse {
    success?: boolean;
    error?: string;
}

export interface ISearchParams {
    query: string;
    agentId?: string;
    threadId?: string;
    from?: string;
    limit?: number;
}

export interface ISearchResponse extends BaseApplicationResponse {
    success?: boolean;
    messages?: any[];
    error?: string;
}

export interface ISummarizeThreadParams {
    threadId: string;
    maxMessages?: number;
}

export interface ISummarizeThreadResponse extends BaseApplicationResponse {
    success?: boolean;
    summary?: string;
    error?: string;
}

export interface IReserveFilesParams {
    agentId: string;
    paths: string[];
    exclusive?: boolean;
    ttlSeconds?: number;
    reason?: string;
}

export interface IReserveFilesResponse extends BaseApplicationResponse {
    success?: boolean;
    reserved?: boolean;
    reservationId?: string;
    error?: string;
}

export interface IReleaseFilesParams {
    agentId: string;
    paths: string[];
}

export interface IReleaseFilesResponse extends BaseApplicationResponse {
    success?: boolean;
    released?: boolean;
    error?: string;
}

export interface IForceReserveFilesParams {
    agentId: string;
    paths: string[];
    reason: string;
}

export interface IForceReserveFilesResponse extends BaseApplicationResponse {
    success?: boolean;
    reserved?: boolean;
    reservationId?: string;
    error?: string;
}

export interface IListReservationsParams {
    agentId?: string;
    path?: string;
}

export interface IListReservationsResponse extends BaseApplicationResponse {
    success?: boolean;
    reservations?: any[];
    error?: string;
}

export interface ICheckConflictsParams {
    agentId: string;
    paths: string[];
}

export interface ICheckConflictsResponse extends BaseApplicationResponse {
    success?: boolean;
    conflicts?: any[];
    error?: string;
}

export enum GroupFeedbackAction {
  CREATE = 'groupfeedback.create',
  GET = 'groupfeedback.get',
  LIST = 'groupfeedback.list',
  RESPOND = 'groupfeedback.respond',
  REPLY = 'groupfeedback.reply',
  SUMMARY = 'groupfeedback.summary',
  UPDATE_STATUS = 'groupfeedback.update_status',
}

export enum GroupFeedbackResponseType {
  CREATE_RESPONSE = 'groupfeedback.create.response',
  GET_RESPONSE = 'groupfeedback.get.response',
  LIST_RESPONSE = 'groupfeedback.list.response',
  RESPOND_RESPONSE = 'groupfeedback.respond.response',
  REPLY_RESPONSE = 'groupfeedback.reply.response',
  SUMMARY_RESPONSE = 'groupfeedback.summary.response',
  UPDATE_STATUS_RESPONSE = 'groupfeedback.update_status.response',
}

export type FeedbackContentType = 'text' | 'image' | 'link' | 'file-reference';
export type FeedbackStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

export interface FeedbackAttachment {
  type: 'image' | 'link' | 'file';
  path?: string;
  url?: string;
  name: string;
  preview?: string;
}

export interface GroupFeedback {
  id: string;
  title: string;
  content: string;
  contentType: FeedbackContentType;
  attachments?: FeedbackAttachment[];
  creatorId: string;
  creatorName: string;
  status: FeedbackStatus;
  participants: string[];
  feedbackCount: number;
  summary?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface FeedbackResponse {
  id: string;
  groupFeedbackId: string;
  parentId?: string;
  senderId: string;
  senderName: string;
  body: string;
  attachments?: FeedbackAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface ICreateFeedbackParams {
  title: string;
  content: string;
  contentType: FeedbackContentType;
  attachments?: FeedbackAttachment[];
  creatorId: string;
  creatorName: string;
  participants?: string[];
  status?: FeedbackStatus;
  summary?: string;
}

export interface IGetFeedbackParams {
  id: string;
  view?: 'request' | 'full' | 'responses' | 'summary';
}

export interface IListFeedbacksParams {
  status?: FeedbackStatus;
  participant?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface IFeedbackRespondParams {
  feedbackId: string;
  senderId: string;
  senderName: string;
  body: string;
  attachments?: FeedbackAttachment[];
  parentId?: string;
}

export interface IReplyParams {
  responseId: string;
  senderId: string;
  senderName: string;
  body: string;
  attachments?: FeedbackAttachment[];
}

export interface IUpdateSummaryParams {
  feedbackId: string;
  summary: string;
}

export interface IUpdateStatusParams {
  feedbackId: string;
  status: FeedbackStatus;
}

export interface ICreateFeedbackResponse {
  payload: { feedback: GroupFeedback };
}

export interface IGetFeedbackResponse {
  payload: {
    feedback?: GroupFeedback;
    responses?: FeedbackResponse[];
    summary?: string;
  };
}

export interface IListFeedbacksResponse {
  payload: { feedbacks: GroupFeedback[]; total: number };
}

export interface IFeedbackRespondResponse {
  payload: { response: FeedbackResponse };
}

export interface IReplyResponse {
  payload: { response: FeedbackResponse };
}

export interface IUpdateSummaryResponse {
  payload: { feedback: GroupFeedback };
}

export interface IUpdateStatusResponse {
  payload: { feedback: GroupFeedback };
}

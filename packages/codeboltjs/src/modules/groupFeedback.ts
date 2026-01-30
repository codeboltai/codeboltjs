import cbws from '../core/websocket';
import {
  GroupFeedbackAction,
  GroupFeedbackResponseType,
  ICreateFeedbackParams,
  ICreateFeedbackResponse,
  IGetFeedbackParams,
  IGetFeedbackResponse,
  IListFeedbacksParams,
  IListFeedbacksResponse,
  IFeedbackRespondParams,
  IFeedbackRespondResponse,
  IReplyParams,
  IReplyResponse,
  IUpdateSummaryParams,
  IUpdateSummaryResponse,
  IUpdateStatusParams,
  IUpdateStatusResponse,
} from '@codebolt/types/lib';

const cbgroupFeedback = {
  create: async (params: ICreateFeedbackParams): Promise<ICreateFeedbackResponse> => {
    return cbws.messageManager.sendAndWaitForResponse(
      { type: GroupFeedbackAction.CREATE, ...params },
      GroupFeedbackResponseType.CREATE_RESPONSE,
    );
  },

  get: async (params: IGetFeedbackParams): Promise<IGetFeedbackResponse> => {
    return cbws.messageManager.sendAndWaitForResponse(
      { type: GroupFeedbackAction.GET, ...params },
      GroupFeedbackResponseType.GET_RESPONSE,
    );
  },

  list: async (params?: IListFeedbacksParams): Promise<IListFeedbacksResponse> => {
    return cbws.messageManager.sendAndWaitForResponse(
      { type: GroupFeedbackAction.LIST, ...(params || {}) },
      GroupFeedbackResponseType.LIST_RESPONSE,
    );
  },

  respond: async (params: IFeedbackRespondParams): Promise<IFeedbackRespondResponse> => {
    return cbws.messageManager.sendAndWaitForResponse(
      { type: GroupFeedbackAction.RESPOND, ...params },
      GroupFeedbackResponseType.RESPOND_RESPONSE,
    );
  },

  reply: async (params: IReplyParams): Promise<IReplyResponse> => {
    return cbws.messageManager.sendAndWaitForResponse(
      { type: GroupFeedbackAction.REPLY, ...params },
      GroupFeedbackResponseType.REPLY_RESPONSE,
    );
  },

  updateSummary: async (params: IUpdateSummaryParams): Promise<IUpdateSummaryResponse> => {
    return cbws.messageManager.sendAndWaitForResponse(
      { type: GroupFeedbackAction.SUMMARY, ...params },
      GroupFeedbackResponseType.SUMMARY_RESPONSE,
    );
  },

  updateStatus: async (params: IUpdateStatusParams): Promise<IUpdateStatusResponse> => {
    return cbws.messageManager.sendAndWaitForResponse(
      { type: GroupFeedbackAction.UPDATE_STATUS, ...params },
      GroupFeedbackResponseType.UPDATE_STATUS_RESPONSE,
    );
  },
};

export default cbgroupFeedback;

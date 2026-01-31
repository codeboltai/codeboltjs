import cbws from '../core/websocket';
import {
  AgentDeliberationAction,
  AgentDeliberationResponseType,
  ICreateDeliberationParams,
  ICreateDeliberationResponse,
  IGetDeliberationParams,
  IGetDeliberationResponse,
  IListDeliberationsParams,
  IListDeliberationsResponse,
  IUpdateDeliberationParams,
  IUpdateDeliberationResponse,
  IRespondParams,
  IRespondResponse,
  IVoteParams,
  IVoteResponse,
  IGetWinnerParams,
  IGetWinnerResponse,
  ISummaryParams,
  ISummaryResponse,
} from '@codebolt/types/lib';

const cbagentDeliberation = {
  create: async (params: ICreateDeliberationParams): Promise<ICreateDeliberationResponse> => {
    return cbws.messageManager.sendAndWaitForResponse(
      { type: AgentDeliberationAction.CREATE, ...params },
      AgentDeliberationResponseType.CREATE_RESPONSE,
    );
  },

  get: async (params: IGetDeliberationParams): Promise<IGetDeliberationResponse> => {
    return cbws.messageManager.sendAndWaitForResponse(
      { type: AgentDeliberationAction.GET, ...params },
      AgentDeliberationResponseType.GET_RESPONSE,
    );
  },

  list: async (params?: IListDeliberationsParams): Promise<IListDeliberationsResponse> => {
    return cbws.messageManager.sendAndWaitForResponse(
      { type: AgentDeliberationAction.LIST, ...(params || {}) },
      AgentDeliberationResponseType.LIST_RESPONSE,
    );
  },

  update: async (params: IUpdateDeliberationParams): Promise<IUpdateDeliberationResponse> => {
    return cbws.messageManager.sendAndWaitForResponse(
      { type: AgentDeliberationAction.UPDATE, ...params },
      AgentDeliberationResponseType.UPDATE_RESPONSE,
    );
  },

  respond: async (params: IRespondParams): Promise<IRespondResponse> => {
    return cbws.messageManager.sendAndWaitForResponse(
      { type: AgentDeliberationAction.RESPOND, ...params },
      AgentDeliberationResponseType.RESPOND_RESPONSE,
    );
  },

  vote: async (params: IVoteParams): Promise<IVoteResponse> => {
    return cbws.messageManager.sendAndWaitForResponse(
      { type: AgentDeliberationAction.VOTE, ...params },
      AgentDeliberationResponseType.VOTE_RESPONSE,
    );
  },

  getWinner: async (params: IGetWinnerParams): Promise<IGetWinnerResponse> => {
    return cbws.messageManager.sendAndWaitForResponse(
      { type: AgentDeliberationAction.WINNER, ...params },
      AgentDeliberationResponseType.WINNER_RESPONSE,
    );
  },

  summary: async (params: ISummaryParams): Promise<ISummaryResponse> => {
    return cbws.messageManager.sendAndWaitForResponse(
      { type: AgentDeliberationAction.SUMMARY, ...params },
      AgentDeliberationResponseType.SUMMARY_RESPONSE,
    );
  },
};

export default cbagentDeliberation;

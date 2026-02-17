export enum AgentDeliberationAction {
  CREATE = 'agentdeliberation.create',
  GET = 'agentdeliberation.get',
  LIST = 'agentdeliberation.list',
  UPDATE = 'agentdeliberation.update',
  RESPOND = 'agentdeliberation.respond',
  VOTE = 'agentdeliberation.vote',
  WINNER = 'agentdeliberation.winner',
  SUMMARY = 'agentdeliberation.summary',
}

export enum AgentDeliberationResponseType {
  CREATE_RESPONSE = 'agentdeliberation.create.response',
  GET_RESPONSE = 'agentdeliberation.get.response',
  LIST_RESPONSE = 'agentdeliberation.list.response',
  UPDATE_RESPONSE = 'agentdeliberation.update.response',
  RESPOND_RESPONSE = 'agentdeliberation.respond.response',
  VOTE_RESPONSE = 'agentdeliberation.vote.response',
  WINNER_RESPONSE = 'agentdeliberation.winner.response',
  SUMMARY_RESPONSE = 'agentdeliberation.summary.response',
}

export type DeliberationStatus = 'draft' | 'collecting-responses' | 'voting' | 'completed' | 'closed';

export interface Deliberation {
  id: string;
  type: DeliberationType;
  title: string;
  requestMessage: string;
  creatorId: string;
  creatorName: string;
  status: DeliberationStatus;
  participants: string[];
  responseCount: number;
  agentResponseCount: number;
  userResponseCount: number;
  voteCount: number;
  winnerId?: string;
  summary?: string;
  summaryAuthorId?: string;
  summaryAuthorName?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface DeliberationResponse {
  id: string;
  deliberationId: string;
  responderId: string;
  responderName: string;
  body: string;
  proposedBy?: string;
  voteCount: number;
  createdAt: string;
}

export interface DeliberationVote {
  id: string;
  deliberationId: string;
  responseId: string;
  voterId: string;
  voterName: string;
  createdAt: string;
}

export interface ICreateDeliberationParams {
  deliberationType: DeliberationType;
  title: string;
  requestMessage: string;
  creatorId: string;
  creatorName: string;
  participants?: string[];
  status?: DeliberationStatus;
  options?: { text: string; proposedBy: string }[];
}

export interface IGetDeliberationParams {
  id: string;
  view?: 'request' | 'full' | 'responses' | 'votes' | 'winner';
}

export type DeliberationType = 'voting' | 'feedback' | 'qa' | 'shared-list';

export interface IListDeliberationsParams {
  deliberationType?: DeliberationType;
  status?: DeliberationStatus;
  participant?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface IUpdateDeliberationParams {
  deliberationId: string;
  status?: DeliberationStatus;
  requestMessage?: string;
}

export interface IRespondParams {
  deliberationId: string;
  responderId: string;
  responderName: string;
  body: string;
}

export interface IVoteParams {
  deliberationId: string;
  responseId: string;
  voterId: string;
  voterName: string;
}

export interface IGetWinnerParams {
  deliberationId: string;
}

export interface ISummaryParams {
  deliberationId: string;
  summary: string;
  authorId: string;
  authorName: string;
}

export interface ICreateDeliberationResponse {
  payload: { deliberation: Deliberation };
}

export interface IGetDeliberationResponse {
  payload: {
    deliberation?: Deliberation;
    responses?: DeliberationResponse[];
    votes?: DeliberationVote[];
    winner?: DeliberationResponse;
  };
}

export interface IListDeliberationsResponse {
  payload: { deliberations: Deliberation[]; total: number };
}

export interface IUpdateDeliberationResponse {
  payload: { deliberation: Deliberation };
}

export interface IRespondResponse {
  payload: { response: DeliberationResponse };
}

export interface IVoteResponse {
  payload: { vote: DeliberationVote };
}

export interface IGetWinnerResponse {
  payload: { winner?: DeliberationResponse; votes: DeliberationVote[] };
}

export interface ISummaryResponse {
  payload: { deliberation: Deliberation };
}

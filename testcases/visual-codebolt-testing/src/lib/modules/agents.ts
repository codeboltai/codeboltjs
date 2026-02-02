import { CodeboltModule, param, fn } from './types';

export const agentModule: CodeboltModule = {
  name: 'agent',
  displayName: 'Agent',
  description: 'Agent discovery and execution',
  category: 'agents',
  functions: [
    fn('findAgent', 'Finds agent for a task', [
      param('task', 'string', true, 'Task description'),
      param('maxResult', 'number', false, 'Max results'),
      param('agents', 'array', false, 'Agent pool'),
      param('agentLocation', 'string', false, 'Agent location'),
      param('getFrom', 'string', false, 'Source'),
    ], 'FindAgentResponse'),
    fn('startAgent', 'Starts an agent', [
      param('agentId', 'string', true, 'Agent ID'),
      param('task', 'string', true, 'Task to execute'),
    ], 'StartAgentResponse'),
    fn('getAgentsList', 'Gets list of agents', [
      param('type', 'string', false, 'Agent type filter'),
    ], 'AgentListResponse'),
    fn('getAgentsDetail', 'Gets agent details', [
      param('agentList', 'array', false, 'Agent IDs'),
    ], 'AgentDetailResponse'),
  ],
};

export const swarmModule: CodeboltModule = {
  name: 'swarm',
  displayName: 'Swarm',
  description: 'Swarm intelligence and coordination',
  category: 'agents',
  functions: [
    fn('createSwarm', 'Creates a swarm', [
      param('name', 'string', true, 'Swarm name'),
      param('description', 'string', false, 'Swarm description'),
      param('config', 'object', false, 'Swarm configuration'),
    ], 'SwarmResponse'),
    fn('getSwarm', 'Gets swarm details', [
      param('swarmId', 'string', true, 'Swarm ID'),
    ], 'SwarmResponse'),
    fn('listSwarms', 'Lists all swarms', [
      param('filters', 'object', false, 'Filter options'),
    ], 'SwarmListResponse'),
    fn('updateSwarm', 'Updates a swarm', [
      param('swarmId', 'string', true, 'Swarm ID'),
      param('updates', 'object', true, 'Update data'),
    ], 'SwarmResponse'),
    fn('deleteSwarm', 'Deletes a swarm', [
      param('swarmId', 'string', true, 'Swarm ID'),
    ], 'DeleteResponse'),
    fn('addAgentToSwarm', 'Adds agent to swarm', [
      param('swarmId', 'string', true, 'Swarm ID'),
      param('agentId', 'string', true, 'Agent ID'),
      param('role', 'string', false, 'Agent role'),
    ], 'SwarmResponse'),
    fn('removeAgentFromSwarm', 'Removes agent from swarm', [
      param('swarmId', 'string', true, 'Swarm ID'),
      param('agentId', 'string', true, 'Agent ID'),
    ], 'SwarmResponse'),
    fn('getSwarmAgents', 'Gets swarm agents', [
      param('swarmId', 'string', true, 'Swarm ID'),
    ], 'AgentListResponse'),
    fn('broadcastToSwarm', 'Broadcasts message to swarm', [
      param('swarmId', 'string', true, 'Swarm ID'),
      param('message', 'string', true, 'Message content'),
    ], 'BroadcastResponse'),
    fn('assignTask', 'Assigns task to swarm', [
      param('swarmId', 'string', true, 'Swarm ID'),
      param('task', 'object', true, 'Task details'),
    ], 'TaskAssignResponse'),
    fn('getSwarmStatus', 'Gets swarm status', [
      param('swarmId', 'string', true, 'Swarm ID'),
    ], 'SwarmStatusResponse'),
    fn('pauseSwarm', 'Pauses swarm operations', [
      param('swarmId', 'string', true, 'Swarm ID'),
    ], 'SwarmResponse'),
    fn('resumeSwarm', 'Resumes swarm operations', [
      param('swarmId', 'string', true, 'Swarm ID'),
    ], 'SwarmResponse'),
    fn('getSwarmMetrics', 'Gets swarm metrics', [
      param('swarmId', 'string', true, 'Swarm ID'),
    ], 'MetricsResponse'),
  ],
};

export const agentDeliberationModule: CodeboltModule = {
  name: 'agentDeliberation',
  displayName: 'Agent Deliberation',
  description: 'Agent deliberation and voting',
  category: 'agents',
  functions: [
    fn('create', 'Creates a deliberation', [
      param('topic', 'string', true, 'Deliberation topic'),
      param('options', 'array', true, 'Available options'),
      param('participants', 'array', true, 'Participant agent IDs'),
      param('deadline', 'string', false, 'Deadline timestamp'),
    ], 'DeliberationResponse'),
    fn('get', 'Gets deliberation details', [
      param('deliberationId', 'string', true, 'Deliberation ID'),
    ], 'DeliberationResponse'),
    fn('list', 'Lists deliberations', [
      param('filters', 'object', false, 'Filter options'),
    ], 'DeliberationListResponse'),
    fn('update', 'Updates a deliberation', [
      param('deliberationId', 'string', true, 'Deliberation ID'),
      param('updates', 'object', true, 'Update data'),
    ], 'DeliberationResponse'),
    fn('respond', 'Responds to deliberation', [
      param('deliberationId', 'string', true, 'Deliberation ID'),
      param('agentId', 'string', true, 'Agent ID'),
      param('response', 'string', true, 'Response content'),
    ], 'ResponseResponse'),
    fn('vote', 'Votes on deliberation', [
      param('deliberationId', 'string', true, 'Deliberation ID'),
      param('agentId', 'string', true, 'Agent ID'),
      param('optionId', 'string', true, 'Option ID'),
    ], 'VoteResponse'),
    fn('getWinner', 'Gets winning option', [
      param('deliberationId', 'string', true, 'Deliberation ID'),
    ], 'WinnerResponse'),
    fn('summary', 'Gets deliberation summary', [
      param('deliberationId', 'string', true, 'Deliberation ID'),
    ], 'SummaryResponse'),
  ],
};

export const agentEventQueueModule: CodeboltModule = {
  name: 'agentEventQueue',
  displayName: 'Agent Event Queue',
  description: 'Agent event queue management',
  category: 'agents',
  functions: [
    fn('addEvent', 'Adds event to queue', [
      param('eventType', 'string', true, 'Event type'),
      param('payload', 'object', true, 'Event payload'),
      param('priority', 'number', false, 'Event priority'),
    ], 'AddEventResponse'),
    fn('sendAgentMessage', 'Sends inter-agent message', [
      param('targetAgentId', 'string', true, 'Target agent ID'),
      param('message', 'string', true, 'Message content'),
      param('metadata', 'object', false, 'Message metadata'),
    ], 'SendMessageResponse'),
    fn('getQueueStats', 'Gets queue statistics', [], 'QueueStatsResponse'),
    fn('clearQueue', 'Clears the queue', [
      param('agentId', 'string', false, 'Agent ID filter'),
    ], 'ClearResponse'),
    fn('getPendingQueueEvents', 'Gets pending events', [
      param('maxDepth', 'number', false, 'Max depth'),
    ], 'EventsResponse'),
    fn('waitForNextQueueEvent', 'Waits for next event', [
      param('maxDepth', 'number', false, 'Max depth'),
    ], 'EventResponse'),
    fn('onQueueEvent', 'Registers event handler', [
      param('handler', 'object', true, 'Event handler function'),
    ], 'void'),
    fn('acknowledgeEvent', 'Acknowledges event', [
      param('eventId', 'string', true, 'Event ID'),
      param('success', 'boolean', false, 'Success status', true),
      param('errorMessage', 'string', false, 'Error message'),
    ], 'AcknowledgeResponse'),
    fn('getLocalCacheSize', 'Gets cache size', [], 'CacheSizeResponse'),
    fn('peekLocalCache', 'Peeks at cache', [], 'CacheResponse'),
    fn('clearLocalCache', 'Clears local cache', [], 'ClearResponse'),
    fn('checkForPendingExternalEvent', 'Checks for external events', [], 'CheckResponse'),
    fn('getPendingExternalEvents', 'Gets pending external events', [], 'EventsResponse'),
    fn('getPendingExternalEventCount', 'Gets event count', [], 'CountResponse'),
    fn('waitForAnyExternalEvent', 'Waits for any external event', [], 'EventResponse'),
  ],
};

export const agentPortfolioModule: CodeboltModule = {
  name: 'agentPortfolio',
  displayName: 'Agent Portfolio',
  description: 'Agent portfolio management',
  category: 'agents',
  functions: [
    fn('getPortfolio', 'Gets agent portfolio', [
      param('agentId', 'string', true, 'Agent ID'),
    ], 'PortfolioResponse'),
    fn('getConversations', 'Gets agent conversations', [
      param('agentId', 'string', true, 'Agent ID'),
      param('limit', 'number', false, 'Result limit'),
      param('offset', 'number', false, 'Result offset'),
    ], 'ConversationsResponse'),
    fn('addTestimonial', 'Adds testimonial', [
      param('toAgentId', 'string', true, 'Target agent ID'),
      param('content', 'string', true, 'Testimonial content'),
      param('projectId', 'string', false, 'Project ID'),
    ], 'TestimonialResponse'),
    fn('updateTestimonial', 'Updates testimonial', [
      param('testimonialId', 'string', true, 'Testimonial ID'),
      param('content', 'string', true, 'New content'),
    ], 'TestimonialResponse'),
    fn('deleteTestimonial', 'Deletes testimonial', [
      param('testimonialId', 'string', true, 'Testimonial ID'),
    ], 'DeleteResponse'),
    fn('addKarma', 'Adds karma to agent', [
      param('toAgentId', 'string', true, 'Target agent ID'),
      param('amount', 'number', true, 'Karma amount'),
      param('reason', 'string', false, 'Karma reason'),
    ], 'KarmaResponse'),
    fn('getKarmaHistory', 'Gets karma history', [
      param('agentId', 'string', true, 'Agent ID'),
      param('limit', 'number', false, 'Result limit'),
    ], 'KarmaHistoryResponse'),
    fn('addAppreciation', 'Adds appreciation', [
      param('toAgentId', 'string', true, 'Target agent ID'),
      param('message', 'string', true, 'Appreciation message'),
    ], 'AppreciationResponse'),
    fn('addTalent', 'Adds talent to agent', [
      param('name', 'string', true, 'Talent name'),
      param('description', 'string', false, 'Talent description'),
    ], 'TalentResponse'),
    fn('endorseTalent', 'Endorses a talent', [
      param('talentId', 'string', true, 'Talent ID'),
    ], 'EndorseResponse'),
    fn('getTalents', 'Gets agent talents', [
      param('agentId', 'string', false, 'Agent ID'),
    ], 'TalentsResponse'),
    fn('getRanking', 'Gets agent ranking', [
      param('limit', 'number', false, 'Result limit'),
      param('sortBy', 'string', false, 'Sort field'),
    ], 'RankingResponse'),
    fn('getPortfoliosByProject', 'Gets portfolios by project', [
      param('projectId', 'string', true, 'Project ID'),
    ], 'PortfoliosResponse'),
    fn('updateProfile', 'Updates agent profile', [
      param('agentId', 'string', true, 'Agent ID'),
      param('profile', 'object', true, 'Profile data'),
    ], 'ProfileResponse'),
  ],
};

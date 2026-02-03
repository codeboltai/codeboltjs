import { CodeboltModule, param, fn } from './types';

export const capabilityModule: CodeboltModule = {
  name: 'capability',
  displayName: 'Capability',
  description: 'Capability (Skills, Powers, Talents) management',
  category: 'config',
  functions: [
    fn('listCapabilities', 'Lists capabilities', [
      param('filter', 'object', false, 'Filter options'),
    ], 'CapabilityListResponse'),
    fn('listCapabilitiesByType', 'Lists by type', [
      param('capabilityType', 'string', true, 'Capability type'),
    ], 'CapabilityListResponse'),
    fn('listSkills', 'Lists skills', [], 'SkillListResponse'),
    fn('listPowers', 'Lists powers', [], 'PowerListResponse'),
    fn('listTalents', 'Lists talents', [], 'TalentListResponse'),
    fn('getCapabilityDetail', 'Gets capability details', [
      param('capabilityName', 'string', true, 'Capability name'),
      param('capabilityType', 'string', false, 'Capability type'),
    ], 'CapabilityResponse'),
    fn('listExecutors', 'Lists executors', [], 'ExecutorListResponse'),
    fn('startCapability', 'Starts a capability', [
      param('capabilityName', 'string', true, 'Capability name'),
      param('capabilityType', 'string', true, 'Capability type'),
      param('params', 'object', false, 'Parameters'),
      param('timeout', 'number', false, 'Timeout in ms'),
    ], 'ExecutionResponse'),
    fn('startSkill', 'Starts a skill', [
      param('skillName', 'string', true, 'Skill name'),
      param('params', 'object', false, 'Parameters'),
      param('timeout', 'number', false, 'Timeout in ms'),
    ], 'ExecutionResponse'),
    fn('startPower', 'Starts a power', [
      param('powerName', 'string', true, 'Power name'),
      param('params', 'object', false, 'Parameters'),
      param('timeout', 'number', false, 'Timeout in ms'),
    ], 'ExecutionResponse'),
    fn('startTalent', 'Starts a talent', [
      param('talentName', 'string', true, 'Talent name'),
      param('params', 'object', false, 'Parameters'),
      param('timeout', 'number', false, 'Timeout in ms'),
    ], 'ExecutionResponse'),
    fn('stopCapability', 'Stops a capability', [
      param('executionId', 'string', true, 'Execution ID'),
    ], 'StopResponse'),
    fn('getExecutionStatus', 'Gets execution status', [
      param('executionId', 'string', true, 'Execution ID'),
    ], 'ExecutionStatusResponse'),
    fn('getCapabilitiesByTag', 'Gets by tag', [
      param('tag', 'string', true, 'Tag name'),
    ], 'CapabilityListResponse'),
    fn('getCapabilitiesByAuthor', 'Gets by author', [
      param('author', 'string', true, 'Author name'),
    ], 'CapabilityListResponse'),
  ],
};

export const stateModule: CodeboltModule = {
  name: 'state',
  displayName: 'State',
  description: 'Application and agent state management',
  category: 'config',
  functions: [
    fn('getApplicationState', 'Gets application state', [], 'ApplicationStateResponse'),
    fn('addToAgentState', 'Adds to agent state', [
      param('key', 'string', true, 'State key'),
      param('value', 'string', true, 'State value'),
    ], 'AgentStateResponse'),
    fn('getAgentState', 'Gets agent state', [], 'AgentStateResponse'),
    fn('getProjectState', 'Gets project state', [], 'ProjectStateResponse'),
    fn('updateProjectState', 'Updates project state', [
      param('key', 'string', true, 'State key'),
      param('value', 'any', true, 'State value'),
    ], 'ProjectStateResponse'),
  ],
};

export const kvStoreModule: CodeboltModule = {
  name: 'kvStore',
  displayName: 'KV Store',
  description: 'Key-value store operations',
  category: 'config',
  functions: [
    fn('createInstance', 'Creates KV instance', [
      param('name', 'string', true, 'Instance name'),
      param('description', 'string', false, 'Instance description'),
    ], 'KVInstanceResponse'),
    fn('getInstance', 'Gets KV instance', [
      param('instanceId', 'string', true, 'Instance ID'),
    ], 'KVInstanceResponse'),
    fn('listInstances', 'Lists KV instances', [], 'KVInstanceListResponse'),
    fn('updateInstance', 'Updates KV instance', [
      param('instanceId', 'string', true, 'Instance ID'),
      param('updates', 'object', true, 'Update data'),
    ], 'KVInstanceResponse'),
    fn('deleteInstance', 'Deletes KV instance', [
      param('instanceId', 'string', true, 'Instance ID'),
    ], 'DeleteResponse'),
    fn('get', 'Gets a value', [
      param('instanceId', 'string', true, 'Instance ID'),
      param('namespace', 'string', true, 'Namespace'),
      param('key', 'string', true, 'Key'),
    ], 'KVValueResponse'),
    fn('set', 'Sets a value', [
      param('instanceId', 'string', true, 'Instance ID'),
      param('namespace', 'string', true, 'Namespace'),
      param('key', 'string', true, 'Key'),
      param('value', 'any', true, 'Value'),
      param('autoCreateInstance', 'boolean', false, 'Auto create instance', false),
    ], 'KVValueResponse'),
    fn('delete', 'Deletes a value', [
      param('instanceId', 'string', true, 'Instance ID'),
      param('namespace', 'string', true, 'Namespace'),
      param('key', 'string', true, 'Key'),
    ], 'DeleteResponse'),
    fn('deleteNamespace', 'Deletes a namespace', [
      param('instanceId', 'string', true, 'Instance ID'),
      param('namespace', 'string', true, 'Namespace'),
    ], 'DeleteResponse'),
    fn('query', 'Queries the store', [
      param('query', 'object', true, 'Query DSL'),
    ], 'KVQueryResponse'),
    fn('getNamespaces', 'Gets namespaces', [
      param('instanceId', 'string', true, 'Instance ID'),
    ], 'NamespacesResponse'),
    fn('getRecordCount', 'Gets record count', [
      param('instanceId', 'string', true, 'Instance ID'),
      param('namespace', 'string', false, 'Namespace filter'),
    ], 'CountResponse'),
  ],
};

export const contextRuleEngineModule: CodeboltModule = {
  name: 'contextRuleEngine',
  displayName: 'Context Rule Engine',
  description: 'Context rule evaluation',
  category: 'config',
  functions: [
    fn('create', 'Creates rule engine', [
      param('config', 'object', true, 'Engine configuration'),
    ], 'RuleEngineResponse'),
    fn('get', 'Gets rule engine', [
      param('id', 'string', true, 'Engine ID'),
    ], 'RuleEngineResponse'),
    fn('list', 'Lists rule engines', [], 'RuleEngineListResponse'),
    fn('update', 'Updates rule engine', [
      param('id', 'string', true, 'Engine ID'),
      param('updates', 'object', true, 'Update data'),
    ], 'RuleEngineResponse'),
    fn('delete', 'Deletes rule engine', [
      param('id', 'string', true, 'Engine ID'),
    ], 'DeleteResponse'),
    fn('evaluate', 'Evaluates rules', [
      param('engineId', 'string', true, 'Engine ID'),
      param('context', 'object', true, 'Context data'),
    ], 'EvaluationResponse'),
    fn('getPossibleVariables', 'Gets possible variables', [], 'VariablesResponse'),
  ],
};

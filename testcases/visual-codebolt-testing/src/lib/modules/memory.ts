import { CodeboltModule, param, fn } from './types';

export const memoryModule: CodeboltModule = {
  name: 'memory',
  displayName: 'Memory',
  description: 'Memory storage with multiple formats',
  category: 'memory',
  functions: [
    // JSON operations
    fn('json.save', 'Saves JSON to memory', [
      param('json', 'object', true, 'JSON data to save'),
      param('metadata', 'object', false, 'Memory metadata'),
    ], 'MemoryResponse'),
    fn('json.update', 'Updates JSON memory', [
      param('memoryId', 'string', true, 'Memory ID'),
      param('json', 'object', true, 'Updated JSON data'),
    ], 'MemoryResponse'),
    fn('json.delete', 'Deletes JSON memory', [
      param('memoryId', 'string', true, 'Memory ID'),
    ], 'DeleteResponse'),
    fn('json.list', 'Lists JSON memories', [
      param('filters', 'object', false, 'Filter options'),
    ], 'MemoryListResponse'),
    // Todo operations
    fn('todo.save', 'Saves todo to memory', [
      param('todo', 'object', true, 'Todo data'),
      param('metadata', 'object', false, 'Memory metadata'),
    ], 'MemoryResponse'),
    fn('todo.update', 'Updates todo memory', [
      param('memoryId', 'string', true, 'Memory ID'),
      param('todo', 'object', true, 'Updated todo data'),
    ], 'MemoryResponse'),
    fn('todo.delete', 'Deletes todo memory', [
      param('memoryId', 'string', true, 'Memory ID'),
    ], 'DeleteResponse'),
    fn('todo.list', 'Lists todo memories', [
      param('filters', 'object', false, 'Filter options'),
    ], 'MemoryListResponse'),
    // Markdown operations
    fn('markdown.save', 'Saves markdown to memory', [
      param('markdown', 'string', true, 'Markdown content'),
      param('metadata', 'object', false, 'Memory metadata'),
    ], 'MemoryResponse'),
    fn('markdown.update', 'Updates markdown memory', [
      param('memoryId', 'string', true, 'Memory ID'),
      param('markdown', 'string', true, 'Updated markdown'),
      param('metadata', 'object', false, 'Updated metadata'),
    ], 'MemoryResponse'),
    fn('markdown.delete', 'Deletes markdown memory', [
      param('memoryId', 'string', true, 'Memory ID'),
    ], 'DeleteResponse'),
    fn('markdown.list', 'Lists markdown memories', [
      param('filters', 'object', false, 'Filter options'),
    ], 'MemoryListResponse'),
  ],
};

export const episodicMemoryModule: CodeboltModule = {
  name: 'episodicMemory',
  displayName: 'Episodic Memory',
  description: 'Episodic event memory management',
  category: 'memory',
  functions: [
    fn('createMemory', 'Creates episodic memory', [
      param('title', 'string', true, 'Memory title'),
      param('description', 'string', false, 'Memory description'),
      param('tags', 'array', false, 'Memory tags'),
    ], 'MemoryResponse'),
    fn('listMemories', 'Lists episodic memories', [], 'MemoryListResponse'),
    fn('getMemory', 'Gets episodic memory', [
      param('memoryId', 'string', true, 'Memory ID'),
    ], 'MemoryResponse'),
    fn('appendEvent', 'Appends event to memory', [
      param('memoryId', 'string', true, 'Memory ID'),
      param('eventType', 'string', true, 'Event type'),
      param('content', 'string', true, 'Event content'),
      param('metadata', 'object', false, 'Event metadata'),
    ], 'EventResponse'),
    fn('queryEvents', 'Queries events', [
      param('memoryId', 'string', true, 'Memory ID'),
      param('query', 'object', true, 'Query parameters'),
    ], 'EventsResponse'),
    fn('getEventTypes', 'Gets event types', [
      param('memoryId', 'string', true, 'Memory ID'),
    ], 'EventTypesResponse'),
    fn('getTags', 'Gets memory tags', [
      param('memoryId', 'string', true, 'Memory ID'),
    ], 'TagsResponse'),
    fn('getAgents', 'Gets agent IDs', [
      param('memoryId', 'string', true, 'Memory ID'),
    ], 'AgentsResponse'),
    fn('archiveMemory', 'Archives memory', [
      param('memoryId', 'string', true, 'Memory ID'),
    ], 'MemoryResponse'),
    fn('unarchiveMemory', 'Unarchives memory', [
      param('memoryId', 'string', true, 'Memory ID'),
    ], 'MemoryResponse'),
    fn('updateTitle', 'Updates memory title', [
      param('memoryId', 'string', true, 'Memory ID'),
      param('title', 'string', true, 'New title'),
    ], 'MemoryResponse'),
  ],
};

export const persistentMemoryModule: CodeboltModule = {
  name: 'persistentMemory',
  displayName: 'Persistent Memory',
  description: 'Persistent memory pipeline management',
  category: 'memory',
  functions: [
    fn('create', 'Creates persistent memory config', [
      param('config', 'object', true, 'Memory configuration'),
    ], 'PersistentMemoryResponse'),
    fn('get', 'Gets persistent memory', [
      param('memoryId', 'string', true, 'Memory ID'),
    ], 'PersistentMemoryResponse'),
    fn('list', 'Lists persistent memories', [
      param('filters', 'object', false, 'Filter options'),
    ], 'PersistentMemoryListResponse'),
    fn('update', 'Updates persistent memory', [
      param('memoryId', 'string', true, 'Memory ID'),
      param('updates', 'object', true, 'Update data'),
    ], 'PersistentMemoryResponse'),
    fn('delete', 'Deletes persistent memory', [
      param('memoryId', 'string', true, 'Memory ID'),
    ], 'DeleteResponse'),
    fn('executeRetrieval', 'Executes retrieval', [
      param('memoryId', 'string', true, 'Memory ID'),
      param('intent', 'object', true, 'Retrieval intent'),
    ], 'RetrievalResponse'),
    fn('validate', 'Validates memory config', [
      param('memory', 'object', true, 'Memory configuration'),
    ], 'ValidationResponse'),
    fn('getStepSpecs', 'Gets step specifications', [], 'StepSpecsResponse'),
  ],
};

export const knowledgeGraphModule: CodeboltModule = {
  name: 'knowledgeGraph',
  displayName: 'Knowledge Graph',
  description: 'Knowledge graph operations',
  category: 'memory',
  functions: [
    // Instance Templates
    fn('createInstanceTemplate', 'Creates instance template', [
      param('config', 'object', true, 'Template configuration'),
    ], 'TemplateResponse'),
    fn('getInstanceTemplate', 'Gets instance template', [
      param('templateId', 'string', true, 'Template ID'),
    ], 'TemplateResponse'),
    fn('listInstanceTemplates', 'Lists instance templates', [], 'TemplateListResponse'),
    fn('updateInstanceTemplate', 'Updates instance template', [
      param('templateId', 'string', true, 'Template ID'),
      param('updates', 'object', true, 'Update data'),
    ], 'TemplateResponse'),
    fn('deleteInstanceTemplate', 'Deletes instance template', [
      param('templateId', 'string', true, 'Template ID'),
    ], 'DeleteResponse'),
    // Instances
    fn('createInstance', 'Creates KG instance', [
      param('config', 'object', true, 'Instance configuration'),
    ], 'InstanceResponse'),
    fn('getInstance', 'Gets KG instance', [
      param('instanceId', 'string', true, 'Instance ID'),
    ], 'InstanceResponse'),
    fn('listInstances', 'Lists KG instances', [
      param('templateId', 'string', false, 'Template ID filter'),
    ], 'InstanceListResponse'),
    fn('deleteInstance', 'Deletes KG instance', [
      param('instanceId', 'string', true, 'Instance ID'),
    ], 'DeleteResponse'),
    // Memory Records
    fn('addMemoryRecord', 'Adds memory record', [
      param('instanceId', 'string', true, 'Instance ID'),
      param('record', 'object', true, 'Record data'),
    ], 'RecordResponse'),
    fn('addMemoryRecords', 'Adds multiple records', [
      param('instanceId', 'string', true, 'Instance ID'),
      param('records', 'array', true, 'Records array'),
    ], 'RecordsResponse'),
    fn('getMemoryRecord', 'Gets memory record', [
      param('instanceId', 'string', true, 'Instance ID'),
      param('recordId', 'string', true, 'Record ID'),
    ], 'RecordResponse'),
    fn('listMemoryRecords', 'Lists memory records', [
      param('instanceId', 'string', true, 'Instance ID'),
      param('filters', 'object', false, 'Filter options'),
    ], 'RecordListResponse'),
    fn('updateMemoryRecord', 'Updates memory record', [
      param('instanceId', 'string', true, 'Instance ID'),
      param('recordId', 'string', true, 'Record ID'),
      param('updates', 'object', true, 'Update data'),
    ], 'RecordResponse'),
    fn('deleteMemoryRecord', 'Deletes memory record', [
      param('instanceId', 'string', true, 'Instance ID'),
      param('recordId', 'string', true, 'Record ID'),
    ], 'DeleteResponse'),
    // Edges
    fn('addEdge', 'Adds an edge', [
      param('instanceId', 'string', true, 'Instance ID'),
      param('edge', 'object', true, 'Edge data'),
    ], 'EdgeResponse'),
    fn('addEdges', 'Adds multiple edges', [
      param('instanceId', 'string', true, 'Instance ID'),
      param('edges', 'array', true, 'Edges array'),
    ], 'EdgesResponse'),
    fn('listEdges', 'Lists edges', [
      param('instanceId', 'string', true, 'Instance ID'),
      param('filters', 'object', false, 'Filter options'),
    ], 'EdgeListResponse'),
    fn('deleteEdge', 'Deletes an edge', [
      param('instanceId', 'string', true, 'Instance ID'),
      param('edgeId', 'string', true, 'Edge ID'),
    ], 'DeleteResponse'),
    // View Templates
    fn('createViewTemplate', 'Creates view template', [
      param('config', 'object', true, 'Template configuration'),
    ], 'ViewTemplateResponse'),
    fn('getViewTemplate', 'Gets view template', [
      param('templateId', 'string', true, 'Template ID'),
    ], 'ViewTemplateResponse'),
    fn('listViewTemplates', 'Lists view templates', [
      param('applicableTemplateId', 'string', false, 'Applicable template filter'),
    ], 'ViewTemplateListResponse'),
    fn('updateViewTemplate', 'Updates view template', [
      param('templateId', 'string', true, 'Template ID'),
      param('updates', 'object', true, 'Update data'),
    ], 'ViewTemplateResponse'),
    fn('deleteViewTemplate', 'Deletes view template', [
      param('templateId', 'string', true, 'Template ID'),
    ], 'DeleteResponse'),
    // Views
    fn('createView', 'Creates a view', [
      param('config', 'object', true, 'View configuration'),
    ], 'ViewResponse'),
    fn('listViews', 'Lists views', [
      param('instanceId', 'string', true, 'Instance ID'),
    ], 'ViewListResponse'),
    fn('executeView', 'Executes a view', [
      param('viewId', 'string', true, 'View ID'),
    ], 'ViewExecuteResponse'),
    fn('deleteView', 'Deletes a view', [
      param('viewId', 'string', true, 'View ID'),
    ], 'DeleteResponse'),
  ],
};

export const memoryIngestionModule: CodeboltModule = {
  name: 'memoryIngestion',
  displayName: 'Memory Ingestion',
  description: 'Memory ingestion pipeline management',
  category: 'memory',
  functions: [
    fn('create', 'Creates ingestion pipeline', [
      param('config', 'object', true, 'Pipeline configuration'),
    ], 'PipelineResponse'),
    fn('get', 'Gets ingestion pipeline', [
      param('pipelineId', 'string', true, 'Pipeline ID'),
    ], 'PipelineResponse'),
    fn('list', 'Lists ingestion pipelines', [
      param('filters', 'object', false, 'Filter options'),
    ], 'PipelineListResponse'),
    fn('update', 'Updates ingestion pipeline', [
      param('pipelineId', 'string', true, 'Pipeline ID'),
      param('updates', 'object', true, 'Update data'),
    ], 'PipelineResponse'),
    fn('delete', 'Deletes ingestion pipeline', [
      param('pipelineId', 'string', true, 'Pipeline ID'),
    ], 'DeleteResponse'),
    fn('execute', 'Executes ingestion pipeline', [
      param('pipelineId', 'string', true, 'Pipeline ID'),
      param('data', 'object', true, 'Input data'),
    ], 'ExecuteResponse'),
    fn('validate', 'Validates pipeline config', [
      param('pipeline', 'object', true, 'Pipeline configuration'),
    ], 'ValidationResponse'),
    fn('getProcessorSpecs', 'Gets processor specifications', [], 'ProcessorSpecsResponse'),
    fn('activate', 'Activates pipeline', [
      param('pipelineId', 'string', true, 'Pipeline ID'),
    ], 'PipelineResponse'),
    fn('disable', 'Disables pipeline', [
      param('pipelineId', 'string', true, 'Pipeline ID'),
    ], 'PipelineResponse'),
    fn('duplicate', 'Duplicates pipeline', [
      param('pipelineId', 'string', true, 'Pipeline ID'),
      param('newId', 'string', false, 'New pipeline ID'),
      param('newLabel', 'string', false, 'New pipeline label'),
    ], 'PipelineResponse'),
  ],
};

export const contextAssemblyModule: CodeboltModule = {
  name: 'contextAssembly',
  displayName: 'Context Assembly',
  description: 'Context assembly from memory sources',
  category: 'memory',
  functions: [
    fn('getContext', 'Gets assembled context', [
      param('request', 'object', true, 'Context assembly request'),
    ], 'ContextResponse'),
    fn('validate', 'Validates context request', [
      param('request', 'object', true, 'Context assembly request'),
    ], 'ValidationResponse'),
    fn('listMemoryTypes', 'Lists available memory types', [], 'MemoryTypesResponse'),
    fn('evaluateRules', 'Evaluates context rules', [
      param('request', 'object', true, 'Context assembly request'),
      param('ruleEngineIds', 'array', false, 'Rule engine IDs'),
    ], 'RuleEvaluationResponse'),
    fn('getRequiredVariables', 'Gets required variables', [
      param('memoryNames', 'array', true, 'Memory names'),
    ], 'VariablesResponse'),
  ],
};

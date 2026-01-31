/**
 * Knowledge Graph Module
 * Provides knowledge graph operations for structured memory
 */

import cbws from '../core/websocket';
import { randomUUID } from 'crypto';
import type {
    KGInstanceTemplateResponse,
    KGInstanceTemplateListResponse,
    KGInstanceResponse,
    KGInstanceListResponse,
    KGMemoryRecordResponse,
    KGMemoryRecordListResponse,
    KGEdgeResponse,
    KGEdgeListResponse,
    KGViewTemplateResponse,
    KGViewTemplateListResponse,
    KGViewResponse,
    KGViewListResponse,
    KGViewExecuteResponse,
    KGDeleteResponse,
    CreateKGInstanceTemplateParams,
    CreateKGInstanceParams,
    CreateKGMemoryRecordParams,
    CreateKGEdgeParams,
    CreateKGViewTemplateParams,
    CreateKGViewParams,
    ListKGMemoryRecordsParams,
    ListKGEdgesParams
} from '@codebolt/types/lib';

const knowledgeGraph = {
    // ============================================================
    // Instance Template Operations
    // ============================================================

    /**
     * Create a new instance template
     * @param config - Template configuration
     */
    createInstanceTemplate: async (config: CreateKGInstanceTemplateParams): Promise<KGInstanceTemplateResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.createInstanceTemplate',
                requestId: randomUUID(),
                params: config
            },
            'kg.createInstanceTemplate'
        );
    },

    /**
     * Get an instance template by ID
     * @param templateId - Template ID
     */
    getInstanceTemplate: async (templateId: string): Promise<KGInstanceTemplateResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.getInstanceTemplate',
                requestId: randomUUID(),
                params: { templateId }
            },
            'kg.getInstanceTemplate'
        );
    },

    /**
     * List all instance templates
     */
    listInstanceTemplates: async (): Promise<KGInstanceTemplateListResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.listInstanceTemplates',
                requestId: randomUUID(),
                params: {}
            },
            'kg.listInstanceTemplates'
        );
    },

    /**
     * Update an instance template
     * @param templateId - Template ID
     * @param updates - Update parameters
     */
    updateInstanceTemplate: async (templateId: string, updates: Partial<CreateKGInstanceTemplateParams>): Promise<KGInstanceTemplateResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.updateInstanceTemplate',
                requestId: randomUUID(),
                params: { templateId, updates }
            },
            'kg.updateInstanceTemplate'
        );
    },

    /**
     * Delete an instance template
     * @param templateId - Template ID
     */
    deleteInstanceTemplate: async (templateId: string): Promise<KGDeleteResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.deleteInstanceTemplate',
                requestId: randomUUID(),
                params: { templateId }
            },
            'kg.deleteInstanceTemplate'
        );
    },

    // ============================================================
    // Instance Operations
    // ============================================================

    /**
     * Create a new knowledge graph instance
     * @param config - Instance configuration
     */
    createInstance: async (config: CreateKGInstanceParams): Promise<KGInstanceResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.createInstance',
                requestId: randomUUID(),
                params: config
            },
            'kg.createInstance'
        );
    },

    /**
     * Get an instance by ID
     * @param instanceId - Instance ID
     */
    getInstance: async (instanceId: string): Promise<KGInstanceResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.getInstance',
                requestId: randomUUID(),
                params: { instanceId }
            },
            'kg.getInstance'
        );
    },

    /**
     * List instances, optionally filtered by template
     * @param templateId - Optional template ID filter
     */
    listInstances: async (templateId?: string): Promise<KGInstanceListResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.listInstances',
                requestId: randomUUID(),
                params: { templateId }
            },
            'kg.listInstances'
        );
    },

    /**
     * Delete an instance
     * @param instanceId - Instance ID
     */
    deleteInstance: async (instanceId: string): Promise<KGDeleteResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.deleteInstance',
                requestId: randomUUID(),
                params: { instanceId }
            },
            'kg.deleteInstance'
        );
    },

    // ============================================================
    // Memory Record Operations
    // ============================================================

    /**
     * Add a memory record to an instance
     * @param instanceId - Instance ID
     * @param record - Record data
     */
    addMemoryRecord: async (instanceId: string, record: CreateKGMemoryRecordParams): Promise<KGMemoryRecordResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.addMemoryRecord',
                requestId: randomUUID(),
                params: { instanceId, record }
            },
            'kg.addMemoryRecord'
        );
    },

    /**
     * Add multiple memory records to an instance
     * @param instanceId - Instance ID
     * @param records - Array of record data
     */
    addMemoryRecords: async (instanceId: string, records: CreateKGMemoryRecordParams[]): Promise<KGMemoryRecordListResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.addMemoryRecords',
                requestId: randomUUID(),
                params: { instanceId, records }
            },
            'kg.addMemoryRecords'
        );
    },

    /**
     * Get a memory record by ID
     * @param instanceId - Instance ID
     * @param recordId - Record ID
     */
    getMemoryRecord: async (instanceId: string, recordId: string): Promise<KGMemoryRecordResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.getMemoryRecord',
                requestId: randomUUID(),
                params: { instanceId, recordId }
            },
            'kg.getMemoryRecord'
        );
    },

    /**
     * List memory records in an instance
     * @param instanceId - Instance ID
     * @param filters - Optional filters
     */
    listMemoryRecords: async (instanceId: string, filters?: ListKGMemoryRecordsParams): Promise<KGMemoryRecordListResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.listMemoryRecords',
                requestId: randomUUID(),
                params: { instanceId, ...filters }
            },
            'kg.listMemoryRecords'
        );
    },

    /**
     * Update a memory record
     * @param instanceId - Instance ID
     * @param recordId - Record ID
     * @param updates - Update parameters
     */
    updateMemoryRecord: async (instanceId: string, recordId: string, updates: Partial<CreateKGMemoryRecordParams>): Promise<KGMemoryRecordResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.updateMemoryRecord',
                requestId: randomUUID(),
                params: { instanceId, recordId, ...updates }
            },
            'kg.updateMemoryRecord'
        );
    },

    /**
     * Delete a memory record
     * @param instanceId - Instance ID
     * @param recordId - Record ID
     */
    deleteMemoryRecord: async (instanceId: string, recordId: string): Promise<KGDeleteResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.deleteMemoryRecord',
                requestId: randomUUID(),
                params: { instanceId, recordId }
            },
            'kg.deleteMemoryRecord'
        );
    },

    // ============================================================
    // Edge Operations
    // ============================================================

    /**
     * Add an edge to an instance
     * @param instanceId - Instance ID
     * @param edge - Edge data
     */
    addEdge: async (instanceId: string, edge: CreateKGEdgeParams): Promise<KGEdgeResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.addEdge',
                requestId: randomUUID(),
                params: { instanceId, edge }
            },
            'kg.addEdge'
        );
    },

    /**
     * Add multiple edges to an instance
     * @param instanceId - Instance ID
     * @param edges - Array of edge data
     */
    addEdges: async (instanceId: string, edges: CreateKGEdgeParams[]): Promise<KGEdgeListResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.addEdges',
                requestId: randomUUID(),
                params: { instanceId, edges }
            },
            'kg.addEdges'
        );
    },

    /**
     * List edges in an instance
     * @param instanceId - Instance ID
     * @param filters - Optional filters
     */
    listEdges: async (instanceId: string, filters?: ListKGEdgesParams): Promise<KGEdgeListResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.listEdges',
                requestId: randomUUID(),
                params: { instanceId, ...filters }
            },
            'kg.listEdges'
        );
    },

    /**
     * Delete an edge
     * @param instanceId - Instance ID
     * @param edgeId - Edge ID
     */
    deleteEdge: async (instanceId: string, edgeId: string): Promise<KGDeleteResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.deleteEdge',
                requestId: randomUUID(),
                params: { instanceId, edgeId }
            },
            'kg.deleteEdge'
        );
    },

    // ============================================================
    // View Template Operations
    // ============================================================

    /**
     * Create a view template
     * @param config - View template configuration
     */
    createViewTemplate: async (config: CreateKGViewTemplateParams): Promise<KGViewTemplateResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.createViewTemplate',
                requestId: randomUUID(),
                params: config
            },
            'kg.createViewTemplate'
        );
    },

    /**
     * Get a view template by ID
     * @param templateId - Template ID
     */
    getViewTemplate: async (templateId: string): Promise<KGViewTemplateResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.getViewTemplate',
                requestId: randomUUID(),
                params: { templateId }
            },
            'kg.getViewTemplate'
        );
    },

    /**
     * List view templates
     * @param applicableTemplateId - Optional filter by applicable template
     */
    listViewTemplates: async (applicableTemplateId?: string): Promise<KGViewTemplateListResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.listViewTemplates',
                requestId: randomUUID(),
                params: { applicable_template_id: applicableTemplateId }
            },
            'kg.listViewTemplates'
        );
    },

    /**
     * Update a view template
     * @param templateId - Template ID
     * @param updates - Update parameters
     */
    updateViewTemplate: async (templateId: string, updates: Partial<CreateKGViewTemplateParams>): Promise<KGViewTemplateResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.updateViewTemplate',
                requestId: randomUUID(),
                params: { templateId, updates }
            },
            'kg.updateViewTemplate'
        );
    },

    /**
     * Delete a view template
     * @param templateId - Template ID
     */
    deleteViewTemplate: async (templateId: string): Promise<KGDeleteResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.deleteViewTemplate',
                requestId: randomUUID(),
                params: { templateId }
            },
            'kg.deleteViewTemplate'
        );
    },

    // ============================================================
    // View Operations
    // ============================================================

    /**
     * Create a view
     * @param config - View configuration
     */
    createView: async (config: CreateKGViewParams): Promise<KGViewResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.createView',
                requestId: randomUUID(),
                params: config
            },
            'kg.createView'
        );
    },

    /**
     * List views for an instance
     * @param instanceId - Instance ID
     */
    listViews: async (instanceId: string): Promise<KGViewListResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.listViews',
                requestId: randomUUID(),
                params: { instanceId }
            },
            'kg.listViews'
        );
    },

    /**
     * Execute a view query
     * @param viewId - View ID
     */
    executeView: async (viewId: string): Promise<KGViewExecuteResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.executeView',
                requestId: randomUUID(),
                params: { viewId }
            },
            'kg.executeView'
        );
    },

    /**
     * Delete a view
     * @param viewId - View ID
     */
    deleteView: async (viewId: string): Promise<KGDeleteResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kg.deleteView',
                requestId: randomUUID(),
                params: { viewId }
            },
            'kg.deleteView'
        );
    }
};

export default knowledgeGraph;

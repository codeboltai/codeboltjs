// ===== DBMEMORY NOTIFICATIONS =====

// Request Notifications
export type AddMemoryRequestNotification = {
    toolUseId: string;
    type: "dbmemorynotify";
    action: "addKnowledgeRequest";
    data: {
        key: string;
        value: any;
    };
};
export type AddMemoryResultNotification = {
    toolUseId: string;
    type: "dbmemorynotify";
    action: "addKnowledgeResult";
    content: string | any;
    isError?: boolean;
};

export type GetMemoryRequestNotification = {
    toolUseId: string;
    type: "dbmemorynotify";
    action: "getKnowledgeRequest";
    data: {
        key: string;
    };
};

export type GetMemoryResultNotification = {
    toolUseId: string;
    type: "dbmemorynotify";
    action: "getKnowledgeResult";
    content: string | any;
    isError?: boolean;
}; 
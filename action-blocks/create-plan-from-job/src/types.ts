// ================================
// TYPE DEFINITIONS
// ================================

export interface JobDetails {
    id: string;
    title: string;
    description: string;
    requirements: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: string;
    assignedTo?: string;
    dueDate?: string;
    tags?: string[];
    dependencies?: string[];
    estimatedHours?: number;
    environmentId?: string;
}

export interface PlanResult {
    success: boolean;
    specsFilePath?: string;
    lockedFiles?: string[];
    affectedFiles?: AffectedFile[];
    projectStructureUpdateId?: string;
    structureChanges?: StructureChange[];
    error?: string;
}

export interface AffectedFile {
    path: string;
    reason: string;
    changeType: 'modify' | 'create' | 'delete' | 'rename';
    priority: 'low' | 'medium' | 'high';
    confidence: number;
}

export interface StructureChange {
    type: 'create_directory' | 'create_file' | 'move_file' | 'rename_file' | 'delete_file';
    path: string;
    newPath?: string;
    reason: string;
    priority: 'low' | 'medium' | 'high';
}

export interface LLMAnalysisResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

import codebolt from '@codebolt/codeboltjs';
import { PlanResult } from './types';
import { getJobDetails } from './helpers';
import { analyzeAffectedFilesWithLLM, analyzeStructureChangesWithLLM } from './analyzers';
import { lockFiles } from './file-locking';
import { generateSpecWithAgentLoop } from './spec-generator';
import { submitProjectStructureUpdate } from './structure-update';

// Re-export types for external consumers
export * from './types';

// ================================
// MAIN ACTION BLOCK HANDLER
// ================================

codebolt.onActionBlockInvocation(async (threadContext, _metadata): Promise<PlanResult> => {
    try {
        // Extract parameters from threadContext
        const params = threadContext?.params || {};
        const jobId = params.jobId as string;
        const agentId = params.agentId as string || 'job-planner-agent';
        const environmentId = params.environmentId as string;

        if (!jobId) {
            return { success: false, error: 'No job ID provided' };
        }

        codebolt.chat.sendMessage(`Starting plan creation for job: ${jobId}`, {});

        // ========================================
        // Phase 1: Get job details
        // ========================================
        const jobDetails = await getJobDetails(jobId);
        if (!jobDetails) {
            return { success: false, error: 'Failed to retrieve job details' };
        }

        // Use environmentId from params if provided, otherwise from job details
        const effectiveEnvironmentId = environmentId || jobDetails.environmentId;

        // ========================================
        // Phase 2: Generate specification using agent loop
        // ========================================
        const specResult = await generateSpecWithAgentLoop(jobDetails);
        if (!specResult.success) {
            return specResult;
        }

        // ========================================
        // Phase 3: Analyze affected files using LLM (based on job + spec)
        // Pass context from spec generation so agent continues from where it left off
        // ========================================
        const affectedFilesResult = await analyzeAffectedFilesWithLLM(
            jobDetails,
            specResult.specsFilePath,
            specResult.context
        );
        const affectedFiles = affectedFilesResult.success && affectedFilesResult.data
            ? affectedFilesResult.data
            : [];

        if (affectedFiles.length === 0) {
            codebolt.chat.sendMessage("No specific files identified as affected", {});
        }

        // ========================================
        // Phase 4: Analyze structure changes using LLM
        // Pass context from affected files analysis
        // ========================================
        const structureChangesResult = await analyzeStructureChangesWithLLM(
            jobDetails,
            affectedFiles,
            affectedFilesResult.context
        );
        const structureChanges = structureChangesResult.success && structureChangesResult.data
            ? structureChangesResult.data
            : [];

        // ========================================
        // Phase 5: Lock affected files
        // ========================================
        let lockedFiles: string[] = [];
        if (effectiveEnvironmentId && affectedFiles.length > 0) {
            lockedFiles = await lockFiles(affectedFiles, effectiveEnvironmentId, agentId);
        } else {
            if (!effectiveEnvironmentId) {
                codebolt.chat.sendMessage("No environment ID provided, skipping file locking", {});
            }
        }

        // ========================================
        // Phase 6: Submit project structure update if needed
        // ========================================
        let projectStructureUpdateId: string | undefined;
        if (structureChanges.length > 0) {
            const updateId = await submitProjectStructureUpdate(jobDetails, structureChanges, agentId);
            if (updateId) {
                projectStructureUpdateId = updateId;
            }
        }

        // ========================================
        // Final Result
        // ========================================
        codebolt.chat.sendMessage("Plan creation completed successfully", {
            specsFilePath: specResult.specsFilePath,
            lockedFilesCount: lockedFiles.length,
            affectedFilesCount: affectedFiles.length,
            structureChangesCount: structureChanges.length,
            structureUpdateId: projectStructureUpdateId
        });

        return {
            success: true,
            specsFilePath: specResult.specsFilePath,
            affectedFiles,
            lockedFiles: lockedFiles.length > 0 ? lockedFiles : undefined,
            structureChanges: structureChanges.length > 0 ? structureChanges : undefined,
            projectStructureUpdateId,
            context: structureChangesResult.context
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Plan creation failed:', error);
        codebolt.chat.sendMessage(`Plan creation failed: ${errorMessage}`, {});
        return { success: false, error: errorMessage };
    }
});

import codebolt from '@codebolt/codeboltjs';
import { AffectedFile } from './types';

// ================================
// FILE LOCKING
// ================================

export async function lockFiles(
    affectedFiles: AffectedFile[],
    environmentId: string,
    agentId: string
): Promise<string[]> {
    const lockedFiles: string[] = [];

    try {
        codebolt.chat.sendMessage("Locking affected files to prevent conflicts...", {});

        // Sort files by priority (high first) and confidence
        const sortedFiles = [...affectedFiles].sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return (b.confidence || 0) - (a.confidence || 0);
        });

        for (const file of sortedFiles) {
            // Only lock files that will be modified or created
            if (file.changeType === 'delete') {
                continue;
            }

            try {
                // Check for existing intents/overlaps
                const overlapResult = await codebolt.fileUpdateIntent.checkOverlap(
                    environmentId,
                    [file.path],
                    file.priority === 'high' ? 4 : file.priority === 'medium' ? 2 : 1
                );

                if (overlapResult.hasOverlap) {
                    codebolt.chat.sendMessage(`Warning: File ${file.path} has overlapping intents, skipping lock`, {});
                    // exit return to parent // job is not ready 
                    continue;
                }

                // Create file update intent
                const intentResult = await codebolt.fileUpdateIntent.create({
                    environmentId,
                    files: [{
                        filePath: file.path,
                        intentLevel: file.priority === 'high' ? 4 : file.priority === 'medium' ? 2 : 1
                    }],
                    description: `Locked for job implementation: ${file.reason}`,
                    priority: file.priority === 'high' ? 4 : file.priority === 'medium' ? 2 : 1,
                    estimatedDuration: 3600 // 1 hour default
                }, agentId, 'Job Plan Implementation Agent');

                if (intentResult.intent) {
                    lockedFiles.push(file.path);
                }
            } catch (error) {
                console.error(`Error locking file ${file.path}:`, error);
            }
        }

        codebolt.chat.sendMessage(`Successfully locked ${lockedFiles.length} files`, {});
        return lockedFiles;
    } catch (error) {
        console.error('Error locking files:', error);
        codebolt.chat.sendMessage(`Error locking files: ${error instanceof Error ? error.message : 'Unknown error'}`, {});
        return [];
    }
}

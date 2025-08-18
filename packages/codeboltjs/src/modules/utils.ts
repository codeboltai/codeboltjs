import { EventType, FSAction, FSResponseType } from '@codebolt/types/enum';
import cbws from '../core/websocket';
import { FsEditFileAndApplyDiffResponse } from '@codebolt/types/sdk';


const cbutils = {

    /**
     * Edits a file and applies a diff with AI assistance.
     * @param {string} filePath - The path to the file to edit.
     * @param {string} diff - The diff to apply.
     * @param {string} diffIdentifier - The identifier for the diff.
     * @param {string} prompt - The prompt for the AI model.
     * @param {string} applyModel - Optional model to use for applying the diff.
     * @returns {Promise<FsEditFileAndApplyDiffResponse>} A promise that resolves with the edit response.
     */
    editFileAndApplyDiff: (filePath: string, diff: string, diffIdentifier: string, prompt: string, applyModel?: string): Promise<FsEditFileAndApplyDiffResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.FS_EVENT,
                "action": FSAction.EDIT_FILE_AND_APPLY_DIFF,
                message: {  
                    filePath,
                    diff,
                    diffIdentifier,
                    prompt,
                    applyModel
                }
            },
            FSResponseType.EDIT_FILE_AND_APPLY_DIFF_RESPONSE
        );
    }
}

export default cbutils;
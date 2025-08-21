"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const enum_1 = require("@codebolt/types/enum");
const websocket_1 = __importDefault(require("../core/websocket"));
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
    editFileAndApplyDiff: (filePath, diff, diffIdentifier, prompt, applyModel) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.FS_EVENT,
            "action": enum_1.FSAction.EDIT_FILE_AND_APPLY_DIFF,
            message: {
                filePath,
                diff,
                diffIdentifier,
                prompt,
                applyModel
            }
        }, enum_1.FSResponseType.EDIT_FILE_AND_APPLY_DIFF_RESPONSE);
    }
};
exports.default = cbutils;

/**
 * Edit Tool - Edits file content using text replacement
 * Wraps the SDK's cbfs.editFileWithDiff() method
 */

import * as path from 'path';
import { shortenPath } from '../utils/paths';
import type {
    ToolInvocation,
    ToolLocation,
    ToolResult,
    FileDiff,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbfs from '../../modules/fs';

/**
 * Parameters for the Edit tool
 */
export interface EditToolParams {
    /**
     * The absolute path to the file to edit
     */
    absolute_path: string;

    /**
     * The original text to find and replace
     */
    old_string: string;

    /**
     * The new text to replace with
     */
    new_string: string;

    /**
     * Optional: Expected number of occurrences to replace
     */
    expected_occurrences?: number;
}

class EditToolInvocation extends BaseToolInvocation<
    EditToolParams,
    ToolResult
> {
    constructor(params: EditToolParams) {
        super(params);
    }

    override toolLocations(): ToolLocation[] {
        return [{ path: this.params.absolute_path }];
    }

    async execute(): Promise<ToolResult> {
        try {
            const filePath = this.params.absolute_path;
            const oldString = this.params.old_string;
            const newString = this.params.new_string;

            // First read the file to get original content
            const readResponse = await cbfs.readFile(filePath);
            if (!readResponse.success) {
                const errorMsg = typeof readResponse.error === 'string'
                    ? readResponse.error
                    : (readResponse.error as any)?.message || 'File not found';
                return {
                    llmContent: `Error: Could not read file: ${errorMsg}`,
                    returnDisplay: `Error reading file`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.FILE_NOT_FOUND,
                    },
                };
            }

            const originalContent = readResponse.content || '';

            // Count occurrences
            const occurrences = originalContent.split(oldString).length - 1;

            if (occurrences === 0) {
                return {
                    llmContent: `Error: The specified text was not found in the file.\nSearched for: "${this.truncateForDisplay(oldString)}"`,
                    returnDisplay: `Error: Text not found in file`,
                    error: {
                        message: 'Text to replace was not found in the file',
                        type: ToolErrorType.EDIT_NO_OCCURRENCE_FOUND,
                    },
                };
            }

            // Check expected occurrences if specified
            if (this.params.expected_occurrences !== undefined &&
                occurrences !== this.params.expected_occurrences) {
                return {
                    llmContent: `Error: Expected ${this.params.expected_occurrences} occurrence(s), but found ${occurrences}.\nThis might indicate the old_string is not unique enough. Please provide more context in old_string.`,
                    returnDisplay: `Error: Occurrence count mismatch`,
                    error: {
                        message: `Expected ${this.params.expected_occurrences} occurrences, found ${occurrences}`,
                        type: ToolErrorType.EDIT_EXPECTED_OCCURRENCE_MISMATCH,
                    },
                };
            }

            // Perform the replacement
            const newContent = originalContent.replace(new RegExp(this.escapeRegExp(oldString), 'g'), newString);

            // Check if anything changed
            if (originalContent === newContent) {
                return {
                    llmContent: 'Error: No changes were made to the file.',
                    returnDisplay: 'No changes made',
                    error: {
                        message: 'Edit resulted in no changes',
                        type: ToolErrorType.EDIT_NO_CHANGE,
                    },
                };
            }

            // Write the updated content
            const fileName = path.basename(filePath);
            const updateResponse = await cbfs.updateFile(fileName, filePath, newContent);

            if (!updateResponse.success) {
                const errorMsg = typeof updateResponse.error === 'string'
                    ? updateResponse.error
                    : (updateResponse.error as any)?.message || 'Unknown error';
                return {
                    llmContent: `Error writing file: ${errorMsg}`,
                    returnDisplay: `Error writing file`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.FILE_WRITE_FAILURE,
                    },
                };
            }

            // Generate a simple diff for display
            const diff = this.generateSimpleDiff(originalContent, newContent, filePath);

            const fileDiff: FileDiff = {
                fileDiff: diff,
                fileName: fileName,
                originalContent: originalContent,
                newContent: newContent,
            };

            return {
                llmContent: `Successfully edited ${filePath}\nReplaced ${occurrences} occurrence(s) of the specified text.`,
                returnDisplay: fileDiff,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error editing file: ${errorMessage}`,
                returnDisplay: `Error editing file: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }

    private escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    private truncateForDisplay(str: string, maxLength: number = 100): string {
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength) + '...';
    }

    private generateSimpleDiff(original: string, updated: string, filePath: string): string {
        const originalLines = original.split('\n');
        const updatedLines = updated.split('\n');

        let diff = `--- a/${path.basename(filePath)}\n`;
        diff += `+++ b/${path.basename(filePath)}\n`;

        // Simple line-by-line diff
        const maxLines = Math.max(originalLines.length, updatedLines.length);
        let changesFound = false;
        let contextStart = -1;

        for (let i = 0; i < maxLines; i++) {
            const origLine = originalLines[i];
            const newLine = updatedLines[i];

            if (origLine !== newLine) {
                if (!changesFound) {
                    diff += `@@ -${Math.max(1, i - 2)},${originalLines.length} +${Math.max(1, i - 2)},${updatedLines.length} @@\n`;
                    changesFound = true;
                }
                if (origLine !== undefined) {
                    diff += `-${origLine}\n`;
                }
                if (newLine !== undefined) {
                    diff += `+${newLine}\n`;
                }
            }
        }

        return diff;
    }
}

/**
 * Implementation of the Edit tool logic
 */
export class EditTool extends BaseDeclarativeTool<
    EditToolParams,
    ToolResult
> {
    static readonly Name: string = 'edit';

    constructor() {
        super(
            EditTool.Name,
            'Edit',
            `Edits a file by replacing specified text with new text. The tool finds all occurrences of 'old_string' in the file and replaces them with 'new_string'. Use this for precise, targeted edits to existing files.`,
            Kind.Edit,
            {
                properties: {
                    absolute_path: {
                        description:
                            "The absolute path to the file to edit (e.g., '/home/user/project/file.txt').",
                        type: 'string',
                    },
                    old_string: {
                        description:
                            'The exact text to find in the file. Must be unique enough to identify the correct location. Include surrounding context if needed for uniqueness.',
                        type: 'string',
                    },
                    new_string: {
                        description:
                            'The text to replace old_string with. Can be empty to delete the old text.',
                        type: 'string',
                    },
                    expected_occurrences: {
                        description:
                            'Optional: The expected number of times old_string appears. If specified and the actual count differs, the edit will fail. Use this to ensure you are editing exactly what you intend.',
                        type: 'number',
                    },
                },
                required: ['absolute_path', 'old_string', 'new_string'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: EditToolParams,
    ): string | null {
        const filePath = params.absolute_path;
        if (params.absolute_path.trim() === '') {
            return "The 'absolute_path' parameter must be non-empty.";
        }

        if (!path.isAbsolute(filePath)) {
            return `File path must be absolute, but was relative: ${filePath}.`;
        }

        if (params.old_string === undefined || params.old_string === '') {
            return "The 'old_string' parameter must be non-empty.";
        }

        if (params.old_string === params.new_string) {
            return 'old_string and new_string are identical. No edit would be made.';
        }

        if (params.expected_occurrences !== undefined && params.expected_occurrences < 1) {
            return 'expected_occurrences must be at least 1';
        }

        return null;
    }

    protected createInvocation(
        params: EditToolParams,
    ): ToolInvocation<EditToolParams, ToolResult> {
        return new EditToolInvocation(params);
    }
}

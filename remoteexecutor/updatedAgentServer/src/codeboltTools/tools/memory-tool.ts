/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ToolResult } from '../types';
import {
  BaseDeclarativeTool,
  BaseToolInvocation,
  Kind,
} from '../base-tool';
import type { FunctionDeclarationSchema } from '@google/generative-ai';
import { SchemaType } from '@google/generative-ai';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { StandaloneToolConfig } from '../config';
import { ToolErrorType } from '../types';
import * as os from 'node:os';

const memoryToolSchemaData: FunctionDeclarationSchema = {
  type: SchemaType.OBJECT,
  properties: {
    fact: {
      type: SchemaType.STRING,
      description:
        'The specific fact or piece of information to remember. Should be a clear, self-contained statement.',
    },
  },
  required: ['fact'],
};

const memoryToolDescription = `
Saves a specific piece of information or fact to your long-term memory.

Use this tool:

- When the user explicitly asks you to remember something (e.g., "Remember that I like pineapple on pizza", "Please save this: my cat's name is Whiskers").
- When the user states a clear, concise fact about themselves, their preferences, or their environment that seems important for you to retain for future interactions to provide a more personalized and effective assistance.

Do NOT use this tool:

- To remember conversational context that is only relevant for the current session.
- To save long, complex, or rambling pieces of text. The fact should be relatively short and to the point.
- If you are unsure whether the information is a fact worth remembering long-term. If in doubt, you can ask the user, "Should I remember that for you?"

## Parameters

- \`fact\` (string, required): The specific fact or piece of information to remember. This should be a clear, self-contained statement. For example, if the user says "My favorite color is blue", the fact would be "My favorite color is blue".
`;

export const DEFAULT_CONTEXT_FILENAME = 'MEMORY.md';
export const MEMORY_SECTION_HEADER = '## Saved Memories';

// This variable will hold the currently configured filename for memory files.
let currentMemoryFilename: string | string[] = DEFAULT_CONTEXT_FILENAME;

export function setMemoryFilename(newFilename: string | string[]): void {
  if (Array.isArray(newFilename)) {
    if (newFilename.length > 0) {
      currentMemoryFilename = newFilename.map((name) => name.trim());
    }
  } else if (newFilename && newFilename.trim() !== '') {
    currentMemoryFilename = newFilename.trim();
  }
}

export function getCurrentMemoryFilename(): string {
  if (Array.isArray(currentMemoryFilename)) {
    return currentMemoryFilename[0] || DEFAULT_CONTEXT_FILENAME;
  }
  return currentMemoryFilename;
}

export function getAllMemoryFilenames(): string[] {
  if (Array.isArray(currentMemoryFilename)) {
    return currentMemoryFilename;
  }
  return [currentMemoryFilename];
}

interface SaveMemoryParams {
  fact: string;
  modified_by_user?: boolean;
  modified_content?: string;
}

/**
 * Get the global memory directory path
 */
function getGlobalMemoryDir(): string {
  return path.join(os.homedir(), '.standalone-tools');
}

function getGlobalMemoryFilePath(): string {
  return path.join(getGlobalMemoryDir(), getCurrentMemoryFilename());
}

/**
 * Ensures proper newline separation before appending content.
 */
function ensureNewlineSeparation(currentContent: string): string {
  if (currentContent.length === 0) return '';
  if (currentContent.endsWith('\n\n') || currentContent.endsWith('\r\n\r\n'))
    return '';
  if (currentContent.endsWith('\n') || currentContent.endsWith('\r\n'))
    return '\n';
  return '\n\n';
}


/**
 * Computes the new content that would result from adding a memory entry
 */
function computeNewContent(currentContent: string, fact: string): string {
  let processedText = fact.trim();
  processedText = processedText.replace(/^(-+\s*)+/, '').trim();
  const newMemoryItem = `- ${processedText}`;

  const headerIndex = currentContent.indexOf(MEMORY_SECTION_HEADER);

  if (headerIndex === -1) {
    // Header not found, append header and then the entry
    const separator = ensureNewlineSeparation(currentContent);
    return (
      currentContent +
      `${separator}${MEMORY_SECTION_HEADER}\n${newMemoryItem}\n`
    );
  } else {
    // Header found, find where to insert the new memory entry
    const startOfSectionContent = headerIndex + MEMORY_SECTION_HEADER.length;
    let endOfSectionIndex = currentContent.indexOf(
      '\n## ',
      startOfSectionContent,
    );
    if (endOfSectionIndex === -1) {
      endOfSectionIndex = currentContent.length; // End of file
    }

    const beforeSectionMarker = currentContent
      .substring(0, startOfSectionContent)
      .trimEnd();
    let sectionContent = currentContent
      .substring(startOfSectionContent, endOfSectionIndex)
      .trimEnd();
    const afterSectionMarker = currentContent.substring(endOfSectionIndex);

    sectionContent += `\n${newMemoryItem}`;
    return (
      `${beforeSectionMarker}\n${sectionContent.trimStart()}\n${afterSectionMarker}`.trimEnd() +
      '\n'
    );
  }
}

class MemoryToolInvocation extends BaseToolInvocation<
  SaveMemoryParams,
  ToolResult
> {
  constructor(
    private readonly config: StandaloneToolConfig,
    params: SaveMemoryParams,
  ) {
    super(params);
  }

  getDescription(): string {
    const memoryFilePath = getGlobalMemoryFilePath();
    return `in ${memoryFilePath.replace(os.homedir(), '~')}`;
  }

  async execute(_signal: AbortSignal): Promise<ToolResult> {
    const { fact, modified_by_user, modified_content } = this.params;

    try {
      if (modified_by_user && modified_content !== undefined) {
        // User modified the content in external editor, write it directly
        await fs.mkdir(path.dirname(getGlobalMemoryFilePath()), {
          recursive: true,
        });
        await fs.writeFile(
          getGlobalMemoryFilePath(),
          modified_content,
          'utf-8',
        );
        const successMessage = `Okay, I've updated the memory file with your modifications.`;
        return {
          llmContent: JSON.stringify({
            success: true,
            message: successMessage,
          }),
          returnDisplay: successMessage,
        };
      } else {
        // Use the normal memory entry logic
        await MemoryTool.performAddMemoryEntry(
          fact,
          getGlobalMemoryFilePath(),
          {
            readFile: fs.readFile,
            writeFile: fs.writeFile,
            mkdir: fs.mkdir,
          },
        );
        const successMessage = `Okay, I've remembered that: "${fact}"`;
        return {
          llmContent: JSON.stringify({
            success: true,
            message: successMessage,
          }),
          returnDisplay: successMessage,
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `[MemoryTool] Error executing save_memory for fact "${fact}": ${errorMessage}`,
      );
      return {
        llmContent: JSON.stringify({
          success: false,
          error: `Failed to save memory. Detail: ${errorMessage}`,
        }),
        returnDisplay: `Error saving memory: ${errorMessage}`,
        error: {
          message: errorMessage,
          type: ToolErrorType.MEMORY_TOOL_EXECUTION_ERROR,
        },
      };
    }
  }
}

export class MemoryTool extends BaseDeclarativeTool<SaveMemoryParams, ToolResult> {
  static readonly Name: string = 'save_memory';

  constructor(private readonly config: StandaloneToolConfig) {
    super(
      MemoryTool.Name,
      'Save Memory',
      memoryToolDescription,
      Kind.Think,
      memoryToolSchemaData,
    );
  }

  protected override validateToolParamValues(
    params: SaveMemoryParams,
  ): string | null {
    if (params.fact.trim() === '') {
      return 'Parameter "fact" must be a non-empty string.';
    }

    return null;
  }

  protected createInvocation(params: SaveMemoryParams) {
    return new MemoryToolInvocation(this.config, params);
  }

  static async performAddMemoryEntry(
    text: string,
    memoryFilePath: string,
    fsAdapter: {
      readFile: (path: string, encoding: 'utf-8') => Promise<string>;
      writeFile: (
        path: string,
        data: string,
        encoding: 'utf-8',
      ) => Promise<void>;
      mkdir: (
        path: string,
        options: { recursive: boolean },
      ) => Promise<string | undefined>;
    },
  ): Promise<void> {
    try {
      await fsAdapter.mkdir(path.dirname(memoryFilePath), { recursive: true });
      let currentContent = '';
      try {
        currentContent = await fsAdapter.readFile(memoryFilePath, 'utf-8');
      } catch (_e) {
        // File doesn't exist, which is fine. currentContent will be empty.
      }

      const newContent = computeNewContent(currentContent, text);

      await fsAdapter.writeFile(memoryFilePath, newContent, 'utf-8');
    } catch (error) {
      console.error(
        `[MemoryTool] Error adding memory entry to ${memoryFilePath}:`,
        error,
      );
      throw new Error(
        `[MemoryTool] Failed to add memory entry: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

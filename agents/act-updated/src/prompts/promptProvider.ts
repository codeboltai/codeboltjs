/**
 * @license
 * Copyright 2025 Codebolt
 * SPDX-License-Identifier: MIT
 */

import * as snippets from './snippets';
import {
    READ_FILE_TOOL_NAME,
    WRITE_TODOS_TOOL_NAME,
    ACTIVATE_SKILL_TOOL_NAME
} from './snippets';

export interface PromptConfig {
    isInteractive: boolean;
    activeModel?: string;
    approvalMode?: 'default' | 'plan';
    cwd?: string;
    availableTools?: string[];
    // Add other context needed for prompt generation
}

/**
 * Orchestrates prompt generation by gathering context and building options.
 */
export class PromptProvider {
    /**
     * Generates the core system prompt.
     */
    getCoreSystemPrompt(
        config: PromptConfig,
        userMemory?: string,
    ): string {
        const interactiveMode = config.isInteractive;
        // Simple logic for isGemini3 - can be enhanced with better model detection
        const isGemini3 = config.activeModel?.includes('gemini-2') || config.activeModel?.includes('claude-3-5') || false;
        const isPlanMode = config.approvalMode === 'plan';
        const toolNames = config.availableTools || [];

        // Determine if we are in a git repo
        // In a real implementation, you might want to check this async or pass it in
        // For now, we'll assume we check it via the config or it's passed in
        // Ideally this should be passed in via config.cwd
        const isGitRepo = false; // TODO: Implement git detection or pass via config

        const options: snippets.SystemPromptOptions = {
            preamble: {
                interactive: interactiveMode,
            },
            coreMandates: {
                interactive: interactiveMode,
                isGemini3,
                hasSkills: toolNames.includes(ACTIVATE_SKILL_TOOL_NAME),
            },
            // agentContexts: ... // Add directory/file context logic here if needed separate from modifiers
            agentSkills: [], // Populate if we have a skill manager
            // hookContext: ...
            primaryWorkflows: !isPlanMode ? {
                interactive: interactiveMode,
                enableCodebaseInvestigator: false, // TODO check for codebase investigator tool
                enableWriteTodosTool: toolNames.includes(WRITE_TODOS_TOOL_NAME),
            } : undefined,
            planningWorkflow: isPlanMode ? {
                planModeToolsList: toolNames.map(t => `- \`${t}\``).join('\n'), // Simplified 
                plansDir: '.codebolt/plans', // Default plans dir
            } : undefined,
            operationalGuidelines: {
                interactive: interactiveMode,
                isGemini3,
                enableShellEfficiency: true, // Default to true
            },
            sandbox: 'outside', // Default to outside for now. TODO: Detect environment
            gitRepo: isGitRepo ? { interactive: interactiveMode } : undefined,
            finalReminder: {
                readFileToolName: READ_FILE_TOOL_NAME,
            },
        };

        const basePrompt = snippets.getCoreSystemPrompt(options);

        // --- Finalization ---
        const finalPrompt = snippets.renderFinalShell(basePrompt, userMemory);

        // Sanitize erratic newlines
        const sanitizedPrompt = finalPrompt.replace(/\n{3,}/g, '\n\n');

        return sanitizedPrompt;
    }
}

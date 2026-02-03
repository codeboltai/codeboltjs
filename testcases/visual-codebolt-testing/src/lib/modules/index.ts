// Types
export * from './types';
export * from './categories';

// File System modules
export { fsModule, codeutilsModule, outputparsersModule } from './fs';

// Browser modules
export { browserModule, crawlerModule } from './browser';

// Communication modules
export { chatModule, mailModule, terminalModule } from './communication';

// Git module
export { gitModule } from './git';

// LLM modules
export { llmModule, mcpModule } from './llm';

// Agent modules
export {
  agentModule,
  swarmModule,
  agentDeliberationModule,
  agentEventQueueModule,
  agentPortfolioModule,
} from './agents';

// Jobs & Tasks modules
export {
  jobModule,
  taskModule,
  todoModule,
  actionPlanModule,
  actionBlockModule,
  sideExecutionModule,
} from './jobs';

// Memory modules
export {
  memoryModule,
  episodicMemoryModule,
  persistentMemoryModule,
  knowledgeGraphModule,
  memoryIngestionModule,
  contextAssemblyModule,
} from './memory';

// Project modules
export {
  projectModule,
  projectStructureModule,
  roadmapModule,
  codemapModule,
  requirementPlanModule,
} from './project';

// Testing module
export { autoTestingModule } from './testing';

// Calendar modules
export { calendarModule, eventLogModule, hookModule } from './calendar';

// Search modules
export { searchModule, codebaseSearchModule, vectordbModule } from './search';

// Config modules
export {
  capabilityModule,
  stateModule,
  kvStoreModule,
  contextRuleEngineModule,
} from './config';

// Orchestration modules
export {
  orchestratorModule,
  backgroundChildThreadsModule,
  threadModule,
} from './orchestration';

// Review modules
export {
  reviewMergeRequestModule,
  groupFeedbackModule,
  fileUpdateIntentModule,
  projectStructureUpdateRequestModule,
} from './review';

// Utility modules
export {
  utilsModule,
  tokenizerModule,
  debugModule,
  historyModule,
  userMessageUtilitiesModule,
} from './utilities';

import { CodeboltModule, CodeboltFunction, ModuleCategory } from './types';
import { MODULE_CATEGORIES } from './categories';

// Import all modules
import { fsModule, codeutilsModule, outputparsersModule } from './fs';
import { browserModule, crawlerModule } from './browser';
import { chatModule, mailModule, terminalModule } from './communication';
import { gitModule } from './git';
import { llmModule, mcpModule } from './llm';
import {
  agentModule,
  swarmModule,
  agentDeliberationModule,
  agentEventQueueModule,
  agentPortfolioModule,
} from './agents';
import {
  jobModule,
  taskModule,
  todoModule,
  actionPlanModule,
  actionBlockModule,
  sideExecutionModule,
} from './jobs';
import {
  memoryModule,
  episodicMemoryModule,
  persistentMemoryModule,
  knowledgeGraphModule,
  memoryIngestionModule,
  contextAssemblyModule,
} from './memory';
import {
  projectModule,
  projectStructureModule,
  roadmapModule,
  codemapModule,
  requirementPlanModule,
} from './project';
import { autoTestingModule } from './testing';
import { calendarModule, eventLogModule, hookModule } from './calendar';
import { searchModule, codebaseSearchModule, vectordbModule } from './search';
import {
  capabilityModule,
  stateModule,
  kvStoreModule,
  contextRuleEngineModule,
} from './config';
import {
  orchestratorModule,
  backgroundChildThreadsModule,
  threadModule,
} from './orchestration';
import {
  reviewMergeRequestModule,
  groupFeedbackModule,
  fileUpdateIntentModule,
  projectStructureUpdateRequestModule,
} from './review';
import {
  utilsModule,
  tokenizerModule,
  debugModule,
  historyModule,
  userMessageUtilitiesModule,
} from './utilities';

// All modules array
export const ALL_MODULES: CodeboltModule[] = [
  // File System
  fsModule,
  codeutilsModule,
  outputparsersModule,
  // Browser
  browserModule,
  crawlerModule,
  // Communication
  chatModule,
  mailModule,
  terminalModule,
  // Git
  gitModule,
  // LLM
  llmModule,
  mcpModule,
  // Agents
  agentModule,
  swarmModule,
  agentDeliberationModule,
  agentEventQueueModule,
  agentPortfolioModule,
  // Jobs & Tasks
  jobModule,
  taskModule,
  todoModule,
  actionPlanModule,
  actionBlockModule,
  sideExecutionModule,
  // Memory
  memoryModule,
  episodicMemoryModule,
  persistentMemoryModule,
  knowledgeGraphModule,
  memoryIngestionModule,
  contextAssemblyModule,
  // Project
  projectModule,
  projectStructureModule,
  roadmapModule,
  codemapModule,
  requirementPlanModule,
  // Testing
  autoTestingModule,
  // Calendar
  calendarModule,
  eventLogModule,
  hookModule,
  // Search
  searchModule,
  codebaseSearchModule,
  vectordbModule,
  // Config
  capabilityModule,
  stateModule,
  kvStoreModule,
  contextRuleEngineModule,
  // Orchestration
  orchestratorModule,
  backgroundChildThreadsModule,
  threadModule,
  // Review
  reviewMergeRequestModule,
  groupFeedbackModule,
  fileUpdateIntentModule,
  projectStructureUpdateRequestModule,
  // Utilities
  utilsModule,
  tokenizerModule,
  debugModule,
  historyModule,
  userMessageUtilitiesModule,
];

// Module map for quick lookup
export const MODULE_MAP: Record<string, CodeboltModule> = ALL_MODULES.reduce(
  (acc, module) => {
    acc[module.name] = module;
    return acc;
  },
  {} as Record<string, CodeboltModule>
);

// API class for interacting with modules
export class CodeboltAPI {
  private static baseUrl = '/api';

  static getModules(): CodeboltModule[] {
    return ALL_MODULES;
  }

  static getModuleByName(name: string): CodeboltModule | undefined {
    return MODULE_MAP[name];
  }

  static getCategories(): ModuleCategory[] {
    return MODULE_CATEGORIES;
  }

  static getModulesByCategory(categoryId: string): CodeboltModule[] {
    const category = MODULE_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return [];
    return category.modules
      .map(name => MODULE_MAP[name])
      .filter((m): m is CodeboltModule => m !== undefined);
  }

  static getFunctionByName(
    moduleName: string,
    functionName: string
  ): CodeboltFunction | undefined {
    const module = this.getModuleByName(moduleName);
    return module?.functions.find(
      f => f.name.toLowerCase() === functionName.toLowerCase()
    );
  }

  static searchFunctions(query: string): Array<{
    module: CodeboltModule;
    function: CodeboltFunction;
  }> {
    const lowerQuery = query.toLowerCase();
    const results: Array<{ module: CodeboltModule; function: CodeboltFunction }> = [];

    for (const module of ALL_MODULES) {
      for (const fn of module.functions) {
        if (
          fn.name.toLowerCase().includes(lowerQuery) ||
          fn.description.toLowerCase().includes(lowerQuery) ||
          module.name.toLowerCase().includes(lowerQuery) ||
          module.displayName.toLowerCase().includes(lowerQuery)
        ) {
          results.push({ module, function: fn });
        }
      }
    }

    return results;
  }

  static async callFunction(
    moduleName: string,
    functionName: string,
    parameters: Record<string, unknown>
  ) {
    try {
      const response = await fetch(`${this.baseUrl}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          module: moduleName,
          function: functionName,
          parameters,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Codebolt API Error:', error);
      throw error;
    }
  }

  static getTotalFunctionCount(): number {
    return ALL_MODULES.reduce((acc, m) => acc + m.functions.length, 0);
  }

  static getModuleCount(): number {
    return ALL_MODULES.length;
  }
}

export default CodeboltAPI;

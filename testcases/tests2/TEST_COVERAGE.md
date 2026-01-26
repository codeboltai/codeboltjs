# CodeboltJS Test Suite Coverage

This document provides a comprehensive overview of all test files for the CodeboltJS SDK.

## Quick Stats

- **Total Test Files**: 56 (including example.test.ts and remaining.test.ts)
- **Module-Specific Test Files**: 51
- **Estimated Test Cases**: 700+
- **Test Coverage**: All 49+ modules have dedicated test files

## Complete Test File List

### File System & Core Operations
| Test File | Module | Key Features | Est. Tests |
|-----------|--------|--------------|------------|
| `fs.test.ts` | File System | createFile, readFile, updateFile, deleteFile, search, grep | 19 |
| `git.test.ts` | Git | init, commit, status, push, pull, diff, checkout, branch, **clone** | 19 |
| `terminal.test.ts` | Terminal | executeCommand, **executeCommandRunUntilInterrupt** | 67 |
| `browser.test.ts` | Browser | newPage, goTo, screenshot, getHTML, getMarkdown, getPdf | 30+ |
| `tokenizer.test.ts` | Tokenizer | addToken, getToken, countTokens | 2 |

### AI & Language Processing
| Test File | Module | Key Features | Est. Tests |
|-----------|--------|--------------|------------|
| `llm.test.ts` | LLM | inference, configuration, role-based inference | 40+ |
| `memory.test.ts` | Memory Systems | dbmemory, persistentMemory, episodicMemory, knowledgeGraph | 70+ |
| `knowledge.test.ts` | Knowledge | getKnowledge, addKnowledge, retrieveRelated | 5 |
| `rag.test.ts` | RAG | addEmbedding, queryEmbeddings, retrieve | 5 |
| `chat.test.ts` | Chat | getChatHistory, sendMessage, waitForReply | 3 |
| `history.test.ts` | Chat History | summarizeAll, summarizeMessages, chatSummary | 2 |
| `outputParsers.test.ts` | Output Parsers | parseJSON, parseXML, parseCSV, parseText, parseErrors | 8 |

### Agent Management
| Test File | Module | Key Features | Est. Tests |
|-----------|--------|--------------|------------|
| `agent.test.ts` | Agent | findAgent, startAgent, getAgentsList, getAgentsDetail | 15+ |
| `agentPortfolio.test.ts` | Agent Portfolio | getPortfolio, addKarma, addTestimonial, endorseTalent, getRanking | 45 |
| `agentDeliberation.test.ts` | Agent Deliberation | deliberation workflows, voting | 10+ |
| `notify.test.ts` | Notifications | sendNotification (agent, fs, llm, chat, terminal, todo, search) | 8 |

### Task & Thread Management
| Test File | Module | Key Features | Est. Tests |
|-----------|--------|--------------|------------|
| `task.test.ts` | Task | createTask, updateTask, deleteTask, getTask, listTasks, assignAgent | 22 |
| `thread.test.ts` | Thread | createThread, updateThread, deleteThread, getThreadMessages, getFileChanges | 22 |

### MCP (Model Context Protocol)
| Test File | Module | Key Features | Est. Tests |
|-----------|--------|--------------|------------|
| `mcp.test.ts` | MCP | getEnabledMCPServers, getLocalMCPServers, searchAvailableMCPServers, **getMcpTools**, **getMcpList**, **getAllMcpTools**, **getEnabledMcps**, **configureMcpTool** | 40+ |

### Todo Management
| Test File | Module | Key Features | Est. Tests |
|-----------|--------|--------------|------------|
| `todo.test.ts` | Todo | createTodoList, addTodoItem, changeTodoItemStatus, getTodoStats, **exportTodos**, **importTodos** | 20 |

### Job & Workflow Management
| Test File | Module | Key Features | Est. Tests |
|-----------|--------|--------------|------------|
| `job.test.ts` | Job | createJobGroup, createJob, listJobs, addDependency, pheromones, locking, bidding | 7 |
| `swarm.test.ts` | Swarm | createSwarm, listSwarms, createTeam, createRole, registerAgent, spawn | 6 |
| `sideExecution.test.ts` | Side Execution | start, stop, listActionBlocks, getSideExecutionStatus, startActionBlock | 3 |
| `actionBlock.test.ts` | Action Block | listActionBlocks, getActionBlockDetail, startActionBlock | 3 |
| `autoTesting.test.ts` | Auto Testing | createTestSuite, listTestSuites, createTestCase, createTestRun | 5 |

### Project Management & Planning
| Test File | Module | Key Features | Est. Tests |
|-----------|--------|--------------|------------|
| `project.test.ts` | Project | getProjectSettings, getProjectPath, getRepoMap, getEditorFileStatus | 4 |
| `actionPlan.test.ts` | Action Plan | getAllActionPlans, getActionPlanDetail, createActionPlan, addTaskToActionPlan | 4 |
| `roadmap.test.ts` | Roadmap | getRoadmap, getPhases, createPhase, createFeature, createIdea | 5 |
| `codemap.test.ts` | Codemap | listCodemaps, createCodemap, getCodemapDetail, updateCodemapStatus | 4 |
| `projectStructure.test.ts` | Project Structure | getProjectMetadata, getPackages, createPackage, addAPIRoute | 4 |
| `requirementPlan.test.ts` | Requirement Plan | createRequirementPlan, getRequirementPlan, listRequirementPlans, addSection | 4 |
| `projectStructureUpdateRequest.test.ts` | Project Structure Update Request | createRequest, getRequest, listRequests, updateRequest, submit, complete, dispute | 12 |

### Infrastructure & State
| Test File | Module | Key Features | Est. Tests |
|-----------|--------|--------------|------------|
| `state.test.ts` | State | getApplicationState, addToAgentState, getAgentState, getProjectState, updateProjectState | 5 |
| `capability.test.ts` | Capability | listCapabilities, getCapabilityDetail, listExecutors, startCapability, stopCapability | 5 |
| `crawler.test.ts` | Crawler | start, goToPage, screenshot, scroll | 4 |
| `search.test.ts` | Search | init, search, get_first_link | 3 |
| `codebaseSearch.test.ts` | Codebase Search | performSemanticSearch, searchMCPTools | 2 |
| `codeutils.test.ts` | Code Utils | getAllFilesAsMarkDown, getMatcherList, performMatch | 3 |
| `utils.test.ts` | Utils | editFileAndApplyDiff | 1 |

### Storage & Memory Systems
| Test File | Module | Key Features | Est. Tests |
|-----------|--------|--------------|------------|
| `kvStore.test.ts` | KV Store | createInstance, listInstances, setKV, getKV, queryKV | 4 |
| `eventLog.test.ts` | Event Log | createInstance, appendEvent, queryEventLog, getEventLogStats | 4 |
| `persistentMemory.test.ts` | Persistent Memory | create, get, list, update, delete, executeRetrieval, validateConfig | 7 |
| `episodicMemory.test.ts` | Episodic Memory | create, get, list, appendEvent, queryEvents, getEventTypes, archive | 9 |
| `memoryIngestion.test.ts` | Memory Ingestion | createPipeline, listPipelines, executePipeline | 3 |
| `knowledgeGraph.test.ts` | Knowledge Graph | createInstanceTemplate, addMemoryRecord, addEdge, createView, executeView | 13 |
| `contextAssembly.test.ts` | Context Assembly | getContext, validateRequest, listMemoryTypes | 3 |
| `contextRuleEngine.test.ts` | Context Rule Engine | createRuleEngine, listRuleEngines, evaluateRules | 3 |

### Communication & Collaboration
| Test File | Module | Key Features | Est. Tests |
|-----------|--------|--------------|------------|
| `mail.test.ts` | Mail | registerAgent, listAgents, createThread, listThreads, findOrCreateThread | 5 |
| `calendar.test.ts` | Calendar | createEvent, listEvents, getUpcomingEvents, markEventComplete, rsvp | 5 |
| `groupFeedback.test.ts` | Group Feedback | createFeedback, listFeedback, respondToFeedback | 3 |

### Code Review & Development
| Test File | Module | Key Features | Est. Tests |
|-----------|--------|--------------|------------|
| `fileUpdateIntent.test.ts` | File Update Intent | createIntent, listIntents, completeIntent | 3 |
| `reviewMergeRequest.test.ts` | Review Merge Request | createRequest, listRequests, addReviewFeedback | 3 |
| `hook.test.ts` | Hook | initializeHookManager, createHook, listHooks | 3 |

### Debug & Diagnostics
| Test File | Module | Key Features | Est. Tests |
|-----------|--------|--------------|------------|
| `debug.test.ts` | Debug | debugLog, errorLog, openDebugBrowser | 3 |

### Setup & Examples
| Test File | Module | Key Features | Est. Tests |
|-----------|--------|--------------|------------|
| `setup.ts` | Test Infrastructure | sharedCodebolt, waitForConnection, test utilities | N/A |
| `example.test.ts` | Example Tests | Test patterns and usage examples | 10+ |

### Legacy/Remaining
| Test File | Module | Key Features | Est. Tests |
|-----------|--------|--------------|------------|
| `remaining.test.ts` | Multiple Modules | Legacy file - content split into individual files | 100+ |

## Newly Added Features (From Implementation Plan)

The following features were added and now have comprehensive tests:

### Git Module Enhancement
- ✅ `clone()` - Clone a git repository

### Terminal Module Enhancement
- ✅ `executeCommandRunUntilInterrupt()` - Run command until interrupted

### MCP Module Enhancements
- ✅ `getMcpTools()` - Get MCP tools
- ✅ `getMcpList()` - Get MCP server list
- ✅ `getAllMcpTools()` - Get all MCP tools
- ✅ `getEnabledMcps()` - Get enabled MCPs
- ✅ `configureMcpTool()` - Configure MCP tool

### Todo Module Enhancements
- ✅ `exportTodos()` - Export todos (JSON/Markdown)
- ✅ `importTodos()` - Import todos (JSON/Markdown)

### Agent Portfolio Module (NEW)
- ✅ `getPortfolio()` - Get agent portfolio
- ✅ `getConversations()` - Get agent conversations
- ✅ `addTestimonial()` - Add testimonial
- ✅ `updateTestimonial()` - Update testimonial
- ✅ `deleteTestimonial()` - Delete testimonial
- ✅ `addKarma()` - Add karma
- ✅ `getKarmaHistory()` - Get karma history
- ✅ `addAppreciation()` - Add appreciation
- ✅ `addTalent()` - Add talent
- ✅ `endorseTalent()` - Endorse talent
- ✅ `getTalents()` - Get talents
- ✅ `getRanking()` - Get ranking/leaderboard
- ✅ `getPortfoliosByProject()` - Get portfolios by project
- ✅ `updateProfile()` - Update agent profile

## Module Coverage from Codebolt Class

All modules from the Codebolt class have dedicated test files:

| Module | Test File | Module | Test File |
|--------|-----------|--------|-----------|
| ✅ fs | fs.test.ts | ✅ projectStructure | projectStructure.test.ts |
| ✅ git | git.test.ts | ✅ codebaseSearch | codebaseSearch.test.ts |
| ✅ llm | llm.test.ts | ✅ fileUpdateIntent | fileUpdateIntent.test.ts |
| ✅ mail | mail.test.ts | ✅ projectStructureUpdateRequest | projectStructureUpdateRequest.test.ts |
| ✅ groupFeedback | groupFeedback.test.ts | ✅ reviewMergeRequest | reviewMergeRequest.test.ts |
| ✅ agentDeliberation | agentDeliberation.test.ts | ✅ kvStore | kvStore.test.ts |
| ✅ browser | browser.test.ts | ✅ persistentMemory | persistentMemory.test.ts |
| ✅ chat | chat.test.ts | ✅ eventLog | eventLog.test.ts |
| ✅ terminal | terminal.test.ts | ✅ knowledgeGraph | knowledgeGraph.test.ts |
| ✅ codeutils | codeutils.test.ts | ✅ hook | hook.test.ts |
| ✅ crawler | crawler.test.ts | ✅ memoryIngestion | memoryIngestion.test.ts |
| ✅ search | search.test.ts | ✅ contextAssembly | contextAssembly.test.ts |
| ✅ knowledge | knowledge.test.ts | ✅ contextRuleEngine | contextRuleEngine.test.ts |
| ✅ rag | rag.test.ts | ✅ agentPortfolio | agentPortfolio.test.ts |
| ✅ outputparsers | outputParsers.test.ts | ✅ vectordb | memory.test.ts (covered) |
| ✅ project | project.test.ts | ✅ dbmemory | memory.test.ts (covered) |
| ✅ cbstate | state.test.ts | ✅ task | task.test.ts |
| ✅ tokenizer | tokenizer.test.ts | ✅ thread | thread.test.ts |
| ✅ mcp | mcp.test.ts | ✅ todo | todo.test.ts |
| ✅ agent | agent.test.ts | ✅ sideExecution | sideExecution.test.ts |
| ✅ utils | utils.test.ts | ✅ capability | capability.test.ts |
| ✅ notify | notify.test.ts | ✅ job | job.test.ts |
| ✅ memory | memory.test.ts | ✅ autoTesting | autoTesting.test.ts |
| ✅ actionPlan | actionPlan.test.ts | ✅ actionBlock | actionBlock.test.ts |
| ✅ swarm | swarm.test.ts | ✅ requirementPlan | requirementPlan.test.ts |
| ✅ calendar | calendar.test.ts | ✅ episodicMemory | episodicMemory.test.ts |
| ✅ roadmap | roadmap.test.ts | ✅ codemap | codemap.test.ts |

**Coverage: 100% - All modules from the Codebolt class have dedicated test files!**

## Test Structure

All test files follow a consistent structure:

```typescript
import Codebolt from '../src/core/Codebolt';

const codebolt = new Codebolt();

describe('Module Name', () => {
    beforeAll(async () => {
        await codebolt.waitForReady();
    }, 30000);

    test('should do something', async () => {
        const result = await codebolt.module.method();
        expect(result.success).toBe(true);
        
        // AskUserQuestion for user verification
        console.log('AskUserQuestion: Did the test succeed?');
    });
});
```

## Running Tests

### Run All Tests
```bash
cd packages/codeboltjs
npm test
```

### Run Specific Test File
```bash
npm test -- agentPortfolio.test.ts
```

### Run with Coverage
```bash
npm run test:coverage
```

### Run Tests by Pattern
```bash
npm test -- --testNamePattern="portfolio"
```

## Notes

- **Total Test Files**: 51 module-specific test files + setup.ts + example.test.ts = 53 total
- **remaining.test.ts** can be deleted as its content has been split into individual module files
- All tests use the shared Codebolt instance to avoid multiple WebSocket connections
- Each test includes AskUserQuestion console.log for manual verification
- Tests run serially using jest-serial-runner to avoid race conditions

import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from "@codebolt/types/sdk";

const TEST_DIR = '/Users/utkarshshukla/Desktop/my/delicious-coffee';

codebolt.onMessage(async (reqMessage: FlatUserMessage, additionalVariable: any) => {
    try {
        codebolt.chat.sendMessage("Starting Tool Tests (MCP + Direct API)...\n");

        // // Setup test directory
        // await codebolt.terminal.executeCommand(`mkdir -p ${TEST_DIR}`);

        // // ============================================
        // // FILE TOOLS
        // // ============================================
        // codebolt.chat.sendMessage("\n=== FILE TOOLS ===\n");

        // // 1. write_file (MCP) vs writeToFile (Direct API)
        // codebolt.chat.sendMessage("--- write_file ---");
        // const mcpWriteResult = await codebolt.mcp.executeTool("codebolt", "write_file", {
        //     absolute_path: `${TEST_DIR}/test.txt`,
        //     content: "Hello World\nLine 2\nLine 3\nLine 4\nLine 5"
        // });
        // codebolt.chat.sendMessage(`MCP write_file: ${JSON.stringify(mcpWriteResult, null, 2)}`);

        // const apiWriteResult = await codebolt.fs.writeToFile(`${TEST_DIR}/test2.txt`, "Hello World API\nLine 2\nLine 3");
        // codebolt.chat.sendMessage(`API writeToFile: ${JSON.stringify(apiWriteResult, null, 2)}`);

        // // 2. read_file (MCP) vs readFile (Direct API)
        // codebolt.chat.sendMessage("--- read_file ---");
        // const mcpReadResult = await codebolt.mcp.executeTool("codebolt", "read_file", {
        //     absolute_path: `${TEST_DIR}/test.txt`
        // });
        // codebolt.chat.sendMessage(`MCP read_file: ${JSON.stringify(mcpReadResult, null, 2)}`);

        // const apiReadResult = await codebolt.fs.readFile(`${TEST_DIR}/test.txt`);
        // codebolt.chat.sendMessage(`API readFile: ${JSON.stringify(apiReadResult, null, 2)}`);

        // // 3. read_file with offset/limit (MCP only)
        // codebolt.chat.sendMessage("--- read_file (offset/limit) ---");
        // const mcpReadOffsetResult = await codebolt.mcp.executeTool("codebolt", "read_file", {
        //     absolute_path: `${TEST_DIR}/test.txt`,
        //     offset: 2,
        //     limit: 2
        // });
        // codebolt.chat.sendMessage(`MCP read_file (offset): ${JSON.stringify(mcpReadOffsetResult, null, 2)}`);

        // // 4. edit (MCP only)
        // codebolt.chat.sendMessage("--- edit ---");
        // const mcpEditResult = await codebolt.mcp.executeTool("codebolt", "edit", {
        //     absolute_path: `${TEST_DIR}/test.txt`,
        //     old_string: "Hello World",
        //     new_string: "Hello Universe"
        // });
        // codebolt.chat.sendMessage(`MCP edit: ${JSON.stringify(mcpEditResult, null, 2)}`);

        // // 5. ls (MCP) vs listDirectory (Direct API)
        // codebolt.chat.sendMessage("--- ls / listDirectory ---");
        // const mcpLsResult = await codebolt.mcp.executeTool("codebolt", "ls", {
        //     path: TEST_DIR
        // });
        // codebolt.chat.sendMessage(`MCP ls: ${JSON.stringify(mcpLsResult, null, 2)}`);

        // const apiListDirResult = await codebolt.fs.listDirectory({ path: TEST_DIR });
        // codebolt.chat.sendMessage(`API listDirectory: ${JSON.stringify(apiListDirResult, null, 2)}`);

        // // 6. read_many_files (MCP) vs readManyFiles (Direct API)
        // codebolt.chat.sendMessage("--- read_many_files ---");
        // const mcpReadManyResult = await codebolt.mcp.executeTool("codebolt", "read_many_files", {
        //     paths: [`${TEST_DIR}/test.txt`, `${TEST_DIR}/test2.txt`]
        // });
        // codebolt.chat.sendMessage(`MCP read_many_files: ${JSON.stringify(mcpReadManyResult, null, 2)}`);

        // const apiReadManyResult = await codebolt.fs.readManyFiles({
        //     paths: [`${TEST_DIR}/test.txt`, `${TEST_DIR}/test2.txt`]
        // });
        // codebolt.chat.sendMessage(`API readManyFiles: ${JSON.stringify(apiReadManyResult, null, 2)}`);

        // // ============================================
        // // SEARCH TOOLS
        // // ============================================
        // codebolt.chat.sendMessage("\n=== SEARCH TOOLS ===\n");

        //----------Not Working both mcp Api--------
        // // 7. glob (MCP) vs fileSearch (Direct API)
        // codebolt.chat.sendMessage("--- glob / fileSearch ---");
        // const mcpGlobResult = await codebolt.mcp.executeTool("codebolt", "glob", {
        //     pattern: "**/*.txt"
        // });
        // codebolt.chat.sendMessage(`MCP glob: ${JSON.stringify(mcpGlobResult, null, 2)}`);

        // const apiFileSearchResult = await codebolt.fs.fileSearch("test");
        // codebolt.chat.sendMessage(`API fileSearch: ${JSON.stringify(apiFileSearchResult, null, 2)}`);

        // 8. grep (MCP) vs grepSearch (Direct API)
        // codebolt.chat.sendMessage("--- grep / grepSearch ---");
        // const mcpGrepResult = await codebolt.mcp.executeTool("codebolt", "grep", {
        //     path: TEST_DIR,
        //     pattern: "hi"
        // });
        // codebolt.chat.sendMessage(`MCP grep: ${JSON.stringify(mcpGrepResult, null, 2)}`);

        // const apiGrepResult = await codebolt.fs.grepSearch(TEST_DIR, "Hello");
        // codebolt.chat.sendMessage(`API grepSearch: ${JSON.stringify(apiGrepResult, null, 2)}`);

        // // 9. search_files (MCP) vs searchFiles (Direct API)
        // codebolt.chat.sendMessage("--- search_files ---");
        // const mcpSearchFilesResult = await codebolt.mcp.executeTool("codebolt", "search_files", {
        //     path: TEST_DIR,
        //     regex: "Line\\s+\\d+"
        // });
        // codebolt.chat.sendMessage(`MCP search_files: ${JSON.stringify(mcpSearchFilesResult, null, 2)}`);

        // const apiSearchFilesResult = await codebolt.fs.searchFiles(TEST_DIR, "Line\\s+\\d+", "*.txt");
        // codebolt.chat.sendMessage(`API searchFiles: ${JSON.stringify(apiSearchFilesResult, null, 2)}`);

        // // 10. codebase_search (MCP only - semantic search)
        // codebolt.chat.sendMessage("--- codebase_search ---");
        // const mcpCodebaseSearchResult = await codebolt.mcp.executeTool("codebolt", "codebase_search", {
        //     query: "file content"
        // });
        // codebolt.chat.sendMessage(`MCP codebase_search: ${JSON.stringify(mcpCodebaseSearchResult, null, 2)}`);

        // // 11. search_mcp_tool (MCP only)
        // codebolt.chat.sendMessage("--- search_mcp_tool ---");
        // const mcpSearchMcpToolResult = await codebolt.mcp.executeTool("codebolt", "search_mcp_tool", {
        //     query: "file"
        // });
        // codebolt.chat.sendMessage(`MCP search_mcp_tool: ${JSON.stringify(mcpSearchMcpToolResult, null, 2)}`);

        // // 12. list_code_definition_names (MCP) vs listCodeDefinitionNames (Direct API)
        // codebolt.chat.sendMessage("--- list_code_definition_names ---");
        // await codebolt.fs.writeToFile(`${TEST_DIR}/sample.ts`, `export function hello() { return "world"; }\nexport class TestClass { getValue() { return 42; } }`);

        // const mcpListCodeDefResult = await codebolt.mcp.executeTool("codebolt", "list_code_definition_names", {
        //     path: `${TEST_DIR}/sample.ts`
        // });
        // codebolt.chat.sendMessage(`MCP list_code_definition_names: ${JSON.stringify(mcpListCodeDefResult, null, 2)}`);

        // const apiListCodeDefResult = await codebolt.fs.listCodeDefinitionNames(`${TEST_DIR}/sample.ts`);
        // codebolt.chat.sendMessage(`API listCodeDefinitionNames: ${JSON.stringify(apiListCodeDefResult, null, 2)}`);

        // // ============================================
        // // TERMINAL TOOLS
        // // ============================================
        // codebolt.chat.sendMessage("\n=== TERMINAL TOOLS ===\n");

        // // 13. execute_command (MCP) vs executeCommand (Direct API)
        // codebolt.chat.sendMessage("--- execute_command ---");
        // const mcpEchoResult = await codebolt.mcp.executeTool("codebolt", "execute_command", {
        //     command: "echo 'Hello from MCP'"
        // });
        // codebolt.chat.sendMessage(`MCP execute_command: ${JSON.stringify(mcpEchoResult, null, 2)}`);

        // const apiEchoResult = await codebolt.terminal.executeCommand("echo 'Hello from API'");
        // codebolt.chat.sendMessage(`API executeCommand: ${JSON.stringify(apiEchoResult, null, 2)}`);

        // // Additional terminal tests
        // codebolt.chat.sendMessage("--- execute_command (pwd) ---");
        // const mcpPwdResult = await codebolt.mcp.executeTool("codebolt", "execute_command", {
        //     command: "pwd"
        // });
        // codebolt.chat.sendMessage(`MCP pwd: ${JSON.stringify(mcpPwdResult, null, 2)}`);

        // const apiPwdResult = await codebolt.terminal.executeCommand("pwd");
        // codebolt.chat.sendMessage(`API pwd: ${JSON.stringify(apiPwdResult, null, 2)}`);

        // // ============================================
        // // GIT TOOLS
        // // ============================================
        codebolt.chat.sendMessage("\n=== GIT TOOLS ===\n");

        // // Setup git repo
        // const gitDir = `${TEST_DIR}/git-repo`;
        // await codebolt.terminal.executeCommand(`mkdir -p ${gitDir} && cd ${gitDir} && git init && git config user.email "test@test.com" && git config user.name "Test"`);
        // await codebolt.fs.writeToFile(`${gitDir}/README.md`, "# Test Repo");

        // // 14. git_action status (MCP) vs status (Direct API)
        // codebolt.chat.sendMessage("--- git status ---");
        // const mcpGitStatusResult = await codebolt.mcp.executeTool("codebolt", "git_action", {
        //     action: "status",
        //     path: gitDir
        // });
        // codebolt.chat.sendMessage(`MCP git_action (status): ${JSON.stringify(mcpGitStatusResult, null, 2)}`);

        const apiGitStatusResult = await codebolt.git.status();
        codebolt.chat.sendMessage(`API git.status: ${JSON.stringify(apiGitStatusResult, null, 2)}`);

        // // 15. git_action add (MCP) vs addAll (Direct API)
        // codebolt.chat.sendMessage("--- git add ---");
        // const mcpGitAddResult = await codebolt.mcp.executeTool("codebolt", "git_action", {
        //     action: "add",
        //     path: gitDir
        // });
        // codebolt.chat.sendMessage(`MCP git_action (add): ${JSON.stringify(mcpGitAddResult, null, 2)}`);

        // const apiGitAddResult = await codebolt.git.addAll();
        // codebolt.chat.sendMessage(`API git.addAll: ${JSON.stringify(apiGitAddResult, null, 2)}`);

        // // 16. git_action commit (MCP) vs commit (Direct API)
        // codebolt.chat.sendMessage("--- git commit ---");
        // const mcpGitCommitResult = await codebolt.mcp.executeTool("codebolt", "git_action", {
        //     action: "commit",
        //     message: "MCP commit",
        //     path: gitDir
        // });
        // codebolt.chat.sendMessage(`MCP git_action (commit): ${JSON.stringify(mcpGitCommitResult, null, 2)}`);

        // // const apiGitCommitResult = await codebolt.git.commit("API commit");
        // // codebolt.chat.sendMessage(`API git.commit: ${JSON.stringify(apiGitCommitResult, null, 2)}`);

        // // 17. git_action logs (MCP) vs logs (Direct API)
        // codebolt.chat.sendMessage("--- git logs ---");
        // const mcpGitLogsResult = await codebolt.mcp.executeTool("codebolt", "git_action", {
        //     action: "logs",
        //     path: gitDir
        // });
        // codebolt.chat.sendMessage(`MCP git_action (logs): ${JSON.stringify(mcpGitLogsResult, null, 2)}`);

        // const apiGitLogsResult = await codebolt.git.logs(gitDir);
        // codebolt.chat.sendMessage(`API git.logs: ${JSON.stringify(apiGitLogsResult, null, 2)}`);

        // // 18. git_action branch (MCP) vs branch (Direct API)
        // codebolt.chat.sendMessage("--- git branch ---");
        // const mcpGitBranchResult = await codebolt.mcp.executeTool("codebolt", "git_action", {
        //     action: "branch",
        //     branch: "test-branch-mcp",
        //     path: gitDir
        // });
        // codebolt.chat.sendMessage(`MCP git_action (branch): ${JSON.stringify(mcpGitBranchResult, null, 2)}`);

        // const apiGitBranchResult = await codebolt.git.branch("test-branch-api");
        // codebolt.chat.sendMessage(`API git.branch: ${JSON.stringify(apiGitBranchResult, null, 2)}`);

        // // 19. git_action diff (MCP) vs diff (Direct API)
        // codebolt.chat.sendMessage("--- git diff ---");
        // const mcpGitDiffResult = await codebolt.mcp.executeTool("codebolt", "git_action", {
        //     action: "diff",
        //     path: gitDir
        // });
        // codebolt.chat.sendMessage(`MCP git_action (diff): ${JSON.stringify(mcpGitDiffResult, null, 2)}`);

        // const apiGitDiffResult = await codebolt.git.diff("HEAD");
        // codebolt.chat.sendMessage(`API git.diff: ${JSON.stringify(apiGitDiffResult, null, 2)}`);

        // // ============================================
        // // BROWSER TOOLS
        // // ============================================
        // codebolt.chat.sendMessage("\n=== BROWSER TOOLS ===\n");

        // // 20. browser_action navigate (MCP) vs goToPage (Direct API)
        // codebolt.chat.sendMessage("--- browser navigate ---");
        // const mcpBrowserNavigateResult = await codebolt.mcp.executeTool("codebolt", "browser_action", {
        //     action: "navigate",
        //     url: "https://example.com"
        // });
        // codebolt.chat.sendMessage(`MCP browser_action (navigate): ${JSON.stringify(mcpBrowserNavigateResult, null, 2)}`);

        // const apiBrowserNavigateResult = await codebolt.browser.goToPage("https://example.com");
        // codebolt.chat.sendMessage(`API browser.goToPage: ${JSON.stringify(apiBrowserNavigateResult, null, 2)}`);

        // // 21. browser_action get_url (MCP) vs getUrl (Direct API)
        // codebolt.chat.sendMessage("--- browser get_url ---");
        // const mcpBrowserUrlResult = await codebolt.mcp.executeTool("codebolt", "browser_action", {
        //     action: "get_url"
        // });
        // codebolt.chat.sendMessage(`MCP browser_action (get_url): ${JSON.stringify(mcpBrowserUrlResult, null, 2)}`);

        // const apiBrowserUrlResult = await codebolt.browser.getUrl();
        // codebolt.chat.sendMessage(`API browser.getUrl: ${JSON.stringify(apiBrowserUrlResult, null, 2)}`);

        // // 22. browser_action get_content (MCP) vs getContent (Direct API)
        // codebolt.chat.sendMessage("--- browser get_content ---");
        // const mcpBrowserContentResult = await codebolt.mcp.executeTool("codebolt", "browser_action", {
        //     action: "get_content"
        // });
        // codebolt.chat.sendMessage(`MCP browser_action (get_content): ${JSON.stringify(mcpBrowserContentResult, null, 2)}`);

        // const apiBrowserContentResult = await codebolt.browser.getContent();
        // codebolt.chat.sendMessage(`API browser.getContent: ${JSON.stringify(apiBrowserContentResult, null, 2)}`);

        // // 23. browser_action get_html (MCP) vs getHTML (Direct API)
        // codebolt.chat.sendMessage("--- browser get_html ---");
        // const mcpBrowserHtmlResult = await codebolt.mcp.executeTool("codebolt", "browser_action", {
        //     action: "get_html"
        // });
        // codebolt.chat.sendMessage(`MCP browser_action (get_html): ${JSON.stringify(mcpBrowserHtmlResult, null, 2)}`);

        // const apiBrowserHtmlResult = await codebolt.browser.getHTML();
        // codebolt.chat.sendMessage(`API browser.getHTML: ${JSON.stringify(apiBrowserHtmlResult, null, 2)}`);

        // // 24. browser_action get_markdown (MCP) vs getMarkdown (Direct API)
        // codebolt.chat.sendMessage("--- browser get_markdown ---");
        // const mcpBrowserMarkdownResult = await codebolt.mcp.executeTool("codebolt", "browser_action", {
        //     action: "get_markdown"
        // });
        // codebolt.chat.sendMessage(`MCP browser_action (get_markdown): ${JSON.stringify(mcpBrowserMarkdownResult, null, 2)}`);

        // const apiBrowserMarkdownResult = await codebolt.browser.getMarkdown();
        // codebolt.chat.sendMessage(`API browser.getMarkdown: ${JSON.stringify(apiBrowserMarkdownResult, null, 2)}`);

        // // 25. browser_action screenshot (MCP) vs screenshot (Direct API)
        // codebolt.chat.sendMessage("--- browser screenshot ---");
        // const mcpBrowserScreenshotResult = await codebolt.mcp.executeTool("codebolt", "browser_action", {
        //     action: "screenshot"
        // });
        // codebolt.chat.sendMessage(`MCP browser_action (screenshot): ${JSON.stringify(mcpBrowserScreenshotResult, null, 2)}`);

        // const apiBrowserScreenshotResult = await codebolt.browser.screenshot();
        // codebolt.chat.sendMessage(`API browser.screenshot: ${JSON.stringify(apiBrowserScreenshotResult, null, 2)}`);

        // // 26. browser_action scroll (MCP) vs scroll (Direct API)
        // codebolt.chat.sendMessage("--- browser scroll ---");
        // const mcpBrowserScrollResult = await codebolt.mcp.executeTool("codebolt", "browser_action", {
        //     action: "scroll",
        //     direction: "down",
        //     pixels: "200"
        // });
        // codebolt.chat.sendMessage(`MCP browser_action (scroll): ${JSON.stringify(mcpBrowserScrollResult, null, 2)}`);

        // const apiBrowserScrollResult = await codebolt.browser.scroll("down", "200");
        // codebolt.chat.sendMessage(`API browser.scroll: ${JSON.stringify(apiBrowserScrollResult, null, 2)}`);

        // // 27. browser_action close (MCP) vs close (Direct API)
        // codebolt.chat.sendMessage("--- browser close ---");
        // const mcpBrowserCloseResult = await codebolt.mcp.executeTool("codebolt", "browser_action", {
        //     action: "close"
        // });
        // codebolt.chat.sendMessage(`MCP browser_action (close): ${JSON.stringify(mcpBrowserCloseResult, null, 2)}`);

        // // await codebolt.browser.close(); // Don't close via API as MCP already closed

        // // ============================================
        // // ORCHESTRATION TOOLS
        // // ============================================
        // codebolt.chat.sendMessage("\n=== ORCHESTRATION TOOLS ===\n");

        // // 28. create_task (MCP only)
        // codebolt.chat.sendMessage("--- create_task ---");
        // const mcpCreateTaskResult = await codebolt.mcp.executeTool("codebolt", "create_task", {
        //     action: "create",
        //     title: "Test Task",
        //     description: "This is a test task"
        // });
        // codebolt.chat.sendMessage(`MCP create_task (create): ${JSON.stringify(mcpCreateTaskResult, null, 2)}`);

        // const mcpListTaskResult = await codebolt.mcp.executeTool("codebolt", "create_task", {
        //     action: "list"
        // });
        // codebolt.chat.sendMessage(`MCP create_task (list): ${JSON.stringify(mcpListTaskResult, null, 2)}`);

        // // 29. agent_management list (MCP) vs getAgentsList (Direct API)
        // codebolt.chat.sendMessage("--- agent_management list ---");
        // const mcpAgentListResult = await codebolt.mcp.executeTool("codebolt", "agent_management", {
        //     action: "list"
        // });
        // codebolt.chat.sendMessage(`MCP agent_management (list): ${JSON.stringify(mcpAgentListResult, null, 2)}`);

        // const apiAgentListResult = await codebolt.agent.getAgentsList();
        // codebolt.chat.sendMessage(`API agent.getAgentsList: ${JSON.stringify(apiAgentListResult, null, 2)}`);

        // // 30. agent_management find (MCP) vs findAgent (Direct API)
        // codebolt.chat.sendMessage("--- agent_management find ---");
        // const mcpAgentFindResult = await codebolt.mcp.executeTool("codebolt", "agent_management", {
        //     action: "find",
        //     task: "write code"
        // });
        // codebolt.chat.sendMessage(`MCP agent_management (find): ${JSON.stringify(mcpAgentFindResult, null, 2)}`);

        // // Note: findAgent requires multiple params (task, maxResult, agents, location, getFrom)
        // // const apiAgentFindResult = await codebolt.agent.findAgent("write code", 1, [], AgentLocation.ALL, FilterUsing.USE_VECTOR_DB);
        // // codebolt.chat.sendMessage(`API agent.findAgent: ${JSON.stringify(apiAgentFindResult, null, 2)}`);

        // // 31. agent_management details (MCP) vs getAgentsDetail (Direct API)
        // codebolt.chat.sendMessage("--- agent_management details ---");
        // const mcpAgentDetailsResult = await codebolt.mcp.executeTool("codebolt", "agent_management", {
        //     action: "details",
        //     agent_list: ["testingagent"]
        // });
        // codebolt.chat.sendMessage(`MCP agent_management (details): ${JSON.stringify(mcpAgentDetailsResult, null, 2)}`);

        // const apiAgentDetailsResult = await codebolt.agent.getAgentsDetail(["testingagent"]);
        // codebolt.chat.sendMessage(`API agent.getAgentsDetail: ${JSON.stringify(apiAgentDetailsResult, null, 2)}`);

        // // ============================================
        // // CLEANUP
        // // ============================================
        // await codebolt.terminal.executeCommand(`rm -rf ${TEST_DIR}`);

        codebolt.chat.sendMessage("\n=== ALL TESTS COMPLETED (MCP + Direct API) ===");

    } catch (error) {
        codebolt.chat.sendMessage(`Error: ${error}`);
    }
});

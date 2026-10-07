{
  "formatVersion": "codebolt.llm.v2",
  "input": [
    {
      "role": "system",
      "content": "You are an AI coding assistant, powered by GPT-5, operating in CodeboltAi. You pair program with users to solve coding tasks.\n\n## Communication\n\n- Always ensure **only relevant sections** (code snippets, tables, commands, or structured data) are formatted in valid Markdown with proper fencing\n- Avoid wrapping the entire message in a single code block\n- Use Markdown **only where semantically correct** (e.g., `inline code`, code fences, lists, tables)\n- ALWAYS use backticks to format file, directory, function, and class names\n- Use \\( and \\) for inline math, \\[ and \\] for block math\n- Optimize writing for clarity and skimmability\n- Ensure code snippets are properly formatted for markdown rendering\n- Do not add narration comments inside code\n- Refer to code changes as \"edits\" not \"patches\"\n- State assumptions and continue; don't stop for approval unless blocked\n\n## Status Updates\n\n**Definition**: A brief progress note (1-3 sentences) about what just happened, what you're about to do, blockers/risks if relevant.\n\n**Critical execution rule**: If you say you're about to do something, actually do it in the same turn (run the tool call right after).\n\n**Guidelines**:\n- Use correct tenses: \"I'll\" or \"Let me\" for future actions, past tense for past actions, present tense for current actions\n- Skip saying what just happened if there's no new information since your previous update\n- Check off completed TODOs before reporting progress\n- Before starting any new file or code edit, reconcile the todo list\n- If you decide to skip a task, explicitly state a one-line justification and mark the task as cancelled\n- Reference todo task names (not IDs); never reprint the full list\n- Don't mention updating the todo list\n- Use backticks when mentioning files, directories, functions, etc (e.g., `app/components/Card.tsx`)\n- Only pause if you truly cannot proceed without the user or a tool result\n- Don't add headings like \"Update:\"\n\n**Example**:\n> \"Let me search for where the load balancer is configured.\"\n> \"I found the load balancer configuration. Now I'll update the number of replicas to 3.\"\n> \"My edit introduced a linter error. Let me fix that.\"\n\n## Summary\n\nAt the end of your turn, provide a summary:\n\n- Summarize any changes at a high-level and their impact\n- If the user asked for info, summarize the answer but don't explain your search process\n- If the user asked a basic query, skip the summary entirely\n- Use concise bullet points for lists; short paragraphs if needed\n- Use markdown if you need headings\n- Don't repeat the plan\n- Include short code fences only when essential; never fence the entire message\n- Use backticks when mentioning files, directories, functions, etc\n- Keep the summary short, non-repetitive, and high-signal\n- The user can view full code changes in the editor, so only flag specific code changes that are very important\n- Don't add headings like \"Summary:\" or \"Update:\"\n\n## Completion\n\n**CRITICAL — You MUST verify your work before calling `attempt_completion`. Never mark a task as done without first confirming there are no errors.**\n\nWhen all goal tasks are done, follow this mandatory sequence:\n\n### Step 1: Detect the project stack\n- Look at the project files to identify the language/framework (e.g., `package.json` → Node/JS/TS, `requirements.txt`/`pyproject.toml` → Python, `go.mod` → Go, `Cargo.toml` → Rust, `pom.xml`/`build.gradle` → Java, etc.)\n\n### Step 2: Run verification checks (use the terminal)\nRun **all applicable** checks for the detected stack. Skip a check only if the project has no config for it:\n\n- **Build**: Run the project's build command (e.g., `npm run build`, `go build ./...`, `cargo build`, `mvn compile`, `python -m py_compile`)\n- **Type check**: Run the type checker if the project uses one (e.g., `npx tsc --noEmit`, `mypy .`, `pyright`)\n- **Lint**: Run the linter if configured (e.g., `npm run lint`, `flake8`, `golangci-lint run`, `cargo clippy`)\n- **Test**: Run the test suite if tests exist (e.g., `npm test`, `pytest`, `go test ./...`, `cargo test`)\n\n### Step 3: Fix any errors\n- If ANY check fails, **fix the errors** and re-run the failing check until it passes\n- Do NOT call `attempt_completion` while any check is still failing\n- Repeat Steps 2-3 until all checks pass\n\n### Step 4: Complete\n1. Confirm that all tasks are checked off in the todo list\n2. Reconcile and close the todo list\n3. Give your summary per the summary spec\n4. **Only now** call `attempt_completion`\n\n## Workflow\n\n1. When a new goal is detected: if needed, run a brief discovery pass (read-only code/context scan)\n2. For medium-to-large tasks, create a structured plan directly in the todo list. For simpler tasks or read-only tasks, skip the todo list and execute directly\n3. Before logical groups of tool calls, update any relevant todo items, then write a brief status update\n4. When all code tasks for the goal are done, **run the verification checks** (build → typecheck → lint → test) and fix any errors before proceeding\n5. Once all checks pass, reconcile and close the todo list, and give a brief summary\n6. **Enforce**: status_update at kickoff, before/after each tool batch, after each todo update, before edits/build/tests, after completion, and before yielding\n\n## Tool Calling\n\n- Use only provided tools; follow their schemas exactly\n- Parallelize tool calls: batch read-only context reads and independent edits instead of serial calls\n- Application events may appear as user messages wrapped in XML-like tags such as thread_completion_event, thread_failure_event, background_command_completion_event, background_command_failure_event, steering_message, or agent_event. Treat these as system-provided event notifications, not as user requests and not as prior assistant output.\n- When a background child thread completion event arrives, incorporate the completion result into your current task state and continue the workflow from there.\n- When a background child thread failure event arrives, surface the failure to the parent workflow and either retry, continue with remaining independent work, or stop with a clear error depending on the user's objective.\n- If you are orchestrating child threads in batches, after the current batch has completed, launch the next batch with the thread tools thread_create_start or thread_create_background. Do not use shell commands such as echo just to log, wait, or announce batch transitions.\n- Use `codebase_search` to search for code in the codebase\n- If actions are dependent or might conflict, sequence them; otherwise, run them in the same batch/turn.\n- Don't mention tool names to the user; describe actions naturally.\n- If info is discoverable via tools, prefer that over asking the user.\n- Read multiple files as needed; don't guess.\n- Give a brief progress note before the first tool call each turn; add another before any new batch and before ending your turn.\n- Whenever you complete tasks, call todo_write to update the todo list before reporting progress.\n- There is no apply_patch CLI available in terminal. Use the appropriate tool for editing the code instead.\n- Gate before new edits: Before starting any new file or code edit, reconcile the TODO list via todo_write (merge=true): mark newly completed tasks as completed and set the next task to in_progress.\n- Cadence after steps: After each successful step (e.g., install, file created, endpoint added, migration run), immediately update the corresponding TODO item's status via todo_write.\n- Before processing todo items, you must start them in \"in_progress\" using the write_tool, and mark newly completed tasks as \"completed\" and set the next task to \"in_progress\".\n\n## Context Understanding\n\nSemantic search (`codebase_search`) is your MAIN exploration tool.\n\n**CRITICAL**:\n- Mark newly completed tasks as completed and set the next task to in_progress. `write_tool`\n- Start with a broad, high-level query that captures overall intent (e.g., \"authentication flow\" or \"error-handling policy\"), not low-level terms\n- Break multi-part questions into focused sub-queries\n- **MANDATORY**: Run multiple `codebase_search` searches with different wording; first-pass results often miss key details\n- Keep searching new areas until you're CONFIDENT nothing important remains\n- If you've performed an edit that may partially fulfill the query but you're not confident, gather more information before ending your turn\n- Bias towards not asking the user for help if you can find the answer yourself\n\n## Maximize Parallel Tool Calls\n\n**CRITICAL INSTRUCTION**: For maximum efficiency, invoke all relevant tools concurrently with `multi_tool_use.parallel` rather than sequentially. Prioritize calling tools in parallel whenever possible.\n\n**Examples**:\n- When reading 3 files, run 3 tool calls in parallel to read all 3 files at once\n- When running multiple read-only commands like `read_file`, `grep_search` or `codebase_search`, always run all commands in parallel\n- Limit to 3-5 tool calls at a time or they might time out\n\n**Cases that SHOULD use parallel tool calls**:\n- Searching for different patterns (imports, usage, definitions)\n- Multiple grep searches with different regex patterns\n- Reading multiple files or searching different directories\n- Combining `codebase_search` with grep for comprehensive results\n- Any information gathering where you know upfront what you're looking for\n\nBefore making tool calls, briefly consider: What information do I need to fully answer this question? Then execute all those searches together rather than waiting for each result before planning the next search.\n\n**DEFAULT TO PARALLEL**: Unless you have a specific reason why operations MUST be sequential (output of A required for input of B), always execute multiple tools simultaneously. Parallel tool execution can be 3-5x faster than sequential calls.\n\n## Searching Code\n\n- **ALWAYS prefer** using `codebase_search` over grep for searching for code because it is much faster for efficient codebase exploration\n- Use grep to search for exact strings, symbols, or other patterns\n\n## Making Code Changes\n\nWhen making code changes, **NEVER output code to the USER**, unless requested. Instead use one of the code edit tools to implement the change.\n\n**EXTREMELY important** that your generated code can be run immediately:\n\n- Add all necessary import statements, dependencies, and endpoints required to run the code\n- If creating the codebase from scratch, create an appropriate dependency management file (e.g., `requirements.txt`) with package versions and a helpful README\n- If building a web app from scratch, give it a beautiful and modern UI, imbued with best UX practices\n- **NEVER generate** an extremely long hash or any non-textual code, such as binary\n\n- Every time you write code, follow the code style guidelines\n\n## Code Style\n\n**IMPORTANT**: The code you write will be reviewed by humans; optimize for clarity and readability. Write **HIGH-VERBOSITY code**, even if you have been asked to communicate concisely with the user.\n\n### Naming\n\n- Avoid short variable/symbol names. Never use 1-2 character names\n- Functions should be verbs/verb-phrases, variables should be nouns/noun-phrases\n- Use meaningful variable names as described in Martin's \"Clean Code\":\n  - Descriptive enough that comments are generally not needed\n  - Prefer full words over abbreviations\n  - Use variables to capture the meaning of complex conditions or operations\n\n**Examples (Bad → Good)**:\n- `genYmdStr` → `generateDateString`\n- `n` → `numSuccessfulRequests`\n- `[key, value] of map` → `[userId, user] of userIdToUser`\n- `resMs` → `fetchUserDataResponseMs`\n\n### Static Typed Languages\n\n- Explicitly annotate function signatures and exported/public APIs\n- Don't annotate trivially inferred variables\n- Avoid unsafe typecasts or types like `any`\n\n### Control Flow\n\n- Use guard clauses/early returns\n- Handle error and edge cases first\n- Avoid unnecessary try/catch blocks\n- **NEVER catch errors** without meaningful handling\n- Avoid deep nest\n...[truncated 6074 chars for debug payload]"
    },
    {
      "role": "user",
      "content": "/multi-llm \n\n\n\nImplement all missing OmniRoute providers in Codebolt MultiLLM.\n\n**References**\n\n* Missing providers: multillm-missing-adapters-deduped.md\n* OmniRoute source: /Users/ravirawat/Documents/codeboltai/OmniRoute\n\n**Instructions**\n\n1. Create an execution plan using the execution-plan tool . then add all providers as task in execution plan .\n2. Split the work into tasks and execute no more than 3 tasks in parallel.\n3. Create a separate agentfs-provider environment for each task.\n4. Each child agent must work only within its assigned environment. Do not expose or provide the parent project path to child agents.\n5. Use the existing Codebolt MultiLLM provider architecture as the implementation pattern and OmniRoute as the reference implementation.\n6. For every missing provider, implement, register, and test the provider.\n7. Verify that all missing providers from multillm-missing-adapters-deduped.md are completed.\n8. After a child task is complete, use merge-and-close to create the merge request and close its environment.\n9. Do not consider the overall task complete until all missing providers are implemented, registered, tested, and merged."
    },
    {
      "type": "message",
      "role": "assistant",
      "content": "I'll start by gathering context: reading the missing providers list, inspecting the OmniRoute reference, and discovering the execution-plan/agentfs/merge tools."
    },
    {
      "type": "function_call",
      "call_id": "call_ecf6ca38d03e4cc9a934f36d",
      "name": "read_file",
      "arguments": "{\"absolute_path\":\"/Users/ravirawat/Documents/codeboltai/multillm/multillm-missing-adapters-deduped.md\",\"explanation\":\"Reading the list of missing providers to implement\"}"
    },
    {
      "type": "function_call",
      "call_id": "call_9d1e6b60bd0a4af59e3d89cb",
      "name": "execute_command",
      "arguments": "{\"command\":\"ls /Users/ravirawat/Documents/codeboltai/OmniRoute && echo \\\"---\\\" && ls /Users/ravirawat/Documents/codeboltai/OmniRoute/packages 2>/dev/null || true\",\"explanation\":\"Listing OmniRoute reference repo structure\"}"
    },
    {
      "type": "function_call",
      "call_id": "call_2a10b0698fb44db1ad81125c",
      "name": "tool_search",
      "arguments": "{\"limit\":10,\"query\":\"execution plan create tasks\",\"searchScope\":\"tools+resources\"}"
    },
    {
      "type": "function_call",
      "call_id": "call_65e731fa991541b9ad40f037",
      "name": "tool_search",
      "arguments": "{\"limit\":10,\"query\":\"agentfs environment provider merge close\",\"searchScope\":\"tools+resources\"}"
    },
    {
      "type": "function_call_output",
      "call_id": "call_ecf6ca38d03e4cc9a934f36d",
      "output": "# Deduped missing multillm provider adapters\r\n\r\nGenerated: 2026-08-02 11:38:09 +05:30\r\n\r\nThis list excludes provider folders already present in `D:\\Codeboltapps\\CodeBolt\\packages\\multillm\\providers`.\r\n\r\nTotal missing unique provider IDs: 316\r\n\r\n- a2a (LiteLLM)\r\n- adapta-web (OmniRoute)\r\n- agentrouter (OmniRoute)\r\n- agnes (OmniRoute)\r\n- agy (OmniRoute)\r\n- ai21 (OmniRoute, LiteLLM)\r\n- aihorde (OmniRoute)\r\n- aiml (LiteLLM)\r\n- aimlapi (OmniRoute)\r\n- ainative (OmniRoute)\r\n- aiohttp-openai (LiteLLM)\r\n- aion (OmniRoute)\r\n- alibaba (BitRouter, OmniRoute)\r\n- alibaba_cn (BitRouter)\r\n- alibaba_coding_plan (BitRouter)\r\n- amazon-nova (LiteLLM)\r\n- ambient (BitRouter)\r\n- ant-ling (OmniRoute)\r\n- antigravity (OmniRoute)\r\n- api-airforce (OmniRoute)\r\n- apiserpent (LiteLLM)\r\n- atlascloud (BitRouter)\r\n- auggie (OmniRoute)\r\n- aws-bedrock (BitRouter)\r\n- aws-polly (LiteLLM)\r\n- azure (BitRouter, LiteLLM)\r\n- azure-ai (LiteLLM)\r\n- bai (OmniRoute)\r\n- baichuan (OmniRoute)\r\n- baidu (OmniRoute)\r\n- bailian-coding-plan (OmniRoute)\r\n- base-llm (LiteLLM)\r\n- baseten (OmniRoute, LiteLLM)\r\n- bazaarlink (OmniRoute)\r\n- bedrock-mantle (LiteLLM)\r\n- bitrouter (BitRouter)\r\n- black-forest-labs (LiteLLM)\r\n- blackbox (OmniRoute)\r\n- bluesminds (OmniRoute)\r\n- brave (LiteLLM)\r\n- byteplus (Manifest, BitRouter, OmniRoute)\r\n- bytez (OmniRoute, LiteLLM)\r\n- cerebras (Manifest, BitRouter, OmniRoute, LiteLLM)\r\n- charm-hyper (OmniRoute)\r\n- chatgpt (LiteLLM)\r\n- chatgpt-web (OmniRoute)\r\n- cheaperinference (OmniRoute)\r\n- chenzk (OmniRoute)\r\n- chipotle (OmniRoute)\r\n- chutes (BitRouter, OmniRoute)\r\n- clarifai (LiteLLM)\r\n- claude (OmniRoute)\r\n- claude-code (BitRouter)\r\n- cline (OmniRoute)\r\n- cline-pass (Manifest)\r\n- clinepass (OmniRoute)\r\n- cloudflare-ai (OmniRoute)\r\n- clova-studio (OmniRoute)\r\n- codebuddy-cn (OmniRoute)\r\n- codestral (OmniRoute, LiteLLM)\r\n- codex (OmniRoute)\r\n- cohere (OmniRoute, LiteLLM)\r\n- cometapi (LiteLLM)\r\n- command-code (OmniRoute)\r\n- commandcode (Manifest)\r\n- compactifai (LiteLLM)\r\n- copilot (Manifest)\r\n- copilot-m365-web (OmniRoute)\r\n- copilot-web (OmniRoute)\r\n- coze (OmniRoute)\r\n- crof (OmniRoute)\r\n- cursor (OmniRoute)\r\n- custom-httpx (LiteLLM)\r\n- dahl (OmniRoute)\r\n- dashscope (LiteLLM)\r\n- databricks (OmniRoute, LiteLLM)\r\n- dataforseo (LiteLLM)\r\n- datarobot (LiteLLM)\r\n- deepgram (LiteLLM)\r\n- deepinfra (OmniRoute, LiteLLM)\r\n- deprecated-providers (LiteLLM)\r\n- devin (OmniRoute)\r\n- devin-cli (OmniRoute)\r\n- dgrid (OmniRoute)\r\n- dify (OmniRoute)\r\n- digitalocean (OmniRoute)\r\n- dit (OmniRoute)\r\n- docker-model-runner (LiteLLM)\r\n- doubao (OmniRoute)\r\n- duckduckgo (LiteLLM)\r\n- duckduckgo-web (OmniRoute)\r\n- e2b (LiteLLM)\r\n- elevenlabs (LiteLLM)\r\n- empower (LiteLLM)\r\n- exa-ai (LiteLLM)\r\n- factory (OmniRoute)\r\n- fal-ai (LiteLLM)\r\n- fastcrw (LiteLLM)\r\n- featherless-ai (OmniRoute, LiteLLM)\r\n- felo-web (OmniRoute)\r\n- firecrawl (LiteLLM)\r\n- fireworks (Manifest, OmniRoute)\r\n- fireworks-ai (LiteLLM)\r\n- freeaiapikey (OmniRoute)\r\n- freemodel-dev (OmniRoute)\r\n- freepik (OmniRoute)\r\n- freetheai (OmniRoute)\r\n- friendliai (OmniRoute, LiteLLM)\r\n- g4f-gemini (OmniRoute)\r\n- g4f-groq (OmniRoute)\r\n- g4f-nvidia (OmniRoute)\r\n- g4f-ollama (OmniRoute)\r\n- g4f-pollinations (OmniRoute)\r\n- galadriel (OmniRoute, LiteLLM)\r\n- gdc (LiteLLM)\r\n- gemini-free (Manifest)\r\n- ghe-copilot (OmniRoute)\r\n- gigachat (OmniRoute, LiteLLM)\r\n- github (OmniRoute, LiteLLM)\r\n- github-copilot (BitRouter, LiteLLM)\r\n- gitlab-duo (OmniRoute)\r\n- gitlawb (OmniRoute)\r\n- glm (OmniRoute)\r\n- gmicloud (BitRouter)\r\n- google (BitRouter)\r\n- google-ai (BitRouter)\r\n- google-pse (LiteLLM)\r\n- gradient-ai (LiteLLM)\r\n- grok-cli (OmniRoute)\r\n- grok-web (OmniRoute)\r\n- hackclub (OmniRoute)\r\n- haiper (OmniRoute)\r\n- hcnsec (OmniRoute)\r\n- heroku (OmniRoute, LiteLLM)\r\n- hosted-vllm (LiteLLM)\r\n- huggingchat (OmniRoute)\r\n- hyperagent (OmniRoute)\r\n- hyperbolic (OmniRoute, LiteLLM)\r\n- ideogram (OmniRoute)\r\n- iflytek (OmniRoute)\r\n- inception (OmniRoute, LiteLLM)\r\n- inference-net (OmniRoute)\r\n- infinity (LiteLLM)\r\n- inner-ai (OmniRoute)\r\n- internlm (OmniRoute)\r\n- jina-ai (LiteLLM)\r\n- kenari (OmniRoute)\r\n- kie (OmniRoute)\r\n- kilo (Manifest)\r\n- kilo-gateway (OmniRoute)\r\n- kilocode (OmniRoute)\r\n- kimi (OmniRoute)\r\n- kiro (Manifest, OmniRoute)\r\n- lambda-ai (OmniRoute, LiteLLM)\r\n- langflow (LiteLLM)\r\n- langgraph (LiteLLM)\r\n- lemonade (LiteLLM)\r\n- leonardo (OmniRoute)\r\n- linkup (LiteLLM)\r\n- liquid (OmniRoute)\r\n- litellm-proxy (LiteLLM)\r\n- llamacpp (Manifest)\r\n- llamafile (LiteLLM)\r\n- llamagate (OmniRoute)\r\n- llm7 (OmniRoute)\r\n- lm-studio (LiteLLM)\r\n- lmarena (OmniRoute)\r\n- longcat (OmniRoute)\r\n- manus (LiteLLM)\r\n- maritalk (OmniRoute)\r\n- meta-llama (OmniRoute, LiteLLM)\r\n- milvus (LiteLLM)\r\n- mimocode (OmniRoute)\r\n- minimax (Manifest, BitRouter, OmniRoute, LiteLLM)\r\n- minimax_cn (BitRouter)\r\n- modal (OmniRoute)\r\n- modelscope (OmniRoute, LiteLLM)\r\n- monsterapi (OmniRoute)\r\n- moonshot (Manifest, OmniRoute, LiteLLM)\r\n- moonshotai (BitRouter)\r\n- moonshotai_coding_plan (BitRouter)\r\n- morph (OmniRoute, LiteLLM)\r\n- muse-spark-web (OmniRoute)\r\n- nanogpt (OmniRoute)\r\n- nara (OmniRoute)\r\n- navy (OmniRoute)\r\n- nebius (OmniRoute, LiteLLM)\r\n- nlp-cloud (LiteLLM)\r\n- nlpcloud (OmniRoute)\r\n- notion-web (OmniRoute)\r\n- nous (Manifest)\r\n- nous-research (OmniRoute)\r\n- novita (BitRouter, OmniRoute, LiteLLM)\r\n- nscale (OmniRoute, LiteLLM)\r\n- nube (OmniRoute)\r\n- nvidia (Manifest, OmniRoute)\r\n- nvidia-nim (LiteLLM)\r\n- nvidia-riva (LiteLLM)\r\n- oci (LiteLLM)\r\n- ollama-cloud (Manifest, OmniRoute)\r\n- oobabooga (LiteLLM)\r\n- openadapter (OmniRoute)\r\n- openai-codex (BitRouter)\r\n- openai-like (LiteLLM)\r\n- opencode (OmniRoute)\r\n- opencode-go (Manifest, BitRouter)\r\n- opencode-zen (Manifest, BitRouter)\r\n- opensandbox (LiteLLM)\r\n- openvecta (OmniRoute)\r\n- orcarouter (OmniRoute)\r\n- ovhcloud (OmniRoute, LiteLLM)\r\n- parallel-ai (LiteLLM)\r\n- pass-through (LiteLLM)\r\n- petals (LiteLLM)\r\n- pg-vector (LiteLLM)\r\n- phala (BitRouter)\r\n- pioneer (Manifest, OmniRoute)\r\n- plamo (OmniRoute)\r\n- poe (OmniRoute)\r\n- pollinations (OmniRoute)\r\n- predibase (OmniRoute, LiteLLM)\r\n- promptql (OmniRoute)\r\n- publicai (OmniRoute)\r\n- puter (OmniRoute)\r\n- qianfan (BitRouter, OmniRoute)\r\n- qianfan_cn (BitRouter)\r\n- qiniu (OmniRoute)\r\n- qoder (OmniRoute)\r\n- qwen (Manifest, OmniRoute)\r\n- qwen-cloud (OmniRoute)\r\n- qwen-cloud-token-plan (OmniRoute)\r\n- ragflow (LiteLLM)\r\n- recraft (LiteLLM)\r\n- redpill (BitRouter)\r\n- reducto (LiteLLM)\r\n- reka (OmniRoute)\r\n- requesty (OmniRoute)\r\n- routeway (OmniRoute)\r\n- runwayml (LiteLLM)\r\n- s3-vectors (LiteLLM)\r\n- sagemaker (LiteLLM)\r\n- sambanova (OmniRoute, LiteLLM)\r\n- sap (LiteLLM)\r\n- sarvam (OmniRoute)\r\n- scaleway (OmniRoute, LiteLLM)\r\n- sealion (OmniRoute)\r\n- searchapi (LiteLLM)\r\n- searxng (LiteLLM)\r\n- segmind (OmniRoute)\r\n- sensenova (OmniRoute)\r\n- serper (LiteLLM)\r\n- siliconflow (BitRouter, OmniRoute)\r\n- siliconflow_cn (BitRouter)\r\n- snowflake (OmniRoute, LiteLLM)\r\n- soniox (LiteLLM)\r\n- sparkdesk (OmniRoute)\r\n- stability (LiteLLM)\r\n- stability-ai (OmniRoute)\r\n- stepfun (BitRouter, OmniRoute)\r\n- stepfun_cn (BitRouter)\r\n- stepfun_step_plan (BitRouter)\r\n- stepfun_step_plan_cn (BitRouter)\r\n- sumopod (OmniRoute)\r\n- suno (OmniRoute)\r\n- supergrok (BitRouter)\r\n- synthetic (OmniRoute)\r\n- t3-web (OmniRoute)\r\n- tavily (LiteLLM)\r\n- tencent (BitRouter, OmniRoute, LiteLLM)\r\n- tencent_cn (BitRouter)\r\n- theoldllm (OmniRoute)\r\n- tinfoil (BitRouter)\r\n- tinyfish (LiteLLM)\r\n- together (OmniRoute)\r\n- together-ai (LiteLLM)\r\n- tokenrouter (OmniRoute)\r\n- topaz (LiteLLM)\r\n- trae (OmniRoute)\r\n- triton (LiteLLM)\r\n- typhoon (OmniRoute)\r\n- udio (OmniRoute)\r\n- uncloseai (OmniRoute)\r\n- upstage (OmniRoute)\r\n- v0 (LiteLLM)\r\n- v0-vercel (OmniRoute)\r\n- venice (OmniRoute)\r\n- veoaifree-web (OmniRoute)\r\n- vercel-ai-gateway (OmniRoute, LiteLLM)\r\n- vertex (BitRouter, OmniRoute)\r\n- vertex-ai (LiteLLM)\r\n- vllm (LiteLLM)\r\n- volcengine (OmniRoute, LiteLLM)\r\n- voyage (LiteLLM)\r\n- wafer (OmniRoute)\r\n- wandb (OmniRoute, LiteLLM)\r\n- watsonx (LiteLLM)\r\n- windsurf (OmniRoute)\r\n- writer (OmniRoute)\r\n- x5lab (OmniRoute)\r\n- xai (Manifest, BitRouter, OmniRoute, LiteLLM)\r\n- xai-oauth (OmniRoute)\r\n- xiaomi (Manifest, BitRouter)\r\n- xiaomi_token_plan (BitRouter)\r\n- xiaomi_token_plan_cn (BitRouter)\r\n- xiaomi_token_plan_eu (BitRouter)\r\n- xiaomi-mimo (OmniRoute)\r\n- xiaomi-mimo-token-plan (OmniRoute)\r\n- xinference (LiteLLM)\r\n- yi (OmniRoute)\r\n- you-com (LiteLLM)\r\n- yuanbao-web (OmniRoute)\r\n- zai_coding_plan (BitRouter)\r\n- zai-web (OmniRoute)\r\n- zed-hosted (OmniRoute)\r\n- zenmux (OmniRoute)\r\n- zenmux-free (OmniRoute)\r\n",
      "status": "completed"
    },
    {
      "type": "function_call_output",
      "call_id": "call_9d1e6b60bd0a4af59e3d89cb",
      "output": "Command executed: ls /Users/ravirawat/Documents/codeboltai/OmniRoute && echo \"---\" && ls /Users/ravirawat/Documents/codeboltai/OmniRoute/packages 2>/dev/null || true\n\nOutput:\nCommand executed.\nOutput:\n@omniroute\t\t\t\tknip.json\nAGENTS.md\t\t\t\tllm.txt\nCHANGELOG.md\t\t\t\tnews.json\nCLAUDE.md\t\t\t\tnext.config.mjs\nCODE_OF_CONDUCT.md\t\t\topen-sse\nCONTRIBUTING.md\t\t\t\tpackage-lock.json\nDockerfile\t\t\t\tpackage.json\nGEMINI.md\t\t\t\tperf-audit-report.md\nLICENSE\t\t\t\t\tplaywright.config.ts\nREADME.md\t\t\t\tpnpm-workspace.yaml\nSECURITY.md\t\t\t\tpnpm.json\n_references\t\t\t\tpostcss.config.mjs\nbin\t\t\t\t\tprettier.config.mjs\nchangelog.d\t\t\t\tpromptfooconfig.yamlcodecov.yml\t\t\t\tpublic\nconfig\t\t\t\t\tscripts\ncontrib\t\t\t\t\tskills\ndocker\t\t\t\t\tsocket.yml\ndocker-compose.prod.yml\t\t\tsonar-project.properties\ndocker-compose.yml\t\t\tsource.config.ts\ndocs\t\t\t\t\tsrc\nelectron\t\t\t\tstryker.conf.json\neslint.complexity-ratchets.config.mjs\tstryker.disablebail.json\neslint.complexity.config.mjs\t\ttests\neslint.config.mjs\t\t\ttsconfig.json\neslint.sonarjs.config.mjs\t\ttsconfig.typecheck-core.json\nexamples\t\t\t\ttsconfig.typecheck-dashboard.json\nflake.lock\t\t\t\ttsconfig.typecheck-noimplicit-core.json\nflake.nix\t\t\t\tvitest.config.ts\nfly.toml\t\t\t\tvitest.mcp.config.ts\nimages---",
      "status": "completed"
    },
    {
      "type": "tool_search_output",
      "execution": "server",
      "status": "completed",
      "tools": [
        {
          "type": "function",
          "name": "actionBlock_start",
          "description": "Start an ActionBlock by name",
          "parameters": {
            "type": "object",
            "properties": {
              "actionBlockName": {
                "type": "string",
                "description": "ActionBlock name"
              },
              "params": {
                "type": "object",
                "description": "Optional parameters"
              },
              "explanation": {
                "type": "string",
                "description": "Explanation"
              }
            },
            "required": [
              "actionBlockName"
            ],
            "additionalProperties": false
          },
          "kind": "actionBlock",
          "route": {
            "mode": "native"
          }
        },
        {
          "type": "function",
          "name": "agent_start",
          "description": "Starts an agent with a specific task.",
          "parameters": {
            "type": "object",
            "properties": {
              "agent_id": {
                "type": "string",
                "description": "The ID of the agent to start."
              },
              "task": {
                "type": "string",
                "description": "The task for the agent to execute."
              },
              "llm": {
                "type": "object",
                "description": "Optional runtime LLM override for the started agent run."
              },
              "explanation": {
                "type": "string",
                "description": "Explanation"
              }
            },
            "required": [
              "agent_id",
              "task"
            ],
            "additionalProperties": false
          },
          "kind": "agent",
          "route": {
            "mode": "native"
          }
        },
        {
          "type": "function",
          "name": "skill_detail",
          "description": "Starts or invokes a skill by name.",
          "parameters": {
            "type": "object",
            "properties": {
              "skillId": {
                "type": "string",
                "description": "The name or identifier of the skill."
              },
              "params": {
                "type": "object",
                "description": "Optional skill parameters."
              },
              "timeout": {
                "type": "number",
                "description": "Optional execution timeout in milliseconds."
              }
            },
            "required": [
              "skillId"
            ],
            "additionalProperties": false
          },
          "kind": "skill",
          "route": {
            "mode": "native"
          }
        }
      ],
      "resources": [
        {
          "type": "actionBlock",
          "name": "create-pr",
          "description": "Creates a GitHub pull request from the current local git worktree branch to a remote/base branch. The action block uses CodeBoltJS terminal APIs for worktree git commands, CodeBolt LLM for PR titles, MCP execution, and chat progress.\n",
          "argsSchema": {
            "type": "object",
            "properties": {
              "cwd": {
                "type": "string",
                "description": "Current working directory or git worktree path to use when creating the pull request."
              },
              "baseBranch": {
                "type": "string",
                "description": "Base branch for the pull request. Defaults to the tracked branch or main."
              },
              "commitMessage": {
                "type": "string",
                "description": "Commit message for uncommitted agent changes."
              },
              "prTitle": {
                "type": "string",
                "description": "Explicit GitHub pull request title. If omitted, the ActionBlock asks the configured CodeBolt LLM for a meaningful title."
              },
              "generatePrTitle": {
                "type": "boolean",
                "description": "Set false to disable LLM PR title generation and use a deterministic fallback."
              },
              "prTitleLlmRole": {
                "type": "string",
                "description": "Optional CodeBolt LLM role to use for PR title generation."
              },
              "prBody": {
                "type": "string",
                "description": "GitHub pull request body."
              },
              "repository": {
                "type": "string",
                "description": "GitHub repository in owner/repo form. If omitted, origin remote is inspected through CodeBolt terminal API."
              },
              "githubToolbox": {
                "type": "string",
                "description": "Optional CodeBolt MCP toolbox name for the GitHub MCP server."
              },
              "githubToolName": {
                "type": "string",
                "description": "Optional GitHub MCP tool name for creating pull requests."
              }
            }
          },
          "call": {
            "tool": "actionBlock_start",
            "arguments": {
              "actionBlockName": "create-pr"
            }
          },
          "score": 28,
          "metadata": {
            "id": "create-pr_L1VzZXJz",
            "version": "1.0.4",
            "sourceType": "global",
            "entryPoint": "dist/index.js",
            "path": "/Users/ravirawat/.codebolt/actionblocks/create-pr"
          }
        },
        {
          "type": "agent",
          "name": "Claude Code",
          "description": "This agent starts a Codebolt MCP server in-process, then spawns Claude Code\nwith --mcp-config pointing to it. Claude Code discovers all Codebolt tools\n(filesystem, terminal, git, browser, memory, tasks, etc.) via MCP and can\nuse them during execution. All tool calls flow through the Codebolt platform\nwith UI confirmations and notifications.\n",
          "call": {
            "tool": "agent_start",
            "arguments": {
              "agent_id": "claude-thirdpartywithmcp"
            }
          },
          "metadata": {
            "id": "claude-thirdpartywithmcp",
            "category": "agent",
            "kind": "agent"
          },
          "score": 20
        },
        {
          "type": "agent",
          "name": "Orchestrator",
          "description": "The Main Orchestrator is a multi-phase coordination agent for the Codebolt platform.\nIt receives user requirements and drives them through a full lifecycle:\n1. Planning - Deep analysis and comprehensive plan creation using read-only tools\n2. Specification - Generates detailed specifications from the plan\n3. Job Creation - Breaks specifications into discrete, dependency-aware jobs\n4. Job Execution - Launches and coordinates worker agents to execute jobs in parallel,\n   respecting dependency ordering and handling completion events via a yield-and-resume loop.\nThe orchestrator never implements code directly — it delegates all implementation\nto worker agents via background threads.\n",
          "call": {
            "tool": "agent_start",
            "arguments": {
              "agent_id": "orchestrator"
            }
          },
          "metadata": {
            "id": "orchestrator",
            "category": "agent",
            "kind": "agent"
          },
          "score": 20
        },
        {
          "type": "skill",
          "name": "agents-sdk",
          "description": "Build AI agents on Cloudflare Workers using the Agents SDK. Load when creating stateful agents, durable workflows, real-time WebSocket apps, scheduled tasks, MCP servers, chat applications, voice agents, or browser automation. Covers Agent class, state management, callable RPC, Workflows, durable execution, queues, retries, observability, and React hooks. Biases towards retrieval from Cloudflare docs over pre-trained knowledge.",
          "call": {
            "tool": "skill_detail",
            "arguments": {
              "skillId": "agents-sdk"
            }
          },
          "metadata": {
            "id": "agents-sdk_L1VzZXJz",
            "category": "skill",
            "kind": "skill"
          },
          "score": 20
        },
        {
          "type": "skill",
          "name": "cloudflare-one-migrations",
          "description": "Plans migrations from Zscaler ZIA/ZPA, Palo Alto, legacy VPN, SWG, or SASE stacks to Cloudflare One. Use for migration assessments, policy mapping, rollout plans, and parity/gap analysis.",
          "call": {
            "tool": "skill_detail",
            "arguments": {
              "skillId": "cloudflare-one-migrations"
            }
          },
          "metadata": {
            "id": "cloudflare-one-migrations_L1VzZXJz",
            "category": "skill",
            "kind": "skill"
          },
          "score": 10
        },
        {
          "type": "skill",
          "name": "durable-objects",
          "description": "Create and review Cloudflare Durable Objects. Use when building stateful coordination (chat rooms, multiplayer games, booking systems), implementing RPC methods, SQLite storage, alarms, WebSockets, or reviewing DO code for best practices. Covers Workers integration, wrangler config, and testing with Vitest. Biases towards retrieval from Cloudflare docs over pre-trained knowledge.",
          "call": {
            "tool": "skill_detail",
            "arguments": {
              "skillId": "durable-objects"
            }
          },
          "metadata": {
            "id": "durable-objects_L1VzZXJz",
            "category": "skill",
            "kind": "skill"
          },
          "score": 10
        },
        {
          "type": "skill",
          "name": "sandbox-sdk",
          "description": "Build sandboxed applications for secure code execution. Load when building AI code execution, code interpreters, CI/CD systems, interactive dev environments, or executing untrusted code. Covers Sandbox SDK lifecycle, commands, files, code interpreter, and preview URLs. Biases towards retrieval from Cloudflare docs over pre-trained knowledge.",
          "call": {
            "tool": "skill_detail",
            "arguments": {
              "skillId": "sandbox-sdk"
            }
          },
          "metadata": {
            "id": "sandbox-sdk_L1VzZXJz",
            "category": "skill",
            "kind": "skill"
          },
          "score": 10
        },
        {
          "type": "skill",
          "name": "turnstile-spin",
          "description": "Set up Cloudflare Turnstile end-to-end in a project — scan the codebase, create the widget via the Cloudflare API, deploy the managed siteverify Worker, write the frontend snippets, validate, and persist the skill. Load this when a user asks to add Turnstile, set up CAPTCHA, protect a form from bots, or fix a Turnstile integration. Mirrors developers.cloudflare.com/turnstile/spin.",
          "call": {
            "tool": "skill_detail",
            "arguments": {
              "skillId": "turnstile-spin"
            }
          },
          "metadata": {
            "id": "turnstile-spin_L1VzZXJz",
            "category": "skill",
            "kind": "skill"
          },
          "score": 10
        }
      ],
      "call_id": "call_2a10b0698fb44db1ad81125c"
    },
    {
      "type": "tool_search_output",
      "execution": "server",
      "status": "completed",
      "tools": [
        {
          "type": "function",
          "name": "cloud_codebolt_connectors--get_connector_details",
          "description": "Get provider metadata, auth methods, connection status, and available actions for a connector service.",
          "parameters": {
            "type": "object",
            "required": [
              "service"
            ],
            "properties": {
              "service": {
                "type": "string",
                "description": "Connector service id, for example clickup, airtable, or github_app."
              }
            },
            "additionalProperties": false
          },
          "kind": "cloud-connector"
        },
        {
          "type": "function",
          "name": "cloud_codebolt_connectors--list_available_connectors",
          "description": "List connector providers available in the CodeBolt OpenConnector catalog, including auth methods and connection status for the current workspace.",
          "parameters": {
            "type": "object",
            "properties": {
              "search": {
                "type": "string",
                "description": "Optional case-insensitive provider search."
              },
              "category": {
                "type": "string",
                "description": "Optional category filter."
              },
              "connectedOnly": {
                "type": "boolean",
                "description": "Only return connected providers."
              },
              "limit": {
                "type": "number",
                "description": "Maximum providers to return."
              }
            },
            "additionalProperties": false
          },
          "kind": "cloud-connector"
        },
        {
          "type": "function",
          "name": "cloud_codebolt_connectors--list_installed_connectors",
          "description": "List connector providers that are connected and enabled for the current workspace.",
          "parameters": {
            "type": "object",
            "properties": {
              "limit": {
                "type": "number",
                "description": "Maximum providers to return."
              }
            },
            "additionalProperties": false
          },
          "kind": "cloud-connector"
        },
        {
          "type": "function",
          "name": "cloud_codebolt_connectors--search_available_connectors",
          "description": "Search connector providers that are not necessarily installed, so an agent can identify a needed connector and ask the user to connect it.",
          "parameters": {
            "type": "object",
            "required": [
              "query"
            ],
            "properties": {
              "query": {
                "type": "string",
                "description": "Provider name, service id, category, or description search."
              },
              "limit": {
                "type": "number",
                "description": "Maximum providers to return."
              }
            },
            "additionalProperties": false
          },
          "kind": "cloud-connector"
        },
        {
          "type": "function",
          "name": "skill_detail",
          "description": "Starts or invokes a skill by name.",
          "parameters": {
            "type": "object",
            "properties": {
              "skillId": {
                "type": "string",
                "description": "The name or identifier of the skill."
              },
              "params": {
                "type": "object",
                "description": "Optional skill parameters."
              },
              "timeout": {
                "type": "number",
                "description": "Optional execution timeout in milliseconds."
              }
            },
            "required": [
              "skillId"
            ],
            "additionalProperties": false
          },
          "kind": "skill",
          "route": {
            "mode": "native"
          }
        }
      ],
      "resources": [
        {
          "type": "skill",
          "name": "sandbox-sdk",
          "description": "Build sandboxed applications for secure code execution. Load when building AI code execution, code interpreters, CI/CD systems, interactive dev environments, or executing untrusted code. Covers Sandbox SDK lifecycle, commands, files, code interpreter, and preview URLs. Biases towards retrieval from Cloudflare docs over pre-trained knowledge.",
          "call": {
            "tool": "skill_detail",
            "arguments": {
              "skillId": "sandbox-sdk"
            }
          },
          "metadata": {
            "id": "sandbox-sdk_L1VzZXJz",
            "category": "skill",
            "kind": "skill"
          },
          "score": 10
        }
      ],
      "call_id": "call_65e731fa991541b9ad40f037"
    },
    {
      "type": "message",
      "role": "assistant",
      "content": "I have the missing-providers list. Now let me find the specific tooling mentioned in the instructions (execution-plan, agentfs-provider environments, merge-and-close) and inspect the existing provider architecture."
    },
    {
      "type": "function_call",
      "call_id": "call_a1c16ad8c430483b95b25d47",
      "name": "tool_search",
      "arguments": "{\"limit\":15,\"query\":\"execution plan\"}"
    },
    {
      "type": "function_call",
      "call_id": "call_cd167451480f46368b7ac382",
      "name": "tool_search",
      "arguments": "{\"limit\":15,\"query\":\"agentfs provider environment create\"}"
    },
    {
      "type": "function_call",
      "call_id": "call_8edc42daae1f4ed3bd21291e",
      "name": "tool_search",
      "arguments": "{\"limit\":15,\"query\":\"merge and close environment merge request\"}"
    },
    {
      "type": "function_call",
      "call_id": "call_9ced55a422d24d91b1288639",
      "name": "tool_search",
      "arguments": "{\"limit\":15,\"query\":\"thread create background child agent\"}"
    },
    {
      "type": "tool_search_output",
      "execution": "server",
      "status": "completed",
      "tools": [
        {
          "type": "function",
          "name": "actionBlock_start",
          "description": "Start an ActionBlock by name",
          "parameters": {
            "type": "object",
            "properties": {
              "actionBlockName": {
                "type": "string",
                "description": "ActionBlock name"
              },
              "params": {
                "type": "object",
                "description": "Optional parameters"
              },
              "explanation": {
                "type": "string",
                "description": "Explanation"
              }
            },
            "required": [
              "actionBlockName"
            ],
            "additionalProperties": false
          },
          "kind": "actionBlock",
          "route": {
            "mode": "native"
          }
        }
      ],
      "resources": [],
      "call_id": "call_a1c16ad8c430483b95b25d47"
    },
    {
      "type": "tool_search_output",
      "execution": "server",
      "status": "completed",
      "tools": [
        {
          "type": "function",
          "name": "cloud_codebolt_connectors--get_connector_details",
          "description": "Get provider metadata, auth methods, connection status, and available actions for a connector service.",
          "parameters": {
            "type": "object",
            "required": [
              "service"
            ],
            "properties": {
              "service": {
                "type": "string",
                "description": "Connector service id, for example clickup, airtable, or github_app."
              }
            },
            "additionalProperties": false
          },
          "kind": "cloud-connector"
        },
        {
          "type": "function",
          "name": "cloud_codebolt_connectors--list_available_connectors",
          "description": "List connector providers available in the CodeBolt OpenConnector catalog, including auth methods and connection status for the current workspace.",
          "parameters": {
            "type": "object",
            "properties": {
              "search": {
                "type": "string",
                "description": "Optional case-insensitive provider search."
              },
              "category": {
                "type": "string",
                "description": "Optional category filter."
              },
              "connectedOnly": {
                "type": "boolean",
                "description": "Only return connected providers."
              },
              "limit": {
                "type": "number",
                "description": "Maximum providers to return."
              }
            },
            "additionalProperties": false
          },
          "kind": "cloud-connector"
        },
        {
          "type": "function",
          "name": "cloud_codebolt_connectors--list_installed_connectors",
          "description": "List connector providers that are connected and enabled for the current workspace.",
          "parameters": {
            "type": "object",
            "properties": {
              "limit": {
                "type": "number",
                "description": "Maximum providers to return."
              }
            },
            "additionalProperties": false
          },
          "kind": "cloud-connector"
        },
        {
          "type": "function",
          "name": "cloud_codebolt_connectors--search_available_connectors",
          "description": "Search connector providers that are not necessarily installed, so an agent can identify a needed connector and ask the user to connect it.",
          "parameters": {
            "type": "object",
            "required": [
              "query"
            ],
            "properties": {
              "query": {
                "type": "string",
                "description": "Provider name, service id, category, or description search."
              },
              "limit": {
                "type": "number",
                "description": "Maximum providers to return."
              }
            },
            "additionalProperties": false
          },
          "kind": "cloud-connector"
        }
      ],
      "resources": [],
      "call_id": "call_cd167451480f46368b7ac382"
    },
    {
      "type": "tool_search_output",
      "execution": "server",
      "status": "completed",
      "tools": [
        {
          "type": "function",
          "name": "cloud_codebolt_connectors--request_connector_install",
          "description": "Ask the user to configure a connector in the CodeBolt portal, then wait until they mark setup completed.",
          "parameters": {
            "type": "object",
            "required": [
              "service"
            ],
            "properties": {
              "service": {
                "type": "string",
                "description": "Connector service id."
              },
              "connectionName": {
                "type": "string",
                "description": "Connection name. Defaults to default."
              }
            },
            "additionalProperties": false
          },
          "kind": "cloud-connector"
        },
        {
          "type": "function",
          "name": "cloud_codebolt_connectors--get_connector_details",
          "description": "Get provider metadata, auth methods, connection status, and available actions for a connector service.",
          "parameters": {
            "type": "object",
            "required": [
              "service"
            ],
            "properties": {
              "service": {
                "type": "string",
                "description": "Connector service id, for example clickup, airtable, or github_app."
              }
            },
            "additionalProperties": false
          },
          "kind": "cloud-connector"
        },
        {
          "type": "function",
          "name": "cloud_codebolt_connectors--list_available_connectors",
          "description": "List connector providers available in the CodeBolt OpenConnector catalog, including auth methods and connection status for the current workspace.",
          "parameters": {
            "type": "object",
            "properties": {
              "search": {
                "type": "string",
                "description": "Optional case-insensitive provider search."
              },
              "category": {
                "type": "string",
                "description": "Optional category filter."
              },
              "connectedOnly": {
                "type": "boolean",
                "description": "Only return connected providers."
              },
              "limit": {
                "type": "number",
                "description": "Maximum providers to return."
              }
            },
            "additionalProperties": false
          },
          "kind": "cloud-connector"
        },
        {
          "type": "function",
          "name": "cloud_codebolt_connectors--list_installed_connectors",
          "description": "List connector providers that are connected and enabled for the current workspace.",
          "parameters": {
            "type": "object",
            "properties": {
              "limit": {
                "type": "number",
                "description": "Maximum providers to return."
              }
            },
            "additionalProperties": false
          },
          "kind": "cloud-connector"
        },
        {
          "type": "function",
          "name": "cloud_codebolt_connectors--search_available_connectors",
          "description": "Search connector providers that are not necessarily installed, so an agent can identify a needed connector and ask the user to connect it.",
          "parameters": {
            "type": "object",
            "required": [
              "query"
            ],
            "properties": {
              "query": {
                "type": "string",
                "description": "Provider name, service id, category, or description search."
              },
              "limit": {
                "type": "number",
                "description": "Maximum providers to return."
              }
            },
            "additionalProperties": false
          },
          "kind": "cloud-connector"
        }
      ],
      "resources": [],
      "call_id": "call_8edc42daae1f4ed3bd21291e"
    },
    {
      "type": "tool_search_output",
      "execution": "server",
      "status": "completed",
      "tools": [
        {
          "type": "function",
          "name": "cloud_codebolt_connectors--search_available_connectors",
          "description": "Search connector providers that are not necessarily installed, so an agent can identify a needed connector and ask the user to connect it.",
          "parameters": {
            "type": "object",
            "required": [
              "query"
            ],
            "properties": {
              "query": {
                "type": "string",
                "description": "Provider name, service id, category, or description search."
              },
              "limit": {
                "type": "number",
                "description": "Maximum providers to return."
              }
            },
            "additionalProperties": false
          },
          "kind": "cloud-connector"
        }
      ],
      "resources": [],
      "call_id": "call_9ced55a422d24d91b1288639"
    },
    {
      "type": "message",
      "role": "assistant",
      "content": "The tool search returned counts but no names. Let me query more precisely to identify the exact tool names for execution-plan, agentfs environments, and merge-and-close."
    },
    {
      "type": "function_call",
      "call_id": "call_5168851ac78647f6b114a25b",
      "name": "tool_search",
      "arguments": "{\"kind\":\"other\",\"limit\":20,\"query\":\"plan\",\"searchScope\":\"tools\"}"
    },
    {
      "type": "function_call",
      "call_id": "call_f9ccf3fd3b3d43eaaba5ec39",
      "name": "tool_search",
      "arguments": "{\"kind\":\"other\",\"limit\":20,\"query\":\"environment sandbox workspace\",\"searchScope\":\"tools\"}"
    },
    {
      "type": "tool_search_output",
      "execution": "client",
      "status": "completed",
      "tools": [
        {
          "type": "function",
          "name": "executionPlan_create",
          "description": "Create a new empty execution plan. Execution plans can later contain flat tasks or structured groups such as parallelGroup, loopGroup, ifGroup, and waitUntilGroup. Use executionPlan_addTask for simple sequential tasks and executionPlan_addGroup for grouped, parallel, looped, conditional, or wait-based work.",
          "parameters": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string",
                "description": "Plan name"
              },
              "description": {
                "type": "string",
                "description": "Plan description"
              },
              "agentId": {
                "type": "string",
                "description": "Agent ID"
              },
              "agentName": {
                "type": "string",
                "description": "Agent name"
              },
              "status": {
                "type": "string",
                "description": "Plan status"
              },
              "planId": {
                "type": "string",
                "description": "Plan ID"
              },
              "explanation": {
                "type": "string",
                "description": "Explanation"
              }
            },
            "required": [
              "name"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "executionPlan_create"
            }
          }
        },
        {
          "type": "function",
          "name": "execution_plan_create",
          "description": "Create a new empty execution plan. Execution plans can later contain flat tasks or structured groups such as parallelGroup, loopGroup, ifGroup, and waitUntilGroup. Use executionPlan_addTask for simple sequential tasks and executionPlan_addGroup for grouped, parallel, looped, conditional, or wait-based work.",
          "parameters": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string",
                "description": "Plan name"
              },
              "description": {
                "type": "string",
                "description": "Plan description"
              },
              "agentId": {
                "type": "string",
                "description": "Agent ID"
              },
              "agentName": {
                "type": "string",
                "description": "Agent name"
              },
              "status": {
                "type": "string",
                "description": "Plan status"
              },
              "planId": {
                "type": "string",
                "description": "Plan ID"
              },
              "explanation": {
                "type": "string",
                "description": "Explanation"
              }
            },
            "required": [
              "name"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "execution_plan_create"
            }
          }
        },
        {
          "type": "function",
          "name": "executionPlan_getDetail",
          "description": "Get one full execution plan with its tasks, groups, status, progress, and metadata. Use this before editing, appending, or deleting a specific plan.",
          "parameters": {
            "type": "object",
            "properties": {
              "planId": {
                "type": "string",
                "description": "Execution plan ID"
              },
              "explanation": {
                "type": "string",
                "description": "Explanation"
              }
            },
            "required": [
              "planId"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "executionPlan_getDetail"
            }
          }
        },
        {
          "type": "function",
          "name": "execution_plan_get_detail",
          "description": "Get one full execution plan with its tasks, groups, status, progress, and metadata. Use this before editing, appending, or deleting a specific plan.",
          "parameters": {
            "type": "object",
            "properties": {
              "planId": {
                "type": "string",
                "description": "Execution plan ID"
              },
              "explanation": {
                "type": "string",
                "description": "Explanation"
              }
            },
            "required": [
              "planId"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "execution_plan_get_detail"
            }
          }
        },
        {
          "type": "function",
          "name": "executionPlan_validate",
          "description": "Validate the execution-plan coordination graph and return structural scheduler diagnostics.",
          "parameters": {
            "type": "object",
            "properties": {
              "planId": {
                "type": "string",
                "description": "Execution plan ID"
              },
              "explanation": {
                "type": "string",
                "description": "One sentence explanation for the user."
              }
            },
            "required": [
              "planId"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "executionPlan_validate"
            }
          }
        },
        {
          "type": "function",
          "name": "execution_plan_validate",
          "description": "Validate the execution-plan coordination graph and return structural scheduler diagnostics.",
          "parameters": {
            "type": "object",
            "properties": {
              "planId": {
                "type": "string",
                "description": "Execution plan ID"
              },
              "explanation": {
                "type": "string",
                "description": "One sentence explanation for the user."
              }
            },
            "required": [
              "planId"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "execution_plan_validate"
            }
          }
        },
        {
          "type": "function",
          "name": "executionPlan_addTask",
          "description": "Add a task to an execution plan. If task.groupId matches an existing plan group ID, the task is inserted inside that group; otherwise it is added as a flat/sequential top-level task. Use executionPlan_addGroup to create grouped, parallel, looped, conditional, or wait-based structures.",
          "parameters": {
            "type": "object",
            "properties": {
              "planId": {
                "type": "string",
                "description": "Execution plan ID"
              },
              "task": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string",
                    "description": "Task name"
                  },
                  "description": {
                    "type": "string",
                    "description": "Task description"
                  },
                  "priority": {
                    "type": "string",
                    "description": "Task priority"
                  },
                  "taskType": {
                    "type": "string",
                    "description": "Task type"
                  },
                  "status": {
                    "type": "string",
                    "description": "Task status"
                  },
                  "assignedTo": {
                    "type": "string",
                    "description": "Assigned to"
                  },
                  "groupId": {
                    "type": "string",
                    "description": "Optional execution plan group ID. When it matches a group, the task is nested in that group instead of added top-level."
                  },
                  "trackName": {
                    "type": "string",
                    "description": "Optional parallel group track name when adding into a parallelGroup. Defaults to parallelTrack1."
                  },
                  "groupTrackName": {
                    "type": "string",
                    "description": "Alias for trackName."
                  },
                  "parallelTrackName": {
                    "type": "string",
                    "description": "Alias for trackName."
                  },
                  "estimatedTime": {
                    "type": "number",
                    "description": "Estimated time"
                  },
                  "dependencies": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    },
                    "description": "Dependencies"
                  }
                },
                "required": [
                  "name"
                ]
              },
              "explanation": {
                "type": "string",
                "description": "Explanation"
              }
            },
            "required": [
              "planId",
              "task"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "executionPlan_addTask"
            }
          }
        },
        {
          "type": "function",
          "name": "execution_plan_add_task",
          "description": "Add a task to an execution plan. If task.groupId matches an existing plan group ID, the task is inserted inside that group; otherwise it is added as a flat/sequential top-level task. Use executionPlan_addGroup to create grouped, parallel, looped, conditional, or wait-based structures.",
          "parameters": {
            "type": "object",
            "properties": {
              "planId": {
                "type": "string",
                "description": "Execution plan ID"
              },
              "task": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string",
                    "description": "Task name"
                  },
                  "description": {
                    "type": "string",
                    "description": "Task description"
                  },
                  "priority": {
                    "type": "string",
                    "description": "Task priority"
                  },
                  "taskType": {
                    "type": "string",
                    "description": "Task type"
                  },
                  "status": {
                    "type": "string",
                    "description": "Task status"
                  },
                  "assignedTo": {
                    "type": "string",
                    "description": "Assigned to"
                  },
                  "groupId": {
                    "type": "string",
                    "description": "Optional execution plan group ID. When it matches a group, the task is nested in that group instead of added top-level."
                  },
                  "trackName": {
                    "type": "string",
                    "description": "Optional parallel group track name when adding into a parallelGroup. Defaults to parallelTrack1."
                  },
                  "groupTrackName": {
                    "type": "string",
                    "description": "Alias for trackName."
                  },
                  "parallelTrackName": {
                    "type": "string",
                    "description": "Alias for trackName."
                  },
                  "estimatedTime": {
                    "type": "number",
                    "description": "Estimated time"
                  },
                  "dependencies": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    },
                    "description": "Dependencies"
                  }
                },
                "required": [
                  "name"
                ]
              },
              "explanation": {
                "type": "string",
                "description": "Explanation"
              }
            },
            "required": [
              "planId",
              "task"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "execution_plan_add_task"
            }
          }
        },
        {
          "type": "function",
          "name": "feature_plan_review",
          "description": "Request a review for a feature plan",
          "parameters": {
            "type": "object",
            "properties": {
              "filePath": {
                "type": "string",
                "description": "Path to the plan file"
              },
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [
              "filePath"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "feature_plan_review"
            }
          }
        },
        {
          "type": "function",
          "name": "executionPlan_failTask",
          "description": "Mark an execution-plan task failed after the agent/runtime reports failure.",
          "parameters": {
            "type": "object",
            "properties": {
              "planId": {
                "type": "string",
                "description": "Execution plan ID"
              },
              "explanation": {
                "type": "string",
                "description": "One sentence explanation for the user."
              },
              "taskId": {
                "type": "string",
                "description": "Execution-plan task ID"
              },
              "error": {
                "type": "object",
                "description": "Optional failure payload.",
                "additionalProperties": true
              }
            },
            "required": [
              "planId",
              "taskId"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "executionPlan_failTask"
            }
          }
        },
        {
          "type": "function",
          "name": "execution_plan_fail_task",
          "description": "Mark an execution-plan task failed after the agent/runtime reports failure.",
          "parameters": {
            "type": "object",
            "properties": {
              "planId": {
                "type": "string",
                "description": "Execution plan ID"
              },
              "explanation": {
                "type": "string",
                "description": "One sentence explanation for the user."
              },
              "taskId": {
                "type": "string",
                "description": "Execution-plan task ID"
              },
              "error": {
                "type": "object",
                "description": "Optional failure payload.",
                "additionalProperties": true
              }
            },
            "required": [
              "planId",
              "taskId"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "execution_plan_fail_task"
            }
          }
        },
        {
          "type": "function",
          "name": "executionPlan_completeTask",
          "description": "Mark an execution-plan task complete after the agent/runtime has finished the actual work.",
          "parameters": {
            "type": "object",
            "properties": {
              "planId": {
                "type": "string",
                "description": "Execution plan ID"
              },
              "explanation": {
                "type": "string",
                "description": "One sentence explanation for the user."
              },
              "taskId": {
                "type": "string",
                "description": "Execution-plan task ID"
              },
              "result": {
                "type": "object",
                "description": "Optional completion payload.",
                "additionalProperties": true
              }
            },
            "required": [
              "planId",
              "taskId"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "executionPlan_completeTask"
            }
          }
        },
        {
          "type": "function",
          "name": "execution_plan_complete_task",
          "description": "Mark an execution-plan task complete after the agent/runtime has finished the actual work.",
          "parameters": {
            "type": "object",
            "properties": {
              "planId": {
                "type": "string",
                "description": "Execution plan ID"
              },
              "explanation": {
                "type": "string",
                "description": "One sentence explanation for the user."
              },
              "taskId": {
                "type": "string",
                "description": "Execution-plan task ID"
              },
              "result": {
                "type": "object",
                "description": "Optional completion payload.",
                "additionalProperties": true
              }
            },
            "required": [
              "planId",
              "taskId"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "execution_plan_complete_task"
            }
          }
        },
        {
          "type": "function",
          "name": "executionPlan_getReadiness",
          "description": "Compile an execution plan into scheduler readiness, graph nodes, graph edges, and blocked reasons. This is read-only and does not execute tasks.",
          "parameters": {
            "type": "object",
            "properties": {
              "planId": {
                "type": "string",
                "description": "Execution plan ID"
              },
              "explanation": {
                "type": "string",
                "description": "One sentence explanation for the user."
              }
            },
            "required": [
              "planId"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "executionPlan_getReadiness"
            }
          }
        },
        {
          "type": "function",
          "name": "execution_plan_get_readiness",
          "description": "Compile an execution plan into scheduler readiness, graph nodes, graph edges, and blocked reasons. This is read-only and does not execute tasks.",
          "parameters": {
            "type": "object",
            "properties": {
              "planId": {
                "type": "string",
                "description": "Execution plan ID"
              },
              "explanation": {
                "type": "string",
                "description": "One sentence explanation for the user."
              }
            },
            "required": [
              "planId"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "execution_plan_get_readiness"
            }
          }
        },
        {
          "type": "function",
          "name": "executionPlan_addGroup",
          "description": "Add a structured group item to an execution plan. Supports sequenceGroup, parallelGroup, taskPoolGroup, barrierGroup, manualGateGroup, loopGroup, ifGroup, and waitUntilGroup for scheduler-friendly plan sections. Nested tasks should use { \"type\": \"task\", \"task\": { \"name\": \"...\", \"description\": \"...\" } }. A shorthand tasks array is also accepted and normalized into the correct group collection.",
          "parameters": {
            "type": "object",
            "properties": {
              "planId": {
                "type": "string",
                "description": "Execution plan ID"
              },
              "group": {
                "type": "object",
                "description": "Group to add. New scheduler groups use items. Legacy groups can still use groupItems, loopTasks, ifTasks, or waitTasks. You may also provide a tasks array as shorthand.",
                "properties": {
                  "type": {
                    "type": "string",
                    "enum": [
                      "sequenceGroup",
                      "parallelGroup",
                      "taskPoolGroup",
                      "barrierGroup",
                      "manualGateGroup",
                      "loopGroup",
                      "ifGroup",
                      "waitUntilGroup"
                    ],
                    "description": "Group type"
                  },
                  "name": {
                    "type": "string",
                    "description": "Group name"
                  },
                  "groupId": {
                    "type": "string",
                    "description": "Optional stable group ID. Use this ID later as task.groupId to add tasks into the group."
                  },
                  "groupItems": {
                    "type": "object",
                    "description": "parallelGroup tracks. Example: { \"frontend\": [{ \"type\": \"task\", \"task\": { \"name\": \"Build UI\" } }] }",
                    "additionalProperties": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "additionalProperties": true
                      }
                    }
                  },
                  "items": {
                    "type": "array",
                    "description": "Child task/group list for sequenceGroup, taskPoolGroup, barrierGroup, manualGateGroup, or simple parallelGroup.",
                    "items": {
                      "type": "object",
                      "additionalProperties": true
                    }
                  },
                  "maxConcurrency": {
                    "type": "number",
                    "description": "Maximum child tasks that can be active at once for parallelGroup or taskPoolGroup."
                  },
                  "schedulingPolicy": {
                    "type": "string",
                    "enum": [
                      "fifo",
                      "priority"
                    ],
                    "description": "Optional scheduling policy for taskPoolGroup."
                  },
                  "completionPolicy": {
                    "type": "object",
                    "description": "Optional barrier completion policy, e.g. { \"type\": \"all\" }, { \"type\": \"any\" }, or { \"type\": \"at_least\", \"count\": 2 }.",
                    "additionalProperties": true
                  },
                  "loopTasks": {
                    "type": "array",
                    "description": "loopGroup child items. Each child is a task wrapper or nested group.",
                    "items": {
                      "type": "object",
                      "additionalProperties": true
                    }
                  },
                  "ifTasks": {
                    "type": "array",
                    "description": "ifGroup child items. Each child is a task wrapper or nested group.",
                    "items": {
                      "type": "object",
                      "additionalProperties": true
                    }
                  },
                  "waitSteps": {
                    "type": "array",
                    "description": "waitUntilGroup wait condition/checklist labels.",
                    "items": {
                      "type": "string"
                    }
                  },
                  "waitTasks": {
                    "type": "array",
                    "description": "waitUntilGroup child items. Each child is a task wrapper or nested group.",
                    "items": {
                      "type": "object",
                      "additionalProperties": true
                    }
                  },
                  "tasks": {
                    "type": "array",
                    "description": "Optional shorthand child task/group list. For parallelGroup it is placed in trackName/groupTrackName or parallelTrack1; for other groups it maps to loopTasks/ifTasks/waitTasks.",
                    "items": {
                      "type": "object",
                      "additionalProperties": true
                    }
                  },
                  "trackName": {
                    "type": "string",
                    "description": "Optional parallelGroup track name for tasks shorthand."
                  },
                  "groupTrackName": {
                    "type": "string",
                    "description": "Alias for trackName."
                  },
                  "condition": {
                    "type": "string",
                    "description": "Optional condition for ifGroup or waitUntilGroup."
                  },
                  "iterationListId": {
                    "type": "string",
                    "description": "Optional loopGroup iteration list identifier."
                  }
                },
                "required": [
                  "type"
                ],
                "additionalProperties": true
              },
              "explanation": {
                "type": "string",
                "description": "Explanation"
              }
            },
            "required": [
              "planId",
              "group"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "executionPlan_addGroup"
            }
          }
        },
        {
          "type": "function",
          "name": "execution_plan_add_group",
          "description": "Add a structured group item to an execution plan. Supports sequenceGroup, parallelGroup, taskPoolGroup, barrierGroup, manualGateGroup, loopGroup, ifGroup, and waitUntilGroup for scheduler-friendly plan sections. Nested tasks should use { \"type\": \"task\", \"task\": { \"name\": \"...\", \"description\": \"...\" } }. A shorthand tasks array is also accepted and normalized into the correct group collection.",
          "parameters": {
            "type": "object",
            "properties": {
              "planId": {
                "type": "string",
                "description": "Execution plan ID"
              },
              "group": {
                "type": "object",
                "description": "Group to add. New scheduler groups use items. Legacy groups can still use groupItems, loopTasks, ifTasks, or waitTasks. You may also provide a tasks array as shorthand.",
                "properties": {
                  "type": {
                    "type": "string",
                    "enum": [
                      "sequenceGroup",
                      "parallelGroup",
                      "taskPoolGroup",
                      "barrierGroup",
                      "manualGateGroup",
                      "loopGroup",
                      "ifGroup",
                      "waitUntilGroup"
                    ],
                    "description": "Group type"
                  },
                  "name": {
                    "type": "string",
                    "description": "Group name"
                  },
                  "groupId": {
                    "type": "string",
                    "description": "Optional stable group ID. Use this ID later as task.groupId to add tasks into the group."
                  },
                  "groupItems": {
                    "type": "object",
                    "description": "parallelGroup tracks. Example: { \"frontend\": [{ \"type\": \"task\", \"task\": { \"name\": \"Build UI\" } }] }",
                    "additionalProperties": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "additionalProperties": true
                      }
                    }
                  },
                  "items": {
                    "type": "array",
                    "description": "Child task/group list for sequenceGroup, taskPoolGroup, barrierGroup, manualGateGroup, or simple parallelGroup.",
                    "items": {
                      "type": "object",
                      "additionalProperties": true
                    }
                  },
                  "maxConcurrency": {
                    "type": "number",
                    "description": "Maximum child tasks that can be active at once for parallelGroup or taskPoolGroup."
                  },
                  "schedulingPolicy": {
                    "type": "string",
                    "enum": [
                      "fifo",
                      "priority"
                    ],
                    "description": "Optional scheduling policy for taskPoolGroup."
                  },
                  "completionPolicy": {
                    "type": "object",
                    "description": "Optional barrier completion policy, e.g. { \"type\": \"all\" }, { \"type\": \"any\" }, or { \"type\": \"at_least\", \"count\": 2 }.",
                    "additionalProperties": true
                  },
                  "loopTasks": {
                    "type": "array",
                    "description": "loopGroup child items. Each child is a task wrapper or nested group.",
                    "items": {
                      "type": "object",
                      "additionalProperties": true
                    }
                  },
                  "ifTasks": {
                    "type": "array",
                    "description": "ifGroup child items. Each child is a task wrapper or nested group.",
                    "items": {
                      "type": "object",
                      "additionalProperties": true
                    }
                  },
                  "waitSteps": {
                    "type": "array",
                    "description": "waitUntilGroup wait condition/checklist labels.",
                    "items": {
                      "type": "string"
                    }
                  },
                  "waitTasks": {
                    "type": "array",
                    "description": "waitUntilGroup child items. Each child is a task wrapper or nested group.",
                    "items": {
                      "type": "object",
                      "additionalProperties": true
                    }
                  },
                  "tasks": {
                    "type": "array",
                    "description": "Optional shorthand child task/group list. For parallelGroup it is placed in trackName/groupTrackName or parallelTrack1; for other groups it maps to loopTasks/ifTasks/waitTasks.",
                    "items": {
                      "type": "object",
                      "additionalProperties": true
                    }
                  },
                  "trackName": {
                    "type": "string",
                    "description": "Optional parallelGroup track name for tasks shorthand."
                  },
                  "groupTrackName": {
                    "type": "string",
                    "description": "Alias for trackName."
                  },
                  "condition": {
                    "type": "string",
                    "description": "Optional condition for ifGroup or waitUntilGroup."
                  },
                  "iterationListId": {
                    "type": "string",
                    "description": "Optional loopGroup iteration list identifier."
                  }
                },
                "required": [
                  "type"
                ],
                "additionalProperties": true
              },
              "explanation": {
                "type": "string",
                "description": "Explanation"
              }
            },
            "required": [
              "planId",
              "group"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "execution_plan_add_group"
            }
          }
        },
        {
          "type": "function",
          "name": "executionPlan_startTask",
          "description": "Mark a ready or leased execution-plan task as active. Returns an error if scheduler constraints are not satisfied.",
          "parameters": {
            "type": "object",
            "properties": {
              "planId": {
                "type": "string",
                "description": "Execution plan ID"
              },
              "explanation": {
                "type": "string",
                "description": "One sentence explanation for the user."
              },
              "taskId": {
                "type": "string",
                "description": "Execution-plan task ID"
              },
              "leaseId": {
                "type": "string",
                "description": "Optional lease ID returned by acquireNextTask."
              },
              "agentId": {
                "type": "string",
                "description": "Optional agent ID starting the task."
              }
            },
            "required": [
              "planId",
              "taskId"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "executionPlan_startTask"
            }
          }
        },
        {
          "type": "function",
          "name": "execution_plan_start_task",
          "description": "Mark a ready or leased execution-plan task as active. Returns an error if scheduler constraints are not satisfied.",
          "parameters": {
            "type": "object",
            "properties": {
              "planId": {
                "type": "string",
                "description": "Execution plan ID"
              },
              "explanation": {
                "type": "string",
                "description": "One sentence explanation for the user."
              },
              "taskId": {
                "type": "string",
                "description": "Execution-plan task ID"
              },
              "leaseId": {
                "type": "string",
                "description": "Optional lease ID returned by acquireNextTask."
              },
              "agentId": {
                "type": "string",
                "description": "Optional agent ID starting the task."
              }
            },
            "required": [
              "planId",
              "taskId"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "execution_plan_start_task"
            }
          }
        },
        {
          "type": "function",
          "name": "executionPlan_getReadyTasks",
          "description": "List currently startable execution-plan tasks for an optional agent context. This is read-only and does not reserve tasks.",
          "parameters": {
            "type": "object",
            "properties": {
              "planId": {
                "type": "string",
                "description": "Execution plan ID"
              },
              "explanation": {
                "type": "string",
                "description": "One sentence explanation for the user."
              },
              "agentId": {
                "type": "string",
                "description": "Optional agent ID requesting work."
              },
              "capabilities": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "Optional agent capabilities used to filter ready tasks."
              }
            },
            "required": [
              "planId"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "executionPlan_getReadyTasks"
            }
          }
        }
      ],
      "resources": [],
      "call_id": "call_5168851ac78647f6b114a25b"
    },
    {
      "type": "tool_search_output",
      "execution": "client",
      "status": "completed",
      "tools": [
        {
          "type": "function",
          "name": "update_request_get",
          "description": "Get an update request by ID",
          "parameters": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Update request ID"
              },
              "workspacePath": {
                "type": "string",
                "description": "Optional workspace path"
              },
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [
              "id"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "update_request_get"
            }
          }
        },
        {
          "type": "function",
          "name": "update_request_list",
          "description": "List update requests with optional filters",
          "parameters": {
            "type": "object",
            "properties": {
              "filters": {
                "type": "object",
                "description": "Optional filters",
                "properties": {
                  "status": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    },
                    "description": "Filter by status"
                  },
                  "author": {
                    "type": "string",
                    "description": "Filter by author"
                  },
                  "search": {
                    "type": "string",
                    "description": "Search text"
                  }
                }
              },
              "workspacePath": {
                "type": "string",
                "description": "Optional workspace path"
              },
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "update_request_list"
            }
          }
        },
        {
          "type": "function",
          "name": "update_request_delete",
          "description": "Delete an update request",
          "parameters": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Update request ID"
              },
              "workspacePath": {
                "type": "string",
                "description": "Optional workspace path"
              },
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [
              "id"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "update_request_delete"
            }
          }
        },
        {
          "type": "function",
          "name": "update_request_submit",
          "description": "Submit an update request for review",
          "parameters": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Update request ID"
              },
              "workspacePath": {
                "type": "string",
                "description": "Optional workspace path"
              },
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [
              "id"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "update_request_submit"
            }
          }
        },
        {
          "type": "function",
          "name": "update_request_start_work",
          "description": "Start working on an update request",
          "parameters": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Update request ID"
              },
              "workspacePath": {
                "type": "string",
                "description": "Optional workspace path"
              },
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [
              "id"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "update_request_start_work"
            }
          }
        },
        {
          "type": "function",
          "name": "update_request_complete",
          "description": "Complete work on an update request",
          "parameters": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Update request ID"
              },
              "workspacePath": {
                "type": "string",
                "description": "Optional workspace path"
              },
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [
              "id"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "update_request_complete"
            }
          }
        },
        {
          "type": "function",
          "name": "update_request_merge",
          "description": "Merge an update request into the project structure",
          "parameters": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Update request ID"
              },
              "workspacePath": {
                "type": "string",
                "description": "Optional workspace path"
              },
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [
              "id"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "update_request_merge"
            }
          }
        },
        {
          "type": "function",
          "name": "update_request_unwatch",
          "description": "Stop watching an update request",
          "parameters": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Update request ID"
              },
              "watcherId": {
                "type": "string",
                "description": "Watcher ID to remove"
              },
              "workspacePath": {
                "type": "string",
                "description": "Optional workspace path"
              },
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [
              "id",
              "watcherId"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "update_request_unwatch"
            }
          }
        },
        {
          "type": "function",
          "name": "update_request_watch",
          "description": "Watch an update request for updates",
          "parameters": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Update request ID"
              },
              "watcherId": {
                "type": "string",
                "description": "Watcher ID (agent or user)"
              },
              "watcherType": {
                "type": "string",
                "enum": [
                  "user",
                  "agent"
                ],
                "description": "Type of watcher"
              },
              "workspacePath": {
                "type": "string",
                "description": "Optional workspace path"
              },
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [
              "id",
              "watcherId",
              "watcherType"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "update_request_watch"
            }
          }
        },
        {
          "type": "function",
          "name": "update_request_update",
          "description": "Update an existing update request",
          "parameters": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Update request ID"
              },
              "title": {
                "type": "string",
                "description": "New title"
              },
              "description": {
                "type": "string",
                "description": "New description"
              },
              "changes": {
                "type": "array",
                "description": "Updated changes",
                "items": {
                  "type": "object"
                }
              },
              "workspacePath": {
                "type": "string",
                "description": "Optional workspace path"
              },
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [
              "id"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "update_request_update"
            }
          }
        },
        {
          "type": "function",
          "name": "update_request_resolve_dispute",
          "description": "Resolve a dispute on an update request",
          "parameters": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Update request ID"
              },
              "disputeId": {
                "type": "string",
                "description": "Dispute ID"
              },
              "resolutionSummary": {
                "type": "string",
                "description": "Optional resolution summary"
              },
              "workspacePath": {
                "type": "string",
                "description": "Optional workspace path"
              },
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [
              "id",
              "disputeId"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "update_request_resolve_dispute"
            }
          }
        },
        {
          "type": "function",
          "name": "update_request_create",
          "description": "Create a new project structure update request",
          "parameters": {
            "type": "object",
            "properties": {
              "title": {
                "type": "string",
                "description": "Short title describing the change"
              },
              "description": {
                "type": "string",
                "description": "Detailed description of what and why"
              },
              "author": {
                "type": "string",
                "description": "Who created the request"
              },
              "authorType": {
                "type": "string",
                "enum": [
                  "user",
                  "agent"
                ],
                "description": "Type of author"
              },
              "changes": {
                "type": "array",
                "description": "All changes to be applied",
                "items": {
                  "type": "object"
                }
              },
              "workspacePath": {
                "type": "string",
                "description": "Optional workspace path"
              },
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [
              "title",
              "author",
              "authorType",
              "changes"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "update_request_create"
            }
          }
        },
        {
          "type": "function",
          "name": "update_request_add_dispute",
          "description": "Add a dispute to an update request",
          "parameters": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Update request ID"
              },
              "raisedBy": {
                "type": "string",
                "description": "Who raised the dispute"
              },
              "raisedByType": {
                "type": "string",
                "enum": [
                  "user",
                  "agent"
                ],
                "description": "Type of actor"
              },
              "reason": {
                "type": "string",
                "description": "Reason for the dispute"
              },
              "workspacePath": {
                "type": "string",
                "description": "Optional workspace path"
              },
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [
              "id",
              "raisedBy",
              "raisedByType",
              "reason"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "update_request_add_dispute"
            }
          }
        },
        {
          "type": "function",
          "name": "update_request_add_comment",
          "description": "Add a comment to a dispute on an update request",
          "parameters": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Update request ID"
              },
              "disputeId": {
                "type": "string",
                "description": "Dispute ID"
              },
              "author": {
                "type": "string",
                "description": "Comment author"
              },
              "authorType": {
                "type": "string",
                "enum": [
                  "user",
                  "agent"
                ],
                "description": "Type of author"
              },
              "content": {
                "type": "string",
                "description": "Comment content"
              },
              "workspacePath": {
                "type": "string",
                "description": "Optional workspace path"
              },
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [
              "id",
              "disputeId",
              "author",
              "authorType",
              "content"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "update_request_add_comment"
            }
          }
        },
        {
          "type": "function",
          "name": "reviewMergeRequest_create",
          "description": "Create a new review merge request",
          "parameters": {
            "type": "object",
            "properties": {
              "title": {
                "type": "string",
                "description": "Title"
              },
              "description": {
                "type": "string",
                "description": "Description"
              },
              "sourceBranch": {
                "type": "string",
                "description": "Legacy alias for Git headRef/source branch"
              },
              "targetBranch": {
                "type": "string",
                "description": "Legacy alias for Git baseRef/target branch"
              },
              "authorId": {
                "type": "string",
                "description": "Author ID"
              },
              "swarmId": {
                "type": "string",
                "description": "Swarm ID"
              },
              "sourceType": {
                "type": "string",
                "enum": [
                  "workspace_sync",
                  "git"
                ],
                "description": "RMR source type"
              },
              "majorFilesChanged": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "Changed files"
              },
              "diffPatch": {
                "type": "string",
                "description": "Unified diff or summary patch"
              },
              "repositoryPath": {
                "type": "string",
                "description": "Local Git repository path"
              },
              "repositoryUrl": {
                "type": "string",
                "description": "Git remote URL"
              },
              "baseRef": {
                "type": "string",
                "description": "Git base branch/ref"
              },
              "headRef": {
                "type": "string",
                "description": "Git head branch/ref"
              },
              "headSha": {
                "type": "string",
                "description": "Git head commit SHA"
              },
              "gitTransport": {
                "type": "string",
                "enum": [
                  "local_merge",
                  "github_pr"
                ],
                "description": "Git RMR transport: local merge or upstream GitHub PR"
              },
              "externalPrUrl": {
                "type": "string",
                "description": "External GitHub PR URL"
              },
              "externalPrNumber": {
                "type": "number",
                "description": "External GitHub PR number"
              },
              "checkoutPath": {
                "type": "string",
                "description": "Git checkout path"
              },
              "environmentId": {
                "type": "string",
                "description": "Workspace sync environment id"
              },
              "snapshotId": {
                "type": "string",
                "description": "Workspace sync head snapshot id"
              },
              "baseSnapshotId": {
                "type": "string",
                "description": "Workspace sync base snapshot id"
              },
              "objectiveId": {
                "type": "string",
                "description": "Workspace sync objective id"
              },
              "narrativeThreadId": {
                "type": "string",
                "description": "Narrative sync thread id"
              },
              "agentRunId": {
                "type": "string",
                "description": "Agent run id"
              },
              "mergeConfig": {
                "type": "object",
                "description": "Full mergeConfig override"
              },
              "explanation": {
                "type": "string",
                "description": "Explanation"
              }
            },
            "required": [
              "title",
              "description",
              "authorId"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "reviewMergeRequest_create"
            }
          }
        }
      ],
      "resources": [],
      "call_id": "call_f9ccf3fd3b3d43eaaba5ec39"
    },
    {
      "type": "message",
      "role": "assistant",
      "content": "The generic searches aren't surfacing names. The instructions mention specific named capabilities (`agentfs-provider`, `merge-and-close`) — these are likely ActionBlocks. Let me search for them directly."
    },
    {
      "type": "function_call",
      "call_id": "call_47f0af001fc6456b995e6578",
      "name": "tool_search",
      "arguments": "{\"limit\":10,\"query\":\"agentfs-provider\",\"searchScope\":\"tools+actionBlock\"}"
    },
    {
      "type": "function_call",
      "call_id": "call_af587f8b6b5044d3a84a742e",
      "name": "tool_search",
      "arguments": "{\"limit\":10,\"query\":\"merge-and-close\",\"searchScope\":\"tools+actionBlock\"}"
    },
    {
      "type": "function_call",
      "call_id": "call_d6ec492795d04df4a8d593cd",
      "name": "execute_command",
      "arguments": "{\"command\":\"ls /Users/ravirawat/.codebolt/actionblocks/ 2>/dev/null | head -50\",\"explanation\":\"Listing available Codebolt action blocks\"}"
    },
    {
      "type": "tool_search_output",
      "execution": "client",
      "status": "completed",
      "tools": [
        {
          "type": "function",
          "name": "llm_get_configured_providers",
          "description": "Lists configured LLM providers. By default the response only includes provider id/name/configured. To get live models, pass a provider filter; when provider is provided, the response includes that provider with its live models list. Use this before setting runtime llm provider/model overrides on agent_start, thread_create_start, thread_create_background, capability execution tools, or actionBlock_start.",
          "parameters": {
            "type": "object",
            "properties": {
              "provider": {
                "description": "Optional provider id or name to filter by, for example openai or anthropic. Pass this when you need that provider models list.",
                "type": "string"
              },
              "searchText": {
                "description": "Optional case-insensitive text search. Without provider, searches provider id/name only. With provider, also searches that provider model names.",
                "type": "string"
              },
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "llm_get_configured_providers"
            }
          }
        },
        {
          "type": "function",
          "name": "mail_list_agents",
          "description": "Lists all registered agents in the mail system.",
          "parameters": {
            "type": "object",
            "properties": {
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "mail_list_agents"
            }
          }
        },
        {
          "type": "function",
          "name": "environment_get_runner_providers",
          "description": "Gets available runner environment providers.",
          "parameters": {
            "type": "object",
            "properties": {
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "environment_get_runner_providers"
            }
          }
        },
        {
          "type": "function",
          "name": "environment_get_local_providers",
          "description": "Gets all available local environment providers.",
          "parameters": {
            "type": "object",
            "properties": {
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "environment_get_local_providers"
            }
          }
        },
        {
          "type": "function",
          "name": "environment_get_running_providers",
          "description": "Gets all currently running environment providers.",
          "parameters": {
            "type": "object",
            "properties": {
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "environment_get_running_providers"
            }
          }
        },
        {
          "type": "function",
          "name": "episodic_get_agents",
          "description": "Get unique agent IDs from an episodic memory",
          "parameters": {
            "type": "object",
            "properties": {
              "memoryId": {
                "type": "string",
                "description": "ID of the episodic memory"
              },
              "swarmId": {
                "type": "string",
                "description": "Swarm ID (alternative to memoryId)"
              },
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "episodic_get_agents"
            }
          }
        },
        {
          "type": "function",
          "name": "llm_set_role",
          "description": "Creates or updates a global or agent-specific LLM role mapping. Provider and model default to \"default\" when omitted.",
          "parameters": {
            "type": "object",
            "properties": {
              "scope": {
                "description": "Role scope to update. Defaults to global.",
                "type": "string",
                "enum": [
                  "global",
                  "agent"
                ]
              },
              "agentId": {
                "description": "Agent identifier, title, unique_id, or agent_id. Optional for the current running agent when scope is agent.",
                "type": "string"
              },
              "name": {
                "description": "LLM role name.",
                "type": "string"
              },
              "provider": {
                "description": "LLM provider for this role. Defaults to \"default\".",
                "type": "string"
              },
              "model": {
                "description": "Model name for this role. Defaults to \"default\".",
                "type": "string"
              },
              "embeddingModel": {
                "description": "Optional embedding model associated with this role.",
                "type": "string"
              },
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [
              "name"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "llm_set_role"
            }
          }
        },
        {
          "type": "function",
          "name": "environment_create",
          "description": "Creates an environment only, without starting an agent task or thread. Use this tool only when the user explicitly wants an environment prepared for later use. If the user wants an agent to perform a task in an environment, use thread_create_start directly instead; it can reuse an existing environment or create the required remote environment. Do not call environment_create before thread_create_start for the same task. When a parent agent creates an environment for a child job, the parent owns its lifecycle and must call environment_merge_and_close with the environment ID after the child finishes. The provider must be from the available local or runner providers list.",
          "parameters": {
            "type": "object",
            "properties": {
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              },
              "name": {
                "description": "The name of the environment to create.",
                "type": "string"
              },
              "description": {
                "description": "Optional description of the environment.",
                "type": "string"
              },
              "provider": {
                "description": "Provider configuration object. Must include at least a name or unique_id matching an available local or runner provider.",
                "type": "object"
              },
              "config": {
                "description": "Optional additional configuration.",
                "type": "object"
              }
            },
            "required": [
              "name",
              "provider"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "environment_create"
            }
          }
        },
        {
          "type": "function",
          "name": "autotesting_create_case",
          "description": "Create a new test case from a provider-neutral Testing Plan",
          "parameters": {
            "type": "object",
            "properties": {
              "suiteId": {
                "type": "string",
                "description": "ID of the test suite this case belongs to"
              },
              "suite_id": {
                "type": "string",
                "description": "Legacy alias for suiteId"
              },
              "testingPlan": {
                "type": "object",
                "description": "Provider-neutral Testing Plan object"
              },
              "key": {
                "type": "string",
                "description": "Optional unique key for the test case. Defaults to testingPlan.metadata.id."
              },
              "name": {
                "type": "string",
                "description": "Optional name of the test case. Defaults to testingPlan.metadata.title."
              },
              "labels": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "Labels for the test case"
              },
              "priority": {
                "type": "string",
                "enum": [
                  "low",
                  "medium",
                  "high",
                  "automated"
                ],
                "description": "Priority of the test case"
              },
              "caseType": {
                "type": "string",
                "description": "Type of the test case"
              },
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [
              "testingPlan"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "autotesting_create_case"
            }
          }
        },
        {
          "type": "function",
          "name": "thread_create_start",
          "description": "Creates and immediately starts a new thread for an agent task. Use this tool directly whenever the user wants an agent to perform a task in an environment. To reuse an existing environment, provide environment or environmentId. When a remote environment does not exist yet, set remoteEnv to true and provide environmentProvider so this tool creates it automatically before starting the thread. Do not call environment_create first for the same task. If this tool creates a remote environment for a child job, the parent agent owns its lifecycle and must call environment_merge_and_close with the environment ID after the child finishes.",
          "parameters": {
            "type": "object",
            "properties": {
              "options": {
                "description": "Advanced thread creation and start options. Prefer the top-level task, selectedAgent, environment, and environmentId fields for common use.",
                "type": "object"
              },
              "task": {
                "description": "Task prompt to start the new thread with. This is sent as the thread userMessage.",
                "type": "string"
              },
              "userMessage": {
                "description": "Optional explicit user message to start the thread with. Defaults to task.",
                "type": "string"
              },
              "title": {
                "description": "Optional title of the new thread. Defaults to task.",
                "type": "string"
              },
              "description": {
                "description": "Optional description of the new thread. Defaults to task.",
                "type": "string"
              },
              "selectedAgent": {
                "description": "Optional selected agent id or selected agent object.",
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "object"
                  }
                ]
              },
              "agentId": {
                "description": "Optional agent id.",
                "type": "string"
              },
              "groupId": {
                "description": "Optional group ID for organizing threads.",
                "type": "string"
              },
              "isGrouped": {
                "description": "Whether the thread belongs to a group.",
                "type": "boolean"
              },
              "policyProfileId": {
                "description": "Explicit guardrail policy profile id for this thread.",
                "type": "string"
              },
              "policyProfileName": {
                "description": "Guardrail policy profile name to resolve for this thread, for example \"allow-all\".",
                "type": "string"
              },
              "environment": {
                "description": "Existing environment id or environment object to run the new thread in. When provided, the thread starts in that environment instead of creating a new one.",
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "object"
                  }
                ]
              },
              "environmentId": {
                "description": "Existing environment id to run the new thread in. Alias for environment.",
                "type": "string"
              },
              "remoteEnv": {
                "description": "If true, creates a remote environment and starts the agent there. If false/undefined, runs locally.",
                "type": "boolean"
              },
              "environmentProvider": {
                "description": "The environment provider to use when remoteEnv is true. Object with name, optional unique_id and providerId.",
                "type": "object"
              },
              "environmentName": {
                "description": "Optional custom name for the remote environment.",
                "type": "string"
              },
              "waitForCompletion": {
                "description": "If true, wait for the thread to complete before returning. Defaults to false.",
                "type": "boolean"
              },
              "execution_mode": {
                "description": "Unified task execution mode. Defaults to background_scoped. foreground_scoped and auto_scoped wait boundedly before converting to background_scoped; background_detached survives user force-stop.",
                "enum": [
                  "foreground_scoped",
                  "auto_scoped",
                  "background_scoped",
                  "background_detached"
                ],
                "type": "string"
              },
              "wait_ms": {
                "description": "Milliseconds to wait before returning. foreground_scoped/auto_scoped convert to background_scoped if still running.",
                "type": "number"
              },
              "llm": {
                "description": "Optional runtime LLM override for the started agent/thread. Use llm_get_configured_providers before choosing provider/model.",
                "type": "object",
                "properties": {
                  "provider": {
                    "type": "string"
                  },
                  "model": {
                    "type": "string"
                  },
                  "roleOverrides": {
                    "type": "object",
                    "additionalProperties": {
                      "type": "object",
                      "properties": {
                        "provider": {
                          "type": "string"
                        },
                        "model": {
                          "type": "string"
                        }
                      },
                      "required": [
                        "provider",
                        "model"
                      ]
                    }
                  }
                }
              },
              "contextoverride_id": {
                "description": "Saved context id returned by thread_save_context to use as startup context for the new agent/thread.",
                "type": "string"
              },
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [
              "task"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "thread_create_start"
            }
          }
        }
      ],
      "resources": [],
      "call_id": "call_47f0af001fc6456b995e6578"
    },
    {
      "type": "tool_search_output",
      "execution": "client",
      "status": "completed",
      "tools": [
        {
          "type": "function",
          "name": "environment_merge_and_close",
          "description": "Creates a retained review merge request from a running environment, then closes the environment without merging the request.",
          "parameters": {
            "type": "object",
            "properties": {
              "explanation": {
                "description": "One sentence explaining why the environment changes should be retained and the environment closed.",
                "type": "string"
              },
              "environmentId": {
                "description": "The ID of the running environment.",
                "type": "string"
              }
            },
            "required": [
              "environmentId"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "environment_merge_and_close"
            }
          }
        },
        {
          "type": "function",
          "name": "reviewMergeRequest_update",
          "description": "Update an existing review merge request",
          "parameters": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Request ID"
              },
              "status": {
                "type": "string",
                "description": "New status"
              },
              "title": {
                "type": "string",
                "description": "New title"
              },
              "description": {
                "type": "string",
                "description": "New description"
              },
              "majorFilesChanged": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "Changed files"
              },
              "diffPatch": {
                "type": "string",
                "description": "Unified diff or summary patch"
              },
              "sourceType": {
                "type": "string",
                "enum": [
                  "workspace_sync",
                  "git"
                ],
                "description": "RMR source type"
              },
              "sourceBranch": {
                "type": "string",
                "description": "Legacy alias for Git headRef/source branch"
              },
              "targetBranch": {
                "type": "string",
                "description": "Legacy alias for Git baseRef/target branch"
              },
              "repositoryPath": {
                "type": "string",
                "description": "Local Git repository path"
              },
              "repositoryUrl": {
                "type": "string",
                "description": "Git remote URL"
              },
              "baseRef": {
                "type": "string",
                "description": "Git base branch/ref"
              },
              "headRef": {
                "type": "string",
                "description": "Git head branch/ref"
              },
              "headSha": {
                "type": "string",
                "description": "Git head commit SHA"
              },
              "gitTransport": {
                "type": "string",
                "enum": [
                  "local_merge",
                  "github_pr"
                ],
                "description": "Git RMR transport: local merge or upstream GitHub PR"
              },
              "externalPrUrl": {
                "type": "string",
                "description": "External GitHub PR URL"
              },
              "externalPrNumber": {
                "type": "number",
                "description": "External GitHub PR number"
              },
              "checkoutPath": {
                "type": "string",
                "description": "Git checkout path"
              },
              "mergeConfig": {
                "type": "object",
                "description": "Full mergeConfig override"
              },
              "explanation": {
                "type": "string",
                "description": "Explanation"
              }
            },
            "required": [
              "id"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "reviewMergeRequest_update"
            }
          }
        },
        {
          "type": "function",
          "name": "update_request_merge",
          "description": "Merge an update request into the project structure",
          "parameters": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Update request ID"
              },
              "workspacePath": {
                "type": "string",
                "description": "Optional workspace path"
              },
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [
              "id"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "update_request_merge"
            }
          }
        },
        {
          "type": "function",
          "name": "thread_create_start",
          "description": "Creates and immediately starts a new thread for an agent task. Use this tool directly whenever the user wants an agent to perform a task in an environment. To reuse an existing environment, provide environment or environmentId. When a remote environment does not exist yet, set remoteEnv to true and provide environmentProvider so this tool creates it automatically before starting the thread. Do not call environment_create first for the same task. If this tool creates a remote environment for a child job, the parent agent owns its lifecycle and must call environment_merge_and_close with the environment ID after the child finishes.",
          "parameters": {
            "type": "object",
            "properties": {
              "options": {
                "description": "Advanced thread creation and start options. Prefer the top-level task, selectedAgent, environment, and environmentId fields for common use.",
                "type": "object"
              },
              "task": {
                "description": "Task prompt to start the new thread with. This is sent as the thread userMessage.",
                "type": "string"
              },
              "userMessage": {
                "description": "Optional explicit user message to start the thread with. Defaults to task.",
                "type": "string"
              },
              "title": {
                "description": "Optional title of the new thread. Defaults to task.",
                "type": "string"
              },
              "description": {
                "description": "Optional description of the new thread. Defaults to task.",
                "type": "string"
              },
              "selectedAgent": {
                "description": "Optional selected agent id or selected agent object.",
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "object"
                  }
                ]
              },
              "agentId": {
                "description": "Optional agent id.",
                "type": "string"
              },
              "groupId": {
                "description": "Optional group ID for organizing threads.",
                "type": "string"
              },
              "isGrouped": {
                "description": "Whether the thread belongs to a group.",
                "type": "boolean"
              },
              "policyProfileId": {
                "description": "Explicit guardrail policy profile id for this thread.",
                "type": "string"
              },
              "policyProfileName": {
                "description": "Guardrail policy profile name to resolve for this thread, for example \"allow-all\".",
                "type": "string"
              },
              "environment": {
                "description": "Existing environment id or environment object to run the new thread in. When provided, the thread starts in that environment instead of creating a new one.",
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "object"
                  }
                ]
              },
              "environmentId": {
                "description": "Existing environment id to run the new thread in. Alias for environment.",
                "type": "string"
              },
              "remoteEnv": {
                "description": "If true, creates a remote environment and starts the agent there. If false/undefined, runs locally.",
                "type": "boolean"
              },
              "environmentProvider": {
                "description": "The environment provider to use when remoteEnv is true. Object with name, optional unique_id and providerId.",
                "type": "object"
              },
              "environmentName": {
                "description": "Optional custom name for the remote environment.",
                "type": "string"
              },
              "waitForCompletion": {
                "description": "If true, wait for the thread to complete before returning. Defaults to false.",
                "type": "boolean"
              },
              "execution_mode": {
                "description": "Unified task execution mode. Defaults to background_scoped. foreground_scoped and auto_scoped wait boundedly before converting to background_scoped; background_detached survives user force-stop.",
                "enum": [
                  "foreground_scoped",
                  "auto_scoped",
                  "background_scoped",
                  "background_detached"
                ],
                "type": "string"
              },
              "wait_ms": {
                "description": "Milliseconds to wait before returning. foreground_scoped/auto_scoped convert to background_scoped if still running.",
                "type": "number"
              },
              "llm": {
                "description": "Optional runtime LLM override for the started agent/thread. Use llm_get_configured_providers before choosing provider/model.",
                "type": "object",
                "properties": {
                  "provider": {
                    "type": "string"
                  },
                  "model": {
                    "type": "string"
                  },
                  "roleOverrides": {
                    "type": "object",
                    "additionalProperties": {
                      "type": "object",
                      "properties": {
                        "provider": {
                          "type": "string"
                        },
                        "model": {
                          "type": "string"
                        }
                      },
                      "required": [
                        "provider",
                        "model"
                      ]
                    }
                  }
                }
              },
              "contextoverride_id": {
                "description": "Saved context id returned by thread_save_context to use as startup context for the new agent/thread.",
                "type": "string"
              },
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              }
            },
            "required": [
              "task"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "thread_create_start"
            }
          }
        },
        {
          "type": "function",
          "name": "environment_create",
          "description": "Creates an environment only, without starting an agent task or thread. Use this tool only when the user explicitly wants an environment prepared for later use. If the user wants an agent to perform a task in an environment, use thread_create_start directly instead; it can reuse an existing environment or create the required remote environment. Do not call environment_create before thread_create_start for the same task. When a parent agent creates an environment for a child job, the parent owns its lifecycle and must call environment_merge_and_close with the environment ID after the child finishes. The provider must be from the available local or runner providers list.",
          "parameters": {
            "type": "object",
            "properties": {
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              },
              "name": {
                "description": "The name of the environment to create.",
                "type": "string"
              },
              "description": {
                "description": "Optional description of the environment.",
                "type": "string"
              },
              "provider": {
                "description": "Provider configuration object. Must include at least a name or unique_id matching an available local or runner provider.",
                "type": "object"
              },
              "config": {
                "description": "Optional additional configuration.",
                "type": "object"
              }
            },
            "required": [
              "name",
              "provider"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "environment_create"
            }
          }
        },
        {
          "type": "function",
          "name": "reviewMergeRequest_addReview",
          "description": "Add review feedback to a review merge request",
          "parameters": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Request ID"
              },
              "reviewerId": {
                "type": "string",
                "description": "Reviewer ID"
              },
              "reviewerName": {
                "type": "string",
                "description": "Reviewer name"
              },
              "status": {
                "type": "string",
                "description": "Review status (approved, changes_requested, etc.)"
              },
              "feedback": {
                "type": "string",
                "description": "Review feedback text"
              },
              "explanation": {
                "type": "string",
                "description": "Explanation"
              }
            },
            "required": [
              "id",
              "reviewerId",
              "reviewerName",
              "status"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "reviewMergeRequest_addReview"
            }
          }
        },
        {
          "type": "function",
          "name": "reviewMergeRequest_addLinkedJob",
          "description": "Add a linked job to a review merge request",
          "parameters": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Request ID"
              },
              "jobId": {
                "type": "string",
                "description": "Job ID to link"
              },
              "explanation": {
                "type": "string",
                "description": "Explanation"
              }
            },
            "required": [
              "id",
              "jobId"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "reviewMergeRequest_addLinkedJob"
            }
          }
        },
        {
          "type": "function",
          "name": "browser_close",
          "description": "Closes the browser page.",
          "parameters": {
            "type": "object",
            "properties": {
              "explanation": {
                "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                "type": "string"
              },
              "instance_id": {
                "description": "Optional browser instance ID for multi-instance support.",
                "type": "string"
              }
            },
            "required": [],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "browser_close"
            }
          }
        },
        {
          "type": "function",
          "name": "reviewMergeRequest_merge",
          "description": "Merge a review merge request",
          "parameters": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Request ID"
              },
              "mergedBy": {
                "type": "string",
                "description": "User merging"
              },
              "explanation": {
                "type": "string",
                "description": "Explanation"
              }
            },
            "required": [
              "id",
              "mergedBy"
            ],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "reviewMergeRequest_merge"
            }
          }
        },
        {
          "type": "function",
          "name": "reviewMergeRequest_readyToMerge",
          "description": "Get review merge requests that are ready to merge",
          "parameters": {
            "type": "object",
            "properties": {
              "explanation": {
                "type": "string",
                "description": "Explanation"
              }
            },
            "required": [],
            "additionalProperties": false
          },
          "kind": "codeboltTool",
          "route": {
            "mode": "runner",
            "runner": "codebolt_tool_execute",
            "fixed": {
              "toolName": "reviewMergeRequest_readyToMerge"
            }
          }
        }
      ],
      "resources": [],
      "call_id": "call_af587f8b6b5044d3a84a742e"
    },
    {
      "type": "function_call_output",
      "call_id": "call_d6ec492795d04df4a8d593cd",
      "output": "Command executed: ls /Users/ravirawat/.codebolt/actionblocks/ 2>/dev/null | head -50\n\nOutput:\nCommand executed.\nOutput:\ncreate-pr",
      "status": "completed"
    },
    {
      "type": "message",
      "role": "assistant",
      "content": "The action-block search didn't surface the named tools, but I can see the environment/thread/RMR tools available to me directly. Let me discover the environment providers (looking for `agentfs`) and inspect the MultiLLM architecture in parallel."
    },
    {
      "type": "function_call",
      "call_id": "call_b3f8a9c0708d42e3946f7867",
      "name": "environment_get_local_providers",
      "arguments": "{\"explanation\":\"Discovering local environment providers to find agentfs\"}"
    },
    {
      "type": "function_call",
      "call_id": "call_c85f984b23044ee7989dcdac",
      "name": "environment_get_runner_providers",
      "arguments": "{\"explanation\":\"Discovering runner environment providers to find agentfs\"}"
    },
    {
      "type": "function_call",
      "call_id": "call_1f6d588f05284d8c92dd7eda",
      "name": "read_file",
      "arguments": "{\"absolute_path\":\"/Users/ravirawat/Documents/codeboltai/multillm/package.json\",\"explanation\":\"Reading package.json to understand build/test tooling\"}"
    },
    {
      "type": "function_call",
      "call_id": "call_8e8970b2418845b0aa9c2598",
      "name": "read_file",
      "arguments": "{\"absolute_path\":\"/Users/ravirawat/Documents/codeboltai/multillm/providers/index.ts\",\"explanation\":\"Reading provider registry to understand registration pattern\"}"
    },
    {
      "type": "function_call_output",
      "call_id": "call_b3f8a9c0708d42e3946f7867",
      "output": "Found 1 local provider(s):\n- agentfs-provider (agentfs-provider)\n",
      "status": "completed"
    },
    {
      "type": "function_call_output",
      "call_id": "call_c85f984b23044ee7989dcdac",
      "output": "Found 0 runner provider(s):\n",
      "status": "completed"
    },
    {
      "type": "function_call_output",
      "call_id": "call_1f6d588f05284d8c92dd7eda",
      "output": "{\n  \"name\": \"@arrowai/multillm\",\n  \"version\": \"1.1.55\",\n  \"main\": \"dist/index.js\",\n  \"module\": \"dist/esm/index.mjs\",\n  \"types\": \"dist/index.d.ts\",\n  \"exports\": {\n    \".\": {\n      \"types\": \"./dist/index.d.ts\",\n      \"import\": \"./dist/esm/index.mjs\",\n      \"require\": \"./dist/index.js\",\n      \"default\": \"./dist/esm/index.mjs\"\n    },\n    \"./types\": {\n      \"types\": \"./dist/types.d.ts\",\n      \"require\": \"./dist/types.js\",\n      \"default\": \"./dist/types.js\"\n    },\n    \"./providers\": {\n      \"types\": \"./dist/providers/index.d.ts\",\n      \"require\": \"./dist/providers/index.js\",\n      \"default\": \"./dist/providers/index.js\"\n    },\n    \"./providers/*\": {\n      \"types\": \"./dist/providers/*/index.d.ts\",\n      \"require\": \"./dist/providers/*/index.js\",\n      \"default\": \"./dist/providers/*/index.js\"\n    },\n    \"./utils/*\": {\n      \"types\": \"./dist/utils/*.d.ts\",\n      \"require\": \"./dist/utils/*.js\",\n      \"default\": \"./dist/utils/*.js\"\n    },\n    \"./ui-stream\": {\n      \"types\": \"./dist/ui-stream/index.d.ts\",\n      \"require\": \"./dist/ui-stream/index.js\",\n      \"default\": \"./dist/ui-stream/index.js\"\n    },\n    \"./ui-stream/*\": {\n      \"types\": \"./dist/ui-stream/*.d.ts\",\n      \"require\": \"./dist/ui-stream/*.js\",\n      \"default\": \"./dist/ui-stream/*.js\"\n    },\n    \"./telemetry\": {\n      \"types\": \"./dist/telemetry/index.d.ts\",\n      \"require\": \"./dist/telemetry/index.js\",\n      \"default\": \"./dist/telemetry/index.js\"\n    },\n    \"./telemetry/*\": {\n      \"types\": \"./dist/telemetry/*.d.ts\",\n      \"require\": \"./dist/telemetry/*.js\",\n      \"default\": \"./dist/telemetry/*.js\"\n    },\n    \"./dist/*\": \"./dist/*\",\n    \"./*\": \"./*\",\n    \"./package.json\": \"./package.json\"\n  },\n  \"scripts\": {\n    \"build\": \"npm run build:cjs && npm run build:esm\",\n    \"build:cjs\": \"tsc\",\n    \"build:esm\": \"esbuild index.ts --bundle --format=esm --platform=neutral --packages=external --target=es2022 --outfile=dist/esm/index.mjs\",\n    \"test\": \"vitest run\",\n    \"test:pollinations\": \"node scripts/test-pollinations.js\",\n    \"test:watch\": \"vitest\",\n    \"test:coverage\": \"vitest run --coverage\"\n  },\n  \"keywords\": [],\n  \"author\": \"\",\n  \"license\": \"ISC\",\n  \"description\": \"\",\n  \"dependencies\": {\n    \"@anthropic-ai/bedrock-sdk\": \"^0.32.0\",\n    \"@anthropic-ai/sdk\": \"^0.110.0\",\n    \"@anthropic-ai/vertex-sdk\": \"^0.19.0\",\n    \"@aws-sdk/client-bedrock-runtime\": \"^3.758.0\",\n    \"@cloudflare/ai\": \"^1.2.2\",\n    \"@google-cloud/vertexai\": \"^1.9.3\",\n    \"@google/generative-ai\": \"^0.18.0\",\n    \"@huggingface/inference\": \"^3.4.1\",\n    \"@mistralai/mistralai\": \"^1.5.0\",\n    \"@octokit/rest\": \"^21.1.1\",\n    \"aws4fetch\": \"^1.0.20\",\n    \"axios\": \"^1.6.8\",\n    \"delay\": \"^6.0.0\",\n    \"groq-sdk\": \"^0.15.0\",\n    \"ollama\": \"^0.5.14\",\n    \"openai\": \"^6.45.0\",\n    \"replicate\": \"^1.0.1\",\n    \"vscode\": \"^1.1.37\"\n  },\n  \"devDependencies\": {\n    \"@types/node\": \"^20.17.19\",\n    \"@vitest/coverage-v8\": \"^1.6.0\",\n    \"esbuild\": \"^0.24.2\",\n    \"typescript\": \"^5.7.3\",\n    \"vitest\": \"^1.6.1\"\n  }\n}\n",
      "status": "completed"
    },
    {
      "type": "function_call_output",
      "call_id": "call_8e8970b2418845b0aa9c2598",
      "output": "export { default as OpenAI } from './openai';\nexport { default as Anthropic } from './anthropic';\nexport { default as HuggingFace } from './huggingface';\nexport { default as Bedrock } from './bedrock';\nexport { default as Gemini } from './gemini';\nexport { default as Groq } from './groq';\nexport { default as Replicate } from './replicate';\nexport { default as Mistral } from './mistral';\nexport { default as Perplexity } from './perplexity';\nexport { default as Grok } from './grok';\nexport { default as Ollama } from './ollama';\nexport { default as LMStudio } from './lmstudio';\nexport { default as CodeBolt } from './codebolt';\nexport { default as OpenRouter } from './openrouter';\nexport { default as Cloudflare } from './cloudflare';\nexport { default as DeepseekAI } from './deepseek';\nexport { default as ZAi } from './zai';",
      "status": "completed"
    },
    {
      "type": "message",
      "role": "assistant",
      "content": "`agentfs-provider` is available. Now let me scope the work: extract the OmniRoute-sourced missing providers, examine the existing provider pattern, and locate the OmniRoute reference implementations."
    },
    {
      "type": "function_call",
      "call_id": "call_c0a6756fbae6493dad76cedb",
      "name": "execute_command",
      "arguments": "{\"command\":\"grep -c \\\"OmniRoute\\\" /Users/ravirawat/Documents/codeboltai/multillm/multillm-missing-adapters-deduped.md && echo \\\"--- OmniRoute providers:\\\" && grep \\\"OmniRoute\\\" /Users/ravirawat/Documents/codeboltai/multillm/multillm-missing-adapters-deduped.md | sed 's/^[- ]*//;s/ (.*//' | tr '\\\\n' ' '\",\"explanation\":\"Counting and extracting OmniRoute-sourced missing providers\"}"
    },
    {
      "type": "function_call",
      "call_id": "call_b24ba8ba5e0a4d3983c529e5",
      "name": "execute_command",
      "arguments": "{\"command\":\"find /Users/ravirawat/Documents/codeboltai/OmniRoute -maxdepth 4 -type d -name \\\"*provider*\\\" 2>/dev/null | grep -v node_modules | head -20\",\"explanation\":\"Locating provider directories in OmniRoute reference\"}"
    },
    {
      "type": "function_call",
      "call_id": "call_3779968a57a34c61b3ff1f46",
      "name": "read_file",
      "arguments": "{\"absolute_path\":\"/Users/ravirawat/Documents/codeboltai/multillm/providers/pollinations/index.ts\",\"explanation\":\"Reading pollinations provider as a simple pattern example\"}"
    },
    {
      "type": "function_call",
      "call_id": "call_29e0d7bc26364c5d864d87f5",
      "name": "read_file",
      "arguments": "{\"absolute_path\":\"/Users/ravirawat/Documents/codeboltai/multillm/index.ts\",\"explanation\":\"Reading main index to understand provider registration\"}"
    },
    {
      "type": "function_call_output",
      "call_id": "call_c0a6756fbae6493dad76cedb",
      "output": "Command executed: grep -c \"OmniRoute\" /Users/ravirawat/Documents/codeboltai/multillm/multillm-missing-adapters-deduped.md && echo \"--- OmniRoute providers:\" && grep \"OmniRoute\" /Users/ravirawat/Documents/codeboltai/multillm/multillm-missing-adapters-deduped.md | sed 's/^[- ]*//;s/ (.*//' | tr '\\n' ' '\n\nOutput:\nCommand executed.\nOutput:\n195--- OmniRoute providers:adapta-web agentrouter agnes agy ai21 aihorde aimlapi ainative aion alibaba ant-ling antigravity api-airforce auggie bai baichuan baidu bailian-coding-plan baseten bazaarlink blackbox bluesminds byteplus bytez cerebras charm-hyper chatgpt-web cheaperinference chenzk chipotle chutes claude cline clinepass cloudflare-ai clova-studio codebuddy-cn codestral codex cohere command-code copilot-m365-web copilot-web coze crof cursor dahl databricks deepinfra devin devin-cli dgrid dify digitalocean dit doubao duckduckgo-web factory featherless-ai felo-web fireworks freeaiapikey freemodel-dev freepik freetheai friendliai g4f-gemini g4f-groq g4f-nvidia g4f-ollama g4f-pollinations galadriel ghe-copilot gigachat github gitlab-duo gitlawb glm grok-cli grok-web hackclub haiper hcnsec heroku huggingchat hyperagent hyperbolic ideogram iflytek inception inference-net inner-ai internlm kenari kie kilo-gateway kilocode kimi kiro lambda-ai leonardo liquid llamagate llm7 lmarena longcat maritalk meta-llama mimocode minimax modal modelscope monsterapi moonshot morph muse-spark-web nanogpt nara navy nebius nlpcloud notion-web nous-research novita nscale nube nvidia ollama-cloud openadapter opencode openvecta orcarouter ovhcloud pioneer plamo poe pollinations predibase promptql publicai puter qianfan qiniu qoder qwen qwen-cloud qwen-cloud-token-plan reka requesty routeway sambanova sarvam scaleway sealion segmind sensenova siliconflow snowflake sparkdesk stability-ai stepfun sumopod suno synthetic t3-web tencent theoldllm together tokenrouter trae typhoon udio uncloseai upstage v0-vercel venice veoaifree-web vercel-ai-gateway vertex volcengine wafer wandb windsurf writer x5lab xai xai-oauth xiaomi-mimo xiaomi-mimo-token-plan yi yuanbao-web zai-web zed-hosted zenmux zenmux-free",
      "status": "completed"
    },
    {
      "type": "function_call_output",
      "call_id": "call_b24ba8ba5e0a4d3983c529e5",
      "output": "Command executed: find /Users/ravirawat/Documents/codeboltai/OmniRoute -maxdepth 4 -type d -name \"*provider*\" 2>/dev/null | grep -v node_modules | head -20\n\nOutput:\nCommand executed.\nOutput:\n/Users/ravirawat/Documents/codeboltai/OmniRoute/@omniroute/opencode-provider\n/Users/ravirawat/Documents/codeboltai/OmniRoute/open-sse/config/providers\n/Users/ravirawat/Documents/codeboltai/OmniRoute/open-sse/handlers/imageGeneration/providers\n/Users/ravirawat/Documents/codeboltai/OmniRoute/open-sse/handlers/videoGeneration/providers\n/Users/ravirawat/Documents/codeboltai/OmniRoute/open-sse/services/tokenRefresh/providers\n/Users/ravirawat/Documents/codeboltai/OmniRoute/tests/unit/dashboard/providers\n/Users/ravirawat/Documents/codeboltai/OmniRoute/tests/snapshots/provider\n/Users/ravirawat/Documents/codeboltai/OmniRoute/docs/providers\n/Users/ravirawat/Documents/codeboltai/OmniRoute/public/providers\n/Users/ravirawat/Documents/codeboltai/OmniRoute/skills/cli-providers\n/Users/ravirawat/Documents/codeboltai/OmniRoute/skills/omni-providers\n/Users/ravirawat/Documents/codeboltai/OmniRoute/.codebolt/providers\n/Users/ravirawat/Documents/codeboltai/OmniRoute/.codebolt/providers/cloudprovider\n/Users/ravirawat/Documents/codeboltai/OmniRoute/src/app/api/provider-nodes\n/Users/ravirawat/Documents/codeboltai/OmniRoute/src/app/api/provider-metrics\n/Users/ravirawat/Documents/codeboltai/OmniRoute/src/app/api/providers\n/Users/ravirawat/Documents/codeboltai/OmniRoute/src/app/api/free-provider-rankings\n/Users/ravirawat/Documents/codeboltai/OmniRoute/src/app/api/provider-models\n/Users/ravirawat/Documents/codeboltai/OmniRoute/src/app/api/provider-stats\n/Users/ravirawat/Documents/codeboltai/OmniRoute/src/shared/constants/providers",
      "status": "completed"
    },
    {
      "type": "function_call_output",
      "call_id": "call_3779968a57a34c61b3ff1f46",
      "output": "import axios from 'axios';\nimport { handleError } from '../../utils/errorHandler';\nimport { modelCache } from '../../utils/cacheManager';\nimport { parseSSEStream, aggregateStreamChunks } from '../../utils/sseParser';\nimport { extractTextContent } from '../../utils/contentTransformer';\nimport { toChatCompletionCompatibleRequest } from '../../utils/chatCompletionsAdapter';\nimport type {\n  BaseProvider,\n  ChatCompletionOptions,\n  ChatCompletionResponse,\n  ChatMessage,\n  StreamChunk,\n  StreamingOptions,\n  ProviderCapabilities,\n  LLMProviderWithStreaming\n} from '../../types';\n\n/**\n * Pollinations provider.\n *\n * Pollinations exposes an OpenAI-compatible chat completions endpoint at\n * https://gen.pollinations.ai/v1/chat/completions. Notable behaviours:\n *\n *  - Anonymous (keyless) requests are allowed. When no apiKey is provided the\n *    request is sent WITHOUT an Authorization header. Premium models (Claude,\n *    Gemini, midijourney) still require a key and return 401 otherwise.\n *  - #3981: `jsonMode=true` is treated as \"the model MUST return JSON\" and the\n *    API rejects (HTTP 400) any request whose messages don't mention \"json\".\n *    We therefore only enable jsonMode when the caller actually requests JSON\n *    output via `response_format.type` of `json_object` or `json_schema`.\n *  - Streaming uses standard SSE (`data:` lines) with `Accept: text/event-stream`.\n */\n\nconst POLLINATIONS_DEFAULT_ENDPOINT = 'https://gen.pollinations.ai/v1';\nconst POLLINATIONS_GET_KEY_URL = 'https://enter.pollinations.ai';\n\n/**\n * Models that require a Pollinations API key. A 401 for one of these is\n * surfaced with actionable guidance pointing the user to get a key.\n */\nconst PREMIUM_MODELS_REQUIRING_KEY = [\n  'claude',\n  'claude-fast',\n  'claude-large',\n  'gemini',\n  'gemini-fast',\n  'midijourney',\n  'midijourney-large'\n];\n\n/**\n * Free models usable without an API key.\n */\nconst FREE_KEYLESS_MODELS = [\n  'openai',\n  'openai-fast',\n  'openai-large',\n  'qwen-coder',\n  'mistral',\n  'deepseek',\n  'grok',\n  'gemini-flash-lite-3.1',\n  'perplexity-fast',\n  'perplexity-reasoning'\n];\n\n/**\n * Known context/output token limits for Pollinations models.\n * These are best-effort values derived from the upstream models backing each\n * Pollinations alias; Pollinations does not document per-alias limits.\n */\nconst POLLINATIONS_MODEL_LIMITS: Record<string, { tokenLimit?: number; maxOutputTokens?: number; supportsTools?: boolean; supportsVision?: boolean; supportsReasoning?: boolean }> = {\n  'openai': { tokenLimit: 128000, maxOutputTokens: 16384, supportsTools: true, supportsVision: true, supportsReasoning: false },\n  'openai-fast': { tokenLimit: 128000, maxOutputTokens: 16384, supportsTools: true, supportsVision: true, supportsReasoning: false },\n  'openai-large': { tokenLimit: 128000, maxOutputTokens: 16384, supportsTools: true, supportsVision: true, supportsReasoning: true },\n  'qwen-coder': { tokenLimit: 131072, maxOutputTokens: 8192, supportsTools: true, supportsVision: false, supportsReasoning: false },\n  'mistral': { tokenLimit: 131072, maxOutputTokens: 8192, supportsTools: true, supportsVision: false, supportsReasoning: false },\n  'deepseek': { tokenLimit: 128000, maxOutputTokens: 8192, supportsTools: true, supportsVision: false, supportsReasoning: true },\n  'grok': { tokenLimit: 131072, maxOutputTokens: 8192, supportsTools: true, supportsVision: false, supportsReasoning: false },\n  'gemini-flash-lite-3.1': { tokenLimit: 1000000, maxOutputTokens: 8192, supportsTools: true, supportsVision: true, supportsReasoning: false },\n  'perplexity-fast': { tokenLimit: 127072, maxOutputTokens: 8192, supportsTools: false, supportsVision: false, supportsReasoning: false },\n  'perplexity-reasoning': { tokenLimit: 127072, maxOutputTokens: 8192, supportsTools: false, supportsVision: false, supportsReasoning: true },\n  'claude': { tokenLimit: 200000, maxOutputTokens: 8192, supportsTools: true, supportsVision: true, supportsReasoning: true },\n  'claude-fast': { tokenLimit: 200000, maxOutputTokens: 8192, supportsTools: true, supportsVision: true, supportsReasoning: true },\n  'claude-large': { tokenLimit: 200000, maxOutputTokens: 8192, supportsTools: true, supportsVision: true, supportsReasoning: true },\n  'gemini': { tokenLimit: 1000000, maxOutputTokens: 8192, supportsTools: true, supportsVision: true, supportsReasoning: true },\n  'gemini-fast': { tokenLimit: 1000000, maxOutputTokens: 8192, supportsTools: true, supportsVision: true, supportsReasoning: true },\n  'midijourney': { tokenLimit: 32768, maxOutputTokens: 4096, supportsTools: false, supportsVision: false, supportsReasoning: false },\n  'midijourney-large': { tokenLimit: 32768, maxOutputTokens: 4096, supportsTools: false, supportsVision: false, supportsReasoning: false }\n};\n\ninterface PollinationsErrorResponse {\n  error: {\n    message: string;\n    type?: string;\n    code?: string;\n  };\n}\n\ninterface PollinationsMessage {\n  role: 'user' | 'assistant' | 'system' | 'tool';\n  content: string;\n  tool_calls?: any[];\n  tool_call_id?: string;\n  name?: string;\n}\n\n/**\n * Transform internal ChatMessage[] into the OpenAI-compatible message shape\n * Pollinations expects. Multimodal content parts are flattened to text via\n * extractTextContent.\n */\nfunction transformMessages(messages: ChatMessage[]): PollinationsMessage[] {\n  return messages.map(message => {\n    if (message.role === 'tool' || message.role === 'function') {\n      return {\n        role: 'tool' as const,\n        content: extractTextContent(message.content),\n        tool_call_id: (message as any).tool_call_id,\n        name: message.name\n      };\n    }\n\n    if (message.role === 'assistant' && message.tool_calls) {\n      return {\n        role: 'assistant' as const,\n        content: extractTextContent(message.content),\n        tool_calls: message.tool_calls\n      };\n    }\n\n    if (message.role === 'system') {\n      return {\n        role: 'system' as const,\n        content: extractTextContent(message.content)\n      };\n    }\n\n    return {\n      role: 'user' as const,\n      content: extractTextContent(message.content)\n    };\n  });\n}\n\n/**\n * Build the request headers for Pollinations.\n * - Content-Type is always application/json.\n * - Authorization Bearer is ONLY attached when an apiKey is present so that\n *   anonymous (keyless) requests work without a header.\n * - Accept: text/event-stream is attached for streaming requests.\n */\nfunction buildHeaders(\n  apiKey: string | null,\n  stream: boolean\n): Record<string, string> {\n  const headers: Record<string, string> = {\n    'Content-Type': 'application/json'\n  };\n\n  if (apiKey) {\n    headers['Authorization'] = `Bearer ${apiKey}`;\n  }\n\n  if (stream) {\n    headers['Accept'] = 'text/event-stream';\n  }\n\n  return headers;\n}\n\n/**\n * Determine whether the request should set jsonMode=true.\n *\n * Pollinations quirk (#3981): jsonMode=true forces the model to return JSON and\n * rejects requests whose messages don't mention \"json\". We therefore only opt\n * in when the caller explicitly asks for JSON via response_format.\n */\nfunction shouldEnableJsonMode(options: ChatCompletionOptions): boolean {\n  const responseFormatType = (options as any).response_format?.type;\n  return responseFormatType === 'json_object' || responseFormatType === 'json_schema';\n}\n\n/**\n * Build the Pollinations-compatible request body from provider options.\n * Normalizes input items/tools via the chat completions adapter, always sets\n * model + stream, and applies the jsonMode quirk.\n */\nfunction buildRequestBody(\n  options: ChatCompletionOptions,\n  modelName: string,\n  stream: boolean\n): Record<string, any> {\n  const compatible = toChatCompletionCompatibleRequest(options);\n  const body: Record<string, any> = {\n    model: modelName,\n    messages: transformMessages(compatible.messages || []),\n    stream\n  };\n\n  if (options.temperature !== undefined) {\n    body.temperature = options.temperature;\n  }\n  if (options.top_p !== undefined) {\n    body.top_p = options.top_p;\n  }\n  if (options.max_tokens !== undefined) {\n    body.max_tokens = options.max_tokens;\n  } else if (options.max_output_tokens !== undefined) {\n    body.max_tokens = options.max_output_tokens;\n  }\n  if (options.stop !== undefined) {\n    body.stop = options.stop;\n  }\n\n  // Tools / tool choice. pollinations is in the usesProviderToolAdapter() list,\n  // so options.tools arrives in raw form; toChatCompletionCompatibleRequest\n  // already normalizes them into OpenAI function-tool shape, which is what the\n  // OpenAI-compatible Pollinations endpoint expects.\n  if (compatible.tools && compatible.tools.length > 0) {\n    body.tools = compatible.tools;\n  }\n  if (compatible.tool_choice !== undefined) {\n    body.tool_choice = compatible.tool_choice;\n  }\n\n  // #3981 jsonMode quirk\n  if (shouldEnableJsonMode(options)) {\n    body.jsonMode = true;\n  }\n\n  return body;\n}\n\n/**\n * Wrap an error with actionable guidance when it is a 401 for a premium model.\n * Mirrors the OmniRoute PollinationsExecutor behaviour.\n */\nfunction enhancePremiumModelError(error: unknown, modelName: string): Error {\n  const status = (error as any)?.response?.status\n    ?? (error as any)?.status\n    ?? (error as any)?.statusCode;\n\n  if (status === 401 && PREMIUM_MODELS_REQUIRING_KEY.includes(modelName)) {\n    return new Error(\n      `Pollinations model \"${modelName}\" requires an API key. ` +\n      `Free keyless models: ${FREE_KEYLESS_MODELS.join(', ')}. ` +\n      `Get a Pollinations API key at ${POLLINATIONS_GET_KEY_URL} and add it in Settings → API Keys.`\n    );\n  }\n\n  return error instanceof Error ? error : new Error(String(error));\n}\n\nclass Pollinations implements LLMProviderWithStreaming {\n  private options: BaseProvider;\n  public model: string | null;\n  public device_map: string | null;\n  public apiKey: string | null;\n  public apiEndpoint: string | null;\n  public provider: 'pollinations';\n\n  constructor(\n    model: string | null = null,\n    device_map: string | null = null,\n    apiKey: string | null = null,\n    apiEndpoint: string | null = null\n  ) {\n    this.model = model || 'openai';\n    this.device_map = device_map;\n    this.apiKey = apiKey;\n    this.apiEndpoint = apiEndpoint ?? POLLINATIONS_DEFAULT_ENDPOINT;\n    this.provider = 'pollinations';\n    this.options = { model, device_map, apiKey, apiEndpoint: this.apiEndpoint };\n  }\n\n  async createCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {\n    try {\n      if (!options.messages || options.messages.length === 0) {\n        throw new Error('Messages array must not be empty');\n      }\n\n      // If streaming with callbacks, delegate to createCompletionStream\n      if (options.stream && (options as StreamingOptions).onChunk) {\n        return this.createCompletionStream(options as StreamingOptions);\n      }\n\n      const modelName = options.model || this.model || 'openai';\n      const body = buildRequestBody(options, modelName, false);\n\n      const response = await axios.post(\n        `${this.apiEndpoint}/chat/completions`,\n        body,\n        {\n          headers: buildHeaders(this.apiKey, false)\n        }\n      );\n\n      const limits = POLLINATIONS_MODEL_LIMITS[modelName];\n      const completionResponse: ChatCompletionResponse = {\n        id: response.data.id,\n        object: 'chat.completion',\n        created: response.data.created,\n        model: response.data.model || modelName,\n        tokenLimit: limits?.tokenLimit,\n        maxOutputTokens: limits?.maxOutputTokens,\n        choices: [{\n          index: 0,\n          message: {\n            role: 'assistant',\n            content: response.data.choices?.[0]?.message?.content,\n            tool_calls: response.data.choices?.[0]?.message?.tool_calls\n          },\n          finish_reason: response.data.choices?.[0]?.finish_reason\n        }],\n        usage: response.data.usage\n      };\n\n      return completionResponse;\n    } catch (error) {\n      const modelName = options.model || this.model || 'openai';\n      throw enhancePremiumModelError(error, modelName);\n    }\n  }\n\n  \n...[truncated 6283 chars for debug payload]",
      "status": "completed"
    },
    {
      "type": "function_call_output",
      "call_id": "call_29e0d7bc26364c5d864d87f5",
      "output": "import type {\n  Provider,\n  SupportedProvider,\n  ProviderConfig,\n  ChatCompletionOptions,\n  ChatCompletionResponse,\n  StreamChunk,\n  StreamingOptions,\n  ProviderCapabilities,\n  LLMProviderWithStreaming,\n  EmbeddingOptions,\n  EmbeddingResponse,\n  ImageGenerationOptions,\n  ImageGenerationResponse,\n  RerankOptions,\n  RerankResponse,\n  TranscriptionOptions,\n  TranscriptionResponse,\n  SpeechOptions,\n  SpeechResponse,\n  MultillmRequest,\n  MultillmResponse\n} from './types';\n\n// Import telemetry classes\nimport { TelemetryCollector } from './telemetry/collector';\nimport { FileExporter, ConsoleExporter, CompositeExporter } from './telemetry/exporters';\nimport type { GenAIProviderName } from './telemetry/types';\n\n// Import content utilities\nimport { extractTextContent } from './utils/contentTransformer';\nimport { normalizeChatCompletionResponse, toChatCompletionCompatibleRequest, toMultillmResponse } from './utils/chatCompletionsAdapter';\n\n// Import retry utility\nimport { withRetry } from './utils/retry';\nimport { attachFullProviderError } from './utils/errors';\n\n// Providers that support streaming\nconst STREAMING_PROVIDERS = new Set<SupportedProvider>([\n  'openai', 'anthropic', 'mistral', 'groq', 'ollama', 'deepseek', 'gemini', 'zai', 'pollinations'\n]);\n\n// Providers that support tools/function calling\nconst TOOL_PROVIDERS = new Set<SupportedProvider>([\n  'openai', 'anthropic', 'mistral', 'groq', 'deepseek', 'gemini', 'pollinations'\n]);\n\n// Providers that support vision/images\nconst VISION_PROVIDERS = new Set<SupportedProvider>([\n  'openai', 'anthropic', 'gemini', 'ollama', 'pollinations'\n]);\n\n// Providers that support embeddings\nconst EMBEDDING_PROVIDERS = new Set<SupportedProvider>([\n  'openai', 'codeboltai', 'mistral', 'ollama', 'zai'\n]);\n\n// Providers that support caching\nconst CACHING_PROVIDERS = new Set<SupportedProvider>([\n  'openai', 'anthropic', 'deepseek', 'gemini'\n]);\n\n// Providers with automatic caching (vs explicit)\nconst AUTOMATIC_CACHING_PROVIDERS = new Set<SupportedProvider>([\n  'openai', 'deepseek'\n]);\n\n// Providers that support image generation\nconst IMAGE_GENERATION_PROVIDERS = new Set<SupportedProvider>([\n  'openai', 'replicate'\n]);\n\n// Providers that support reranking\nconst RERANKING_PROVIDERS = new Set<SupportedProvider>([\n  'codeboltai'\n]);\n\n// Providers that support transcription (speech-to-text)\nconst TRANSCRIPTION_PROVIDERS = new Set<SupportedProvider>([\n  'openai', 'groq'\n]);\n\n// Providers that support speech (text-to-speech)\nconst SPEECH_PROVIDERS = new Set<SupportedProvider>([\n  'openai'\n]);\n\n// Providers that support reasoning models (o1/o3, extended thinking, reasoner)\nconst REASONING_PROVIDERS = new Set<SupportedProvider>([\n  'openai', 'anthropic', 'deepseek', 'pollinations'\n]);\n\n// Providers that support multimodal content (images, files in messages)\nconst MULTIMODAL_PROVIDERS = new Set<SupportedProvider>([\n  'openai', 'anthropic', 'gemini', 'ollama'\n]);\n\n// Import providers\nimport CodeBoltAI from './providers/codebolt/index';\nimport OpenAI from './providers/openai/index';\nimport Anthropic from './providers/anthropic/index';\nimport Perplexity from './providers/perplexity/index';\nimport LMStudio from './providers/lmstudio/index';\nimport MistralAI from './providers/mistral/index';\nimport Gemini from './providers/gemini/index';\nimport Ollama from './providers/ollama/index';\nimport OpenRouter from './providers/openrouter/index';\nimport HuggingFace from './providers/huggingface/index';\nimport Bedrock from './providers/bedrock/index';\nimport CloudflareAI from './providers/cloudflare/index';\nimport Groq from './providers/groq/index';\nimport Grok from './providers/grok/index';\nimport Replicate from './providers/replicate/index';\nimport DeepseekAI from './providers/deepseek/index';\nimport ZAi from './providers/zai/index';\nimport Pollinations from './providers/pollinations/index';\n\nclass Multillm implements LLMProviderWithStreaming {\n  public provider: SupportedProvider;\n  public device_map: string | null;\n  public apiKey: string | null;\n  public model: string | null;\n  public apiEndpoint: string | null;\n  public config: ProviderConfig;\n  private instance: LLMProviderWithStreaming;\n  private telemetryCollector: TelemetryCollector | null = null;\n\n  private usesProviderToolAdapter(): boolean {\n    return this.provider === 'openai'\n      || this.provider === 'anthropic'\n      || this.provider === 'openrouter'\n      || this.provider === 'zai'\n      || this.provider === 'pollinations';\n  }\n\n  private toProviderRequestOptions<T extends ChatCompletionOptions>(options: T): T {\n    const compatible = toChatCompletionCompatibleRequest(options);\n    const providerOptions: ChatCompletionOptions = {\n      ...options,\n      messages: compatible.messages,\n      max_tokens: options.max_tokens ?? options.max_output_tokens,\n    };\n\n    if (!this.usesProviderToolAdapter()) {\n      providerOptions.tools = compatible.tools as any;\n      providerOptions.tool_choice = compatible.tool_choice;\n    }\n\n    return providerOptions as T;\n  }\n\n  constructor(\n    provider: SupportedProvider,\n    model: string | null = null,\n    device_map: string | null = null,\n    apiKey: string | null = null,\n    apiEndpoint: string | null = null,\n    config: ProviderConfig = {}\n  ) {\n    this.provider = provider;\n    this.device_map = device_map;\n    this.apiKey = apiKey;\n    this.model = model;\n    this.apiEndpoint = apiEndpoint;\n    this.config = config;\n\n    // Initialize telemetry if enabled\n    this.initTelemetry();\n\n    switch (this.provider) {\n      case \"codeboltai\": {\n        this.instance = new CodeBoltAI(this.model, this.device_map, this.apiKey, this.apiEndpoint);\n        break;\n      }\n      case \"openai\": {\n        this.instance = new OpenAI(this.model, this.device_map, this.apiKey, this.apiEndpoint);\n        break;\n      }\n      case \"anthropic\": {\n        this.instance = new Anthropic(this.model, this.device_map, this.apiKey, this.apiEndpoint);\n        break;\n      }\n      case \"perplexity\": {\n        this.instance = new Perplexity(this.model, this.device_map, this.apiKey, this.apiEndpoint);\n        break;\n      }\n      case \"lmstudio\": {\n        this.instance = new LMStudio(this.model, this.device_map, this.apiEndpoint);\n        break;\n      }\n      case \"mistral\": {\n        this.instance = new MistralAI(this.model, this.device_map, this.apiKey, this.apiEndpoint);\n        break;\n      }\n      case \"gemini\": {\n        this.instance = new Gemini(this.model, this.device_map, this.apiKey, this.apiEndpoint);\n        break;\n      }\n      case \"ollama\": {\n        this.instance = new Ollama(this.model, this.device_map, this.apiKey, this.apiEndpoint);\n        break;\n      }\n      case \"openrouter\": {\n        this.instance = new OpenRouter(this.model, this.device_map, this.apiKey, this.apiEndpoint);\n        break;\n      }\n      case \"huggingface\": {\n        this.instance = new HuggingFace(this.model, this.device_map, this.apiKey, this.apiEndpoint);\n        break;\n      }\n      case \"grok\": {\n        this.instance = new Grok(this.model, this.device_map, this.apiKey, this.apiEndpoint);\n        break;\n      }\n      case \"replicate\": {\n        this.instance = new Replicate(this.model, this.device_map, this.apiKey, this.apiEndpoint);\n        break;\n      }\n      case \"groq\": {\n        this.instance = new Groq(this.model, this.device_map, this.apiKey, this.apiEndpoint);\n        break;\n      }\n      case \"bedrock\": {\n        this.instance = new Bedrock(this.model, this.device_map, this.apiKey, this.apiEndpoint, this.config.aws);\n        break;\n      }\n      case \"cloudflare\": {\n        this.instance = new CloudflareAI({\n          apiKey: this.apiKey || '',\n          apiEndpoint: this.apiEndpoint || '',\n          model: this.model || '@cf/meta/llama-3.1-8b-instruct'\n        });\n        break;\n      }\n      case \"deepseek\": {\n        this.instance = new DeepseekAI(this.model, this.device_map, this.apiKey, this.apiEndpoint);\n        break;\n      }\n\n      case \"zai\": {\n        this.instance = new ZAi(this.model, this.device_map, this.apiKey, this.apiEndpoint);\n        break;\n      }\n      case \"pollinations\": {\n        this.instance = new Pollinations(this.model, this.device_map, this.apiKey, this.apiEndpoint);\n        break;\n      }\n      default: {\n        console.log(`Unsupported provider: ${this.provider}`);\n        throw new Error(`Unsupported provider: ${this.provider}`);\n      }\n    }\n  }\n\n  /**\n   * Initialize telemetry (enabled by default)\n   */\n  private initTelemetry(): void {\n    const telemetryConfig = this.config.telemetry;\n\n    const hasNodeProcess = typeof process !== 'undefined' && !!process.versions?.node;\n\n    // Telemetry is enabled by default in Node.js unless explicitly disabled.\n    // Edge/browser runtimes must opt in because the default file exporter is Node-only.\n    if (telemetryConfig?.enabled === false || (!hasNodeProcess && telemetryConfig?.enabled !== true)) {\n      return;\n    }\n\n    // Create telemetry collector with sensible defaults\n    this.telemetryCollector = new TelemetryCollector({\n      isEnabled: true,\n      recordInputs: telemetryConfig?.recordInputs ?? true,\n      recordOutputs: telemetryConfig?.recordOutputs ?? true,\n      serviceName: telemetryConfig?.serviceName ?? 'multillm',\n      metadata: telemetryConfig?.metadata\n    });\n\n    // Add exporters based on config\n    const exporters: Array<ConsoleExporter | FileExporter> = [];\n\n    // Console exporter (if requested)\n    if (telemetryConfig?.consoleLog) {\n      exporters.push(new ConsoleExporter({ verbose: telemetryConfig.consoleVerbose ?? false }));\n    }\n\n    // File exporter - only in Node.js, or when a file path is explicitly provided.\n    if (hasNodeProcess || telemetryConfig?.filePath) {\n      exporters.push(new FileExporter({\n        filePath: telemetryConfig?.filePath ?? './llm-telemetry.ndjson',\n        exportOtlp: telemetryConfig?.exportOtlp ?? false\n      }));\n    }\n\n    // Add all exporters\n    if (exporters.length === 0) {\n      this.telemetryCollector = null;\n      return;\n    }\n    if (exporters.length === 1) {\n      this.telemetryCollector.addExporter(exporters[0]);\n    } else {\n      this.telemetryCollector.addExporter(new CompositeExporter(exporters));\n    }\n\n    // Auto-flush on process exit (Node.js only)\n    this.setupAutoFlush();\n  }\n\n  /**\n   * Setup automatic flush on process exit (Node.js environments)\n   */\n  private setupAutoFlush(): void {\n    try {\n      const proc = (typeof process !== 'undefined' ? process : null) as {\n        on?: (event: string, listener: () => void) => void;\n      } | null;\n\n      if (proc?.on) {\n        const collector = this.telemetryCollector;\n        proc.on('beforeExit', () => {\n          collector?.flush().catch(() => { });\n        });\n      }\n    } catch {\n      // Not in Node.js environment, skip auto-flush setup\n    }\n  }\n\n  /**\n   * Create a completion (backward compatible)\n   * Automatically records telemetry if enabled\n   */\n  async createCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {\n    const providerOptions = this.toProviderRequestOptions(options);\n\n    if (!this.telemetryCollector) {\n      try {\n        const response = await withRetry(() => this.instance.createCompletion(providerOptions), { maxRetries: 3 });\n        return normalizeChatCompletionResponse(response);\n      } catch (error) {\n        throw attachFullProviderError(error, this.provider);\n      }\n    }\n\n    const span = this.telemetryCollector.startSpan(\n      'chat',\n      this.provider as GenAIProviderName,\n      this.model || providerOptions.model\n    );\n\n    // Set request parameters\n    if (providerOptions.temperature !== undefined) {\n      span.setRequestParams({ temperature: providerOptions.temperature });\n    }\n    if (providerOptions.max_tokens !== undefined) {\n      span.setRequestParams({ maxTokens: providerOptions.max_tokens });\n    }\n\n    // Record input\n    if (providerOptions.messages?.length) {\n      const lastMessage = providerOptions.mes\n...[truncated 21797 chars for debug payload]",
      "status": "completed"
    }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "attempt_completion",
        "description": "Signals the completion of the task and returns the final result.",
        "parameters": {
          "type": "object",
          "properties": {
            "result": {
              "type": "object",
              "description": "The final result of the task. The structure of this object should match the format specified in the system prompt.",
              "additionalProperties": true
            },
            "explanation": {
              "type": "string",
              "description": "Optional explanation of why the task is receiving this result."
            }
          },
          "required": [
            "result"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "cloud_codebolt_connectors--get_connector_details",
        "description": "Get provider metadata, auth methods, connection status, and available actions for a connector service.",
        "parameters": {
          "type": "object",
          "required": [
            "service"
          ],
          "properties": {
            "service": {
              "type": "string",
              "description": "Connector service id, for example clickup, airtable, or github_app."
            }
          },
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "cloud_codebolt_connectors--list_available_connectors",
        "description": "List connector providers available in the CodeBolt OpenConnector catalog, including auth methods and connection status for the current workspace.",
        "parameters": {
          "type": "object",
          "properties": {
            "search": {
              "type": "string",
              "description": "Optional case-insensitive provider search."
            },
            "category": {
              "type": "string",
              "description": "Optional category filter."
            },
            "connectedOnly": {
              "type": "boolean",
              "description": "Only return connected providers."
            },
            "limit": {
              "type": "number",
              "description": "Maximum providers to return."
            }
          },
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "cloud_codebolt_connectors--list_installed_connectors",
        "description": "List connector providers that are connected and enabled for the current workspace.",
        "parameters": {
          "type": "object",
          "properties": {
            "limit": {
              "type": "number",
              "description": "Maximum providers to return."
            }
          },
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "cloud_codebolt_connectors--request_connector_install",
        "description": "Ask the user to configure a connector in the CodeBolt portal, then wait until they mark setup completed.",
        "parameters": {
          "type": "object",
          "required": [
            "service"
          ],
          "properties": {
            "service": {
              "type": "string",
              "description": "Connector service id."
            },
            "connectionName": {
              "type": "string",
              "description": "Connection name. Defaults to default."
            }
          },
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "cloud_codebolt_connectors--search_available_connectors",
        "description": "Search connector providers that are not necessarily installed, so an agent can identify a needed connector and ask the user to connect it.",
        "parameters": {
          "type": "object",
          "required": [
            "query"
          ],
          "properties": {
            "query": {
              "type": "string",
              "description": "Provider name, service id, category, or description search."
            },
            "limit": {
              "type": "number",
              "description": "Maximum providers to return."
            }
          },
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "edit",
        "description": "Edits a file by replacing specified text with new text. The tool finds all occurrences of 'old_string' in the file and replaces them with 'new_string'. Use this for precise, targeted edits to existing files.",
        "parameters": {
          "type": "object",
          "properties": {
            "explanation": {
              "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
              "type": "string"
            },
            "absolute_path": {
              "description": "The absolute path to the file to edit (e.g., '/home/user/project/file.txt').",
              "type": "string"
            },
            "old_string": {
              "description": "The exact text to find in the file. Must be unique enough to identify the correct location. Include surrounding context if needed for uniqueness.",
              "type": "string"
            },
            "new_string": {
              "description": "The text to replace old_string with. Can be empty to delete the old text.",
              "type": "string"
            },
            "expected_occurrences": {
              "description": "Optional: The expected number of times old_string appears. If specified and the actual count differs, the edit will fail. Use this to ensure you are editing exactly what you intend.",
              "type": "number"
            }
          },
          "required": [
            "absolute_path",
            "old_string",
            "new_string"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "execute_command",
        "description": "Execute a CLI command on the system. Use this when you need to perform system operations or run specific commands to accomplish any step in the user's task. You must tailor your command to the user's system and provide a clear explanation of what the command does. Prefer to execute complex CLI commands over creating executable scripts, as they are more flexible and easier to run. For any interactive command, always pass the --yes flag to automatically confirm prompts.",
        "parameters": {
          "type": "object",
          "properties": {
            "explanation": {
              "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.Use correct tenses: I'll or Let me for future actions, past tense for past actions, present tense for current actions",
              "type": "string"
            },
            "command": {
              "type": "string",
              "description": "The CLI command to execute. This should be valid for the current operating system. For multiline shell constructs, prefer `command_lines` so physical line breaks are preserved."
            },
            "command_lines": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "Physical shell lines for a multiline command. Use this for heredocs, continued pipelines, quoted multiline scripts, and similar shell constructs."
            },
            "execution_mode": {
              "type": "string",
              "enum": [
                "foreground_scoped",
                "auto_scoped",
                "background_scoped",
                "background_detached"
              ],
              "description": "How to manage the command. foreground_scoped waits inline up to a bounded timeout then converts to background_scoped. auto_scoped waits briefly then converts to background_scoped. background_scoped returns a task id quickly and is stopped on user force-stop. background_detached is for intentional services/dev servers that should survive."
            },
            "wait_ms": {
              "type": "number",
              "description": "Milliseconds to wait before returning. foreground_scoped/auto_scoped convert to background_scoped if still running; background modes use this as a startup output capture window."
            }
          },
          "required": [],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "glob",
        "description": "Finds files matching a glob pattern. Use this to locate files by name pattern, extension, or path structure. Supports standard glob syntax like *, **, and {a,b} alternatives.",
        "parameters": {
          "type": "object",
          "properties": {
            "explanation": {
              "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
              "type": "string"
            },
            "pattern": {
              "description": "The glob pattern to match files (e.g., '**/*.ts', 'src/**/*.{js,jsx}', '**/test/*.spec.ts').",
              "type": "string"
            },
            "path": {
              "description": "Optional: The directory to search in. If not specified, searches from the project root.",
              "type": "string"
            }
          },
          "required": [
            "pattern"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "grep",
        "description": "Searches for text patterns in files using grep-like functionality. Supports regex patterns and can filter by file types. Use this to find specific text, function definitions, imports, or any pattern across files.",
        "parameters": {
          "type": "object",
          "properties": {
            "explanation": {
              "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
              "type": "string"
            },
            "path": {
              "description": "The absolute path to search within. Can be a file or directory.",
              "type": "string"
            },
            "pattern": {
              "description": "The text pattern or regex to search for.",
              "type": "string"
            },
            "include": {
              "description": "Glob pattern for files to include (e.g., '*.ts', '*.{js,jsx,ts,tsx}').",
              "type": "string"
            },
            "exclude": {
              "description": "Glob pattern for files/directories to exclude (e.g., 'node_modules/**').",
              "type": "string"
            },
            "case_sensitive": {
              "description": "Whether the search is case sensitive. Defaults to true.",
              "type": "boolean"
            }
          },
          "required": [
            "path",
            "pattern"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "read_file",
        "description": "Reads and returns the content of a specified file. If the file is large, the content will be truncated. The tool's response will clearly indicate if truncation has occurred and will provide details on how to read more of the file using the 'offset' and 'limit' parameters. Handles text files and can read specific line ranges.",
        "parameters": {
          "type": "object",
          "properties": {
            "explanation": {
              "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
              "type": "string"
            },
            "absolute_path": {
              "description": "The absolute path to the file to read (e.g., '/home/user/project/file.txt'). Relative paths are not supported. You must provide an absolute path.",
              "type": "string"
            },
            "offset": {
              "description": "Optional: For text files, the 0-based line number to start reading from. Requires 'limit' to be set. Use for paginating through large files.",
              "type": "number"
            },
            "limit": {
              "description": "Optional: For text files, maximum number of lines to read. Use with 'offset' to paginate through large files. If omitted, reads the entire file (if feasible, up to a default limit).",
              "type": "number"
            }
          },
          "required": [
            "absolute_path"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "read_many_files",
        "description": "Reads multiple files at once based on file paths, directory paths, or glob patterns. Efficiently retrieves content from multiple files in a single operation. Useful for reading related files, getting an overview of a directory's contents, or batch processing.",
        "parameters": {
          "type": "object",
          "properties": {
            "explanation": {
              "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
              "type": "string"
            },
            "paths": {
              "description": "An array of file paths, directory paths, or glob patterns to read (e.g., ['/path/to/file.ts', '/path/to/dir', '**/*.json']).",
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "include": {
              "description": "Optional glob patterns for files to include (e.g., ['*.ts', '*.tsx']).",
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "exclude": {
              "description": "Optional glob patterns for files/directories to exclude (e.g., ['*.test.ts', 'node_modules']).",
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "recursive": {
              "description": "Whether to search recursively through subdirectories. Defaults to true.",
              "type": "boolean"
            },
            "use_default_excludes": {
              "description": "Whether to use default exclusion patterns (node_modules, .git, etc.). Defaults to true.",
              "type": "boolean"
            },
            "max_files": {
              "description": "Maximum number of files to read. Useful for limiting output size.",
              "type": "number"
            },
            "max_total_size": {
              "description": "Maximum total size of content to read in bytes.",
              "type": "number"
            },
            "include_metadata": {
              "description": "Whether to include file metadata (size, etc.) in output.",
              "type": "boolean"
            }
          },
          "required": [
            "paths"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "search_get_first_link",
        "description": "Get first search result link",
        "parameters": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Search query"
            },
            "explanation": {
              "type": "string",
              "description": "Explanation"
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "search_web",
        "description": "Perform a web search",
        "parameters": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Search query"
            },
            "provider": {
              "type": "string",
              "description": "Optional web search provider id"
            },
            "count": {
              "type": "number",
              "description": "Maximum number of results"
            },
            "explanation": {
              "type": "string",
              "description": "Explanation"
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "terminal_get_command_status",
        "description": "Get durable status for a managed terminal command, including final exit state when available.",
        "parameters": {
          "type": "object",
          "properties": {
            "process_id": {
              "type": "number",
              "description": "Process ID returned by execute_command."
            },
            "explanation": {
              "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
              "type": "string"
            }
          },
          "required": [
            "process_id"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "terminal_list_commands",
        "description": "List currently running managed terminal commands.",
        "parameters": {
          "type": "object",
          "properties": {
            "explanation": {
              "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
              "type": "string"
            }
          },
          "required": [],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "terminal_read_command_output",
        "description": "Read captured output for a managed terminal command.",
        "parameters": {
          "type": "object",
          "properties": {
            "process_id": {
              "type": "number",
              "description": "Process ID returned by execute_command."
            },
            "lines": {
              "type": "number",
              "description": "Optional number of trailing lines to return."
            },
            "tail_bytes": {
              "type": "number",
              "description": "Optional number of trailing bytes to inspect."
            },
            "explanation": {
              "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
              "type": "string"
            }
          },
          "required": [
            "process_id"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "terminal_stop_command",
        "description": "Stop a managed terminal command by process ID.",
        "parameters": {
          "type": "object",
          "properties": {
            "process_id": {
              "type": "number",
              "description": "Process ID returned by execute_command."
            },
            "explanation": {
              "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
              "type": "string"
            }
          },
          "required": [
            "process_id"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "terminal_tui",
        "description": "Controls terminal user interfaces through a headless screen model. Supports run, attach, output, screen, type, write, press, resize, search, region, cursor, wait, wheel, sessions_list, sessions_switch, kill, and cleanup.",
        "parameters": {
          "type": "object",
          "properties": {
            "explanation": {
              "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
              "type": "string"
            },
            "action": {
              "description": "TUI action name. Examples: run, attach, screen, type, press, wait, sessions_list, kill.",
              "type": "string"
            },
            "params": {
              "description": "Action-specific parameters. For run use command, args, cwd, env, visible, sessionId, terminalId, cols, rows.",
              "type": "object"
            }
          },
          "required": [
            "action"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "terminal_wait_command",
        "description": "Wait for a managed terminal command to finish, fail, or stop.",
        "parameters": {
          "type": "object",
          "properties": {
            "process_id": {
              "type": "number",
              "description": "Process ID returned by execute_command."
            },
            "timeout_ms": {
              "type": "number",
              "description": "Maximum time to wait in milliseconds."
            },
            "explanation": {
              "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
              "type": "string"
            }
          },
          "required": [
            "process_id"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "tool_search",
        "description": "Searches for available tools by name, description, or functionality using full-text search. Use this to discover which tools are available for a given task.",
        "parameters": {
          "type": "object",
          "properties": {
            "explanation": {
              "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
              "type": "string"
            },
            "query": {
              "description": "The search query to find relevant tools (e.g. \"create environment\", \"read file\", \"git commit\").",
              "type": "string"
            },
            "limit": {
              "description": "Maximum number of results to return (default: 10).",
              "type": "number"
            },
            "kind": {
              "description": "Filter results by exact tool action kind, not namespace: \"read\", \"edit\", \"delete\", \"execute\", \"search\", \"fetch\", \"other\". Use category for browser/git/context/etc.",
              "type": "string"
            },
            "category": {
              "description": "Filter results by exact tool namespace/category, such as \"browser\" for browser_* tools or \"git\" for git_* tools.",
              "type": "string"
            },
            "searchScope": {
              "description": "Search scope mode. Defaults to \"tools\". Use \"tools+resources\" to include ActionBlocks, agents, capabilities, and skills as resources, or use a narrower resource scope.",
              "type": "string",
              "enum": [
                "tools",
                "tools+resources",
                "tools+actionBlock",
                "tools+agent",
                "tools+capability",
                "tools+skill"
              ]
            },
            "runtimeToolSetId": {
              "description": "Optional runtime tool-set id. Defaults to all registered runtime tool sets.",
              "type": "string"
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "web_fetch",
        "description": "Fetch a specific URL and return readable text content. Use this when the user provides a URL or after another tool gives you a source URL.",
        "parameters": {
          "type": "object",
          "properties": {
            "explanation": {
              "type": "string",
              "description": "One sentence explanation of why this URL is being fetched."
            },
            "url": {
              "type": "string",
              "description": "The http or https URL to fetch."
            },
            "prompt": {
              "type": "string",
              "description": "The prompt to run on the fetched content."
            },
            "summarize_by_llm": {
              "type": "boolean",
              "description": "Controls secondary LLM processing. Defaults to true when prompt is present; set false to return raw fetched content."
            },
            "max_chars": {
              "type": "number",
              "description": "Maximum number of content characters to return. Defaults to 100000."
            },
            "timeout_ms": {
              "type": "number",
              "description": "Request timeout in milliseconds. Defaults to 60000."
            },
            "allow_private_network": {
              "type": "boolean",
              "description": "Allow fetching localhost or private network URLs. Defaults to false."
            },
            "follow_redirects": {
              "type": "boolean",
              "description": "Follow same-host redirects. Cross-host redirects are returned for explicit follow-up."
            },
            "upgrade_http": {
              "type": "boolean",
              "description": "Upgrade http URLs to https before fetching. Defaults to true."
            }
          },
          "required": [
            "url",
            "prompt"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "write_file",
        "description": "Creates a new file or overwrites an existing file with the provided content.",
        "parameters": {
          "type": "object",
          "properties": {
            "explanation": {
              "description": "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
              "type": "string"
            },
            "absolute_path": {
              "description": "The absolute path to the file to write (e.g., '/home/user/project/file.txt'). Relative paths are not supported.",
              "type": "string"
            },
            "content": {
              "description": "The content to write to the file.",
              "type": "string"
            }
          },
          "required": [
            "absolute_path",
            "content"
          ],
          "additionalProperties": false
        }
      }
    }
  ],
  "tool_choice": "auto",
  "saveToContext": true,
  "__debugArrayTruncation": {
    "input": "Omitted 74 array items from debug payload"
  }
}
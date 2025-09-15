{
  "model": "gemini-2.5-pro",
  "project": "subtle-plasma-1b54t",
  "user_prompt_id": "e4d4b812-9944-4a8b-9349-a1290f63b337########0",
  "request": {
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "This is the Gemini CLI. We are setting up the context for our chat.\nToday's date is Monday 15 September, 2025 (formatted according to the user's locale).\nMy operating system is: darwin\nI'm currently working in the directory: /Users/utkarshshukla/Codebolt/aci\nHere is the folder structure of the current working directories:\n\nShowing up to 200 items (files + folders). Folders or files indicated with ... contain more items not shown, were ignored, or the display limit (200 items) was reached.\n\n/Users/utkarshshukla/Codebolt/aci/\n├───.gitignore\n├───.pre-commit-config.yaml\n├───.roomodes\n├───CLA.md\n├───CODE_OF_CONDUCT.md\n├───CONTRIBUTING.md\n├───integrations.md\n├───LICENSE\n├───README.md\n├───SECURITY.md\n├───.conductor/...\n├───.crush/\n│   └───logs/\n├───.git/...\n├───.github/\n│   ├───PULL_REQUEST_TEMPLATE.md\n│   ├───ISSUE_TEMPLATE/\n│   │   ├───bug_report.yml\n│   │   ├───feature_request.yml\n│   │   └───integration_request.yml\n│   ├───scripts/\n│   │   ├───integration_detect_changed_files.sh\n│   │   ├───integration_generate_pr_content.sh\n│   │   └───integration_pr_review.py\n│   └───workflows/\n│       ├───backend.yml\n│       ├───devportal.yml\n│       └───integration_code_review.yml\n├───.qoder/\n│   └───quests/\n├───backend/\n│   ├───.dockerignore\n│   ├───.env.example\n│   ├───.gitignore\n│   ├───.prettierrc.json\n│   ├───.python-version\n│   ├───alembic.ini\n│   ├───compose.ci.yml\n│   ├───compose.yml\n│   ├───Dockerfile.runner\n│   ├───Dockerfile.server\n│   ├───pyproject.toml\n│   ├───README.md\n│   ├───uv.lock\n│   ├───.venv/...\n│   ├───aci/\n│   │   ├───__init__.py\n│   │   ├───__pycache__/\n│   │   ├───alembic/\n│   │   ├───cli/\n│   │   ├───common/\n│   │   └───server/\n│   ├───apps/\n│   │   ├───accredible/\n│   │   ├───active_campaign/\n│   │   ├───aero_workflow/\n│   │   ├───agent_mail/\n│   │   ├───agent_secrets_manager/\n│   │   ├───aidbase/\n│   │   ├───airtable/\n│   │   ├───akkio/\n│   │   ├───all_images/\n│   │   ├───anchor_browser/\n│   │   ├───apaleo/\n│   │   ├───api_template/\n│   │   ├───arxiv/\n│   │   ├───asana/\n│   │   ├───baidu_map/\n│   │   ├───baserow/\n│   │   ├───brave_search/\n│   │   ├───breezy/\n│   │   ├───browserbase/\n│   │   ├───cal/\n│   │   ├───calendly/\n│   │   ├───clickup/\n│   │   ├───cloudflare/\n│   │   ├───coda/\n│   │   ├───cognito_forms/\n│   │   ├───coin_gecko/\n│   │   ├───coinmarketcap/\n│   │   ├───daytona/\n│   │   ├───dexscreener/\n│   │   ├───dify/\n│   │   ├───discord/\n│   │   ├───e2b/\n│   │   ├───eleven_labs/\n│   │   ├───etherscan/\n│   │   ├───exa_ai/\n│   │   ├───factorialhr/\n│   │   ├───feishu/\n│   │   ├───figma/\n│   │   ├───firecrawl/\n│   │   ├───fireflies/\n│   │   ├───github/\n│   │   ├───gitlab/\n│   │   ├───gmail/\n│   │   ├───goco/\n│   │   ├───google_analytics_admin/\n│   │   ├───google_calendar/\n│   │   ├───google_docs/\n│   │   ├───google_maps/\n│   │   ├───google_meet/\n│   │   ├───google_sheets/\n│   │   ├───google_tasks/\n│   │   ├───hackernews/\n│   │   ├───holded/\n│   │   ├───jira/\n│   │   ├───lmnt/\n│   │   ├───neon/\n│   │   ├───notion/\n│   │   ├───notte/\n│   │   ├───one_page_crm/\n│   │   ├───one_signal/\n│   │   ├───open_weather_map/\n│   │   ├───paddle/\n│   │   ├───posthog/\n│   │   ├───reddit/\n│   │   ├───replicate/\n│   │   ├───resend/\n│   │   ├───rocketlane/\n│   │   ├───rossum/\n│   │   ├───scrapybara/\n│   │   ├───sendgrid/\n│   │   ├───sentry/\n│   │   ├───serpapi/\n│   │   ├───share_point/\n│   │   ├───slack/\n│   │   ├───solscan/\n│   │   ├───steel/\n│   │   ├───supabase/\n│   │   ├───tavily/\n│   │   ├───tines/\n│   │   ├───typefully/\n│   │   ├───ultra_msg/\n│   │   ├───vercel/\n│   │   ├───wrike/\n│   │   ├───youtube/\n│   │   ├───zenrows/\n│   │   └───zoho_desk/\n│   ├───deployment/\n│   │   ├───app.py\n│   │   ├───cdk.json\n│   │   ├───README.md\n│   │   ├───provision/\n│   │   └───tests/\n│   ├───evals/\n│   │   ├───__init__.py\n│   │   ├───evaluation_pipeline.py\n│   │   ├───intent_prompts.py\n│   │   ├───search_evaluator.py\n│   │   └───synthetic_intent_generator.py\n│   ├───images/\n│   │   └───propelauth-switch-to-local.png\n│   ├───mock/\n│   │   ├───propelauth_fastapi_mock.py\n│   │   └───propelauth_mock_server.py\n│   └───scripts/\n│       ├───create-kms-encryption-key.sh\n│       └───seed_db.sh\n├───frontend/\n│   ├───.env.example\n│   ├───.gitattributes\n│   ├───.gitignore\n│   ├───.prettierignore\n│   ├───.prettierrc\n│   ├───components.json\n│   ├───eslint.config.mjs\n│   ├───next.config.ts\n│   ├───package-lock.json\n│   ├───package.json\n│   ├───postcss.config.mjs\n│   ├───README.md\n│   ├───sentry.client.config.ts\n│   ├───sentry.edge.config.ts\n│   ├───sentry.server.config.ts\n│   ├───sentryoptions.ts\n│   ├───tailwind.config.ts\n│   ├───tsconfig.json\n│   ├───vercel.json\n│   ├───vitest.config.mts\n│   ├───vitest.setup.ts\n│   ├───.next/\n│   │   ├───cache/...\n│   │   ├───server/...\n│   │   ├───static/...\n│   │   └───types/...\n│   ├───node_modules/...\n│   ├───public/\n│   │   ├───aci-architecture-intro.svg\n│   │   ├───aci-dev-full-logo.svg\n│   │   ├───android-chrome-192x192.png\n│   │   ├───android-chrome-512x512.png\n│   │   ├───apple-touch-icon.png\n│   │   ├───favicon-16x16.png\n│   │   ├───favicon-32x32.png\n│   │   ├───favicon-dark.ico\n│   │   ├───favicon-light.ico\n│   │   ├───site.webmanifest\n│   │   ├───...\n│   │   └───...\n│   └───src/\n└───worktrees/"
          }
        ]
      },
      {
        "role": "model",
        "parts": [
          {
            "text": "Got it. Thanks for the context!"
          }
        ]
      },
      {
        "role": "user",
        "parts": [
          {
            "text": "hi"
          }
        ]
      }
    ],
    "systemInstruction": {
      "role": "user",
      "parts": [
        {
          "text": "You are an interactive CLI agent specializing in software engineering tasks. Your primary goal is to help users safely and efficiently, adhering strictly to the following instructions and utilizing your available tools.\n\n# Core Mandates\n\n- **Conventions:** Rigorously adhere to existing project conventions when reading or modifying code. Analyze surrounding code, tests, and configuration first.\n- **Libraries/Frameworks:** NEVER assume a library/framework is available or appropriate. Verify its established usage within the project (check imports, configuration files like 'package.json', 'Cargo.toml', 'requirements.txt', 'build.gradle', etc., or observe neighboring files) before employing it.\n- **Style & Structure:** Mimic the style (formatting, naming), structure, framework choices, typing, and architectural patterns of existing code in the project.\n- **Idiomatic Changes:** When editing, understand the local context (imports, functions/classes) to ensure your changes integrate naturally and idiomatically.\n- **Comments:** Add code comments sparingly. Focus on *why* something is done, especially for complex logic, rather than *what* is done. Only add high-value comments if necessary for clarity or if requested by the user. Do not edit comments that are separate from the code you are changing. *NEVER* talk to the user or describe your changes through comments.\n- **Proactiveness:** Fulfill the user's request thoroughly, including reasonable, directly implied follow-up actions.\n- **Confirm Ambiguity/Expansion:** Do not take significant actions beyond the clear scope of the request without confirming with the user. If asked *how* to do something, explain first, don't just do it.\n- **Explaining Changes:** After completing a code modification or file operation *do not* provide summaries unless asked.\n- **Path Construction:** Before using any file system tool (e.g., read_file' or 'write_file'), you must construct the full absolute path for the file_path argument. Always combine the absolute path of the project's root directory with the file's path relative to the root. For example, if the project root is /path/to/project/ and the file is foo/bar/baz.txt, the final path you must use is /path/to/project/foo/bar/baz.txt. If the user provides a relative path, you must resolve it against the root directory to create an absolute path.\n- **Do Not revert changes:** Do not revert changes to the codebase unless asked to do so by the user. Only revert changes made by you if they have resulted in an error or if the user has explicitly asked you to revert the changes.\n\n# Primary Workflows\n\n## Software Engineering Tasks\nWhen requested to perform tasks like fixing bugs, adding features, refactoring, or explaining code, follow this sequence:\n1. **Understand:** Think about the user's request and the relevant codebase context. Use 'search_file_content' and 'glob' search tools extensively (in parallel if independent) to understand file structures, existing code patterns, and conventions. Use 'read_file' and 'read_many_files' to understand context and validate any assumptions you may have.\n2. **Plan:** Build a coherent and grounded (based on the understanding in step 1) plan for how you intend to resolve the user's task. Share an extremely concise yet clear plan with the user if it would help the user understand your thought process. As part of the plan, you should try to use a self-verification loop by writing unit tests if relevant to the task. Use output logs or debug statements as part of this self verification loop to arrive at a solution.\n3. **Implement:** Use the available tools (e.g., 'replace', 'write_file' 'run_shell_command' ...) to act on the plan, strictly adhering to the project's established conventions (detailed under 'Core Mandates').\n4. **Verify (Tests):** If applicable and feasible, verify the changes using the project's testing procedures. Identify the correct test commands and frameworks by examining 'README' files, build/package configuration (e.g., 'package.json'), or existing test execution patterns. NEVER assume standard test commands.\n5. **Verify (Standards):** VERY IMPORTANT: After making code changes, execute the project-specific build, linting and type-checking commands (e.g., 'tsc', 'npm run lint', 'ruff check .') that you have identified for this project (or obtained from the user). This ensures code quality and adherence to standards. If unsure about these commands, you can ask the user if they'd like you to run them and if so how to.\n\n## New Applications\n\n**Goal:** Autonomously implement and deliver a visually appealing, substantially complete, and functional prototype. Utilize all tools at your disposal to implement the application. Some tools you may especially find useful are 'write_file', 'replace' and 'run_shell_command'.\n\n1. **Understand Requirements:** Analyze the user's request to identify core features, desired user experience (UX), visual aesthetic, application type/platform (web, mobile, desktop, CLI, library, 2D or 3D game), and explicit constraints. If critical information for initial planning is missing or ambiguous, ask concise, targeted clarification questions.\n2. **Propose Plan:** Formulate an internal development plan. Present a clear, concise, high-level summary to the user. This summary must effectively convey the application's type and core purpose, key technologies to be used, main features and how users will interact with them, and the general approach to the visual design and user experience (UX) with the intention of delivering something beautiful, modern, and polished, especially for UI-based applications. For applications requiring visual assets (like games or rich UIs), briefly describe the strategy for sourcing or generating placeholders (e.g., simple geometric shapes, procedurally generated patterns, or open-source assets if feasible and licenses permit) to ensure a visually complete initial prototype. Ensure this information is presented in a structured and easily digestible manner.\n  - When key technologies aren't specified, prefer the following:\n  - **Websites (Frontend):** React (JavaScript/TypeScript) with Bootstrap CSS, incorporating Material Design principles for UI/UX.\n  - **Back-End APIs:** Node.js with Express.js (JavaScript/TypeScript) or Python with FastAPI.\n  - **Full-stack:** Next.js (React/Node.js) using Bootstrap CSS and Material Design principles for the frontend, or Python (Django/Flask) for the backend with a React/Vue.js frontend styled with Bootstrap CSS and Material Design principles.\n  - **CLIs:** Python or Go.\n  - **Mobile App:** Compose Multiplatform (Kotlin Multiplatform) or Flutter (Dart) using Material Design libraries and principles, when sharing code between Android and iOS. Jetpack Compose (Kotlin JVM) with Material Design principles or SwiftUI (Swift) for native apps targeted at either Android or iOS, respectively.\n  - **3d Games:** HTML/CSS/JavaScript with Three.js.\n  - **2d Games:** HTML/CSS/JavaScript.\n3. **User Approval:** Obtain user approval for the proposed plan.\n4. **Implementation:** Autonomously implement each feature and design element per the approved plan utilizing all available tools. When starting ensure you scaffold the application using 'run_shell_command' for commands like 'npm init', 'npx create-react-app'. Aim for full scope completion. Proactively create or source necessary placeholder assets (e.g., images, icons, game sprites, 3D models using basic primitives if complex assets are not generatable) to ensure the application is visually coherent and functional, minimizing reliance on the user to provide these. If the model can generate simple assets (e.g., a uniformly colored square sprite, a simple 3D cube), it should do so. Otherwise, it should clearly indicate what kind of placeholder has been used and, if absolutely necessary, what the user might replace it with. Use placeholders only when essential for progress, intending to replace them with more refined versions or instruct the user on replacement during polishing if generation is not feasible.\n5. **Verify:** Review work against the original request, the approved plan. Fix bugs, deviations, and all placeholders where feasible, or ensure placeholders are visually adequate for a prototype. Ensure styling, interactions, produce a high-quality, functional and beautiful prototype aligned with design goals. Finally, but MOST importantly, build the application and ensure there are no compile errors.\n6. **Solicit Feedback:** If still applicable, provide instructions on how to start the application and request user feedback on the prototype.\n\n# Operational Guidelines\n\n## Tone and Style (CLI Interaction)\n- **Concise & Direct:** Adopt a professional, direct, and concise tone suitable for a CLI environment.\n- **Minimal Output:** Aim for fewer than 3 lines of text output (excluding tool use/code generation) per response whenever practical. Focus strictly on the user's query.\n- **Clarity over Brevity (When Needed):** While conciseness is key, prioritize clarity for essential explanations or when seeking necessary clarification if a request is ambiguous.\n- **No Chitchat:** Avoid conversational filler, preambles (\"Okay, I will now...\"), or postambles (\"I have finished the changes...\"). Get straight to the action or answer.\n- **Formatting:** Use GitHub-flavored Markdown. Responses will be rendered in monospace.\n- **Tools vs. Text:** Use tools for actions, text output *only* for communication. Do not add explanatory comments within tool calls or code blocks unless specifically part of the required code/command itself.\n- **Handling Inability:** If unable/unwilling to fulfill a request, state so briefly (1-2 sentences) without excessive justification. Offer alternatives if appropriate.\n\n## Security and Safety Rules\n- **Explain Critical Commands:** Before executing commands with 'run_shell_command' that modify the file system, codebase, or system state, you *must* provide a brief explanation of the command's purpose and potential impact. Prioritize user understanding and safety. You should not ask permission to use the tool; the user will be presented with a confirmation dialogue upon use (you do not need to tell them this).\n- **Security First:** Always apply security best practices. Never introduce code that exposes, logs, or commits secrets, API keys, or other sensitive information.\n\n## Tool Usage\n- **File Paths:** Always use absolute paths when referring to files with tools like 'read_file' or 'write_file'. Relative paths are not supported. You must provide an absolute path.\n- **Parallelism:** Execute multiple independent tool calls in parallel when feasible (i.e. searching the codebase).\n- **Command Execution:** Use the 'run_shell_command' tool for running shell commands, remembering the safety rule to explain modifying commands first.\n- **Background Processes:** Use background processes (via `&`) for commands that are unlikely to stop on their own, e.g. `node server.js &`. If unsure, ask the user.\n- **Interactive Commands:** Try to avoid shell commands that are likely to require user interaction (e.g. `git rebase -i`). Use non-interactive versions of commands (e.g. `npm init -y` instead of `npm init`) when available, and otherwise remind the user that interactive shell commands are not supported and may cause hangs until canceled by the user.\n- **Remembering Facts:** Use the 'save_memory' tool to remember specific, *user-related* facts or preferences when the user explicitly asks, or when they state a clear, concise piece of information that would help personalize or streamline *your future interactions with them* (e.g., preferred coding style, common project paths they use, personal tool aliases). This tool is for user-specific information that should persist across sessions. Do *not* use it for general project context or information. If unsure whether to save something, you can ask the user, \"Should I remember that for you?\"\n- **Respect User Confirmations:** Most tool calls (also denoted as 'function calls') will first require confirmation from the user, where they will either approve or cancel the function call. If a user cancels a function call, respect their choice and do _not_ try to make the function call again. It is okay to request the tool call again _only_ if the user requests that same tool call on a subsequent prompt. When a user cancels a function call, assume best intentions from the user and consider inquiring if they prefer any alternative paths forward.\n\n## Interaction Details\n- **Help Command:** The user can use '/help' to display help information.\n- **Feedback:** To report a bug or provide feedback, please use the /bug command.\n\n\n# Outside of Sandbox\nYou are running outside of a sandbox container, directly on the user's system. For critical commands that are particularly likely to modify the user's system outside of the project directory or system temp directory, as you explain the command to the user (per the Explain Critical Commands rule above), also remind the user to consider enabling sandboxing.\n\n\n\n# Git Repository\n- The current working (project) directory is being managed by a git repository.\n- When asked to commit changes or prepare a commit, always start by gathering information using shell commands:\n  - `git status` to ensure that all relevant files are tracked and staged, using `git add ...` as needed.\n  - `git diff HEAD` to review all changes (including unstaged changes) to tracked files in work tree since last commit.\n    - `git diff --staged` to review only staged changes when a partial commit makes sense or was requested by the user.\n  - `git log -n 3` to review recent commit messages and match their style (verbosity, formatting, signature line, etc.)\n- Combine shell commands whenever possible to save time/steps, e.g. `git status && git diff HEAD && git log -n 3`.\n- Always propose a draft commit message. Never just ask the user to give you the full commit message.\n- Prefer commit messages that are clear, concise, and focused more on \"why\" and less on \"what\".\n- Keep the user informed and ask for clarification or confirmation where needed.\n- After each commit, confirm that it was successful by running `git status`.\n- If a commit fails, never attempt to work around the issues without being asked to do so.\n- Never push changes to a remote repository without being asked explicitly by the user.\n\n\n# Examples (Illustrating Tone and Workflow)\n<example>\nuser: 1 + 2\nmodel: 3\n</example>\n\n<example>\nuser: is 13 a prime number?\nmodel: true\n</example>\n\n<example>\nuser: list files here.\nmodel: [tool_call: list_directory for path '/path/to/project']\n</example>\n\n<example>\nuser: start the server implemented in server.js\nmodel: [tool_call: run_shell_command for 'node server.js &' because it must run in the background]\n</example>\n\n<example>\nuser: Refactor the auth logic in src/auth.py to use the requests library instead of urllib.\nmodel: Okay, I can refactor 'src/auth.py'.\nFirst, I'll analyze the code and check for a test safety net before planning any changes.\n[tool_call: glob for path 'tests/test_auth.py']\n[tool_call: read_file for absolute_path '/path/to/tests/test_auth.py']\n(After analysis)\nGreat, 'tests/test_auth.py' exists and covers the core authentication logic. With this safety net in place, I can safely plan the refactoring.\nI'll also confirm 'requests' is a dependency.\n[tool_call: read_file for absolute_path '/path/to/requirements.txt']\n(After analysis)\nLooks good, 'requests' is available.\n\nHere's the plan:\n1.  Replace the 'urllib' calls with 'requests'.\n2.  Add proper 'try...except' error handling for the new network calls.\n3.  Remove the old 'urllib' import.\n4.  Run the project's linter and tests to verify the changes.\n\nShould I proceed?\nuser: Yes\nmodel:\n[tool_call: write_file or replace to apply the refactoring to 'src/auth.py']\nRefactoring complete. Running verification...\n[tool_call: run_shell_command for 'ruff check src/auth.py && pytest']\n(After verification passes)\nAll checks passed. This is a stable checkpoint.\nWould you like me to write a commit message and commit these changes?\n</example>\n\n<example>\nuser: Delete the temp directory.\nmodel: I can run `rm -rf /path/to/project/temp`. This will permanently delete the directory and all its contents.\n</example>\n\n<example>\nuser: Write tests for someFile.ts\nmodel:\nOkay, I can write those tests. First, I'll read `someFile.ts` to understand its functionality.\n[tool_call: read_file for absolute_path '/path/to/someFile.ts' or use glob to find `someFile.ts` if its location is unknown]\nNow I'll look for existing or related test files to understand current testing conventions and dependencies.\n[tool_call: read_many_files for paths ['**/*.test.ts', 'src/**/*.spec.ts'] assuming someFile.ts is in the src directory]\n(After reviewing existing tests and the file content)\n[tool_call: write_file to create /path/to/someFile.test.ts with the test code]\nI've written the tests. Now I'll run the project's test command to verify them.\n[tool_call: run_shell_command for 'npm run test']\n</example>\n\n<example>\nuser: How do I update the user's profile information in this system?\nmodel:\nI'm not immediately sure how user profile information is updated. I'll search the codebase for terms like 'UserProfile', 'updateProfile', or 'editUser' to find relevant files or API endpoints.\n[tool_call: search_file_content for pattern 'UserProfile|updateProfile|editUser']\n(After reviewing search results, assuming a relevant file like '/path/to/UserProfileService.java' was found)\nOkay, `/path/to/UserProfileService.java` seems like the most relevant file. I'll read its content to understand how updates are handled.\n[tool_call: read_file for absolute_path '/path/to/UserProfileService.java']\n(After reading the file)\nIt appears the `updateUserProfile` method in `UserProfileService.java` is responsible for this. It expects a user ID and a `UserProfileDTO` object...\n</example>\n\n<example>\nuser: Where are all the 'app.config' files in this project? I need to check their settings.\nmodel:\n[tool_call: glob for pattern '**/app.config']\n(Assuming GlobTool returns a list of paths like ['/path/to/moduleA/app.config', '/path/to/moduleB/app.config'])\nI found the following 'app.config' files:\n- /path/to/moduleA/app.config\n- /path/to/moduleB/app.config\nTo help you check their settings, I can read their contents. Which one would you like to start with, or should I read all of them?\n</example>\n\n# Final Reminder\nYour core function is efficient and safe assistance. Balance extreme conciseness with the crucial need for clarity, especially regarding safety and potential system modifications. Always prioritize user control and project conventions. Never make assumptions about the contents of files; instead use 'read_file' or 'read_many_files' to ensure you aren't making broad assumptions. Finally, you are an agent - please keep going until the user's query is completely resolved."
        }
      ]
    },
    "tools": [
      {
        "functionDeclarations": [
          {
            "name": "list_directory",
            "description": "Lists the names of files and subdirectories directly within a specified directory path. Can optionally ignore entries matching provided glob patterns.",
            "parametersJsonSchema": {
              "properties": {
                "path": {
                  "description": "The absolute path to the directory to list (must be absolute, not relative)",
                  "type": "string"
                },
                "ignore": {
                  "description": "List of glob patterns to ignore",
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                },
                "file_filtering_options": {
                  "description": "Optional: Whether to respect ignore patterns from .gitignore or .geminiignore",
                  "type": "object",
                  "properties": {
                    "respect_git_ignore": {
                      "description": "Optional: Whether to respect .gitignore patterns when listing files. Only available in git repositories. Defaults to true.",
                      "type": "boolean"
                    },
                    "respect_gemini_ignore": {
                      "description": "Optional: Whether to respect .geminiignore patterns when listing files. Defaults to true.",
                      "type": "boolean"
                    }
                  }
                }
              },
              "required": [
                "path"
              ],
              "type": "object"
            }
          },
          {
            "name": "read_file",
            "description": "Reads and returns the content of a specified file. If the file is large, the content will be truncated. The tool's response will clearly indicate if truncation has occurred and will provide details on how to read more of the file using the 'offset' and 'limit' parameters. Handles text, images (PNG, JPG, GIF, WEBP, SVG, BMP), and PDF files. For text files, it can read specific line ranges.",
            "parametersJsonSchema": {
              "properties": {
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
              "type": "object"
            }
          },
          {
            "name": "search_file_content",
            "description": "Searches for a regular expression pattern within the content of files in a specified directory (or current working directory). Can filter files by a glob pattern. Returns the lines containing matches, along with their file paths and line numbers.",
            "parametersJsonSchema": {
              "properties": {
                "pattern": {
                  "description": "The regular expression (regex) pattern to search for within file contents (e.g., 'function\\s+myFunction', 'import\\s+\\{.*\\}\\s+from\\s+.*').",
                  "type": "string"
                },
                "path": {
                  "description": "Optional: The absolute path to the directory to search within. If omitted, searches the current working directory.",
                  "type": "string"
                },
                "include": {
                  "description": "Optional: A glob pattern to filter which files are searched (e.g., '*.js', '*.{ts,tsx}', 'src/**'). If omitted, searches all files (respecting potential global ignores).",
                  "type": "string"
                }
              },
              "required": [
                "pattern"
              ],
              "type": "object"
            }
          },
          {
            "name": "glob",
            "description": "Efficiently finds files matching specific glob patterns (e.g., `src/**/*.ts`, `**/*.md`), returning absolute paths sorted by modification time (newest first). Ideal for quickly locating files based on their name or path structure, especially in large codebases.",
            "parametersJsonSchema": {
              "properties": {
                "pattern": {
                  "description": "The glob pattern to match against (e.g., '**/*.py', 'docs/*.md').",
                  "type": "string"
                },
                "path": {
                  "description": "Optional: The absolute path to the directory to search within. If omitted, searches the root directory.",
                  "type": "string"
                },
                "case_sensitive": {
                  "description": "Optional: Whether the search should be case-sensitive. Defaults to false.",
                  "type": "boolean"
                },
                "respect_git_ignore": {
                  "description": "Optional: Whether to respect .gitignore patterns when finding files. Only available in git repositories. Defaults to true.",
                  "type": "boolean"
                }
              },
              "required": [
                "pattern"
              ],
              "type": "object"
            }
          },
          {
            "name": "replace",
            "description": "Replaces text within a file. By default, replaces a single occurrence, but can replace multiple occurrences when `expected_replacements` is specified. This tool requires providing significant context around the change to ensure precise targeting. Always use the read_file tool to examine the file's current content before attempting a text replacement.\n\n      The user has the ability to modify the `new_string` content. If modified, this will be stated in the response.\n\nExpectation for required parameters:\n1. `file_path` MUST be an absolute path; otherwise an error will be thrown.\n2. `old_string` MUST be the exact literal text to replace (including all whitespace, indentation, newlines, and surrounding code etc.).\n3. `new_string` MUST be the exact literal text to replace `old_string` with (also including all whitespace, indentation, newlines, and surrounding code etc.). Ensure the resulting code is correct and idiomatic.\n4. NEVER escape `old_string` or `new_string`, that would break the exact literal text requirement.\n**Important:** If ANY of the above are not satisfied, the tool will fail. CRITICAL for `old_string`: Must uniquely identify the single instance to change. Include at least 3 lines of context BEFORE and AFTER the target text, matching whitespace and indentation precisely. If this string matches multiple locations, or does not match exactly, the tool will fail.\n**Multiple replacements:** Set `expected_replacements` to the number of occurrences you want to replace. The tool will replace ALL occurrences that match `old_string` exactly. Ensure the number of replacements matches your expectation.",
            "parametersJsonSchema": {
              "properties": {
                "file_path": {
                  "description": "The absolute path to the file to modify. Must start with '/'.",
                  "type": "string"
                },
                "old_string": {
                  "description": "The exact literal text to replace, preferably unescaped. For single replacements (default), include at least 3 lines of context BEFORE and AFTER the target text, matching whitespace and indentation precisely. For multiple replacements, specify expected_replacements parameter. If this string is not the exact literal text (i.e. you escaped it) or does not match exactly, the tool will fail.",
                  "type": "string"
                },
                "new_string": {
                  "description": "The exact literal text to replace `old_string` with, preferably unescaped. Provide the EXACT text. Ensure the resulting code is correct and idiomatic.",
                  "type": "string"
                },
                "expected_replacements": {
                  "type": "number",
                  "description": "Number of replacements expected. Defaults to 1 if not specified. Use when you want to replace multiple occurrences.",
                  "minimum": 1
                }
              },
              "required": [
                "file_path",
                "old_string",
                "new_string"
              ],
              "type": "object"
            }
          },
          {
            "name": "write_file",
            "description": "Writes content to a specified file in the local filesystem.\n\n      The user has the ability to modify `content`. If modified, this will be stated in the response.",
            "parametersJsonSchema": {
              "properties": {
                "file_path": {
                  "description": "The absolute path to the file to write to (e.g., '/home/user/project/file.txt'). Relative paths are not supported.",
                  "type": "string"
                },
                "content": {
                  "description": "The content to write to the file.",
                  "type": "string"
                }
              },
              "required": [
                "file_path",
                "content"
              ],
              "type": "object"
            }
          },
          {
            "name": "web_fetch",
            "description": "Processes content from URL(s), including local and private network addresses (e.g., localhost), embedded in a prompt. Include up to 20 URLs and instructions (e.g., summarize, extract specific data) directly in the 'prompt' parameter.",
            "parametersJsonSchema": {
              "properties": {
                "prompt": {
                  "description": "A comprehensive prompt that includes the URL(s) (up to 20) to fetch and specific instructions on how to process their content (e.g., \"Summarize https://example.com/article and extract key points from https://another.com/data\"). Must contain as least one URL starting with http:// or https://.",
                  "type": "string"
                }
              },
              "required": [
                "prompt"
              ],
              "type": "object"
            }
          },
          {
            "name": "read_many_files",
            "description": "Reads content from multiple files specified by paths or glob patterns within a configured target directory. For text files, it concatenates their content into a single string. It is primarily designed for text-based files. However, it can also process image (e.g., .png, .jpg) and PDF (.pdf) files if their file names or extensions are explicitly included in the 'paths' argument. For these explicitly requested non-text files, their data is read and included in a format suitable for model consumption (e.g., base64 encoded).\n\nThis tool is useful when you need to understand or analyze a collection of files, such as:\n- Getting an overview of a codebase or parts of it (e.g., all TypeScript files in the 'src' directory).\n- Finding where specific functionality is implemented if the user asks broad questions about code.\n- Reviewing documentation files (e.g., all Markdown files in the 'docs' directory).\n- Gathering context from multiple configuration files.\n- When the user asks to \"read all files in X directory\" or \"show me the content of all Y files\".\n\nUse this tool when the user's query implies needing the content of several files simultaneously for context, analysis, or summarization. For text files, it uses default UTF-8 encoding and a '--- {filePath} ---' separator between file contents. The tool inserts a '--- End of content ---' after the last file. Ensure paths are relative to the target directory. Glob patterns like 'src/**/*.js' are supported. Avoid using for single files if a more specific single-file reading tool is available, unless the user specifically requests to process a list containing just one file via this tool. Other binary files (not explicitly requested as image/PDF) are generally skipped. Default excludes apply to common non-text files (except for explicitly requested images/PDFs) and large dependency directories unless 'useDefaultExcludes' is false.",
            "parametersJsonSchema": {
              "type": "object",
              "properties": {
                "paths": {
                  "type": "array",
                  "items": {
                    "type": "string",
                    "minLength": 1
                  },
                  "minItems": 1,
                  "description": "Required. An array of glob patterns or paths relative to the tool's target directory. Examples: ['src/**/*.ts'], ['README.md', 'docs/']"
                },
                "include": {
                  "type": "array",
                  "items": {
                    "type": "string",
                    "minLength": 1
                  },
                  "description": "Optional. Additional glob patterns to include. These are merged with `paths`. Example: \"*.test.ts\" to specifically add test files if they were broadly excluded.",
                  "default": []
                },
                "exclude": {
                  "type": "array",
                  "items": {
                    "type": "string",
                    "minLength": 1
                  },
                  "description": "Optional. Glob patterns for files/directories to exclude. Added to default excludes if useDefaultExcludes is true. Example: \"**/*.log\", \"temp/\"",
                  "default": []
                },
                "recursive": {
                  "type": "boolean",
                  "description": "Optional. Whether to search recursively (primarily controlled by `**` in glob patterns). Defaults to true.",
                  "default": true
                },
                "useDefaultExcludes": {
                  "type": "boolean",
                  "description": "Optional. Whether to apply a list of default exclusion patterns (e.g., node_modules, .git, binary files). Defaults to true.",
                  "default": true
                },
                "file_filtering_options": {
                  "description": "Whether to respect ignore patterns from .gitignore or .geminiignore",
                  "type": "object",
                  "properties": {
                    "respect_git_ignore": {
                      "description": "Optional: Whether to respect .gitignore patterns when listing files. Only available in git repositories. Defaults to true.",
                      "type": "boolean"
                    },
                    "respect_gemini_ignore": {
                      "description": "Optional: Whether to respect .geminiignore patterns when listing files. Defaults to true.",
                      "type": "boolean"
                    }
                  }
                }
              },
              "required": [
                "paths"
              ]
            }
          },
          {
            "name": "run_shell_command",
            "description": "This tool executes a given shell command as `bash -c <command>`. Command can start background processes using `&`. Command is executed as a subprocess that leads its own process group. Command process group can be terminated as `kill -- -PGID` or signaled as `kill -s SIGNAL -- -PGID`.\n\n      The following information is returned:\n\n      Command: Executed command.\n      Directory: Directory (relative to project root) where command was executed, or `(root)`.\n      Stdout: Output on stdout stream. Can be `(empty)` or partial on error and for any unwaited background processes.\n      Stderr: Output on stderr stream. Can be `(empty)` or partial on error and for any unwaited background processes.\n      Error: Error or `(none)` if no error was reported for the subprocess.\n      Exit Code: Exit code or `(none)` if terminated by signal.\n      Signal: Signal number or `(none)` if no signal was received.\n      Background PIDs: List of background processes started or `(none)`.\n      Process Group PGID: Process group started or `(none)`",
            "parametersJsonSchema": {
              "type": "object",
              "properties": {
                "command": {
                  "type": "string",
                  "description": "Exact bash command to execute as `bash -c <command>`"
                },
                "description": {
                  "type": "string",
                  "description": "Brief description of the command for the user. Be specific and concise. Ideally a single sentence. Can be up to 3 sentences for clarity. No line breaks."
                },
                "directory": {
                  "type": "string",
                  "description": "(OPTIONAL) Directory to run the command in, if not the project root directory. Must be relative to the project root directory and must already exist."
                }
              },
              "required": [
                "command"
              ]
            }
          },
          {
            "name": "save_memory",
            "description": "\nSaves a specific piece of information or fact to your long-term memory.\n\nUse this tool:\n\n- When the user explicitly asks you to remember something (e.g., \"Remember that I like pineapple on pizza\", \"Please save this: my cat's name is Whiskers\").\n- When the user states a clear, concise fact about themselves, their preferences, or their environment that seems important for you to retain for future interactions to provide a more personalized and effective assistance.\n\nDo NOT use this tool:\n\n- To remember conversational context that is only relevant for the current session.\n- To save long, complex, or rambling pieces of text. The fact should be relatively short and to the point.\n- If you are unsure whether the information is a fact worth remembering long-term. If in doubt, you can ask the user, \"Should I remember that for you?\"\n\n## Parameters\n\n- `fact` (string, required): The specific fact or piece of information to remember. This should be a clear, self-contained statement. For example, if the user says \"My favorite color is blue\", the fact would be \"My favorite color is blue\".\n",
            "parametersJsonSchema": {
              "type": "object",
              "properties": {
                "fact": {
                  "type": "string",
                  "description": "The specific fact or piece of information to remember. Should be a clear, self-contained statement."
                }
              },
              "required": [
                "fact"
              ]
            }
          },
          {
            "name": "google_web_search",
            "description": "Performs a web search using Google Search (via the Gemini API) and returns the results. This tool is useful for finding information on the internet based on a query.",
            "parametersJsonSchema": {
              "type": "object",
              "properties": {
                "query": {
                  "type": "string",
                  "description": "The search query to find information on the web."
                }
              },
              "required": [
                "query"
              ]
            }
          }
        ]
      }
    ],
    "generationConfig": {
      "temperature": 0,
      "topP": 1,
      "thinkingConfig": {
        "thinkingBudget": -1,
        "includeThoughts": true
      }
    },
    "session_id": "e4d4b812-9944-4a8b-9349-a1290f63b337"
  }
}
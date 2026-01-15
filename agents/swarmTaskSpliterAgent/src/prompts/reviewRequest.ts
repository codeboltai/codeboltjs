export const REVIEW_REQUEST_GENERATION_PROMPT = `
You are an expert AI assistant task with extracting structured information for a Review Merge Request from a conversation history.

Your goal is to analyze the provided conversation history between a User and an Agent and generate a JSON object representing a "Review Merge Request".
This request captures the work done, files changed, and other metadata necessary for a code review process.

### Input Data
You will be provided with:
1. **Conversation History**: A transcript of messages.

### Output Format
You must return ONLY a valid JSON object matching the following structure:

\`\`\`json
{
  "type": "review_merge",
  "title": "A concise and descriptive title of the work done (e.g., 'feat: Add user authentication')",
  "description": "A detailed description of the changes. strict Markdown format supported. Include summary of changes, reasoning, and any important context.",
  "initialTask": "The original task or goal stated by the user at the start.",
  "taskDescription": "A more detailed explanation of what the task entailed.",
  "majorFilesChanged": [
    "path/to/file1.ts",
    "path/to/file2.tsx"
  ],
  "diffPatch": "", 
  "changesFilePath": "",
  "issuesFaced": [
    "List any challenges or blockers encountered during the task"
  ],
  "remainingTasks": [
    "List any pending items or future improvements"
  ],
  "agentId": "swarm-agent", 
  "agentName": "Swarm Agent",
  "swarmId": "",
  "mergeConfig": {
    "strategy": "patch"
  }
}
\`\`\`

### Instructions
1. **Analyze the Conversation**: Read through the messages to understand:
   - What was the initial user request? (Maps to \`initialTask\`)
   - What specific files were modified or created? (Maps to \`majorFilesChanged\`)
   - What logic was implemented? (Maps to \`description\` and \`taskDescription\`)
   - Were there any errors or debugging steps? (Maps to \`issuesFaced\`)
   - Is there anything left to do? (Maps to \`remainingTasks\`)

2. **Title**: Create a Conventional Commits style title (e.g., \`feat: ...\`, \`fix: ...\`, \`refactor: ...\`).

3. **Files**: Extract file paths explicitly mentioned as edited or created.

4. **Diff/Patch**: Leave \`diffPatch\` empty string \`""\` for now, or if a diff is explicitly provided in the chat, use it. Usually it won't be, so empty is fine.

5. **Strict JSON**: Return ONLY the JSON object. No markdown formatting around the JSON (unless requested otherwise, but primarily raw JSON).
`;

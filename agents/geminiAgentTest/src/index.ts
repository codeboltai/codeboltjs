import codebolt from '@codebolt/codeboltjs';
import fs from 'fs'
import {
    InitialPromptGenerator,

    ResponseExecutor
} from '@codebolt/agent/unified'
import { FlatUserMessage } from "@codebolt/types/sdk";
import {
    EnvironmentContextModifier,
    CoreSystemPromptModifier,
    DirectoryContextModifier,
    IdeContextModifier,
    AtFileProcessorModifier,
    ToolInjectionModifier,
    ChatHistoryMessageModifier


} from '@codebolt/agent/processor-pieces';



import { AgentStep } from '@codebolt/agent/unified';
import { AgentStepOutput, ProcessedMessage } from '@codebolt/types/agent';



codebolt.onMessage(async (reqMessage: FlatUserMessage) => {

    try {
        const message = reqMessage.userMessage;

        if (message.startsWith('git ')) {
            codebolt.chat.sendMessage("Running sequential git operations test...", {});

            try {
                // 1. Status
                codebolt.chat.sendMessage("1. Running git status...", {});
                try {
                    const status = await codebolt.git.status();
                    codebolt.chat.sendMessage(`Status Result:\n\`\`\`json\n${JSON.stringify(status, null, 2)}\n\`\`\``, {});
                } catch (e) { codebolt.chat.sendMessage(`Status failed: ${e}`, {}); }

                // 2. Add All
                codebolt.chat.sendMessage("2. Running git add . ...", {});
                try {
                    const add = await codebolt.git.addAll();
                    codebolt.chat.sendMessage(`Add Result:\n\`\`\`json\n${JSON.stringify(add, null, 2)}\n\`\`\``, {});
                } catch (e) { codebolt.chat.sendMessage(`Add failed: ${e}`, {}); }

                // 3. Commit
                codebolt.chat.sendMessage("3. Running git commit...", {});
                try {
                    const commit = await codebolt.git.commit("Automated test commit from agent");
                    codebolt.chat.sendMessage(`Commit Result:\n\`\`\`json\n${JSON.stringify(commit, null, 2)}\n\`\`\``, {});
                } catch (e) { codebolt.chat.sendMessage(`Commit failed: ${e}`, {}); }

                // 4. Push
                codebolt.chat.sendMessage("4. Running git push...", {});
                try {
                    const push = await codebolt.git.push();
                    codebolt.chat.sendMessage(`Push Result:\n\`\`\`json\n${JSON.stringify(push, null, 2)}\n\`\`\``, {});
                } catch (e) { codebolt.chat.sendMessage(`Push failed: ${e}`, {}); }

                // 5. Pull
                codebolt.chat.sendMessage("5. Running git pull...", {});
                try {
                    const pull = await codebolt.git.pull();
                    codebolt.chat.sendMessage(`Pull Result:\n\`\`\`json\n${JSON.stringify(pull, null, 2)}\n\`\`\``, {});
                } catch (e) { codebolt.chat.sendMessage(`Pull failed: ${e}`, {}); }

                // 6. Log
                codebolt.chat.sendMessage("6. Running git log...", {});
                try {
                    const logs = await codebolt.git.logs('.');
                    codebolt.chat.sendMessage(`Log Result:\n\`\`\`json\n${JSON.stringify(logs, null, 2)}\n\`\`\``, {});
                } catch (e) { codebolt.chat.sendMessage(`Log failed: ${e}`, {}); }

               

                codebolt.chat.sendMessage("Sequential git test completed.", {});

            } catch (error) {
                codebolt.chat.sendMessage(`Sequential test encountered a fatal error: ${error}`, {});
            }
            return;
        }

        codebolt.chat.sendMessage("Gemini agent started. Send 'git start' to run sequential tests.", {})







    } catch (error) {

    }
})

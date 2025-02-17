import { UserMessage, UserMessageContent } from "./usermessage";

/**
 * Encapsulates task instructions and their related metadata.
 * Handles loading and processing of task instructions from YAML files.
 */
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

// ... existing imports ...

interface Tools {
    [key: string]: {
        description: string;
        usage: string;
        example?: string;
    };
}



interface TaskData {
    [key: string]: {
        description: string;
        expected_output: string;
    };
}

interface UserMessages {
    type: string;
    text: string;
}

class TaskInstruction {
    tools: Tools;
    userMessages: UserMessageContent[]=[];
    userMessage: UserMessage
    filepath: string;
    refsection: string;

    constructor(tools: Tools = {}, userMessage: UserMessage , filepath: string = "", refsection: string = "") {
        this.tools = tools;
        this.userMessage = userMessage;
        this.filepath = filepath;
        this.refsection = refsection;
    }

    async toPrompt(): Promise<UserMessages[]> {
        try {
            this.userMessages = await this.userMessage.toPrompt();
            const fileContents = fs.readFileSync(path.resolve(this.filepath), 'utf8');
            const data = yaml.load(fileContents) as TaskData;
            const task = data[this.refsection];
            this.userMessages.push({
                type: "text",
                text: `Task Description: ${task.description}\nExpected Output: ${task.expected_output}`
            });
            return this.userMessages;
        } catch (error) {
            console.error(`Error processing task instruction: ${error}`);
            throw error;
        }
    }
}
export { TaskInstruction };

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskInstruction = void 0;
/**
 * Encapsulates task instructions and their related metadata.
 * Handles loading and processing of task instructions from YAML files.
 */
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
/**
 * Class representing a task instruction.
 * Handles loading task data and converting it to prompts.
 */
class TaskInstruction {
    /**
     * Creates a new TaskInstruction instance.
     *
     * @param tools - Tools available for this task
     * @param userMessage - User message containing task instructions
     * @param filepath - Path to the YAML file with task data
     * @param refsection - Section name within the YAML file
     */
    constructor(tools = {}, userMessage, filepath = "", refsection = "") {
        /** Messages from the user for this task */
        this.userMessages = [];
        this.tools = tools;
        this.userMessage = userMessage;
        this.filepath = filepath;
        this.refsection = refsection;
    }
    /**
     * Converts the task instruction to a prompt format.
     * Loads data from YAML file and combines with user message.
     *
     * @returns Promise with an array of user message content blocks
     * @throws Error if there's an issue processing the task instruction
     */
    async toPrompt() {
        try {
            this.userMessages = await this.userMessage.toPrompt();
            const fileContents = fs.readFileSync(path.resolve(this.filepath), 'utf8');
            const data = yaml.load(fileContents);
            const task = data[this.refsection];
            this.userMessages.push({
                type: "text",
                text: `Task Description: ${task.description}\nExpected Output: ${task.expected_output}`
            });
            return this.userMessages;
        }
        catch (error) {
            console.error(`Error processing task instruction: ${error}`);
            throw error;
        }
    }
}
exports.TaskInstruction = TaskInstruction;

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
class TaskInstruction {
    constructor(tools = {}, userMessage, filepath = "", refsection = "") {
        this.userMessages = [];
        this.tools = tools;
        this.userMessage = userMessage;
        this.filepath = filepath;
        this.refsection = refsection;
    }
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

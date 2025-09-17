import { InitialPromptGeneratorInterface } from "@codebolt/types/agent";
import { InitialPromptGenerator } from "../initialPromptGenerator";

/**
 * Utility function to create a basic message processor with default settings
 */
export function createDefaultMessageProcessor(): InitialPromptGeneratorInterface{
    return new InitialPromptGenerator({
        enableLogging: true,
        processors:[],//TODO add some default processors here
        metaData: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        }
    });
}
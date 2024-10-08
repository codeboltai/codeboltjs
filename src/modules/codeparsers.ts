/**
 * A collection of code parser functions.
 */
import CbWS from './websocket';
import { EventEmitter } from 'events';
import { ChatMessage, UserMessage } from '@codebolt/types';

class CustomEventEmitter extends EventEmitter { }

class CbCodeparsers {
    private wsManager: CbWS;
    private ws: any;
    private eventEmitter: CustomEventEmitter;

    constructor(wsManager: CbWS) {
        this.wsManager = wsManager;
        // this.ws = this.wsManager.getWebsocket();
        this.eventEmitter = new CustomEventEmitter();
    }
    /**
     * Retrieves the classes in a given file.
     * @param file The file to parse for classes.
     */
    getClassesInFile= (file: any) => {
        console.log('Code parsers initialized');
    }
    /**
     * Retrieves the functions in a given class within a file.
     * @param file The file containing the class.
     * @param className The name of the class to parse for functions.
     */
    getFunctionsinClass= (file: any, className: any) => {
        console.log('Code parsers initialized');
    }
    /**
     * Generates an Abstract Syntax Tree (AST) for a given file.
     * @param file The file to generate an AST for.
     * @param className The name of the class to focus the AST generation on.
     */
    getAstTreeInFile= (file: any, className: any) => {
        
    }
};

export default CbCodeparsers;

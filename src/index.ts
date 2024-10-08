import CbWS from './modules/websocket';
import WebSocket from 'ws';
import { EventEmitter } from 'events';
import CbChat from './modules/chat';
import Cbfs from './modules/fs';
import Cbllm from './modules/llm';
import Cbterminal from './modules/terminal';
import Cbbrowser from './modules/browser';
import Cbcodeutils from './modules/codeutils';
import Cbdocutils from './modules/docutils';
import Cbcrawler from './modules/crawler';
import Cbsearch from './modules/search';
import Cbknowledge from './modules/knowledge';
import Cbrag from './modules/rag';
import CbCodeparsers from './modules/codeparsers';
import CbOutputparsers from './modules/outputparsers';
import CbProject from './modules/project';
import CbGit from './modules/git';
import CbDbmemory from './modules/dbmemory';
import Cbstate from './modules/state';
import CbTask from './modules/task';
import CbVectorDB from './modules/vectordb';
import CbDebug from './modules/debug'
import CbTokenizer from './modules/tokenizer'
import CbChatSummary from './modules/history'

class Codebolt  { // Extend EventEmitter
    private static instance: Codebolt | null = null;
    private wsManager: CbWS;
    chat: CbChat;
    fs:  Cbfs;
    git:  CbGit;
    llm:  Cbllm;
    browser:  Cbbrowser;
    terminal:  Cbterminal;
    codeutils:  Cbcodeutils;
    docutils:  Cbdocutils;
    crawler:  Cbcrawler;
    search:  Cbsearch;
    knowledge:  Cbknowledge;
    rag:  Cbrag;
    codeparsers:  CbCodeparsers;
    outputparsers:  CbOutputparsers;
    project:  CbProject;
    dbmemory:  CbDbmemory;
    cbstate:  Cbstate;
    taskplaner:  CbTask;
    vectordb:  CbVectorDB;
    debug:  CbDebug;
    tokenizer:  CbTokenizer;
    chatSummary:  CbChatSummary;

    constructor() {
        this.wsManager = new CbWS();
        this.chat = new CbChat(this.wsManager);
        this.fs = new Cbfs(this.wsManager);
        this.git = new CbGit(this.wsManager);
        this.llm = new Cbllm(this.wsManager);
        this.browser = new Cbbrowser(this.wsManager);
        this.terminal = new Cbterminal(this.wsManager);
        this.codeutils = new Cbcodeutils(this.wsManager);
        this.docutils = new Cbdocutils(this.wsManager);
        this.crawler = new Cbcrawler(this.wsManager);
        this.search = new Cbsearch(this.wsManager);
        this.knowledge = new Cbknowledge(this.wsManager);
        this.rag = new Cbrag(this.wsManager);
        this.codeparsers = new CbCodeparsers(this.wsManager);
        this.outputparsers = new CbOutputparsers(this.wsManager);
        this.project = new CbProject(this.wsManager);
        this.dbmemory = new CbDbmemory(this.wsManager);
        this.cbstate = new Cbstate(this.wsManager);
        this.taskplaner = new CbTask(this.wsManager);
        this.vectordb = new CbVectorDB(this.wsManager);
        this.debug = new CbDebug(this.wsManager);
        this.tokenizer = new CbTokenizer(this.wsManager);
        this.chatSummary = new CbChatSummary(this.wsManager);
    }
    
    public static getInstance(): Codebolt {
        if (!Codebolt.instance) {
            Codebolt.instance = new Codebolt();
        }
        return Codebolt.instance;
    }

    async connect() {
        await this.wsManager.connect();
    }

    async disconnect() {
        await this.wsManager.disconnect();
    }

    websocket: WebSocket | null = null;
}

export default Codebolt.getInstance();
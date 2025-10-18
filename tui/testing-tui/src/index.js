#!/usr/bin/env node

import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

// App Params
const DEFAULT_HOST = process.env.AGENT_SERVER_HOST || 'localhost';
const DEFAULT_PORT = process.env.AGENT_SERVER_PORT ? Number(process.env.AGENT_SERVER_PORT) : 3001;
const DEFAULT_PROTOCOL = process.env.AGENT_SERVER_PROTOCOL || 'ws';

// UID
const DEFAULT_TUI_ID = process.env.TUI_ID || `dummytui-${uuidv4()}`;

// ?????
const projectPath = process.env.CURRENT_PROJECT_PATH;
const projectName = process.env.CURRENT_PROJECT_NAME;
const projectType = process.env.CURRENT_PROJECT_TYPE;

const urlParams = new URLSearchParams({
  clientType: 'tui',
  tuiId: DEFAULT_TUI_ID
});

if (projectPath) {
  urlParams.set('currentProject', projectPath);
}

if (projectName) {
  urlParams.set('projectName', projectName);
}

if (projectType) {
  urlParams.set('projectType', projectType);
}

const url = `${DEFAULT_PROTOCOL}://${DEFAULT_HOST}:${DEFAULT_PORT}/?${urlParams.toString()}`;

console.log(`[dummytui] connecting to ${url}`);

const socket = new WebSocket(url, {
  handshakeTimeout: 10000
});

function safeJsonStringify(data) {
  try {
    return JSON.stringify(data);
  } catch (error) {
    return `unable to stringify payload: ${error}`;
  }
}

function sendSampleUserMessage() {
  // const sampleMessage = {
  //   id: uuidv4(),
  //   type: 'messageResponse',
  //   clientId: DEFAULT_TUI_ID,
  //   userMessage: 'Hello from dummy TUI',
  //   currentFile: '',
  //   mentionedFiles: [],
  //   mentionedFullPaths: [],
  //   mentionedMCPs: [],
  //   mentionedFolders: [],
  //   uploadedImages: [],
  //   selectedAgent: {
  //     id: process.env.SELECTED_AGENT_ID || 'c4d3fdb9-cf9e-4f82-8a1d-0160bbfc9ae9',
  //     name: process.env.SELECTED_AGENT_NAME || 'Default Agent',
  //     agentType: 'local-path',
  //     agentDetail:'./../../agents/CliTestAgent/dist'
  //   },
  //   messageId: uuidv4(),
  //   threadId: uuidv4()
  // };
  let messageFromTui = {
    type: 'messageResponse',
    message: {

      userMessage: "Hello from dummy TUI",

      selectedAgent: {
        id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        name: "string", // Get agent name from path/codeboltagent.yaml file key title
        agentType: "local-path",
        agentDetails: "./../../agents/CliTestAgent/dist"
      },
      mentionedFiles: [],
      mentionedFullPaths: [],
      mentionedFolders: [],
      mentionedMCPs: [],
      uploadedImages: [],
      mentionedAgents: [],
      messageId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      threadId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    },
    sender: {
      senderType: "user",
      senderInfo: {
        name: "user",
      }
    },
    templateType: '',
    data: {
      text: ''
    },
    messageId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    timestamp: Date.now().toString(),
  }
  console.log(`[dummytui -> server] ${safeJsonStringify(messageFromTui)}`);
  try {
    socket.send(JSON.stringify(messageFromTui));
  } catch (error) {
    console.error('[dummytui] failed to send sample message', error);
  }
}

socket.on('open', () => {
  console.log('[dummytui] connection established');

  const registrationMessage = {
    id: uuidv4(),
    type: 'register',
    clientType: 'tui',
    clientId: DEFAULT_TUI_ID
  };

  console.log(`[dummytui -> server] ${safeJsonStringify(registrationMessage)}`);

  try {
    socket.send(JSON.stringify(registrationMessage));
  } catch (error) {
    console.error('[dummytui] failed to send registration message', error);
  }

  sendSampleUserMessage();

});

socket.on('message', (data) => {
  let parsed;

  try {
    parsed = JSON.parse(data.toString());
  } catch (error) {
    console.error('[dummytui] failed to parse incoming message', error);
    console.error('[dummytui] raw message:', data.toString());
    return;
  }

  console.log(`[server -> dummytui] ${safeJsonStringify(parsed)}`);
});

socket.on('close', (code, reason) => {
  console.log(`[dummytui] connection closed (code=${code}, reason=${reason.toString() || 'n/a'})`);

});

socket.on('error', (error) => {
  console.error('[dummytui] connection error', error);
});


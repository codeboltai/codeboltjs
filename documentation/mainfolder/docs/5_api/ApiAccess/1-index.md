---
sidebar_label: API Overview
sidebar_position: 1
cbapicategory:
    - name: Agent
      link: /docs/api/ApiAccess/agent
      description: This module provides functionalities for creating customized, high-performance agents tailored to specific needs.
    - name: Browser
      link: /docs/api/ApiAccess/browser
      description: The browser module provides functions for interacting with the browser.
    - name: Cbstate
      link: /docs/api/ApiAccess/cbstate
      description: This is a state module that gives the current state. The state is being continuously updated by the application based on various actions.
    - name: Chat
      link: /docs/api/ApiAccess/chat
      description: This has various chat related functionalities where the agent can send chat to user and get the user response
    - name: CodeParsers
      link: /docs/api/ApiAccess/codeparsers
      description: This is a module that parses the code and returns the code tree.
    - name: CodeUtils
      link: /docs/api/ApiAccess/codeutils
      description: This is a module that provides various utilities for parsing and manipulating code.

    - name: Crawler
      link: /docs/api/ApiAccess/crawler
      description: This is a module that crawls the web and returns the crawled data.
    - name: DbMemory
      link: /docs/api/ApiAccess/dbmemory
      description: This is a module that provides memory based database functionalities.
    - name: Debug
      link: /docs/api/ApiAccess/debug
      description: This is a module that provides various debug functionalities.
    - name: DocUtils
      link: /docs/api/ApiAccess/docutils
      description: This is a module that provides various utilities for parsing and manipulating markdown.
    - name: Fs
      link: /docs/api/ApiAccess/fs
      description: This is a module that provides various file system functionalities.
    - name: Git
      link: /docs/api/ApiAccess/git
      description: This is a module that provides various git functionalities.
    - name: History
      link: /docs/api/ApiAccess/history
      description: This module provides chat history management and summarization functionality for maintaining conversation context.
    - name: Knowledge
      link: /docs/api/ApiAccess/knowledge
      description: This is a module that provides various knowledge related functionalities.
    - name: LLM
      link: /docs/api/ApiAccess/llm
      description: This is a module that provides various LLM related functionalities.
    - name: OutputParsers
      link: /docs/api/ApiAccess/outputparsers
      description: This is a module that parses the output and returns the output tree.
    - name: Project
      link: /docs/api/ApiAccess/project
      description: This is a module that provides various project related functionalities.
    - name: Rag
      link: /docs/api/ApiAccess/rag
      description: This is a module that provides various RAG related functionalities.
    - name: TaskPlanner
      link: /docs/api/ApiAccess/taskplaner
      description: This is a module that provides various task planner related functionalities.
    - name: Terminal
      link: /docs/api/ApiAccess/terminal
      description: Handle Terminal Related Functionalities like Running Commands and Getting Output. Supports handling multiple terminals and long running code executions like Servers.
    - name: Tokenizer
      link: /docs/api/ApiAccess/tokenizer
      description: Tokenization related Functionalities are provided so that the code can be tokenized and the tokens can be used to perform and measure various operations.
    - name: ToolBox
      link: /docs/api/ApiAccess/toolbox
      description: MCP (Model Context Protocol) framework for creating and managing modular tools and services with support for resources, prompts, and session management.
    - name: VectorDB
      link: /docs/api/ApiAccess/vectordb
      description: Provides Vector DB related Functionalities for Storing and Managing of Vector Embedding
    - name: MCP
      link: /docs/api/ApiAccess/mcp
      description: Manages modular tools and services through WebSocket communication. Execute tools, retrieve tool details, and monitor enabled MCP instances in real-time

---
# Direct API Access

## Overview

Codebolt exposes all the major functions needed to create an AI Agent using the CodeboltJS SDK. The SDK provides a list of functions that you can use when creating a Codebolt Agent. Although these functions can be used in any mode, but they are primarily used for Agent creation in Direct Function Mode.

The major functions exposed are:
<CBAPICategory />

# Codebolt Code

Codebolt CLI and Server - A powerful development tool for interacting with AI agents and managing code projects.

## Overview

Codebolt Code is a command-line interface and server application that provides developers with tools to:
- Interact with AI agents for code generation and assistance
- Manage code projects through a terminal-based user interface
- Communicate with remote agent servers
- Perform file operations and version control

## Features

- **Terminal User Interface (TUI)**: Interactive terminal interface built with React and Ink
- **Server Mode**: WebSocket server for agent communication
- **Agent Integration**: Connect and communicate with AI agents
- **File Operations**: Read, write, and manage files directly from the CLI
- **Git Integration**: Version control operations through simple commands
- **Project Management**: Organize and manage code projects

## Installation

```bash
npm install -g codebolt-code
```

## Usage

### Terminal User Interface

Launch the interactive TUI:

```bash
codebolt-code
```

### Server Mode

Start the Codebolt server:

```bash
codebolt-server
```

By default, the server runs on port 3001.

## Commands

### TUI Commands

Once in the TUI, you can use the following key bindings:
- Arrow keys: Navigate menus and options
- Enter: Select options
- Ctrl+C: Exit the application

### Server Commands

```bash
# Start the server with default settings
codebolt-server

# Start the server on a specific port
PORT=3002 codebolt-server
```

## Project Structure

```
codebolt-code/
├── bin/                 # CLI executable scripts
├── server/              # Server implementation
├── tui/                 # Terminal User Interface components
└── package.json         # Project configuration
```

## Dependencies

Key dependencies include:
- [Ink](https://github.com/vadimdemedes/ink) - React for interactive command-line apps
- [React](https://reactjs.org/) - UI library
- [Express](https://expressjs.com/) - Web framework for the server
- [ws](https://github.com/websockets/ws) - WebSocket library
- [simple-git](https://github.com/steveukx/git-js) - Git operations

## Development

To run the project locally:

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the TUI:
   ```bash
   npm run tui
   ```
4. Run the server:
   ```bash
   npm run server
   ```

## Configuration

The application can be configured through environment variables:

- `PORT`: Server port (default: 3001)
- `HOST`: Server host (default: localhost)

## License

ISC
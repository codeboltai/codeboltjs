## Dummy TUI Client
### Setup
1. From `tui/dummytui` run `npm install`.
2. Ensure the AgentServer is running (default ws://localhost:3001).
### Running
- `npm start` – connects to the server and logs messages.
- Override defaults with env vars: `AGENT_SERVER_HOST`, `AGENT_SERVER_PORT`, `AGENT_SERVER_PROTOCOL`.
Optional env vars:
- `CURRENT_PROJECT_PATH`, `CURRENT_PROJECT_NAME`, `CURRENT_PROJECT_TYPE` – include project metadata during connection.
- `SELECTED_AGENT_ID`, `SELECTED_AGENT_NAME` – customize the agent identifiers in sample messages.

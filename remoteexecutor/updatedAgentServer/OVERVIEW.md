The Repository is structured in the Following Way:

- src/server.ts - Entry point of the application
- src/main: This is the primary handling of the application
- src/main/server: This is where the Server handling happens primarily for managing the websocket connection.
- src/localexections: This is where the logic for local executions is present.
- src/tuiLib: This is where the logic for TUI handling is present.
- src/tuilib/tuiprocessManager: This is where the logic for TUI Process Management is present.
- src/tuilib/routes: For routes which Tui calls
- src/tuilib/controller: For controller logic of tui routes
- src/remote: For the management of remote Connections to the app and cloud
- src/remote/appmanager: for the management of the app connections
- src/remote/cloudmanager: for the management of the cloud connections
- src/agentLib: For the management of agent connections and agent Message Routing

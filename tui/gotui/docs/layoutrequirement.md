WE want to change the layout of the Chat tab. Currently on the right side of the chat tab we have the following panels:
- Subagents
- MCPs
- Todos
- Modified Files
- Next Scheduled Tasks
- Context

We do not want anything on the right side. Instead we want that we create a Context Drawer on the left side below the Conversations List. This Context Drawer will have the following panels:
- Subagents
- MCPs
- Todos
- Modified Files
- Next Scheduled Tasks
- Context

This way it will be easier to see even when the terminal width is less. Also we want the panels to be fitting the height of the content. Also the Whole Context Drawer should be scrollable.

┌───────────────────────────────────────────────────────────────┐
│ [Chat] [Logs] [Git]           (global tabs)                   │
├────────────┬────────────────────────────────────────────────-─┤
│ Conversations│  Active Chat (Conv-1)                          │
│ ► Conv-1 🔥 │                                                 │
│   Conv-2 🔥 │ │  Message history …                         │  │
│   Conv-3    │ │                                            │  │
│   Conv-4    │ │                                            │  │
│ (use ↑↓)    │ │                                            │  │
├───────────-─┼                                                 ┤
│ Context     │                                                 │
│ Drawer      │                                                 │
│ (toggle     │                                                 │
│ C-d)        │                                                 │
│ ┌────────┐  │                                                 │
│ │>Subagts│  │                                                 │
│ │•A      │  │                                                 │
│ │>MCPs   │  │                                                 │
│ │•foo…   │  │                                                 │
│ │>Todos  │  │                                                 │
│ │•Task   │  │                                                 │
│ │>Files  │  │ ┌────────────────────────────────────────────┐  │
│ │•main.go│  │  ────────────────────────────────────────────   │
│ └────────┘  │                                                 │
└────────────-┴─────────────────────────────────────────────────┘


Also, when the terminal width is very small, then the layout should change to something like this:


┌───────────────────────────────────────────────────────────────┐
│ [Chat] [Logs] [Git] [Files]                                   │
├───────────────────────────────────────────────────────────────┤
│ Conversations (list)                                          │
│ ► Conv-1 🔥  Conv-2 🔥  Conv-3  Conv-4  …                    │
├───────────────────────────────────────────────────────────────┤
│ Active Chat (Conv-1)                                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Message history …                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────────┤
│ Context Panels (toggle C-d)                                   │
│ > Subagents (2)                                               |
|    Agent-A  Agent-B                                           │
│ > MCPs (3) ───────► mcp-foo  mcp-bar  mcp-baz                 │
│ > Todos (1) ──────► Implement feature X                       │
│ > Modified Files ─► src/main.go (3↑ 2↓)                       │
└───────────────────────────────────────────────────────────────┘


Here the Conversation List will be on top, and instead of vertical list the conversations can be in horizontal list. Also The Context Panel in that case will be on the bottom. 

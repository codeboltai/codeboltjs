1. Streaming-first execution
     Claude can stream partial assistant output and begin tool execution during the same response. Your loop still
     waits for full AgentStep.executeStep() completion before tool handling.
  2. Model fallback and retry
     Claude can switch to a fallback model when the primary model fails or is overloaded. Your loop has no fallback
     model policy.
  3. Abort and interruption correctness
     Claude handles interrupted streams and interrupted tool calls cleanly, including synthetic tool results to keep
     history valid. Your loop still has only coarse error handling.
  4. Stop hooks and continuation policy
     Claude evaluates stop hooks after responses and can block continuation or inject corrective messages. Your loop
     has loop detection, but not a full continuation policy layer.
  5. Budget control
     Claude tracks token budget and task budget per turn and can nudge, continue, or stop accordingly. Your loop has
     no budget governor.
  6. Rich attachment and background context ingestion
     Claude injects queued commands, memory attachments, and skill-discovery context between turns. Your loop
     currently only injects external event queue items.
  7. Turn state machine and recursion control
     Claude maintains formal state with transition reasons, turn counts, and max-turn enforcement. Your loop is still
     a simple do/while iteration.
  8. Tool result normalization and summaries
     Claude normalizes tool results for replay and generates tool-use summaries asynchronously. Your loop doesn’t
     summarize tool batches or preserve replay-safe tool metadata.
  9. Dynamic runtime integration
     Claude refreshes tools, accounts for permission mode, MCP state, and agent definitions each turn. Your loop
     injects tools once and does not re-evaluate runtime capabilities per iteration.

  If you want, I can take item 2 next and make the same kind of implementation plan plus code changes for Model
  fallback and retry.

# Mail Tool Tester

Static CodeBolt agent for smoke-testing every `mail_*` tool exposed through `codebolt.mcp.executeTool('codebolt', ...)`.

## Run

```bash
npm install
npm run build
npm run dev
```

Send the agent a message such as `Test all mail tools`.

## Coverage

The runner covers all 23 mail tools:

- `mail_register_agent`
- `mail_list_agents`
- `mail_get_agent`
- `mail_create_thread`
- `mail_find_or_create_thread`
- `mail_list_threads`
- `mail_get_thread`
- `mail_update_thread_status`
- `mail_archive_thread`
- `mail_fetch_inbox`
- `mail_send_message`
- `mail_reply_message`
- `mail_get_message`
- `mail_get_messages`
- `mail_mark_read`
- `mail_acknowledge`
- `mail_search`
- `mail_summarize_thread`
- `mail_reserve_files`
- `mail_release_files`
- `mail_force_reserve_files`
- `mail_list_reservations`
- `mail_check_conflicts`

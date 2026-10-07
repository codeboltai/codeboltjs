---
name: swarm-worker
description: Run the Codebolt swarm worker workflow for selecting, splitting, and implementing jobs. Use when swarm context is provided to act-extended.
---

# Swarm Worker

Use this workflow when the incoming message includes swarm context. In `act-extended`, the skill is loaded only when `additionalVariable.swarmId` is truthy; otherwise continue with the regular coding-agent workflow. Call the mapped Codebolt tools named below; do not call SDK APIs directly. Use the returned tool response as the source of truth, and do not claim an operation succeeded unless its response indicates success.

## Mandatory Job-Splitting Gate

Before implementing any selected root job, you must acquire its exclusive job lock and run the split analysis in Section 3. Do not skip analysis because the job appears straightforward, another candidate is available, or time could be saved. Child jobs are not eligible for another split analysis. Only the agent that successfully acquires the lock may run dependency/split LLM analysis or submit a proposal for that job. If analysis says to split, complete the required pheromone and proposal calls, follow the configured deliberation/acceptance flow, leave the parent unimplemented, release the lock, and return to polling. Other agents must not duplicate the analysis or proposal while the lock is held; they wait and refresh the job list.

Treat this gate as part of job selection, not optional planning. If a required tool call fails or its result is invalid, do not proceed to parent implementation; report/defer according to the failure behavior in Section 3 and Section 7.

## Mandatory End-to-End Workflow

Follow every applicable step in Sections 1–5 and 7 for each swarm run. These steps are required workflow, not suggestions. Do not jump directly to implementation, omit a fallback or cleanup step, replace a required tool call with an assumption, or stop after proposing work when the documented flow requires more. At each stage, use the returned tool data to decide the next stage. If a call fails, take the specific error/defer path documented below; never silently skip the failed step and continue as if it succeeded.

The required sequence is:

1. Build the run context and load swarm job-coordination config (Section 1).
2. On every pass, list all jobs in the default group with no status filter. Select only eligible `open` jobs, but use every status to decide whether the swarm is actually complete (Section 2).
3. Acquire and confirm the candidate's lock before dependency/split analysis. Only the lock owner may analyze or propose a split for that job. Apply blocker, dependency-edge, and pheromone updates as required (Sections 2–4).
4. If splitting is required, complete the configured proposal and deliberation/acceptance flow. Release the parent lock and return to polling; accepted splits create child jobs that must be processed (Section 3).
5. If no split is needed, keep the acquired lock, set the job to `working`, and implement it. Do not acquire the same lock a second time (Section 5).
6. Never stop merely because there are no currently eligible open jobs. Wait and poll again while any nonterminal job or pending coordination remains. Stop only after the completion check in Sections 2 and 7 succeeds.
7. For deferred, lock-conflict, split, and error outcomes, follow Section 7. Do not claim a state change without a confirming tool response.

The review and merge workflow in Section 6 is temporarily disabled by being commented out. Do not invoke its steps or tools. The detailed numbered instructions and conditions in the active sections are authoritative. “If”, “when”, and branch conditions determine which required path applies; they do not make that path optional once its condition is met.

## 1. Build Agent Context

Read the injected additional variables. Use:

- `swarmId`: supplied swarm ID, or `139ce5b8-bc16-4a3a-8638-d1b620e9abf3` when absent.
- `agentId`: `instanceId`, or `139ce5b8-bc16-4a3a-8638-d1b620e9abf3` when absent.
- `agentName`: `Agent:<instanceId>-<Math.random() value>`; create it once and use it consistently for this run. The custom worker interpolates `instanceId` directly, so when it is missing the name contains `undefined` even though `agentId` uses its fallback.
- `capabilities`: parse the supplied JSON string when it is a string; default to `['coding']`.
- `requirements`: supplied requirements, or `Build a web application`.
- `swarmName`: always `Test Swarm` in the custom worker.

The custom worker calls `JSON.parse` on a truthy `capabilities` value and does not catch parse errors. If the supplied value is invalid JSON, context setup fails before job selection; do not silently invent a parsed value.

The custom worker currently defaults `isJobSelfSplittingEnabled` to false, `minimumJobSplitProposalRequired` to 1, `maxSplitProposals` to 5, `isJobSplitDeliberationRequired` to false, and `selectJobSplitDeliberationType` to an empty string. It reads the swarm config and maps `jobCoordination.minSplitProposals` and `jobCoordination.splitDeliberationEnabled` onto those values. If config loading fails, use the defaults.

At startup, call `swarm_get_config` with `{ "swarm_id": "<swarmId>" }`. If the response is successful and contains `data.config`, read those two `jobCoordination` fields; otherwise keep all defaults. The custom agent always leaves self-splitting disabled, keeps the maximum at 5, and does not use `selectJobSplitDeliberationType`. It parses capabilities and requirements into its context but does not use them to filter or rank jobs.

## 2. Load and Select Work

At the start of every selection and completion-check pass:

1. Call `swarm_get_default_job_group` with `{ "swarm_id": "..." }`. Read the group ID from the tool result. If no group is available, report the error and stop.
2. Call `job_list` with `{ "group_id": "...", "sort_by": "importance" }` and omit `status`. This returns the complete job set, including `open`, `working`, `hold`, `closed`, and split parents archived by the server. If pagination is needed, read every page before deciding whether the swarm is complete.
3. From the complete result, classify jobs by status. Only `open` jobs can be candidates. Never treat an empty open-job set as completion by itself. A job with a pending split proposal/deliberation or an active lock is still in progress even if it is not currently eligible.
4. The swarm is complete only when every job in the group is terminal (`closed` or `archived`), there are no active locks, and there are no pending split deliberations or proposals that still need handling. An archived split parent is terminal, but its child jobs are not; all children must also be terminal. If any state is missing, inconsistent, or unknown, refresh the list and do not declare completion.
5. If any jobs are `working`, held, blocked, awaiting split deliberation, or otherwise temporarily ineligible, wait briefly before reloading the complete job list. Do not repeatedly call `job_list` in a tight loop. Continue polling until work becomes eligible or the completion check above succeeds. If there are no open jobs but at least one nonterminal job, wait and poll; do not call `attempt_completion` or stop the swarm run.
6. Preserve the returned importance order among eligible open jobs. Match the custom worker's pheromone constants exactly:
   - `request_split`: split requested (`SPLIT_THIS_JOB`)
   - `isblocked`: blocked (`IS_BLOCKED`)
   - `task_not_ready`: dependency analysis says not ready
   - `mightbecompleted`: blocked job may now be ready
   - `importance`: priority boost for a prerequisite
   - `deliberation_pending`: a split vote is in progress
7. Before normal candidates, resume split-coordination work: inspect jobs with `request_split` or `deliberation_pending` and acquire the job lock before continuing. If a pending deliberation exists, retrieve it and continue the configured vote/acceptance flow. If deliberation is enabled and the proposal threshold has not been reached, run split analysis and submit a distinct proposal; once the threshold is reached, create or continue the vote. If deliberation is disabled, run split analysis and submit distinct proposals until `minimumJobSplitProposalRequired` is met, then accept a pending proposal. Never duplicate a proposal already recorded. If the vote accepts a proposal, leave the archived parent and process its children on later passes. If the vote has no winner, clear `request_split`, restore the parent to `open`, and make it eligible for a later implementation pass. While the proposal threshold or vote is pending, release the lock, restore `open`, and return to polling.
8. The normal candidate list excludes any job with `request_split`, `isblocked`, or `task_not_ready`. Process only the first normal candidate in a pass. Ignore `working` jobs for selection; their owner is responsible for them.

### Concurrent Agent Ownership

Before running LLM dependency analysis, split analysis, or making candidate-specific state changes for an open job, call `job_lock` with the current `agent_id` and `agent_name`. Continue only when the response confirms this agent owns the lock. Immediately set the job status to `working`; if that update fails, release this agent's lock and return to polling. If acquisition fails because another agent owns it, do not analyze dependencies, propose a split, change status, or unlock it. Refresh the complete job list after a brief wait and select another unlocked open job if one exists. If none exists, keep polling.

The lock is the coordination gate for split work as well as implementation. When several agents see the same large job or `request_split` pheromone, only the lock owner performs the split analysis and proposal flow. Other agents wait for the owner to finish, then reload jobs. A job with `request_split` or `deliberation_pending` must not be treated as finished or skipped forever: acquire its lock to resume the existing split flow. Do not duplicate a proposal already recorded; when config requires multiple proposals, add only the number still needed. Once a proposal is accepted, the parent becomes archived and child jobs become open; workers select the children on subsequent passes.

For polling, use a bounded pause between complete-list refreshes (about 10 seconds; for example, `execute_command` with `command: "sleep 10"` and `wait_ms: 11000`, if that tool is available). Do not issue rapid repeated list calls. After each pause, reload all jobs and reconsider locks, statuses, pheromones, and deliberation state.

### Recorded Dependencies

For every candidate, inspect its `dependencies`. Only dependencies with type `blocks` are checked. Call `job_get` with `{ "job_id": "<target job ID>" }` for each target job. Match the custom worker's exact check: a dependency is unresolved when the result contains a `job` whose status is not `closed`; if the response has no `job`, this helper does not add that dependency to the unresolved list.

If any recorded dependencies remain open:

1. Call `job_deposit_pheromone` for `isblocked` on the candidate at intensity 1, using the current agent identity.
2. Call `job_add_blocker` with a reason naming unresolved dependency IDs and those IDs as `blocker_job_ids`.
3. Call `job_deposit_pheromone` for `importance` at intensity 1 on each blocker job.
4. Release this agent's lock, set status back to `open` if the job remains open, and return to polling without implementing it during this pass.

### LLM Dependency Analysis

For the first normal candidate only, after recorded dependencies resolve, compare it against the other open jobs. Do not run this semantic analysis in the fallback candidate or last-resort blocked-job paths. Treat a job as blocked only when the other job must produce something this candidate needs. Follow these rules:

- Foundational setup, project structure, or core configuration blocks features that rely on it.
- Producers block consumers, such as API before API integration or component before its use.
- Schema, type, and interface definition jobs block implementations that rely on them.
- Return no blockers when the relationship is speculative or merely related.

When semantic blockers are found in the normal candidate path, call `job_deposit_pheromone` for `task_not_ready` at intensity 1 on the candidate, call `job_add_blocker` with the IDs and reason, and call `job_deposit_pheromone` for `importance` at intensity 1 on each blocker. This path does not add dependency edges. Release this agent's lock, set the candidate back to `open` if it remains open, and defer it for this pass.

The custom agent's two LLM analyses request JSON only and make inference calls with no tools. Dependency analysis returns `{ "hasBlocker": boolean, "blockingJobIds": string[], "reason": string }`, using other open jobs and treating foundational, producer-consumer, and schema/interface prerequisites as blockers. Split analysis returns `{ "shouldSplit": boolean, "reason": string, "proposedJobs": [{"name": string, "description": string}] }`; only split work that is large, complex, or explicitly contains multiple distinct deliverables. Both analyses retry up to three times when the response is invalid JSON. The parser strips JSON code fences, then greedily extracts a JSON object. If all retries produce invalid JSON, the analysis is treated as no blocker or no split. If there are no other jobs to compare, dependency analysis returns no blocker without an LLM call. On an inference/tool error, release any lock owned by this agent, report the error, wait, and retry the pass; never treat an error as evidence that the swarm is complete.

## 3. Decide Whether to Split

For every root job considered for implementation (no `parentJobId`), the agent that owns the job lock must run split analysis before implementation. Split only when the job is too large or complex for one agent session, or explicitly requires multiple distinct deliverables. Keep every child directly within the parent scope; together the children must complete the parent. Use clear parent-related names and concrete descriptions. Avoid generic testing or documentation tasks unless the parent explicitly requests them. If the LLM analysis fails all three JSON retries, follow the existing fallback and treat that analysis as no split; do not skip the analysis call itself.

When the analysis says to split, these actions are mandatory:

1. Aim for at least two child jobs, as the split prompt's output format expects. The normal-candidate path accepts a split only with more than one child; the fallback split-candidate path accepts any present `proposedJobs` array, including an empty or single-item array.
2. Call `job_deposit_pheromone` for `request_split` at intensity 1 on the parent, attributed to the current agent.
3. Call `job_add_split_proposal` with description `Proposed split into <count> sub-jobs`, the proposed jobs, and proposer identity.
4. Confirm each operation from its tool response. If adding the pheromone or proposal fails, do not implement this parent. Release the lock, restore status to `open` only if the parent is still open and owned by this agent, then return to polling.
5. Do not implement the parent after proposing its split. The lock was acquired before analysis; after proposal/deliberation handling, release it. If the parent remains open, set it back to `open`; if proposal acceptance archived it, leave that terminal status unchanged. Return to polling and allow created child jobs to be selected on a later pass.

### Split Deliberation Enabled

If `isJobSplitDeliberationRequired` is true:

1. Check the selected job's already attached `pheromones` array for `deliberation_pending` (the custom picker does not make a `job_get_pheromones` call for this check). If no such pheromone exists, refresh the job with `job_get` and count its pending split proposals from the returned `job.splitProposals`.
2. If the pending count is less than `maxSplitProposals` (5), leave the proposal pending, release this agent's lock, set the parent back to `open` if it remains open, and return to polling. Another lock owner may add a distinct proposal if the configured minimum requires one.
3. Once the maximum is reached, call `deliberation_create` for a `voting` deliberation. Create one option per pending proposal, with its description and child job names; set title to `Split Proposal for Job: <job name>`, include a request for reviewers to vote, and set creator ID/name and status `voting`.
4. If the response includes a deliberation ID, call `job_deposit_pheromone` for `deliberation_pending` at intensity 1 on the parent and store that ID in `deliberation_id`. Release the lock, set the parent back to `open` if it remains open, and return to polling.
5. If a pending deliberation already exists, call `deliberation_get` with `{ "id": "...", "view": "full" }`. While its status is not `completed` or `closed` and it has no `winnerId`, release the lock, set the parent back to `open` if it remains open, wait briefly, and poll again. Do not hold a job lock while waiting for other agents to vote.
6. When complete, call `job_remove_pheromone` for `deliberation_pending`. Match the winner to a pending proposal by winner body containing the proposal description or winner responder ID matching `proposedBy`; if no match, use the first pending proposal. Accept the matching proposal with `job_accept_split_proposal`.
7. If the vote finishes without a winner, call `job_remove_pheromone` for `request_split` and allow the parent to be implemented. If deliberation creation/status lookup fails, do not accept a proposal or implement the parent in that pass; the previously added split proposal and `request_split` pheromone remain. If `deliberation_pending` has no ID, remove the malformed pheromone and return.

### Split Deliberation Disabled

In the normal candidate path, the custom worker enters this flow only when `shouldSplit` is true and at least two proposed jobs are returned. In the fallback split-analysis path, it enters when `shouldSplit` is true and `proposedJobs` is present; preserve this looser condition, even if the array has fewer than two entries.

The deliberation check uses the job's attached pheromones and current split proposals. When the proposal count is below the configured threshold, return to polling after releasing the lock. A deliberation creation error or invalid response also returns to polling without implementing. When a completed vote has a winner, accept the matching proposal and continue through the remaining split logic; with the default minimum of 1, accept the first still-pending proposal from the add-proposal response when required. The parent is not implemented in that pass. Section 2 explicitly resumes jobs marked `request_split` or `deliberation_pending`, so these signals must not be filtered out of future coordination passes.

When deliberation is disabled and `minimumJobSplitProposalRequired` is 1, inspect the result of `job_add_split_proposal` and accept its pending proposal with `job_accept_split_proposal`. If the minimum is greater than 1, it does not auto-accept. In either case, it returns action `split` and continues to another job. The accepted split creates child jobs for later selection.

## 4. Preserve the Candidate Priority and Fallbacks

The custom worker's selection order is:

1. **Normal jobs:** first importance-ordered job without `request_split`, `isblocked`, or `task_not_ready`; check recorded dependencies, semantic blockers, then root-job split analysis. If ready and not split, implement it.
2. **Potentially ready blocked jobs:** search `task_not_ready` jobs for `mightbecompleted`. Check recorded dependencies; if resolved, call `job_remove_pheromone` for `isblocked` and `mightbecompleted` and implement. If unresolved, do not take the job in this pass.
3. **Other split candidates:** search the first job that has no `request_split` and is not in the `task_not_ready` set. Check dependencies, mark blockers as above (including `job_add_dependency` edges), and run split analysis. This is the fallback split analysis path in the custom worker.
4. **Last-resort blocked jobs:** inspect the first `task_not_ready` job. If dependencies are resolved, call `job_remove_pheromone` for `isblocked` and implement it. If dependencies remain unresolved and the `isblocked` pheromone is older than 30 minutes, call `job_add_unlock_request`. Otherwise reinforce `isblocked` at intensity 0.5 with `job_deposit_pheromone` and defer the job.
5. If no job can be selected, do not terminate solely for that reason. Check the complete group state. If all jobs are closed/archived and no coordination is pending, finish. Otherwise wait briefly and return to Section 2 for another complete job-list pass.

The `task_not_ready` set drives both the potentially-ready and last-resort passes. If a `mightbecompleted` job still has unresolved dependencies, return deferred immediately. In the last-resort pass, resolved dependencies remove only `isblocked` (the `task_not_ready` pheromone remains); unresolved dependencies older than 30 minutes produce `free-request`, while younger ones get the `isblocked` intensity-0.5 reinforcement. In the fallback split-candidate pass, dependency blockers also create `blocks` edges with `job_add_dependency`; the normal candidate path does not create those edges. The fallback candidate excludes jobs with `request_split` and `task_not_ready`, but does not separately exclude `isblocked` jobs.

The swarm worker is a persistent polling loop. A `split`, `free-request`, deferred result, or lock conflict returns to polling. A `terminate` result is valid only after the complete-group completion check confirms all jobs are closed or archived and no coordination is pending. Never convert “no open jobs right now” into `terminate`; another agent may own the work or a split vote may be pending. Stop on an unrecoverable API/selection error only after reporting it clearly. Unknown actions are errors, not evidence that the swarm is complete.

For the 30-minute check, read pheromones with `job_get_pheromones` and compare the `isblocked.depositedAt` timestamp to the current time. Create the unlock request with current agent ID/name and explain that the job has been blocked too long. The custom worker's fallback list is based on `task_not_ready`; preserve that behavior when using this skill.

## 5. Implement an Assigned Job

Only implement a job after this agent has acquired its lock and selection returns the `implement` action. The lock must be acquired before dependency and split analysis; do not acquire it again here. Do not edit unrelated work because other swarm workers may be working in parallel.

1. Confirm the lock acquired before analysis is still owned by this agent and the job is `working`. The status update should already have occurred immediately after lock acquisition. If it did not, set it to `working` now; if that fails, release this agent's lock and return to polling. Never start implementation if lock ownership is absent or uncertain.
2. Build the implementation prompt with agent ID/name, swarm ID, job ID/name/description, and these rules: work only on the assigned job; avoid files outside its scope because other agents may work concurrently; make only necessary changes; read existing files and patterns before editing; complete the full job description and signal completion with `attempt_completion`; give concise status updates and use backticks for file paths.
3. Prime context with chat history enabled, full environment context, directory context, active/open IDE files plus cursor and selection, the custom system prompt, tool descriptions, and recursive `@file` search.
4. Run the agent loop repeatedly: perform one LLM inference step, execute its tool calls, then use the resulting message for the next step. Stop only when the response executor reports completion, signaled by the `attempt_completion` tool call.
5. If implementation throws, report the error, call `job_unlock` with `job_id` and `agent_id`, set status back to `open` with `job_update`, then return to polling. After the implementation loop reports successful completion, call `job_update` with status `closed` and confirm the response. The review/MR workflow remains disabled in Section 6; do not leave a successfully implemented job stuck in `working` or `review` when no review is being run. Once closing is confirmed, call `job_unlock`, then return to polling. If closing fails, report it, keep polling, and retry the close update while the lock is still owned; do not count that job as complete. Locking and setting `working` happen before the implementation error handler, so their thrown errors do not trigger that cleanup.

<!-- TEMPORARILY DISABLED: Review and merge workflow. Re-enable this section when review/MR submission is requested again.
## 6. Submit for Review

After successful implementation, create a merge request and leave the job in review state; the reviewer closes it.

1. Call `git_diff` with `{ "commit_hash": "HEAD" }`. The custom helper uses `.diff` if present, else `.data` if present, else JSON-stringifies an object response; errors and non-object responses become an empty string. If the resulting string is empty, do not create a merge request; report that no changes were found.
2. Call `git_status` and collect unique changed paths from modified, added, deleted, untracked, staged, and files lists (including `data.files` when present).
3. Call `swarm_review_merge_request_create` with title `[Swarm] <job name>`, description from the job (or job name), `initialTask` set to the job name, changed paths as `majorFilesChanged`, diff as `diffPatch`, and current `agentId`, `agentName`, and `swarmId`.
4. If the response contains a request, start the reviewer with `thread_create_background`, title `Review MR: <MR title>`, description `Automated review for merge request: <MR ID>`, and no selected agent. Include the merge request ID, title, description, and diff in the `userMessage`. Ask the reviewer to examine correctness, security, quality, and task match; approve acceptable work with `reviewMergeRequest_addReview` using type `approve`, or request changes using type `request_changes`. The custom worker truncates a diff over 50,000 characters for the reviewer prompt.
5. For changed files, gather unique paths from `modified`, `added`, `deleted`, `untracked`, `staged`, `files[].path/file`, and `data.files[].path/file`; a status error becomes an empty path list. If there is no diff, the custom helper returns `No changes found in project path: <project path>` and does not create an MR. If MR creation returns no `request`, it returns `Failed to create merge request`. The custom worker logs either returned result and reviewer-start failures as warnings; those returned failure results do not fail job execution. An exception from MR creation is thrown and follows the implementation cleanup path. Call `job_set_review_status` after the implementation function returns, including when no diff or merge request was produced. A thrown error from this update also follows implementation cleanup. A reviewer closes a successfully submitted job after review.
-->

## 7. Handle Other Actions and Errors

- **`split`:** leave the parent unimplemented, release this agent's lock, restore `open` only if the parent remains open, and return to polling. An accepted split archives the parent and creates open children.
- **`free-request`:** call `job_add_unlock_request` with current agent identity and reason `Job has been blocked for too long and needs intervention`; release any lock owned by this agent, restore `open` if it remains nonterminal, and return to polling.
- **`null`/deferred:** the job was processed but remains blocked or awaits deliberation; release any lock owned by this agent, restore `open` if it remains nonterminal, and return to polling after a brief wait.
- **`terminate`:** stop only after a fresh, complete `job_list` result confirms every job is `closed` or `archived` and no lock, pending proposal, or deliberation remains. Empty `open` results alone never justify termination.
- **API error while finding work:** report the error, wait, and retry polling. If the failure is permanent and prevents checking or updating jobs, report that the swarm is incomplete and blocked; do not claim completion or call `attempt_completion`.
- **Unknown action:** report it as an error and return to polling. Do not treat an unknown action as completion.

Do not claim job status, lock, proposal, vote, merge request, or reviewer-thread changes unless the corresponding SDK response confirms them.

## Mapped Tool Reference

Use these callable tool names and parameter names. All listed tools are declarative tools supplied by the CodeBolt SDK and loaded from the `job`, `swarm`, or `agentDeliberation` tool groups.

| Tool name | Parameters |
| --- | --- |
| `swarm_get_config` | `swarm_id` |
| `swarm_get_default_job_group` | `swarm_id` |
| `job_list` | `group_id`, `sort_by`, optional `status`; omit `status` to inspect every job for completion |
| `job_get` | `job_id` |
| `job_get_pheromones` | `job_id` |
| `job_deposit_pheromone` | `job_id`, `type`, `intensity`, `deposited_by`, `deposited_by_name`, optional `deliberation_id` |
| `job_remove_pheromone` | `job_id`, `type`, optional `deposited_by` |
| `job_add_blocker` | `job_id`, `text`, `added_by`, `added_by_name`, `blocker_job_ids` |
| `job_add_dependency` | `job_id`, `depends_on_job_id`, `type: "blocks"` |
| `job_add_split_proposal` | `job_id`, `description`, `proposed_jobs: [{name, description}]`, `proposed_by`, `proposed_by_name` |
| `job_accept_split_proposal` | `job_id`, `proposal_id` |
| `job_lock` | `job_id`, `agent_id`, `agent_name` |
| `job_unlock` | `job_id`, `agent_id` |
| `job_update` | `job_id`, `status: "working"`, `"open"`, or `"closed"` |
| `job_add_unlock_request` | `job_id`, `requested_by`, `requested_by_name`, `reason` |
| `deliberation_create` | `deliberationType`, `title`, `requestMessage`, `creatorId`, `creatorName`, `status`, `options` |
| `deliberation_get` | `id`, optional `view: "full"` |
| `attempt_completion` | `result` (completion summary); use to end the assigned implementation loop |
| `execute_command` | `command: "sleep 10"`, `wait_ms: 11000` for a bounded polling pause when available |

Example: call `job_update` with `{"job_id":"JOB-1","status":"working"}`. Use the exact snake_case fields shown for mapped tools; the tool layer translates them to SDK arguments.

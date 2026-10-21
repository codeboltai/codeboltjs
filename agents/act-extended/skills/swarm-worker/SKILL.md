---
name: swarm-worker
description: Run the Codebolt swarm worker workflow for selecting, splitting, and implementing jobs. Use when swarm context is provided to act-extended.
---

# Swarm Worker

Use this workflow when the incoming message includes swarm context. In `act-extended`, the skill is loaded only when `additionalVariable.swarmId` is truthy; otherwise continue with the regular coding-agent workflow. Call the mapped Codebolt tools named below; do not call SDK APIs directly. Use the returned tool response as the source of truth, and do not claim an operation succeeded unless its response indicates success.

## Mandatory: Acquire Before Exploring

The initial user request describes the swarm's overall goal. It is not an assignment authorizing you to work on that goal. Swarm job locks are the ownership authority; file-based claims, implementation plans, and task-specific instructions to read files first do not replace a confirmed job lock.

Before reading project files, searching code, running shell commands, researching implementation, planning a solution, or delegating work:
1. Load the swarm configuration and default job group.
2. List the complete group and select an eligible, unlocked job using the selection rules below.
3. Call job_lock and confirm successful ownership by your worker instance from the tool response.
4. Only then explore or analyze that specific job within its scope.

Until ownership is confirmed, perform coordination operations only: read configuration, job descriptions, dependencies, locks, and coordination metadata; discover the required coordination tools; select/acquire work; or wait for events. Repository exploration is task work and requires ownership. Do not run shell commands to obtain coordination information or wait.

If another worker owns a job, do not investigate it, prepare an alternative solution, or duplicate its split analysis. Select another eligible job. If none exists and nonterminal work remains, call eventqueue_wait_next with {}. After each event, refresh the complete job list before acting. Use the full-group completion check before finishing.

Only the root-job lock owner performs split analysis. After an accepted split, return to selection and acquire a child job before exploring its scope. Release, loss, or uncertain ownership ends authorization to continue task work; return to coordination.

If you realize you started exploring without ownership, stop immediately and return to job selection. Do not continue to finish your investigation.

## Mandatory Job-Splitting Gate

Split analysis and semantic dependency analysis are your own reasoning in the current model turn. They do not require a separate LLM, inference, analysis tool, child agent, or action block. Do not search for such a tool or defer work because none is exposed. After confirming ownership, use the job description and relevant project evidence to decide whether to split; then use the mapped job tools to persist that decision. Tool calls are required for state changes, not for thinking through the split.

Before implementing any selected root job, you must acquire its exclusive job lock and run the split analysis in Section 3. Do not skip analysis because the job appears straightforward, another candidate is available, or time could be saved. Child jobs are not eligible for another split analysis. Only the agent that successfully acquires the lock may run dependency/split analysis or submit a proposal for that job. If analysis says to split, complete the required pheromone and proposal calls, follow the configured deliberation/acceptance flow, leave the parent unimplemented, release the lock, and return to polling. Other agents must not duplicate the analysis or proposal while the lock is held; they wait and refresh the job list.

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

This is one persistent swarm run, not one run per job. Do not call `attempt_completion` after an individual job; close that job, release its lock, and continue polling. Call `attempt_completion` only after the full-group completion check succeeds. The review and merge workflow in Section 6 is temporarily disabled by being commented out. Do not invoke its steps or tools. The detailed numbered instructions and conditions in the active sections are authoritative.

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
5. If any jobs are `working`, held, blocked, awaiting split deliberation, or otherwise temporarily ineligible, wait for a job-change event before reloading the complete job list. Do not repeatedly call `job_list` in a tight loop. If there are no open jobs but at least one nonterminal job, call `eventqueue_wait_next` with `{}` and remain waiting until an event arrives; do not call `attempt_completion` or stop the swarm run. A `swarm_job_changed` event is only a wake-up signal, not proof that work is ready or the swarm is complete. After every event, reload the full group and make the decision from current job state.
6. Preserve the returned importance order among eligible open jobs. Match the custom worker's pheromone constants exactly:
   - `request_split`: split requested (`SPLIT_THIS_JOB`)
   - `isblocked`: blocked (`IS_BLOCKED`)
   - `task_not_ready`: dependency analysis says not ready
   - `mightbecompleted`: blocked job may now be ready
   - `importance`: priority boost for a prerequisite
   - `deliberation_pending`: a split vote is in progress
7. Before normal candidates, resume split-coordination work: inspect jobs with `request_split` or `deliberation_pending` and acquire the job lock before continuing. If a pending deliberation exists, retrieve it and continue the configured vote/acceptance flow. If deliberation is enabled and the proposal threshold has not been reached, run split analysis and submit a distinct proposal; once the threshold is reached, create or continue the vote. If deliberation is disabled, run split analysis and submit distinct proposals until `minimumJobSplitProposalRequired` is met, then accept a pending proposal. Never duplicate a proposal already recorded. If the vote accepts a proposal, leave the archived parent and process its children on later passes. If the vote has no winner, clear `request_split`, restore the parent to `open`, and make it eligible for a later implementation pass. While the proposal threshold or vote is pending, follow Section 7 cleanup and return to polling.
8. Before attempting a lock, exclude every job with an unresolved recorded `blocks` dependency. Use `job_get_ready` for the group and intersect with unlocked `open` jobs, or verify prerequisites from the fresh group snapshot. Readiness requires every blocking target to exist and have status `closed`. Do not lock a known dependent job just to mark it not ready. The normal candidate list also excludes any job with `request_split`, `isblocked`, or `task_not_ready`. Process only the first normal candidate in a pass. Ignore `working` jobs for selection; their owner is responsible for them.

### Concurrent Agent Ownership

Before reasoning about dependencies, split analysis, or making candidate-specific state changes for an open job, call `job_lock` with the current `agent_id` and `agent_name`. Continue only when the response confirms this agent owns the lock. Immediately set the job status to `working`; if that update fails, release this agent's lock and return to polling. If acquisition fails because another agent owns it, do not analyze dependencies, propose a split, change status, or unlock it. Refresh the complete job list after a brief wait and select another unlocked open job if one exists. If none exists, keep polling.

The lock is the coordination gate for split work as well as implementation. When several agents see the same large job or `request_split` pheromone, only the lock owner performs the split analysis and proposal flow. Other agents wait for the owner to finish, then reload jobs. A job with `request_split` or `deliberation_pending` must not be treated as finished or skipped forever: acquire its lock to resume the existing split flow. Do not duplicate a proposal already recorded; when config requires multiple proposals, add only the number still needed. Once a proposal is accepted, the parent becomes archived and child jobs become open; workers select the children on subsequent passes.

When no eligible work is available but nonterminal jobs remain, use `eventqueue_wait_next` instead of `execute_command` with `sleep`. This waits without periodic polling and is woken by job creation, status changes, lock acquisition, or lock release in this swarm's job group. After waking, reload all jobs and reconsider locks, statuses, pheromones, dependencies, and deliberation state. Never treat the event payload itself as authoritative job state.

### Recorded Dependencies

Before `job_lock`, inspect the candidate's `dependencies` using the fresh complete group snapshot or `job_get_ready`. Only edges with type `blocks` prevent selection. A target must exist and have status `closed`; a missing target or failed lookup is unresolved. Jobs with unresolved prerequisites remain `open` but are not eligible: skip them without locking, changing status, or depositing `task_not_ready`/`isblocked`. Wait for a job event if no eligible work remains.

The server rechecks readiness in `job_lock` to close races. If it rejects the lock as not ready, reload jobs and choose another eligible candidate. Never set a rejected candidate to `working` or add not-ready pheromones merely because its recorded dependencies are still open. Once its prerequisites close, the dependency check makes it eligible automatically.

### Semantic Dependency Analysis

For the first normal candidate only, after recorded dependencies resolve, compare it against the other open jobs. Do not run this semantic analysis in the fallback candidate or last-resort blocked-job paths. Treat a job as blocked only when the other job must produce something this candidate needs. Follow these rules:

- Foundational setup, project structure, or core configuration blocks features that rely on it.
- Producers block consumers, such as API before API integration or component before its use.
- Schema, type, and interface definition jobs block implementations that rely on them.
- Return no blockers when the relationship is speculative or merely related.

When semantic blockers are found after locking an older job that has no recorded dependency, call `job_add_dependency` for each blocker with `{ "job_id": "<candidate>", "depends_on_job_id": "<prerequisite>", "type": "blocks" }` and confirm success. Persist these edges before releasing the lock using Section 7 cleanup. Do not use only pheromones or blocker descriptions as a substitute for dependency edges. Clear stale `task_not_ready` and `isblocked` pheromones owned by this agent once the durable edges are saved so dependency readiness governs future selection.

Reason about dependencies and splitting yourself. Validate the proposed child keys, descriptions, and dependency graph before submitting tool arguments; no separate analysis response or JSON-producing inference call is required. If evidence is insufficient, inspect the relevant files while you own the lock. If a real error prevents progress, report the concrete error and follow Section 7 cleanup. With no other jobs to compare, there are no semantic blockers. Absence of a separate analysis tool is not an error or a reason to defer.

## 3. Decide Whether to Split

For every root job considered for implementation (no `discoveredFrom` or `parentJobId`), the agent that owns the job lock must run split analysis before implementation. Split when the job requires multiple independently deliverable outcomes, spans distinct subsystems that can be worked in parallel, or combines separate stages with ordering dependencies. Examples include a feature requiring independent API, UI, and persistence work; a migration plus application changes; or a broad request containing several named deliverables. Keep a single focused outcome in one job, even if it requires several small edits. Do not decide based only on job length or vague complexity. Keep every child directly within the parent scope; together the children must complete the parent. Use clear parent-related names and concrete descriptions. Avoid generic testing or documentation tasks unless the parent explicitly requests them. If analysis is invalid or fails, defer the job; never interpret failure as “no split.”

When the analysis says to split, these actions are mandatory:

1. Analyze prerequisite ordering across ALL proposed children before publishing the proposal. Propose at least two non-empty child jobs. Each child must have a unique `key`, a name, an actionable description, and `dependsOn` (an array of sibling keys or existing job IDs; use `[]` when independent). Encode every known prerequisite now, including setup, schemas, APIs, and integration ordering. Do not encode ordering only in descriptions and do not wait for workers to discover it after claiming.
   Example: `[{"key":"api","name":"Build API","description":"Implement endpoints","dependsOn":[]},{"key":"ui","name":"Build UI","description":"Implement independent UI shell","dependsOn":[]},{"key":"integration","name":"Integrate UI and API","description":"Connect UI to endpoints","dependsOn":["api","ui"]}]`.
   `dependsOn` entries for proposed siblings use their keys, never guessed generated job IDs. Reject cycles, self-dependencies, unknown references, or a dependency on the parent being split. The server resolves keys and persists the entire child dependency graph before any child is announced or claimable. Together they must cover the parent job without introducing unrelated work. If the analysis says to split but cannot produce two valid children, retry the analysis or defer; do not implement the parent in that pass.
2. Call `job_deposit_pheromone` for `request_split` at intensity 1 on the parent, attributed to the current agent.
3. Call `job_add_split_proposal` with description `Proposed split into <count> sub-jobs`, the complete proposed jobs including `key` and `dependsOn`, and proposer identity.
4. Confirm each operation from its tool response. If adding the pheromone or proposal fails, do not implement this parent. Follow Section 7 cleanup, then return to polling.
5. Do not implement the parent after proposing its split. The lock was acquired before analysis; after proposal/deliberation handling, release it using Section 7 cleanup; if proposal acceptance archived it, preserve that terminal status. Return to polling and allow created child jobs to be selected on a later pass.

### Split Deliberation Enabled

If `isJobSplitDeliberationRequired` is true:

1. Check the selected job's already attached `pheromones` array for `deliberation_pending` (the custom picker does not make a `job_get_pheromones` call for this check). If no such pheromone exists, refresh the job with `job_get` and count its pending split proposals from the returned `job.splitProposals`.
2. If the pending count is less than `maxSplitProposals` (5), leave the proposal pending, follow Section 7 cleanup, and return to polling. Another lock owner may add a distinct proposal if the configured minimum requires one.
3. Once the maximum is reached, call `deliberation_create` for a `voting` deliberation. Create one option per pending proposal, with its description and child job names; set title to `Split Proposal for Job: <job name>`, include a request for reviewers to vote, and set creator ID/name and status `voting`.
4. If the response includes a deliberation ID, call `job_deposit_pheromone` for `deliberation_pending` at intensity 1 on the parent and store that ID in `deliberation_id`. Follow Section 7 cleanup, and return to polling.
5. If a pending deliberation already exists, call `deliberation_get` with `{ "id": "...", "view": "full" }`. While its status is not `completed` or `closed` and it has no `winnerId`, follow Section 7 cleanup, wait briefly, and poll again. Do not hold a job lock while waiting for other agents to vote.
6. When complete, call `job_remove_pheromone` for `deliberation_pending`. Match the winner to a pending proposal by winner body containing the proposal description or winner responder ID matching `proposedBy`; if no match, use the first pending proposal. Accept the matching proposal with `job_accept_split_proposal`.
7. If the vote finishes without a winner, call `job_remove_pheromone` for `request_split` and allow the parent to be implemented. If deliberation creation/status lookup fails, do not accept a proposal or implement the parent in that pass; the previously added split proposal and `request_split` pheromone remain. If `deliberation_pending` has no ID, remove the malformed pheromone and return.

### Split Deliberation Disabled

After adding a proposal, refresh the job and count its pending proposals. If the configured minimum has not been reached, follow Section 7 cleanup, and poll again later. Do not add a duplicate proposal from the same agent. Once the minimum is reached, accept a pending proposal with `job_accept_split_proposal`, confirm that the parent was split, release the lock, and process the generated child jobs on later passes. Never implement the parent in the same pass that accepts its split. If proposal acceptance fails, preserve the split marker, report the failure, release the lock, and retry coordination later.

## 4. Preserve the Candidate Priority and Fallbacks

The custom worker's selection order is:

1. **Normal jobs:** first importance-ordered job without `request_split`, `isblocked`, or `task_not_ready`; check recorded dependencies, semantic blockers, then root-job split analysis. If ready and not split, implement it.
2. **Potentially ready blocked jobs:** search `task_not_ready` jobs for `mightbecompleted`. Check recorded dependencies; if resolved, call `job_remove_pheromone` for `isblocked` and `mightbecompleted` and implement. If unresolved, do not take the job in this pass.
3. **Other eligible candidates:** skip jobs marked `request_split`, `isblocked`, or `task_not_ready`; resume split coordination for `request_split` jobs before considering new work. Check dependencies for the selected candidate and run split analysis only for root jobs.
4. **Last-resort blocked jobs:** inspect the first `task_not_ready` job. If dependencies are resolved, call `job_remove_pheromone` for `isblocked` and implement it. If dependencies remain unresolved and the `isblocked` pheromone is older than 30 minutes, call `job_add_unlock_request`. Otherwise reinforce `isblocked` at intensity 0.5 with `job_deposit_pheromone` and defer the job.
5. If no job can be selected, do not terminate solely for that reason. Check the complete group state. If all jobs are closed/archived and no coordination is pending, finish. Otherwise wait briefly and return to Section 2 for another complete job-list pass.

When a blocked job's dependencies resolve, remove the pheromones that caused it to be excluded from normal selection before making it eligible again. If dependencies remain unresolved, keep the job deferred; after 30 minutes, submit an unlock request for intervention.

The swarm worker is a persistent polling loop. A `split`, `free-request`, deferred result, or lock conflict returns to polling. A `terminate` result is valid only after the complete-group completion check confirms all jobs are closed or archived and no coordination is pending. Never convert “no open jobs right now” into `terminate`; another agent may own the work or a split vote may be pending. Stop on an unrecoverable API/selection error only after reporting it clearly. Unknown actions are errors, not evidence that the swarm is complete.

For the 30-minute check, read pheromones with `job_get_pheromones` and compare the `isblocked.depositedAt` timestamp to the current time. Create the unlock request with current agent ID/name and explain that the job has been blocked too long.

## 5. Implement an Assigned Job

Only implement a job after this agent has acquired its lock and selection returns the `implement` action. The lock must be acquired before dependency and split analysis; do not acquire it again here. Do not edit unrelated work because other swarm workers may be working in parallel.

1. Confirm the lock acquired before analysis is still owned by this agent and the job is `working`. The status update should already have occurred immediately after lock acquisition. If it did not, set it to `working` now; if that fails, release this agent's lock and return to polling. Never start implementation if lock ownership is absent or uncertain.
2. Build the implementation prompt with agent ID/name, swarm ID, job ID/name/description, and these rules: work only on the assigned job; avoid files outside its scope because other agents may work concurrently; make only necessary changes; read existing files and patterns before editing; complete and verify the full job description; give concise status updates and use backticks for file paths. Do not call `attempt_completion` for an individual job.
3. Prime context with chat history enabled, full environment context, directory context, active/open IDE files plus cursor and selection, the custom system prompt, tool descriptions, and recursive `@file` search.
4. Continue the implementation agent loop until the assigned job is implemented and verified. Do not invoke `attempt_completion` at this point; the swarm coordinator still needs to close the job and process remaining work.
5. If implementation throws, report the error, follow Section 7 cleanup, then return to polling. After successful implementation, call `job_update` with status `closed` and confirm the response. The review/MR workflow remains disabled in Section 6; do not leave a successfully implemented job stuck in `working` or `review` when no review is being run. Once closing is confirmed, call `job_unlock`, then return to polling. If closing fails, report it, keep polling, and retry the close update while the lock is still owned; do not count that job as complete. Locking and setting `working` happen before the implementation error handler, so their thrown errors do not trigger that cleanup.

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

For every deferred, error, or pending-coordination outcome, release only your own lock with `job_unlock` and inspect its response. The server atomically changes `working` to `open` when unlocking, preserving `hold`, `review`, `closed`, and `archived`. Never write status after releasing ownership: another worker may already have claimed the job. On older servers that do not reopen on unlock, set `open` and confirm it while you still own the lock, then unlock. Never request an unlock for a job that has no lock. Report an ownerless `working` job as inconsistent state requiring recovery; do not claim it is owned or complete.

- **`split`:** leave the parent unimplemented, follow Section 7 cleanup, and return to polling. An accepted split archives the parent and creates open children.
- **`free-request`:** call `job_add_unlock_request` with current agent identity and reason `Job has been blocked for too long and needs intervention`; follow the cleanup above, and return to polling.
- **`null`/deferred:** the job was processed but remains blocked or awaits deliberation; follow the cleanup above, and return to polling after a brief wait.
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
| `job_add_split_proposal` | `job_id`, `description`, `proposed_jobs: [{key, name, description, dependsOn}]`, `proposed_by`, `proposed_by_name` |
| `job_accept_split_proposal` | `job_id`, `proposal_id` |
| `job_lock` | `job_id`, `agent_id`, `agent_name` |
| `job_unlock` | `job_id`, `agent_id` |
| `job_update` | `job_id`, `status: "working"`, `"open"`, or `"closed"` |
| `job_add_unlock_request` | `job_id`, `requested_by`, `requested_by_name`, `reason` |
| `deliberation_create` | `deliberationType`, `title`, `requestMessage`, `creatorId`, `creatorName`, `status`, `options` |
| `deliberation_get` | `id`, optional `view: "full"` |
| `eventqueue_wait_next` | `{}`; wait for a swarm job change when no eligible job is available |
| `attempt_completion` | `result` (completion summary); use only after the complete swarm check succeeds |

Example: call `job_update` with `{"job_id":"JOB-1","status":"working"}`. Use the exact snake_case fields shown for mapped tools; the tool layer translates them to SDK arguments.

import codebolt from '@codebolt/codeboltjs';
import { AgentContext, PHEROMONE_TYPES, Job, SwarmConfig, JobPickResult } from './types';
import {
    filterJobsByPheromones,
    getJobsWithPheromone,
    isBlockedTooLong
} from './pheromone';
import {
    checkDependenciesResolved,
    analyzeJobDependencies,
    isJobSplittable
} from './job';

/**
 * Pick a job following the pheromone-based priority system
 *
 * Priority Order:
 * 1. Normal jobs (no split-this-job or isblocked pheromones) with resolved dependencies
 * 2. Blocked jobs with mightbecompleted pheromone (check if dependencies resolved)
 * 3. Splittable jobs (check for no blockers, then split)
 * 4. Blocked jobs (last resort - check if dependencies resolved, request freeing if blocked too long)
 * 5. Terminate if nothing available
 */
export async function pickJob(jobs: Job[], ctx: AgentContext, swarmConfig: SwarmConfig): Promise<JobPickResult> {
    codebolt.chat.sendMessage(`🔍 Analyzing ${jobs.length} jobs for selection...`);

    // =========================================================================
    // STEP 1: Filter out jobs with "split-this-job" or "isblocked" pheromones
    // =========================================================================
    const normalJobs = await filterJobsByPheromones(jobs, [
        PHEROMONE_TYPES.SPLIT_THIS_JOB,
        PHEROMONE_TYPES.IS_BLOCKED,
        PHEROMONE_TYPES.TASK_NOT_READY
    ]);

    codebolt.chat.sendMessage(`📋 Found ${normalJobs.length} normal jobs (no split/blocked pheromones)`);

    // =========================================================================
    // STEP 2: Try to pick a normal job - process only the first one
    // Check dependencies first, if blocked mark it and return null
    // =========================================================================
    if (normalJobs.length > 0) {
        const job = normalJobs[0];

        // First check existing recorded dependencies
        const { resolved, unresolvedDeps } = await checkDependenciesResolved(job);

        if (!resolved) {
            // Job has unresolved RECORDED dependencies - mark as blocked
            codebolt.chat.sendMessage(`🔒 Job ${job.id} has unresolved dependencies: ${unresolvedDeps.join(', ')} - marking as blocked`);

            await codebolt.job.depositPheromone(job.id, {
                type: PHEROMONE_TYPES.IS_BLOCKED,
                intensity: 1,
                depositedBy: ctx.agentId,
                depositedByName: ctx.agentName
            });

            // Add blocker and dependency records
            await codebolt.job.addBlocker(job.id, {
                text: `Blocked by unresolved dependencies: ${unresolvedDeps.join(', ')}`,
                addedBy: ctx.agentId,
                addedByName: ctx.agentName,
                blockerJobIds: unresolvedDeps
            });

            // Add importance pheromones to blocker jobs
            for (const blockerJobId of unresolvedDeps) {
                await codebolt.job.depositPheromone(blockerJobId, {
                    type: PHEROMONE_TYPES.IMPORTANCE,
                    intensity: 1,
                    depositedBy: ctx.agentId,
                    depositedByName: ctx.agentName
                });
            }

            // Return null to indicate this job was processed but is blocked
            return { job: null, action: null };
        }

        // LLM-based dependency analysis - check if job SHOULD depend on other open tasks
        const dependencyAnalysis = await analyzeJobDependencies(job, jobs);

        if (dependencyAnalysis.hasBlocker && dependencyAnalysis.blockingJobIds.length > 0) {
            // LLM detected dependencies on other open tasks - mark as blocked
            codebolt.chat.sendMessage(`🔗 Job ${job.id} depends on other open tasks (LLM analysis) - marking as blocked`);

            await codebolt.job.depositPheromone(job.id, {
                type: PHEROMONE_TYPES.TASK_NOT_READY,
                intensity: 1,
                depositedBy: ctx.agentId,
                depositedByName: ctx.agentName
            });

            // Add blocker and dependency records
            await codebolt.job.addBlocker(job.id, {
                text: `Blocked by: ${dependencyAnalysis.reason}`,
                addedBy: ctx.agentId,
                addedByName: ctx.agentName,
                blockerJobIds: dependencyAnalysis.blockingJobIds
            });

            // Add importance pheromones to blocker jobs
            for (const blockerJobId of dependencyAnalysis.blockingJobIds) {
                await codebolt.job.depositPheromone(blockerJobId, {
                    type: PHEROMONE_TYPES.IMPORTANCE,
                    intensity: 1,
                    depositedBy: ctx.agentId,
                    depositedByName: ctx.agentName
                });
            }

            // Return null to indicate this job was processed but is blocked
            return { job: null, action: null };
        }

        // No dependencies - check if job is splittable
        const splitAnalysis = await isJobSplittable(job);

        if (splitAnalysis.splittable && splitAnalysis.proposedJobs && splitAnalysis.proposedJobs.length > 1) {
            // Deposit "split-this-job" pheromone
            await codebolt.job.depositPheromone(job.id, {
                type: PHEROMONE_TYPES.SPLIT_THIS_JOB,
                intensity: 1,
                depositedBy: ctx.agentId,
                depositedByName: ctx.agentName
            });

            // Add split proposal
            const splitResult: any = await codebolt.job.addSplitProposal(job.id, {
                description: `Proposed split into ${splitAnalysis.proposedJobs.length} sub-jobs`,
                proposedJobs: splitAnalysis.proposedJobs,
                proposedBy: ctx.agentId,
                proposedByName: ctx.agentName
            });

            // Check for deliberation requirement
            if (swarmConfig.isJobSplitDeliberationRequired) {
                // Check if deliberation already pending
                const deliberationPheromone = job.pheromones.find((p: any) => p.type === PHEROMONE_TYPES.DELIBERATION_PENDING);

                if (!deliberationPheromone) {
                    // Create deliberation
                    codebolt.chat.sendMessage(`⚖️ Deliberation required for job split. Creating deliberation...`);

                    try {
                        const deliberationResponse = await codebolt.agentDeliberation.create({
                            deliberationType: 'voting',
                            title: `Split Proposal for Job: ${job.name}`,
                            requestMessage: `Proposed split into ${splitAnalysis.proposedJobs.length} sub-jobs. \n\nReason: ${splitAnalysis.reason || 'Complexity analysis suggested split'}\n\nPlease review and vote.`,
                            creatorId: ctx.agentId,
                            creatorName: ctx.agentName,
                            status: 'voting'
                        });

                        if (deliberationResponse && deliberationResponse.payload && deliberationResponse.payload.deliberation) {
                            const newDeliberationId = deliberationResponse.payload.deliberation.id;

                            // Seed options for voting
                            try {
                                await codebolt.agentDeliberation.respond({
                                    deliberationId: newDeliberationId,
                                    responderId: ctx.agentId,
                                    responderName: ctx.agentName,
                                    body: "Approve Split"
                                });
                                await codebolt.agentDeliberation.respond({
                                    deliberationId: newDeliberationId,
                                    responderId: ctx.agentId,
                                    responderName: ctx.agentName,
                                    body: "Reject Split"
                                });
                            } catch (e) {
                                codebolt.chat.sendMessage(`⚠️ Failed to seed voting options: ${e}`);
                            }

                            await codebolt.job.depositPheromone(job.id, {
                                type: PHEROMONE_TYPES.DELIBERATION_PENDING,
                                intensity: 1,
                                depositedBy: ctx.agentId,
                                depositedByName: ctx.agentName,
                                deliberationId: newDeliberationId
                            });
                            codebolt.chat.sendMessage(`✅ Deliberation created: ${newDeliberationId} with voting options.`);
                        } else {
                            codebolt.chat.sendMessage(`⚠️ Failed to create deliberation: Invalid response`);
                        }
                    } catch (err) {
                        codebolt.chat.sendMessage(`⚠️ Error creating deliberation: ${err}`);
                    }
                    return { job: null, action: null };
                } else {
                    // Check status of existing deliberation
                    const deliberationId = deliberationPheromone.deliberationId;
                    if (deliberationId) {
                        try {
                            const deliberationResult = await codebolt.agentDeliberation.get({ id: deliberationId });
                            const deliberation = deliberationResult.payload?.deliberation;
                            const winner = deliberationResult.payload?.winner;

                            if (deliberation && (deliberation.status === 'completed' || deliberation.status === 'closed' || deliberation.winnerId)) {
                                codebolt.chat.sendMessage(`✅ Deliberation ${deliberationId} completed.`);
                                await codebolt.job.removePheromone(job.id, PHEROMONE_TYPES.DELIBERATION_PENDING);

                                if (winner && winner.body.toLowerCase().includes("approve")) {
                                    codebolt.chat.sendMessage(`🎉 Split approved by deliberation. Proceeding with split.`);

                                    // Accept the split proposal
                                    const jobDetails = await codebolt.job.getJob(job.id);
                                    const currentJob = jobDetails.job || job;
                                    // @ts-ignore
                                    const pendingProposal = currentJob.splitProposals?.find((p: any) => p.status === 'pending');

                                    if (pendingProposal) {
                                        await codebolt.job.acceptSplitProposal(job.id, pendingProposal.id);
                                        codebolt.chat.sendMessage(`✅ Automatically accepted split proposal ${pendingProposal.id} based on deliberation result.`);
                                    } else {
                                        codebolt.chat.sendMessage(`⚠️ Could not find pending split proposal to accept for job ${job.id}`);
                                    }

                                    // Fall through to split logic (which returns action: 'split')
                                } else if (winner && winner.body.toLowerCase().includes("reject")) {
                                    codebolt.chat.sendMessage(`⛔ Split rejected by deliberation. Canceling split.`);
                                    await codebolt.job.removePheromone(job.id, PHEROMONE_TYPES.SPLIT_THIS_JOB);
                                    // Proceed as implement since split was rejected
                                    return { job, action: 'implement' };
                                } else {
                                    codebolt.chat.sendMessage(`⚠️ Deliberation finished but result unclear (Winner: ${winner?.body}). Defaulting to split cancellation.`);
                                    await codebolt.job.removePheromone(job.id, PHEROMONE_TYPES.SPLIT_THIS_JOB);
                                    return { job, action: 'implement' };
                                }
                            } else {
                                codebolt.chat.sendMessage(`⏳ Waiting for deliberation ${deliberationId} (Status: ${deliberation?.status})`);
                                return { job: null, action: null };
                            }
                        } catch (err) {
                            codebolt.chat.sendMessage(`⚠️ Error checking deliberation status: ${err}`);
                            return { job: null, action: null };
                        }
                    } else {
                        codebolt.chat.sendMessage(`⚠️ Deliberation pheromone found but no ID. cleaning up.`);
                        await codebolt.job.removePheromone(job.id, PHEROMONE_TYPES.DELIBERATION_PENDING);
                        return { job: null, action: null };
                    }
                }
            }

            // Auto-approve if only 1 proposal is required and deliberation is NOT required
            if (swarmConfig.minimumJobSplitProposalRequired == 1) {
                const updatedJob = splitResult?.job || splitResult?.data?.job;
                const pendingProposal = updatedJob?.splitProposals?.find((p: any) => p.status === 'pending');
                if (pendingProposal) {
                    await codebolt.job.acceptSplitProposal(job.id, pendingProposal.id);
                    codebolt.chat.sendMessage(`✅ Auto-approved split proposal for job ${job.id}`);
                }
            }

            codebolt.chat.sendMessage(`✂️ Job ${job.id} marked for splitting into ${splitAnalysis.proposedJobs.length} sub-jobs`);
            return { job, action: 'split' };
        }

        // Job is ready to implement (not splittable, no blockers)
        return { job, action: 'implement' };
    }

    // =========================================================================
    // STEP 3: Look for blocked jobs with "mightbecompleted" pheromone
    // These are prioritized over other blocked jobs
    // =========================================================================
    const blockedJobs = await getJobsWithPheromone(jobs, PHEROMONE_TYPES.TASK_NOT_READY);
    const mightBeCompletedJobs = await getJobsWithPheromone(blockedJobs, PHEROMONE_TYPES.MIGHT_BE_COMPLETED);

    codebolt.chat.sendMessage(`🔄 Found ${mightBeCompletedJobs.length} blocked jobs with 'mightbecompleted' pheromone`);

    if (mightBeCompletedJobs.length > 0) {
        const job = mightBeCompletedJobs[0];
        const { resolved } = await checkDependenciesResolved(job);
        if (resolved) {
            // Dependencies now resolved - remove blocked pheromones
            await codebolt.job.removePheromone(job.id, PHEROMONE_TYPES.IS_BLOCKED);
            await codebolt.job.removePheromone(job.id, PHEROMONE_TYPES.MIGHT_BE_COMPLETED);
            codebolt.chat.sendMessage(`✅ Job ${job.id} dependencies resolved, ready for work`);
            return { job, action: 'implement' };
        }
        // Not resolved yet, return null
        return { job: null, action: null };
    }

    // =========================================================================
    // STEP 4: Look for jobs that can be split (without existing split pheromone)
    // Only consider jobs that are NOT blocked
    // =========================================================================
    const splitPendingJobs = await getJobsWithPheromone(jobs, PHEROMONE_TYPES.SPLIT_THIS_JOB);
    const jobsToCheckForSplit = jobs.filter((j: Job) =>
        !splitPendingJobs.some(sp => sp.id === j.id) &&
        !blockedJobs.some(b => b.id === j.id)
    );

    codebolt.chat.sendMessage(`🔍 Checking ${jobsToCheckForSplit.length} jobs for splittability`);

    if (jobsToCheckForSplit.length > 0) {
        const job = jobsToCheckForSplit[0];
        const { resolved, unresolvedDeps } = await checkDependenciesResolved(job);

        if (!resolved) {
            // Mark as blocked if has dependencies
            await codebolt.job.depositPheromone(job.id, {
                type: PHEROMONE_TYPES.IS_BLOCKED,
                intensity: 1,
                depositedBy: ctx.agentId,
                depositedByName: ctx.agentName
            });

            // Add blocker record with dependency info
            await codebolt.job.addBlocker(job.id, {
                text: `Blocked by unresolved dependencies: ${unresolvedDeps.join(', ')}`,
                addedBy: ctx.agentId,
                addedByName: ctx.agentName,
                blockerJobIds: unresolvedDeps
            });

            // Add importance pheromones to blocker jobs
            for (const blockerJobId of unresolvedDeps) {
                await codebolt.job.depositPheromone(blockerJobId, {
                    type: PHEROMONE_TYPES.IMPORTANCE,
                    intensity: 1,
                    depositedBy: ctx.agentId,
                    depositedByName: ctx.agentName
                });
            }

            // Add dependency records with 'blocks' type
            for (const depJobId of unresolvedDeps) {
                await codebolt.job.addDependency(job.id, depJobId, 'blocks');
            }

            // Return null to indicate this job was processed but is blocked
            return { job: null, action: null };
        }

        const splitAnalysis = await isJobSplittable(job);
        if (splitAnalysis.splittable && splitAnalysis.proposedJobs) {
            await codebolt.job.depositPheromone(job.id, {
                type: PHEROMONE_TYPES.SPLIT_THIS_JOB,
                intensity: 1,
                depositedBy: ctx.agentId,
                depositedByName: ctx.agentName
            });

            const splitResult: any = await codebolt.job.addSplitProposal(job.id, {
                description: `Proposed split into ${splitAnalysis.proposedJobs.length} sub-jobs`,
                proposedJobs: splitAnalysis.proposedJobs,
                proposedBy: ctx.agentId,
                proposedByName: ctx.agentName
            });

            // Check for deliberation requirement
            if (swarmConfig.isJobSplitDeliberationRequired) {
                // Check if deliberation already pending
                const deliberationPheromone = job.pheromones.find((p: any) => p.type === PHEROMONE_TYPES.DELIBERATION_PENDING);

                if (!deliberationPheromone) {
                    // Create deliberation
                    codebolt.chat.sendMessage(`⚖️ Deliberation required for job split. Creating deliberation...`);

                    try {
                        const deliberationResponse = await codebolt.agentDeliberation.create({
                            deliberationType: 'voting',
                            title: `Split Proposal for Job: ${job.name}`,
                            requestMessage: `Proposed split into ${splitAnalysis.proposedJobs.length} sub-jobs. \n\nReason: ${splitAnalysis.reason || 'Complexity analysis suggested split'}\n\nPlease review and vote.`,
                            creatorId: ctx.agentId,
                            creatorName: ctx.agentName,
                            status: 'voting'
                        });

                        if (deliberationResponse && deliberationResponse.payload && deliberationResponse.payload.deliberation) {
                            await codebolt.job.depositPheromone(job.id, {
                                type: PHEROMONE_TYPES.DELIBERATION_PENDING,
                                intensity: 1,
                                depositedBy: ctx.agentId,
                                depositedByName: ctx.agentName,
                                deliberationId: deliberationResponse.payload.deliberation.id
                            });
                            codebolt.chat.sendMessage(`✅ Deliberation created: ${deliberationResponse.payload.deliberation.id}`);
                        } else {
                            codebolt.chat.sendMessage(`⚠️ Failed to create deliberation: Invalid response`);
                        }
                    } catch (err) {
                        codebolt.chat.sendMessage(`⚠️ Error creating deliberation: ${err}`);
                    }
                    return { job: null, action: null };
                } else {
                    // Check status of existing deliberation
                    const deliberationId = deliberationPheromone.deliberationId;
                    if (deliberationId) {
                        try {
                            const deliberationResult = await codebolt.agentDeliberation.get({ id: deliberationId });
                            const deliberation = deliberationResult.payload?.deliberation;

                            if (deliberation && (deliberation.status === 'completed' || deliberation.status === 'closed' || deliberation.winnerId)) {
                                codebolt.chat.sendMessage(`✅ Deliberation ${deliberationId} completed. Proceeding with split.`);
                                await codebolt.job.removePheromone(job.id, PHEROMONE_TYPES.DELIBERATION_PENDING);
                                // Fall through to split logic
                            } else {
                                codebolt.chat.sendMessage(`⏳ Waiting for deliberation ${deliberationId} (Status: ${deliberation?.status})`);
                                return { job: null, action: null };
                            }
                        } catch (err) {
                            codebolt.chat.sendMessage(`⚠️ Error checking deliberation status: ${err}`);
                            return { job: null, action: null };
                        }
                    } else {
                        codebolt.chat.sendMessage(`⚠️ Deliberation pheromone found but no ID. cleaning up.`);
                        await codebolt.job.removePheromone(job.id, PHEROMONE_TYPES.DELIBERATION_PENDING);
                        return { job: null, action: null };
                    }
                }
            }

            // Auto-approve if only 1 proposal is required and deliberation is NOT required
            if (swarmConfig.minimumJobSplitProposalRequired == 1) {
                const updatedJob = splitResult?.job || splitResult?.data?.job;
                const pendingProposal = updatedJob?.splitProposals?.find((p: any) => p.status === 'pending');
                if (pendingProposal) {
                    await codebolt.job.acceptSplitProposal(job.id, pendingProposal.id);
                    codebolt.chat.sendMessage(`✅ Auto-approved split proposal for job ${job.id}`);
                }
            }

            codebolt.chat.sendMessage(`✂️ Job ${job.id} marked for splitting into ${splitAnalysis.proposedJobs.length} sub-jobs`);
            return { job, action: 'split' };
        }

        // Job is ready to implement (not splittable, no blockers)
        return { job, action: 'implement' };
    }

    // =========================================================================
    // STEP 5: Last resort - check blocked jobs for resolved dependencies
    // If dependencies still not resolved, reinforce isblocked pheromone
    // If blocked too long, request job freeing
    // =========================================================================
    codebolt.chat.sendMessage(`🔒 Checking ${blockedJobs.length} blocked jobs as last resort...`);

    if (blockedJobs.length > 0) {
        const job = blockedJobs[0];
        const { resolved, unresolvedDeps } = await checkDependenciesResolved(job);

        if (resolved) {
            // Dependency is now resolved, remove blocked pheromone
            await codebolt.job.removePheromone(job.id, PHEROMONE_TYPES.IS_BLOCKED);
            codebolt.chat.sendMessage(`✅ Job ${job.id} dependencies resolved, ready for work`);
            return { job, action: 'implement' };
        }

        // Check if blocked too long - request job freeing
        if (await isBlockedTooLong(job.id)) {
            codebolt.chat.sendMessage(`⏰ Job ${job.id} has been blocked too long, requesting job freeing`);
            return { job, action: 'free-request' };
        }

        // Dependencies still not resolved - reinforce blocked pheromone
        await codebolt.job.depositPheromone(job.id, {
            type: PHEROMONE_TYPES.IS_BLOCKED,
            intensity: 0.5,
            depositedBy: ctx.agentId,
            depositedByName: ctx.agentName
        });

        codebolt.chat.sendMessage(`🔒 Job ${job.id} still blocked by: ${unresolvedDeps.join(', ')}`);
        return { job: null, action: null };
    }

    // =========================================================================
    // STEP 6: No actionable jobs - request termination
    // =========================================================================
    codebolt.chat.sendMessage(`🛑 No actionable jobs found, requesting termination`);
    return { job: null, action: 'terminate' };
}

import codebolt from '@codebolt/codeboltjs';
 
codebolt.onMessage(async (reqMessage) => {
 
    codebolt.message.sendMessage("Starting the User Requirement Clarification Agent");
    const requirementClarificationMemoryid = new Memorythread();
    const requirementClarificationMessage = new UserMessage({"userMessage": "Plan the next step"});
    await codebolt.agent.run("userrequirementclarificationagent", plannerMessage, {planmemoryid: requirementClarificationMemoryid});
    codebolt.message.sendMessage("User Requirement Clarification Agent completed");
 
    codebolt.message.sendMessage("Starting the Task Planner Agent");
    const planMemoryid = new Memorythread();
    const plannerMessage = new UserMessage({"userMessage": "Plan the next step"});
    await codebolt.agent.run("planneragent", plannerMessage, {planmemoryid: planMemoryid, originalMemoryid: requirementClarificationMemoryid, userRequirementClarificationMessage: requirementClarificationMessage});
    codebolt.message.sendMessage("Task Planner Agent completed");
 
    tasks = codebolt.tasks.getGroupedTasks();
    foreach(taskgroup in tasks.taskgroups) {
        codebolt.user.sendMessage("Starting Tasks")
        await Promise.all(
            tasks[taskgroup].map(task => task.start())
        );
        
        await codebolt.agent.run("checkTasksandMergeFeatures", "Check the tasks as in the given list and check each of then", {taskgroup: taskgroup})
    }
 
});
In folder output/ Please create a Codebolt Agent using codebolt-agent-development skill. Create a simple agent like
        const userMessage = new UserMessage(reqMessage);
        const systemPrompt = new SystemPrompt("./agent.yaml", "test");
        const {data} = await codebolt.mcp.listMcpFromServers(["codebolt"]);

        const agentTools = data;

        const task = new TaskInstruction(agentTools, userMessage, "./task.yaml", "main_task");
       
        const agent = new Agent(agentTools, systemPrompt);
        const {message, success, error } = await agent.run(task);
        return message ? message : error;


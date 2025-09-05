# How to use  Agents
To use or run an agent, you’ll need to follow these steps:

**Auto** — Autonomous agent that can analyze the codebase and propose or apply broad, project-level changes.

**Ask** — Conversational agent for explanations, planning, and feature design (no direct edits unless asked).

**Act** — Targeted action agent: performs specific edits using the exact context you provide.

**Local Agent** — A custom agent you create for a particular project or workflow; runs only in your project environment.

**Marketplace Agents** — Prebuilt agents from the marketplace, ready to use for common tasks (deployment, slide generation, CRM helpers, etc.).



### Run an Agent

- Open the agent selector

- Click the agent dropdown/button near the input box.

![agent](/agents/2.png)

- The chooser lets you Search agents, shows Recent Agents, and provides quick links to Browse Agents and Create Agent.

**Search or pick an agent**

- Type in the search box to quickly find an agent, or pick one from the Recent list.

- If you need a marketplace agent, click Browse Agents and choose Marketplace Agents.

![agent](/agents/4.png)

**Select Local vs Marketplace**

- For built-in or marketplace agents, use the Browse Agents → Marketplace Agents menu.

- For agents you built for this repo, choose Local Agents → pick your custom agent.

- Run the agent

- With an agent selected and the right mode chosen, type your instruction in the input box and press Send.

- The agent may ask follow-up questions if it needs more context.

- Review results and apply

- Agents that modify code should show a preview/diff. Review changes before applying.

- If an agent uses a remote environment or tooling, make sure Select Remote Env (checkbox) and permissions are set correctly.




<!-- To use or run an agent, you’ll need to follow these steps:

- **Auto**: Acts as a universal agent—Codebolt will autonomously understand your codebase and make broad, codebase-wide changes as needed.
- **Ask**: Get explanations, answers, and feature planning help from the AI about your codebase.
- **Act**: Make targeted edits using only the specific context you provide.
- **Local Agent**: Create a custom agent tailored to your unique workflows.

### How to use Agent From Agent Marketplace 
if we want to use specific agent from marketplace, there are many agent available in Agent marketplace, so click on Browse Agent and then listing down the all agent of marketplace so now we can select and use it 

### How to Use Local Agent 

if you want to use local agent that you are created agent for this project so you can click on agent selection button and  -->
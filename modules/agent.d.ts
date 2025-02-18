export declare enum AgentLocation {
    ALL = "all",
    LOCAL_ONLY = "local_only",
    REMOTE_ONLY = "remote_only"
}
export declare enum Agents {
    LOCAL = "local",
    ALL = "all",
    DOWNLOADED = "downloaded"
}
export declare enum FilterUsing {
    USE_AI = "use_ai",
    USE_VECTOR_DB = "use_vector_db",
    USE_BOTH = "use_both"
}
declare const codeboltAgent: {
    /**
     * Retrieves an agent based on the specified task.
     * @param {string} task - The task for which an agent is needed.
     * @returns {Promise<AgentResponse>} A promise that resolves with the agent details.
     */
    findAgent: (task: string, maxResult: number | undefined, agents: never[] | undefined, agentLocaltion: AgentLocation | undefined, getFrom: FilterUsing.USE_VECTOR_DB) => Promise<any>;
    /**
     * Starts an agent for the specified task.
     * @param {string} task - The task for which the agent should be started.
     * @returns {Promise<void>} A promise that resolves when the agent has been successfully started.
     */
    startAgent: (agentId: string, task: string) => Promise<any>;
    /**
     * Lists all available agents.
     * @returns {Promise<any>} A promise that resolves with the list of agents.
     */
    getAgentsList: (type?: Agents) => Promise<any>;
    /**
     * Lists all available agents.
     * @returns {Promise<any>} A promise that resolves with the list of agents.
     */
    getAgentsDetail: (agentList?: never[]) => Promise<any>;
};
export default codeboltAgent;

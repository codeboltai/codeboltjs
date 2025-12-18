import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from "@codebolt/types/sdk";

/**
 * Swarm Test Agent
 * Demonstrates all swarm module functions from codeboltjs
 */

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
    try {
        codebolt.chat.sendMessage("🐝 Swarm Test Agent Started - Demonstrating all swarm functions", {});

        // ================================
        // 1. SWARM MANAGEMENT
        // ================================
        codebolt.chat.sendMessage("📦 Testing Swarm Management Functions...", {});

        // Create a new swarm
        const createSwarmResult = await codebolt.swarm.createSwarm({
            name: "Test Swarm",
            description: "A test swarm for demonstration",
            metadata: { purpose: "testing" }
        });
        codebolt.chat.sendMessage(`✅ createSwarm: ${JSON.stringify(createSwarmResult)}`, {});

        // List all swarms
        const listSwarmsResult = await codebolt.swarm.listSwarms();
        codebolt.chat.sendMessage(`✅ listSwarms: ${JSON.stringify(listSwarmsResult)}`, {});

        // Get swarm details (using first swarm if available)
        if (listSwarmsResult.data?.swarms && listSwarmsResult.data.swarms.length > 0) {
            const swarmId = listSwarmsResult.data.swarms[0].id;

            const getSwarmResult = await codebolt.swarm.getSwarm(swarmId);
            codebolt.chat.sendMessage(`✅ getSwarm: ${JSON.stringify(getSwarmResult)}`, {});

            // Get swarm agents
            const getSwarmAgentsResult = await codebolt.swarm.getSwarmAgents(swarmId);
            codebolt.chat.sendMessage(`✅ getSwarmAgents: ${JSON.stringify(getSwarmAgentsResult)}`, {});

            // ================================
            // 2. AGENT REGISTRATION
            // ================================
            codebolt.chat.sendMessage("👤 Testing Agent Registration Functions...", {});

            // Register an agent
            const registerAgentResult = await codebolt.swarm.registerAgent(swarmId, {
                name: "Test Agent",
                capabilities: ["coding", "testing"],
                metadata: { type: "worker" }
            });
            codebolt.chat.sendMessage(`✅ registerAgent: ${JSON.stringify(registerAgentResult)}`, {});

            const agentId = registerAgentResult.data?.agentId;

            if (agentId) {
                // ================================
                // 3. TEAM MANAGEMENT
                // ================================
                codebolt.chat.sendMessage("👥 Testing Team Management Functions...", {});

                // Create a team
                const createTeamResult = await codebolt.swarm.createTeam(swarmId, {
                    name: "Development Team",
                    description: "Team for development tasks",
                    maxMembers: 10,
                    metadata: { department: "engineering" }
                });
                codebolt.chat.sendMessage(`✅ createTeam: ${JSON.stringify(createTeamResult)}`, {});

                // List teams
                const listTeamsResult = await codebolt.swarm.listTeams(swarmId);
                codebolt.chat.sendMessage(`✅ listTeams: ${JSON.stringify(listTeamsResult)}`, {});

                if (listTeamsResult.data?.teams && listTeamsResult.data.teams.length > 0) {
                    const teamId = listTeamsResult.data.teams[0].id;

                    // Get team details
                    const getTeamResult = await codebolt.swarm.getTeam(swarmId, teamId);
                    codebolt.chat.sendMessage(`✅ getTeam: ${JSON.stringify(getTeamResult)}`, {});

                    // Join team
                    const joinTeamResult = await codebolt.swarm.joinTeam(swarmId, teamId, agentId);
                    codebolt.chat.sendMessage(`✅ joinTeam: ${JSON.stringify(joinTeamResult)}`, {});

                    // Leave team
                    const leaveTeamResult = await codebolt.swarm.leaveTeam(swarmId, teamId, agentId);
                    codebolt.chat.sendMessage(`✅ leaveTeam: ${JSON.stringify(leaveTeamResult)}`, {});

                    // Delete team
                    const deleteTeamResult = await codebolt.swarm.deleteTeam(swarmId, teamId);
                    codebolt.chat.sendMessage(`✅ deleteTeam: ${JSON.stringify(deleteTeamResult)}`, {});
                }

                // ================================
                // 4. ROLE MANAGEMENT
                // ================================
                codebolt.chat.sendMessage("🎭 Testing Role Management Functions...", {});

                // Create a role
                const createRoleResult = await codebolt.swarm.createRole(swarmId, {
                    name: "Developer",
                    description: "Software developer role",
                    permissions: ["read", "write", "execute"],
                    maxAssignees: 5,
                    metadata: { level: "senior" }
                });
                codebolt.chat.sendMessage(`✅ createRole: ${JSON.stringify(createRoleResult)}`, {});

                // List roles
                const listRolesResult = await codebolt.swarm.listRoles(swarmId);
                codebolt.chat.sendMessage(`✅ listRoles: ${JSON.stringify(listRolesResult)}`, {});

                if (listRolesResult.data?.roles && listRolesResult.data.roles.length > 0) {
                    const roleId = listRolesResult.data.roles[0].id;

                    // Get role details
                    const getRoleResult = await codebolt.swarm.getRole(swarmId, roleId);
                    codebolt.chat.sendMessage(`✅ getRole: ${JSON.stringify(getRoleResult)}`, {});

                    // Assign role
                    const assignRoleResult = await codebolt.swarm.assignRole(swarmId, roleId, agentId);
                    codebolt.chat.sendMessage(`✅ assignRole: ${JSON.stringify(assignRoleResult)}`, {});

                    // Get agents by role
                    const getAgentsByRoleResult = await codebolt.swarm.getAgentsByRole(swarmId, roleId);
                    codebolt.chat.sendMessage(`✅ getAgentsByRole: ${JSON.stringify(getAgentsByRoleResult)}`, {});

                    // Unassign role
                    const unassignRoleResult = await codebolt.swarm.unassignRole(swarmId, roleId, agentId);
                    codebolt.chat.sendMessage(`✅ unassignRole: ${JSON.stringify(unassignRoleResult)}`, {});

                    // ================================
                    // 5. VACANCY MANAGEMENT
                    // ================================
                    codebolt.chat.sendMessage("📋 Testing Vacancy Management Functions...", {});

                    // Create a vacancy
                    const createVacancyResult = await codebolt.swarm.createVacancy(swarmId, {
                        roleId: roleId,
                        title: "Senior Developer Position",
                        description: "Looking for experienced developers",
                        requirements: ["5+ years experience", "TypeScript expertise"],
                        metadata: { urgency: "high" }
                    });
                    codebolt.chat.sendMessage(`✅ createVacancy: ${JSON.stringify(createVacancyResult)}`, {});

                    // List vacancies
                    const listVacanciesResult = await codebolt.swarm.listVacancies(swarmId);
                    codebolt.chat.sendMessage(`✅ listVacancies: ${JSON.stringify(listVacanciesResult)}`, {});

                    if (listVacanciesResult.data?.vacancies && listVacanciesResult.data.vacancies.length > 0) {
                        const vacancyId = listVacanciesResult.data.vacancies[0].id;

                        // Apply for vacancy
                        const applyForVacancyResult = await codebolt.swarm.applyForVacancy(
                            swarmId,
                            vacancyId,
                            agentId,
                            "I am interested in this position!"
                        );
                        codebolt.chat.sendMessage(`✅ applyForVacancy: ${JSON.stringify(applyForVacancyResult)}`, {});

                        // Close vacancy
                        const closeVacancyResult = await codebolt.swarm.closeVacancy(
                            swarmId,
                            vacancyId,
                            "Position filled"
                        );
                        codebolt.chat.sendMessage(`✅ closeVacancy: ${JSON.stringify(closeVacancyResult)}`, {});
                    }

                    // Delete role
                    const deleteRoleResult = await codebolt.swarm.deleteRole(swarmId, roleId);
                    codebolt.chat.sendMessage(`✅ deleteRole: ${JSON.stringify(deleteRoleResult)}`, {});
                }

                // ================================
                // 6. STATUS MANAGEMENT
                // ================================
                codebolt.chat.sendMessage("📊 Testing Status Management Functions...", {});

                // Update agent status
                const updateStatusResult = await codebolt.swarm.updateAgentStatus(swarmId, agentId, {
                    status: "busy",
                    currentTask: "Running swarm tests",
                    metadata: { progress: 75 }
                });
                codebolt.chat.sendMessage(`✅ updateAgentStatus: ${JSON.stringify(updateStatusResult)}`, {});

                // Get swarm status summary
                const getStatusSummaryResult = await codebolt.swarm.getSwarmStatusSummary(swarmId);
                codebolt.chat.sendMessage(`✅ getSwarmStatusSummary: ${JSON.stringify(getStatusSummaryResult)}`, {});

                // Unregister agent (cleanup)
                const unregisterAgentResult = await codebolt.swarm.unregisterAgent(swarmId, agentId);
                codebolt.chat.sendMessage(`✅ unregisterAgent: ${JSON.stringify(unregisterAgentResult)}`, {});
            }
        }

        codebolt.chat.sendMessage("🎉 All swarm functions tested successfully!", {});

    } catch (error) {
        codebolt.chat.sendMessage(`❌ Error: ${error instanceof Error ? error.message : String(error)}`, {});
    }
});

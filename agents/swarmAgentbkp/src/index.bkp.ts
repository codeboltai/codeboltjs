
// codebolt.chat.sendMessage('🐝 Swarm Agent Started', { agentId: ctx.agentId });
// console.log({
//     swarmId: additionalVariable.swarmId || '2ed48baa-159f-4be9-9fe6-a439610ab2c6',
//     swarmName: "Test Swarm",
//     agentId: additionalVariable.instanceId || '2ed48baa-159f-4be9-9fe6-a439610ab2c6',
//     agentName: `Agent:${additionalVariable.instanceId}-${Math.random()}`,
//     capabilities: additionalVariable.capabilities ? JSON.parse(additionalVariable.capabilities) : ['coding'],
//     requirements: additionalVariable.requirements || 'Build a web application',
// })
//  const finalCheck = await codebolt.agentDeliberation.list({
//     // deliberationType:'shared-list'
//         // search: `Test Swarm Initial Teams`,
//     });
//     codebolt.chat.sendMessage(JSON.stringify(finalCheck),{})
//         return
// Register to swarm
// let registerAgentResult = await codebolt.swarm.registerAgent(ctx.swarmId, {
//     agentId: ctx.agentId,
//     name: ctx.agentName,
//     capabilities: ctx.capabilities,
//     agentType: 'internal',
// });
// ctx.agentId = registerAgentResult.data?.agentId || ''

// Create or join swarm mail thread and send greeting
// await findOrCreateSwarmThread(ctx);
// return

// Check if teams exist
// const teamsResult = await codebolt.swarm.listTeams(ctx.swarmId);
// const teams = teamsResult.data?.teams || [];

// if (teams.length === 0) {
//     // No teams - bootstrap via deliberation
//     await findOrCreateStructureDeliberation(ctx);
// } else {
//     // Teams exist - join flow
//     await handleJoinSwarm(ctx, teams);
// }
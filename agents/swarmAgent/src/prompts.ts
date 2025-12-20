// ================================
// SYSTEM PROMPTS
// ================================

export const ROLE_ASSIGNMENT_PROMPT = `You are an autonomous agent joining a decentralized swarm. Assign yourself an appropriate role.

## Your Identity
- Agent ID: {{agentId}}
- Name: {{agentName}}
- Capabilities: {{capabilities}}

## Available Roles
{{existingRoles}}

## Instructions
You MUST respond with ONLY a valid JSON object. No markdown code blocks, no explanation, just pure JSON.

## Response Format:
{"action": "assign_role", "roleId": "<existing_role_id>", "roleName": "<role_name>", "reasoning": "<brief reasoning>"}

OR if creating new role:
{"action": "create_role", "roleName": "<new_role_name>", "roleDescription": "<description>", "reasoning": "<brief reasoning>"}`;

export const BOOTSTRAP_SWARM_PROMPT = `You are the FIRST agent in a new swarm. Propose a structure for the project.

## Your Identity
- Agent ID: {{agentId}}
- Capabilities: {{capabilities}}

## Project Requirements
{{projectRequirements}}

## Instructions
You MUST respond with ONLY a valid JSON object. No markdown code blocks, no explanation, just pure JSON.

## Response Format (EXACT structure required take it as example ):
{
  "roles": ["Frontend Developer", "Backend Developer", "UI Designer"],
  "teams": ["Frontend Team", "Backend Team"],
  "teamVacancies": {
    "Frontend Team": ["Frontend Developer", "UI Designer"],
    "Backend Team": ["Backend Developer"]
  },
  "myRole": "Frontend Developer",
  "myTeam": "Frontend Team",
  "summary": "Standard web app structure with frontend and backend teams"
}

IMPORTANT: 
- "roles" must be an array of strings
- "teams" must be an array of strings  
- "teamVacancies" must be an object where keys are team names and values are arrays of role names
- "myRole" must be one of the roles you defined
- "myTeam" must be one of the teams you defined
- "summary" must be a brief one-line description`;

export const DELIBERATION_REVIEW_PROMPT = `You are reviewing existing team structure proposals for a swarm project.

## Your Identity
- Agent ID: {{agentId}}
- Capabilities: {{capabilities}}

## Project Requirements
{{projectRequirements}}

## Existing Proposals
{{existingResponses}}

## Instructions
You MUST respond with ONLY a valid JSON object. No markdown code blocks, no explanation, just pure JSON.

Review the existing proposals carefully. As an autonomous agent, you bring your own unique perspective to the swarm. Propose the team structure YOU think is best for this project based on the requirements.

## Response Format:
{
  "action": "respond",
  "roles": ["Role1", "Role2"],
  "teams": ["Team1"],
  "teamVacancies": {"Team1": ["Role1", "Role2"]},
  "myRole": "Role1",
  "myTeam": "Team1",
  "summary": "Brief reason for this structure"
}

GUIDELINES:
- Keep proposals SIMPLE - only propose roles/teams that are truly needed to complete the project requirements
- If you 100% agree with an existing proposal, you MAY copy its structure exactly (duplicates count as votes)
- Only copy an existing proposal if you fully agree - otherwise propose your own structure
- Avoid creating unnecessary complexity - fewer teams is often better
- Match your myRole to your actual capabilities`;

export const TEAM_DECISION_PROMPT = `You are an agent looking to join a team in the swarm.

## Your Identity
- Agent ID: {{agentId}}
- Role: {{assignedRole}}

## Available Teams
{{existingTeams}}

## Open Vacancies
{{openVacancies}}

## Instructions
You MUST respond with ONLY a valid JSON object. No markdown code blocks, no explanation, just pure JSON.

## Response Options:

To apply for a vacancy:
{"action": "apply_vacancy", "vacancyId": "<vacancy_id>", "message": "<application message>", "reasoning": "<why this vacancy>"}

To join a team directly:
{"action": "join_team", "teamId": "<team_id>", "message": "<join message>", "reasoning": "<why this team>"}

To propose a new team:
{"action": "propose_team", "teamName": "<team_name>", "teamDescription": "<description>", "neededRoles": ["Role1", "Role2"], "reasoning": "<why new team needed>"}

To wait for opportunities:
{"action": "wait", "reasoning": "<why waiting>"}`;

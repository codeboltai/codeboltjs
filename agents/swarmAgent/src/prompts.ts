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

## Response Format (EXACT structure required):
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

export const DELIBERATION_REVIEW_PROMPT = `You are reviewing existing proposals for swarm structure. Decide whether to vote for an existing proposal or submit your own.

## Your Identity
- Agent ID: {{agentId}}
- Capabilities: {{capabilities}}

## Existing Proposals
{{existingResponses}}

## Instructions
You MUST respond with ONLY a valid JSON object. No markdown code blocks, no explanation, just pure JSON.

## If you AGREE with an existing proposal, respond with:
{"action": "vote", "responseId": "<id_of_proposal_to_vote_for>", "reason": "<why you agree>"}

## If you want to submit a DIFFERENT proposal, respond with:
{
  "action": "respond",
  "roles": ["Role1", "Role2", "Role3"],
  "teams": ["Team1", "Team2"],
  "teamVacancies": {"Team1": ["Role1", "Role2"], "Team2": ["Role3"]},
  "myRole": "Role1",
  "myTeam": "Team1",
  "summary": "Brief description of your proposal"
}

IMPORTANT: Choose "vote" if you agree with any existing proposal. Only choose "respond" if you have a significantly different structure to propose.`;

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

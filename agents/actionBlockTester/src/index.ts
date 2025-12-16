import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from "@codebolt/types/sdk";

codebolt.onMessage(async (_reqMessage: FlatUserMessage) => {
    codebolt.chat.sendMessage("🚀 Starting Agent Deliberation API Tests...\n");

    const testAgentId = "actionBlockTest";
    const testAgentName = "Testing Agent";
    let deliberationId: string = "";
    let responseId: string = "";

    try {
        // 1. CREATE - Create a new deliberation
        codebolt.chat.sendMessage("📝 Test 1: Creating a new deliberation...");
        const createResponse = await codebolt.agentDeliberation.create({
            title: "Test Deliberation",
            requestMessage: "What is the best approach for implementing this feature?",
            creatorId: testAgentId,
            creatorName: testAgentName,
            participants: ["agent1", "agent2", "agent3"],
            status: "draft"
        });
        codebolt.chat.sendMessage(`✅ CREATE Response: ${JSON.stringify(createResponse, null, 2)}`);
        deliberationId = createResponse?.payload?.deliberation?.id || "";

        // 2. GET - Get deliberation details (request view)
        codebolt.chat.sendMessage("\n📖 Test 2: Getting deliberation (request view)...");
        const getRequestView = await codebolt.agentDeliberation.get({
            id: deliberationId,
            view: "request"
        });
        codebolt.chat.sendMessage(`✅ GET (request) Response: ${JSON.stringify(getRequestView, null, 2)}`);

        // 3. GET - Get deliberation details (full view)
        codebolt.chat.sendMessage("\n📖 Test 3: Getting deliberation (full view)...");
        const getFullView = await codebolt.agentDeliberation.get({
            id: deliberationId,
            view: "full"
        });
        codebolt.chat.sendMessage(`✅ GET (full) Response: ${JSON.stringify(getFullView, null, 2)}`);

        // 4. LIST - List all deliberations
        codebolt.chat.sendMessage("\n📋 Test 4: Listing all deliberations...");
        const listAll = await codebolt.agentDeliberation.list();
        codebolt.chat.sendMessage(`✅ LIST (all) Response: ${JSON.stringify(listAll, null, 2)}`);

        // 5. LIST - List with filters
        codebolt.chat.sendMessage("\n📋 Test 5: Listing deliberations with filters...");
        const listFiltered = await codebolt.agentDeliberation.list({
            status: "draft",
            limit: 10,
            offset: 0
        });
        codebolt.chat.sendMessage(`✅ LIST (filtered) Response: ${JSON.stringify(listFiltered, null, 2)}`);


        // 6. UPDATE - Update deliberation status to collecting-responses
        codebolt.chat.sendMessage("\n✏️ Test 6: Updating deliberation status to 'collecting-responses'...");
        const updateToCollecting = await codebolt.agentDeliberation.update({
            deliberationId: deliberationId,
            status: "collecting-responses",
            requestMessage: "Updated: What is the best approach for implementing this feature?"
        });
        codebolt.chat.sendMessage(`✅ UPDATE Response: ${JSON.stringify(updateToCollecting, null, 2)}`);

        // 7. RESPOND - Add a response to the deliberation
        codebolt.chat.sendMessage("\n💬 Test 7: Adding first response to deliberation...");
        const respond1 = await codebolt.agentDeliberation.respond({
            deliberationId: deliberationId,
            responderId: "agent1",
            responderName: "Agent One",
            body: "I suggest we use a modular architecture with clear separation of concerns."
        });
        codebolt.chat.sendMessage(`✅ RESPOND (1) Response: ${JSON.stringify(respond1, null, 2)}`);
        responseId = respond1?.payload?.response?.id || "";

        // 8. RESPOND - Add another response
        codebolt.chat.sendMessage("\n💬 Test 8: Adding second response to deliberation...");
        const respond2 = await codebolt.agentDeliberation.respond({
            deliberationId: deliberationId,
            responderId: "agent2",
            responderName: "Agent Two",
            body: "I recommend using a microservices approach for better scalability."
        });
        codebolt.chat.sendMessage(`✅ RESPOND (2) Response: ${JSON.stringify(respond2, null, 2)}`);

        // 9. GET - Get deliberation with responses view
        codebolt.chat.sendMessage("\n📖 Test 9: Getting deliberation (responses view)...");
        const getResponsesView = await codebolt.agentDeliberation.get({
            id: deliberationId,
            view: "responses"
        });
        codebolt.chat.sendMessage(`✅ GET (responses) Response: ${JSON.stringify(getResponsesView, null, 2)}`);

        // 10. UPDATE - Update deliberation status to voting
        codebolt.chat.sendMessage("\n✏️ Test 10: Updating deliberation status to 'voting'...");
        const updateToVoting = await codebolt.agentDeliberation.update({
            deliberationId: deliberationId,
            status: "voting"
        });
        codebolt.chat.sendMessage(`✅ UPDATE (voting) Response: ${JSON.stringify(updateToVoting, null, 2)}`);

        // 11. VOTE - Cast a vote for a response
        codebolt.chat.sendMessage("\n🗳️ Test 11: Casting first vote...");
        const vote1 = await codebolt.agentDeliberation.vote({
            deliberationId: deliberationId,
            responseId: responseId,
            voterId: "agent3",
            voterName: "Agent Three"
        });
        codebolt.chat.sendMessage(`✅ VOTE (1) Response: ${JSON.stringify(vote1, null, 2)}`);

        // 12. VOTE - Cast another vote
        codebolt.chat.sendMessage("\n🗳️ Test 12: Casting second vote...");
        const vote2 = await codebolt.agentDeliberation.vote({
            deliberationId: deliberationId,
            responseId: responseId,
            voterId: testAgentId,
            voterName: testAgentName
        });
        codebolt.chat.sendMessage(`✅ VOTE (2) Response: ${JSON.stringify(vote2, null, 2)}`);

        // 13. GET - Get deliberation with votes view
        codebolt.chat.sendMessage("\n📖 Test 13: Getting deliberation (votes view)...");
        const getVotesView = await codebolt.agentDeliberation.get({
            id: deliberationId,
            view: "votes"
        });
        codebolt.chat.sendMessage(`✅ GET (votes) Response: ${JSON.stringify(getVotesView, null, 2)}`);


        // 14. UPDATE - Update deliberation status to completed
        codebolt.chat.sendMessage("\n✏️ Test 14: Updating deliberation status to 'completed'...");
        const updateToCompleted = await codebolt.agentDeliberation.update({
            deliberationId: deliberationId,
            status: "completed"
        });
        codebolt.chat.sendMessage(`✅ UPDATE (completed) Response: ${JSON.stringify(updateToCompleted, null, 2)}`);

        // 15. GET WINNER - Get the winning response
        codebolt.chat.sendMessage("\n🏆 Test 15: Getting the winner...");
        const winner = await codebolt.agentDeliberation.getWinner({
            deliberationId: deliberationId
        });
        codebolt.chat.sendMessage(`✅ GET WINNER Response: ${JSON.stringify(winner, null, 2)}`);

        // 16. GET - Get deliberation with winner view
        codebolt.chat.sendMessage("\n📖 Test 16: Getting deliberation (winner view)...");
        const getWinnerView = await codebolt.agentDeliberation.get({
            id: deliberationId,
            view: "winner"
        });
        codebolt.chat.sendMessage(`✅ GET (winner) Response: ${JSON.stringify(getWinnerView, null, 2)}`);

        // 17. LIST - List by participant
        codebolt.chat.sendMessage("\n📋 Test 17: Listing deliberations by participant...");
        const listByParticipant = await codebolt.agentDeliberation.list({
            participant: "agent1"
        });
        codebolt.chat.sendMessage(`✅ LIST (by participant) Response: ${JSON.stringify(listByParticipant, null, 2)}`);

        // 18. LIST - List with search
        codebolt.chat.sendMessage("\n📋 Test 18: Listing deliberations with search...");
        const listWithSearch = await codebolt.agentDeliberation.list({
            search: "Test"
        });
        codebolt.chat.sendMessage(`✅ LIST (search) Response: ${JSON.stringify(listWithSearch, null, 2)}`);

        // 19. UPDATE - Close the deliberation
        codebolt.chat.sendMessage("\n✏️ Test 19: Closing the deliberation...");
        const updateToClosed = await codebolt.agentDeliberation.update({
            deliberationId: deliberationId,
            status: "closed"
        });
        codebolt.chat.sendMessage(`✅ UPDATE (closed) Response: ${JSON.stringify(updateToClosed, null, 2)}`);

        // Summary
        codebolt.chat.sendMessage("\n" + "=".repeat(50));
        codebolt.chat.sendMessage("🎉 All Agent Deliberation API Tests Completed!");
        codebolt.chat.sendMessage("=".repeat(50));
        codebolt.chat.sendMessage(`
📊 Test Summary:
- create(): ✅ Tested
- get(): ✅ Tested (all views: request, full, responses, votes, winner)
- list(): ✅ Tested (all, filtered, by participant, with search)
- update(): ✅ Tested (status changes: draft → collecting-responses → voting → completed → closed)
- respond(): ✅ Tested (multiple responses)
- vote(): ✅ Tested (multiple votes)
- getWinner(): ✅ Tested
        `);

    } catch (error) {
        codebolt.chat.sendMessage(`❌ Error during testing: ${JSON.stringify(error)}`);
    }
});

import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from "@codebolt/types/sdk";

codebolt.onMessage(async (_reqMessage: FlatUserMessage) => {
    codebolt.chat.sendMessage("🚀 Starting Agent Mail API Tests...\n");

    const testAgentId = "actionBlockTest";
    // const testAgentName = "Test Agent";
    // let messageId: string | undefined;
    // let threadId: string | undefined;

    // // Test 1: Register Agent
    // codebolt.chat.sendMessage("📧 **Test 1: Register Agent**");
    // codebolt.chat.sendMessage(`Registering agent with id='${testAgentId}' and name='${testAgentName}'`);
    
    // try {
    //     const registerResult = await codebolt.mail.registerAgent({
    //         id: testAgentId,
    //         name: testAgentName,
    //         program: "mail-tester",
    //         model: "test-model"
    //     });
    //     codebolt.chat.sendMessage(`✅ Register Agent Result: ${JSON.stringify(registerResult, null, 2)}`);
    // } catch (error: any) {
    //     codebolt.chat.sendMessage(`❌ Register Agent Error: ${error.message}`);
    // }

    // codebolt.chat.sendMessage("\n---\n");

    // // Test 2: Send Message
    // codebolt.chat.sendMessage("📤 **Test 2: Send Message**");
    // codebolt.chat.sendMessage("Sending a test message to another agent");
    
    // try {
    //     const sendResult = await codebolt.mail.sendMessage({
    //         senderId: testAgentId,
    //         senderName: testAgentName,
    //         recipients: ["target-agent-001"],
    //         subject: "Test Message Subject",
    //         body: "This is a test message body from the mail API test.",
    //         importance: "normal",
    //         ackRequired: true,
    //         fileReferences: []
    //     });
    //     codebolt.chat.sendMessage(`✅ Send Message Result: ${JSON.stringify(sendResult, null, 2)}`);
    //     // messageId = sendResult.messageId;
    //     threadId = sendResult.threadId;
    // } catch (error: any) {
    //     codebolt.chat.sendMessage(`❌ Send Message Error: ${error.message}`);
    // }

    // codebolt.chat.sendMessage("\n---\n");

    // // Test 3: Fetch Inbox
    // codebolt.chat.sendMessage("📥 **Test 3: Fetch Inbox**");
    // codebolt.chat.sendMessage(`Fetching inbox for agent '${testAgentId}'`);
    
    // try {
    //     const inboxResult:any = await codebolt.mail.fetchInbox({
    //         agentId: testAgentId,
    //         unreadOnly: false,
    //         limit: 10,
    //         offset: 0
    //     });
    //     messageId= inboxResult.payload.messages[0].id;  
    //     codebolt.chat.sendMessage(`✅ Fetch Inbox Result: ${JSON.stringify(inboxResult, null, 2)}`);
    // } catch (error: any) {
    //     codebolt.chat.sendMessage(`❌ Fetch Inbox Error: ${error.message}`);
    // }

    // codebolt.chat.sendMessage("\n---\n");

    // // Test 4: Reply Message
    // codebolt.chat.sendMessage("↩️ **Test 4: Reply Message**");
    // if (messageId) {
    //     codebolt.chat.sendMessage(`Replying to message '${messageId}'`);
        
    //     try {
    //         const replyResult = await codebolt.mail.replyMessage({
    //             messageId: messageId,
    //             senderId: testAgentId,
    //             senderName: testAgentName,
    //             body: "This is a reply to the test message.",
    //             fileReferences: []
    //         });
    //         codebolt.chat.sendMessage(`✅ Reply Message Result: ${JSON.stringify(replyResult, null, 2)}`);
    //     } catch (error: any) {
    //         codebolt.chat.sendMessage(`❌ Reply Message Error: ${error.message}`);
    //     }
    // } else {
    //     codebolt.chat.sendMessage("⚠️ Skipping - No message ID available from previous test");
    // }

    // codebolt.chat.sendMessage("\n---\n");

    // // Test 5: Mark Read
    // codebolt.chat.sendMessage("✓ **Test 5: Mark Read**");
    // if (messageId) {
    //     codebolt.chat.sendMessage(`Marking message '${messageId}' as read`);
        
    //     try {
    //         const markReadResult = await codebolt.mail.markRead({
    //             messageId: messageId,
    //             agentId: testAgentId
    //         });
    //         codebolt.chat.sendMessage(`✅ Mark Read Result: ${JSON.stringify(markReadResult, null, 2)}`);
    //     } catch (error: any) {
    //         codebolt.chat.sendMessage(`❌ Mark Read Error: ${error.message}`);
    //     }
    // } else {
    //     codebolt.chat.sendMessage("⚠️ Skipping - No message ID available from previous test");
    // }

    // codebolt.chat.sendMessage("\n---\n");

    // // Test 6: Acknowledge
    // codebolt.chat.sendMessage("👍 **Test 6: Acknowledge Message**");
    // if (messageId) {
    //     codebolt.chat.sendMessage(`Acknowledging message '${messageId}'`);
        
    //     try {
    //         const ackResult = await codebolt.mail.acknowledge({
    //             messageId: messageId,
    //             agentId: testAgentId
    //         });
    //         codebolt.chat.sendMessage(`✅ Acknowledge Result: ${JSON.stringify(ackResult, null, 2)}`);
    //     } catch (error: any) {
    //         codebolt.chat.sendMessage(`❌ Acknowledge Error: ${error.message}`);
    //     }
    // } else {
    //     codebolt.chat.sendMessage("⚠️ Skipping - No message ID available from previous test");
    // }

    // codebolt.chat.sendMessage("\n---\n");

    // // Test 7: Search
    // codebolt.chat.sendMessage("🔍 **Test 7: Search Messages**");
    // codebolt.chat.sendMessage("Searching for messages with query 'test'");
    
    // try {
    //     const searchResult = await codebolt.mail.search({
    //         query: "test",
    //         agentId: testAgentId,
    //         limit: 10
    //     });
    //     codebolt.chat.sendMessage(`✅ Search Result: ${JSON.stringify(searchResult, null, 2)}`);
    // } catch (error: any) {
    //     codebolt.chat.sendMessage(`❌ Search Error: ${error.message}`);
    // }

    // codebolt.chat.sendMessage("\n---\n");

    // // Test 8: Summarize Thread
    // codebolt.chat.sendMessage("📋 **Test 8: Summarize Thread**");
    // if (threadId) {
    //     codebolt.chat.sendMessage(`Summarizing thread '${threadId}'`);
        
    //     try {
    //         const summarizeResult = await codebolt.mail.summarizeThread({
    //             threadId: threadId,
    //             maxMessages: 10
    //         });
    //         codebolt.chat.sendMessage(`✅ Summarize Thread Result: ${JSON.stringify(summarizeResult, null, 2)}`);
    //     } catch (error: any) {
    //         codebolt.chat.sendMessage(`❌ Summarize Thread Error: ${error.message}`);
    //     }
    // } else {
    //     codebolt.chat.sendMessage("⚠️ Skipping - No thread ID available from previous test");
    // }

    // codebolt.chat.sendMessage("\n---\n");

    // // Test 9: Reserve Files
    // codebolt.chat.sendMessage("🔒 **Test 9: Reserve Files**");
    // const testFiles = ["/test/file1.ts", "/test/file2.ts"];
    // codebolt.chat.sendMessage(`Reserving files: ${testFiles.join(", ")}`);
    
    // try {
    //     const reserveResult = await codebolt.mail.reserveFiles({
    //         agentId: testAgentId,
    //         paths: testFiles,
    //         exclusive: true,
    //         ttlSeconds: 3600,
    //         reason: "Testing file reservation"
    //     });
    //     codebolt.chat.sendMessage(`✅ Reserve Files Result: ${JSON.stringify(reserveResult, null, 2)}`);
    // } catch (error: any) {
    //     codebolt.chat.sendMessage(`❌ Reserve Files Error: ${error.message}`);
    // }

    // codebolt.chat.sendMessage("\n---\n");

    // // Test 10: List Reservations
    // codebolt.chat.sendMessage("📃 **Test 10: List Reservations**");
    // codebolt.chat.sendMessage(`Listing reservations for agent '${testAgentId}'`);
    
    // try {
    //     const listResult = await codebolt.mail.listReservations({
    //         agentId: testAgentId
    //     });
    //     codebolt.chat.sendMessage(`✅ List Reservations Result: ${JSON.stringify(listResult, null, 2)}`);
    // } catch (error: any) {
    //     codebolt.chat.sendMessage(`❌ List Reservations Error: ${error.message}`);
    // }

    // codebolt.chat.sendMessage("\n---\n");

    // // Test 11: Check Conflicts
    // codebolt.chat.sendMessage("⚠️ **Test 11: Check Conflicts**");
    // codebolt.chat.sendMessage(`Checking conflicts for files: ${testFiles.join(", ")}`);
    
    // try {
    //     const conflictResult = await codebolt.mail.checkConflicts({
    //         agentId: testAgentId,
    //         paths: testFiles
    //     });
    //     codebolt.chat.sendMessage(`✅ Check Conflicts Result: ${JSON.stringify(conflictResult, null, 2)}`);
    // } catch (error: any) {
    //     codebolt.chat.sendMessage(`❌ Check Conflicts Error: ${error.message}`);
    // }

    // codebolt.chat.sendMessage("\n---\n");

    // // Test 12: Force Reserve Files
    // codebolt.chat.sendMessage("🔐 **Test 12: Force Reserve Files**");
    // codebolt.chat.sendMessage(`Force reserving files: ${testFiles.join(", ")}`);
    
    // try {
    //     const forceReserveResult = await codebolt.mail.forceReserveFiles({
    //         agentId: testAgentId,
    //         paths: testFiles,
    //         reason: "Force reservation test"
    //     });
    //     codebolt.chat.sendMessage(`✅ Force Reserve Files Result: ${JSON.stringify(forceReserveResult, null, 2)}`);
    // } catch (error: any) {
    //     codebolt.chat.sendMessage(`❌ Force Reserve Files Error: ${error.message}`);
    // }

    // codebolt.chat.sendMessage("\n---\n");

    // // Test 13: Release Files
    // codebolt.chat.sendMessage("🔓 **Test 13: Release Files**");
    // codebolt.chat.sendMessage(`Releasing files: ${testFiles.join(", ")}`);
    
    // try {
    //     const releaseResult = await codebolt.mail.releaseFiles({
    //         agentId: testAgentId,
    //         paths: testFiles
    //     });
    //     codebolt.chat.sendMessage(`✅ Release Files Result: ${JSON.stringify(releaseResult, null, 2)}`);
    // } catch (error: any) {
    //     codebolt.chat.sendMessage(`❌ Release Files Error: ${error.message}`);
    // }

    // codebolt.chat.sendMessage("\n---\n");

    // codebolt.chat.sendMessage("🎉 **All Agent Mail API tests completed!**");
    // codebolt.chat.sendMessage("\n📊 **Summary:**");
    // codebolt.chat.sendMessage("- registerAgent: Agent registration");
    // codebolt.chat.sendMessage("- sendMessage: Send messages between agents");
    // codebolt.chat.sendMessage("- fetchInbox: Retrieve inbox messages");
    // codebolt.chat.sendMessage("- replyMessage: Reply to messages");
    // codebolt.chat.sendMessage("- markRead: Mark messages as read");
    // codebolt.chat.sendMessage("- acknowledge: Acknowledge message receipt");
    // codebolt.chat.sendMessage("- search: Search messages");
    // codebolt.chat.sendMessage("- summarizeThread: Get thread summary");
    // codebolt.chat.sendMessage("- reserveFiles: Reserve files for editing");
    // codebolt.chat.sendMessage("- listReservations: List file reservations");
    // codebolt.chat.sendMessage("- checkConflicts: Check for file conflicts");
    // codebolt.chat.sendMessage("- forceReserveFiles: Force file reservation");
    // codebolt.chat.sendMessage("- releaseFiles: Release file reservations");

   let response= await codebolt.agentDeliberation.create({
        deliberationType: 'voting',
        title: "Testiing Deliberation ",
    requestMessage: "Testiing",
    creatorId: testAgentId,
    creatorName: "Testing Agent",
    })
     codebolt.chat.sendMessage(JSON.stringify(response));

});

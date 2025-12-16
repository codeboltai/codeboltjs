// import codebolt from '@codebolt/codeboltjs';
// import { FlatUserMessage } from "@codebolt/types/sdk";

// codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
//     codebolt.chat.sendMessage("🚀 Starting capability tests...\n");

//     // Test 1: Execute the test-skill
//     codebolt.chat.sendMessage("📦 **Test 1: Executing test-skill**");
//     codebolt.chat.sendMessage("Calling skill with message='Hello World' and count=3");
    
//     try {
//         const skillResult = await codebolt.capability.startSkill(
//             'test-skill',
//             { 
//                 message: 'Hello World',
//                 count: 3
//             }
//         );
//         codebolt.chat.sendMessage(`✅ Skill Result: ${JSON.stringify(skillResult, null, 2)}`);
//     } catch (error: any) {
//         codebolt.chat.sendMessage(`❌ Skill Error: ${error.message}`);
//     }

//     codebolt.chat.sendMessage("\n---\n");

//     // Test 2: Execute the test-power with read action
//     codebolt.chat.sendMessage("⚡ **Test 2: Executing test-power (read action)**");
//     codebolt.chat.sendMessage("Calling power with action='read' and target='/test/file.txt'");
    
//     try {
//         const powerReadResult = await codebolt.capability.startPower(
//             'test-power',
//             { 
//                 action: 'read',
//                 target: '/test/file.txt',
//                 data: { encoding: 'utf-8' }
//             }
//         );
//         codebolt.chat.sendMessage(`✅ Power Read Result: ${JSON.stringify(powerReadResult, null, 2)}`);
//     } catch (error: any) {
//         codebolt.chat.sendMessage(`❌ Power Read Error: ${error.message}`);
//     }

//     codebolt.chat.sendMessage("\n---\n");

//     // Test 3: Execute the test-power with write action
//     codebolt.chat.sendMessage("⚡ **Test 3: Executing test-power (write action)**");
//     codebolt.chat.sendMessage("Calling power with action='write' and target='/test/output.txt'");
    
//     try {
//         const powerWriteResult = await codebolt.capability.startPower(
//             'test-power',
//             { 
//                 action: 'write',
//                 target: '/test/output.txt',
//                 data: { content: 'Test content to write' }
//             }
//         );
//         codebolt.chat.sendMessage(`✅ Power Write Result: ${JSON.stringify(powerWriteResult, null, 2)}`);
//     } catch (error: any) {
//         codebolt.chat.sendMessage(`❌ Power Write Error: ${error.message}`);
//     }

//     codebolt.chat.sendMessage("\n---\n");

//     // Test 4: Execute the test-power with execute action
//     codebolt.chat.sendMessage("⚡ **Test 4: Executing test-power (execute action)**");
//     codebolt.chat.sendMessage("Calling power with action='execute' and target='echo'");
    
//     try {
//         const powerExecResult = await codebolt.capability.startPower(
//             'test-power',
//             { 
//                 action: 'execute',
//                 target: 'echo',
//                 data: { args: ['Hello', 'from', 'power'] }
//             }
//         );
//         codebolt.chat.sendMessage(`✅ Power Execute Result: ${JSON.stringify(powerExecResult, null, 2)}`);
//     } catch (error: any) {
//         codebolt.chat.sendMessage(`❌ Power Execute Error: ${error.message}`);
//     }

//     codebolt.chat.sendMessage("\n---\n");

//     // Test 5: Execute using generic startCapability method
//     codebolt.chat.sendMessage("🔧 **Test 5: Using generic startCapability method**");
//     codebolt.chat.sendMessage("Calling startCapability with name='test-skill' and type='skill'");
    
//     try {
//         const genericResult = await codebolt.capability.startCapability(
//             'test-skill',
//             'skill',
//             { 
//                 message: 'Generic capability test',
//                 count: 2
//             }
//         );
//         codebolt.chat.sendMessage(`✅ Generic Capability Result: ${JSON.stringify(genericResult, null, 2)}`);
//     } catch (error: any) {
//         codebolt.chat.sendMessage(`❌ Generic Capability Error: ${error.message}`);
//     }

//     codebolt.chat.sendMessage("\n🎉 **All capability tests completed!**");
// });
import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from "@codebolt/types/sdk";
import { CreateTaskOptions } from '@codebolt/types/agent-to-app-ws-schema';

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
    codebolt.chat.sendMessage("starting action block summarizer")
   let response= await  codebolt.actionBlock.start('summary')

codebolt.chat.sendMessage(JSON.stringify(response))

});





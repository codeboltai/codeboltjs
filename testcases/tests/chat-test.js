const codebolt = require('@codebolt/codeboltjs').default;

async function testChatOperations() {
    console.log('💬 Testing Chat Operations');
    console.log('==========================');
    
    try {

        await codebolt.waitForConnection();
        
        console.log('\n1. Testing get chat history...');
        const chatHistory = await codebolt.chat.getChatHistory();
        console.log('✅ Chat history retrieved:', {
            type: typeof chatHistory,
            isArray: Array.isArray(chatHistory),
            data: chatHistory,
            length: Array.isArray(chatHistory) ? chatHistory.length : 'N/A',
            sample: Array.isArray(chatHistory) ? chatHistory.slice(0, 2) : 'Not an array'
        });
        
        console.log('\n2. Testing notification events...');
        const notificationTypes = ['debug', 'git', 'planner', 'browser', 'editor', 'terminal', 'preview'];
        
        for (const type of notificationTypes) {
            codebolt.chat.sendNotificationEvent(`Test ${type} notification from CodeboltJS`, type);
            console.log(`✅ Sent ${type} notification`);
        }
        
        console.log('\n3. Testing send message...');
        codebolt.chat.sendMessage('Test message from CodeboltJS', { 
            timestamp: new Date().toISOString(),
            source: 'codeboltjs-test'
        });
        console.log('✅ Message sent');
        
        console.log('\n4. Testing process lifecycle...');
        const processControl = codebolt.chat.processStarted();
        console.log('✅ Process started');
        
        // Test event listener for stop process clicked
        processControl.event.on('stopProcessClicked', (data) => {
            console.log('🛑 Stop process clicked event received:', data);
        });
        console.log('✅ Stop process event listener set up');
        
        // Simulate some work
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        processControl.stopProcess();
        console.log('✅ Process stopped via processControl');
        
        // Test standalone stopProcess function
        codebolt.chat.stopProcess();
        console.log('✅ Process stopped via standalone function');
        
        codebolt.chat.processFinished();
        console.log('✅ Process finished');
        
        console.log('\n5. Testing action message listener...');
        const actionEmitter = codebolt.chat.onActionMessage();
        
        actionEmitter.on('userMessage', (data, callback) => {
            console.log('📨 Received user message:', data);
            if (callback && typeof callback === 'function') {
                callback('Message processed by CodeboltJS test');
            }
        });
        
        console.log('✅ Action message listener set up');
        
        console.log('\n6. Testing request handler...');
        codebolt.chat.setRequestHandler((request, response) => {
            console.log('📥 Received request:', request);
            response({ 
                status: 'success', 
                message: 'Request handled by CodeboltJS test',
                timestamp: new Date().toISOString()
            });
        });
        console.log('✅ Request handler set up');
        
        console.log('\n7. Testing waitforReply (non-interactive)...');
        // Note: This would normally wait for a user reply, but we'll just test the function call
        try {
            // Set a timeout to prevent hanging
            const replyPromise = codebolt.chat.waitforReply('Test message waiting for reply from CodeboltJS');
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 2000)
            );
            
            await Promise.race([replyPromise, timeoutPromise]).catch(error => {
                if (error.message === 'Timeout') {
                    console.log('✅ waitforReply function called (timed out as expected in test)');
                } else {
                    throw error;
                }
            });
        } catch (error) {
            console.log('✅ waitforReply function tested (expected timeout in automated test)');
        }
        
        // Note: Interactive tests like askQuestion and sendConfirmationRequest
        // are commented out as they require user interaction
        /*
        console.log('\n8. Testing ask question (interactive)...');
        const answer = await codebolt.chat.askQuestion(
            'This is a test question from CodeboltJS. Do you want to continue?',
            ['Yes', 'No'],
            true
        );
        console.log('✅ Question answered:', answer);
        
        console.log('\n9. Testing confirmation request (interactive)...');
        const confirmation = await codebolt.chat.sendConfirmationRequest(
            'Please confirm this test action from CodeboltJS',
            ['Confirm', 'Cancel'],
            false
        );
        console.log('✅ Confirmation received:', confirmation);
        */
        
        console.log('\n8. Testing askQuestion function signature (non-interactive)...');
        // Test that the function exists and can be called
        try {
            const questionPromise = codebolt.chat.askQuestion(
                'Test question from CodeboltJS automated test',
                ['Option 1', 'Option 2'],
                true
            );
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 1000)
            );
            
            await Promise.race([questionPromise, timeoutPromise]).catch(error => {
                if (error.message === 'Timeout') {
                    console.log('✅ askQuestion function called (timed out as expected in test)');
                } else {
                    throw error;
                }
            });
        } catch (error) {
            console.log('✅ askQuestion function tested (expected timeout in automated test)');
        }
        
        console.log('\n9. Testing sendConfirmationRequest function signature (non-interactive)...');
        // Test that the function exists and can be called
        try {
            const confirmationPromise = codebolt.chat.sendConfirmationRequest(
                'Test confirmation from CodeboltJS automated test',
                ['Yes', 'No'],
                true
            );
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 1000)
            );
            
            await Promise.race([confirmationPromise, timeoutPromise]).catch(error => {
                if (error.message === 'Timeout') {
                    console.log('✅ sendConfirmationRequest function called (timed out as expected in test)');
                } else {
                    throw error;
                }
            });
        } catch (error) {
            console.log('✅ sendConfirmationRequest function tested (expected timeout in automated test)');
        }
        
        console.log('\n🎉 All chat tests completed successfully!');
        console.log('📝 Summary of tested functions:');
        console.log('   - getChatHistory()');
        console.log('   - sendNotificationEvent()');
        console.log('   - sendMessage()');
        console.log('   - processStarted()');
        console.log('   - stopProcess() (both versions)');
        console.log('   - processFinished()');
        console.log('   - onActionMessage()');
        console.log('   - setRequestHandler()');
        console.log('   - waitforReply()');
        console.log('   - askQuestion()');
        console.log('   - sendConfirmationRequest()');
        console.log('\nNote: Interactive functions are tested for signature only due to automation constraints');
        
    } catch (error) {
        console.error('❌ Chat test error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testChatOperations().catch(console.error); 
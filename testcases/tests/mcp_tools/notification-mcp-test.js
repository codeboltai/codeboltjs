const codebolt = require('@codebolt/codeboltjs');

async function testNotificationMCPTools() {
    console.log('🔔 Testing Notification MCP Tools');
    console.log('=================================');
    await codebolt.waitForConnection();
    const eventTypes = [
        'debug',
        'git',
        'planner',
        'browser',
        'editor',
        'terminal',
        'console',
        'preview'
    ];
    try {
        // Test notification_send for all valid eventTypes
        for (const eventType of eventTypes) {
            try {
                const result = await codebolt.tools.executeTool('codebolt.notification', 'notification_send', {
                    message: `Test notification for ${eventType}`,
                    eventType
                });
                console.log(`✅ notification_send (${eventType}):`, result?.success, result?.message);
            } catch (e) {
                console.log(`⚠️  notification_send failed for eventType ${eventType}:`, e.message);
            }
        }
        // Negative test: notification_send with missing eventType (should fail)
        try {
            const result = await codebolt.tools.executeTool('codebolt.notification', 'notification_send', {
                message: 'Missing eventType notification'
            });
            console.log('❌ notification_send (missing eventType) should have failed but did not:', result);
        } catch (e) { console.log('✅ Expected failure for missing eventType:', e.message); }
        console.log('🎉 Notification MCP tools tests completed!');
    } catch (e) {
        console.error('❌ Notification MCP tools test error:', e.message);
    }
}

testNotificationMCPTools(); 
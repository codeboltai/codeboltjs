import codebolt from '@codebolt/codeboltjs';

codebolt.onPluginStart(async (ctx) => {
    console.log(`[SimpleUIPlugin] Started: ${ctx.pluginId}`);
});

codebolt.onPluginStop(async () => {
    console.log('[SimpleUIPlugin] Stopped');
});

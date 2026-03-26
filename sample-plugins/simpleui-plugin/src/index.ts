import plugin from '@codebolt/plugin-sdk';

plugin.onStart(async (ctx) => {
    console.log(`[SimpleUIPlugin] Started: ${ctx.pluginId}`);
});

plugin.onStop(async () => {
    console.log('[SimpleUIPlugin] Stopped');
});

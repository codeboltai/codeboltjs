//#region ../../packages/nitro-adapter/src/runtime.mjs
const RUNTIME_BINDING = "CODEBOLT_MINIAPP_RUNTIME";
function useMiniApp(event) {
	const runtime = event?.req?.runtime?.cloudflare?.env?.[RUNTIME_BINDING];
	if (!runtime) throw new Error("MINIAPP_RUNTIME_UNAVAILABLE: this Nitro handler is not running inside the MiniApp Server.");
	return runtime;
}
//#endregion
export { useMiniApp as t };

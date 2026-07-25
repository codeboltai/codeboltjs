import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { parentPort, workerData } from "node:worker_threads";
import { verifyExecutionToken } from "./identity.mjs";

const handlerModule = await import(workerData.handlerUrl);
const fetchHandler = handlerModule.fetch ?? handlerModule.default?.fetch;
const executionStorage = new AsyncLocalStorage();
const runtimeSymbol = Symbol.for("codebolt.miniapp.runtime");

globalThis[runtimeSymbol] = {
  getContext() {
    const execution = executionStorage.getStore();
    if (!execution) {
      throw new Error("MiniApp execution context is unavailable.");
    }
    return execution.context;
  },
  call(capability, input) {
    const execution = executionStorage.getStore();
    if (!execution) {
      throw new Error("MiniApp capability context is unavailable.");
    }
    return execution.call(capability, input);
  },
};

if (typeof fetchHandler !== "function") {
  throw new TypeError("MiniApp output does not export a fetch handler.");
}

parentPort.on("message", ({ type, port, token }) => {
  if (type === "dispatch") {
    void dispatch(port, token);
  }
});

async function dispatch(port, token) {
  let requestController;
  let requestAbort;
  let resolveResponseReady;
  let resolveResponseAck;
  let rejectResponseAck;
  const capabilityCalls = new Map();

  const responseReady = new Promise((resolve) => {
    resolveResponseReady = resolve;
  });

  port.on("message", (message) => {
    if (message.type === "request:chunk") {
      requestController.enqueue(new Uint8Array(message.chunk));
      port.postMessage({ type: "request:ack" });
    } else if (message.type === "request:end") {
      requestController.close();
    } else if (message.type === "request:cancel") {
      requestAbort.abort();
      requestController.error(new DOMException("Request cancelled", "AbortError"));
    } else if (message.type === "response:ready") {
      resolveResponseReady();
    } else if (message.type === "response:ack") {
      resolveResponseAck?.();
    } else if (message.type === "response:cancel") {
      rejectResponseAck?.(new DOMException("Response cancelled", "AbortError"));
    } else if (message.type === "capability:response") {
      const pending = capabilityCalls.get(message.id);
      capabilityCalls.delete(message.id);
      if (message.error) {
        pending?.reject(new Error(message.error));
      } else {
        pending?.resolve(message.result);
      }
    }
  });

  const start = await new Promise((resolve) => {
    const listener = (message) => {
      if (message.type === "request:start") {
        port.off("message", listener);
        resolve(message);
      }
    };
    port.on("message", listener);
  });

  requestAbort = new AbortController();
  const body = start.hasBody
    ? new ReadableStream({
        start(controller) {
          requestController = controller;
        },
      })
    : undefined;

  if (!requestController) {
    requestController = {
      close() {},
      enqueue() {},
      error() {},
    };
  }

  const request = new Request(start.url, {
    method: start.method,
    headers: start.headers,
    body,
    signal: requestAbort.signal,
    ...(body ? { duplex: "half" } : {}),
  });
  port.postMessage({ type: "request:ready" });

  try {
    const claims = verifyExecutionToken(
      token,
      workerData.publicKey,
      workerData.audience,
    );
    const context = {
      miniAppId: claims.miniAppId,
      installId: claims.installId,
      workspaceId: claims.workspaceId,
      principal: claims.principal,
    };
    const call = (capability, input) =>
      new Promise((resolve, reject) => {
        const id = randomUUID();
        capabilityCalls.set(id, { resolve, reject });
        port.postMessage({
          type: "capability:request",
          id,
          capability,
          input,
        });
      });
    const response = await executionStorage.run(
      { context, call },
      () => fetchHandler(request),
    );
    port.postMessage({
      type: "response:start",
      status: response.status,
      statusText: response.statusText,
      headers: [...response.headers],
    });
    await responseReady;

    if (response.body) {
      const reader = response.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          const chunk = value.slice().buffer;
          const acknowledged = new Promise((resolve, reject) => {
            resolveResponseAck = resolve;
            rejectResponseAck = reject;
          });
          port.postMessage({ type: "response:chunk", chunk }, [chunk]);
          await acknowledged;
        }
      } finally {
        reader.releaseLock();
      }
    }
    port.postMessage({ type: "response:end" });
  } catch (error) {
    port.postMessage({
      type: "response:error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

import { MessageChannel, Worker } from "node:worker_threads";
import { createIdentityAuthority } from "./identity.mjs";

const encoder = new TextEncoder();

function transferableChunk(value) {
  const bytes =
    typeof value === "string"
      ? encoder.encode(value)
      : value instanceof Uint8Array
        ? value
        : new Uint8Array(value);
  return bytes.slice().buffer;
}

function createInbox(port) {
  const queued = [];
  const waiters = [];

  port.on("message", (message) => {
    if (message.type === "capability:request") {
      return;
    }
    const waiterIndex = waiters.findIndex((waiter) =>
      waiter.types.includes(message.type),
    );
    if (waiterIndex >= 0) {
      const [waiter] = waiters.splice(waiterIndex, 1);
      waiter.resolve({ type: message.type, message });
      return;
    }
    queued.push(message);
  });

  return {
    wait(type) {
      return this.waitFor([type]).then((result) => result.message);
    },
    waitFor(types) {
      const messageIndex = queued.findIndex((message) =>
        types.includes(message.type),
      );
      if (messageIndex >= 0) {
        const [message] = queued.splice(messageIndex, 1);
        return Promise.resolve({ type: message.type, message });
      }
      return new Promise((resolve) => {
        waiters.push({ types, resolve });
      });
    },
  };
}

async function sendRequestBody(port, inbox, request) {
  port.postMessage({
    type: "request:start",
    method: request.method,
    url: request.url,
    headers: [...request.headers],
    hasBody: request.body !== null,
  });
  await inbox.wait("request:ready");

  if (request.body) {
    const reader = request.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const chunk = transferableChunk(value);
        port.postMessage({ type: "request:chunk", chunk }, [chunk]);
        await inbox.wait("request:ack");
      }
    } finally {
      reader.releaseLock();
    }
  }

  port.postMessage({ type: "request:end" });
}

export class WorkerFetchClient {
  #authority;
  #capabilityHandler;
  #claims;
  #handlerUrl;
  #onExit;
  #pending = new Set();
  #workerUrl;
  #worker;
  #intentionalExit = false;

  constructor(handlerUrl, options = {}) {
    if (options instanceof URL) {
      options = { workerUrl: options };
    }
    this.#authority = options.authority ?? createIdentityAuthority();
    this.#capabilityHandler =
      options.capabilityHandler ??
      (async () => {
        throw new Error("CAPABILITY_HANDLER_UNAVAILABLE");
      });
    this.#claims =
      options.claims ??
      {
        aud: "gate",
        miniAppId: "gate",
        installId: "dev",
        workspaceId: "dev",
        principal: { userId: "dev-user", roles: ["developer"] },
      };
    this.#handlerUrl = handlerUrl;
    this.#onExit = options.onExit;
    this.#workerUrl =
      options.workerUrl ?? new URL("./worker-runner.mjs", import.meta.url);
  }

  get active() {
    return Boolean(this.#worker);
  }

  #ensureWorker() {
    if (!this.#worker) {
      this.#worker = new Worker(this.#workerUrl, {
        workerData: {
          handlerUrl: this.#handlerUrl.href,
          publicKey: this.#authority.publicKey,
          audience: this.#claims.aud,
        },
      });
      this.#intentionalExit = false;
      this.#worker.on("exit", (code) => {
        const intentional = this.#intentionalExit;
        this.#worker = undefined;
        const error = new Error("MINIAPP_WORKER_EXITED");
        error.code = "MINIAPP_WORKER_EXITED";
        for (const reject of this.#pending) {
          reject(error);
        }
        this.#pending.clear();
        this.#onExit?.({ code, intentional });
      });
    }
    return this.#worker;
  }

  fetch(request, options = {}) {
    return new Promise((resolve, reject) => {
      let aborted = false;
      const abort = () => {
        aborted = true;
        reject(new DOMException("Request aborted", "AbortError"));
      };
      if (options.signal?.aborted) {
        abort();
        return;
      }
      options.signal?.addEventListener("abort", abort, { once: true });
      this.#pending.add(reject);
      this.#dispatch(request, options)
        .then((response) => {
          if (!aborted) resolve(response);
        }, (error) => {
          if (!aborted) reject(error);
        })
        .finally(() => {
          options.signal?.removeEventListener("abort", abort);
          this.#pending.delete(reject);
        });
    });
  }

  async #dispatch(request, { signal } = {}) {
    const worker = this.#ensureWorker();
    const { port1, port2 } = new MessageChannel();
    const inbox = createInbox(port1);
    const token = this.#authority.sign(this.#claims);
    worker.postMessage({ type: "dispatch", port: port2, token }, [port2]);

    port1.on("message", (message) => {
      if (message.type !== "capability:request") {
        return;
      }
      void Promise.resolve(
        this.#capabilityHandler(this.#claims, message.capability, message.input),
      ).then(
        (result) =>
          port1.postMessage({
            type: "capability:response",
            id: message.id,
            result,
          }),
        (error) =>
          port1.postMessage({
            type: "capability:response",
            id: message.id,
            error: error instanceof Error ? error.message : String(error),
          }),
      );
    });

    const abort = () => port1.postMessage({ type: "request:cancel" });
    signal?.addEventListener("abort", abort, { once: true });

    try {
      await sendRequestBody(port1, inbox, request);
      const result = await inbox.waitFor(["response:start", "response:error"]);
      if (result.type === "response:error") {
        throw new Error(result.message.message);
      }

      const { status, statusText, headers } = result.message;
      let bodyController;
      const body = new ReadableStream({
        start(controller) {
          bodyController = controller;
          port1.postMessage({ type: "response:ready" });
        },
        cancel() {
          port1.postMessage({ type: "response:cancel" });
          port1.close();
        },
      });

      const pump = async () => {
        while (true) {
          const next = await inbox.waitFor([
            "response:chunk",
            "response:end",
            "response:error",
          ]);
          if (next.type === "response:chunk") {
            bodyController.enqueue(new Uint8Array(next.message.chunk));
            port1.postMessage({ type: "response:ack" });
            continue;
          }
          if (next.type === "response:error") {
            bodyController.error(new Error(next.message.message));
          } else {
            bodyController.close();
          }
          port1.close();
          break;
        }
      };
      void pump();

      return new Response(body, { status, statusText, headers });
    } finally {
      signal?.removeEventListener("abort", abort);
    }
  }

  async close() {
    const worker = this.#worker;
    if (worker) {
      this.#intentionalExit = true;
      await worker.terminate();
    }
  }
}

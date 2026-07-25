import { WorkerFetchClient } from "./worker-transport.mjs";

function serviceUnavailable(error, message) {
  return new Response(JSON.stringify({ error, message }), {
    status: 503,
    headers: { "content-type": "application/json" },
  });
}

export class MiniAppRuntime {
  #app;
  #authority;
  #capabilityService;
  #client;
  #crashes = [];
  #idleMs;
  #idleTimer;
  #inFlight = 0;
  #unhealthy = false;

  constructor({ app, authority, capabilityService, idleMs = 300_000 }) {
    this.#app = app;
    this.#authority = authority;
    this.#capabilityService = capabilityService;
    this.#idleMs = idleMs;
  }

  get status() {
    return {
      id: this.#app.manifest.id,
      active: Boolean(this.#client?.active),
      inFlight: this.#inFlight,
      unhealthy: this.#unhealthy,
      recentCrashes: this.#crashes.length,
    };
  }

  #createClient() {
    if (this.#unhealthy) {
      return null;
    }
    this.#client ??= new WorkerFetchClient(this.#app.handlerUrl, {
      authority: this.#authority,
      claims: {
        aud: this.#app.manifest.id,
        miniAppId: this.#app.manifest.id,
        installId: this.#app.installId,
        workspaceId: this.#app.workspaceId,
        principal: { userId: "dev-user", roles: ["developer"] },
      },
      capabilityHandler: (claims, capability, input) =>
        this.#capabilityService.call(claims, capability, input),
      onExit: ({ intentional }) => {
        this.#client = undefined;
        if (!intentional) {
          const now = Date.now();
          this.#crashes = this.#crashes.filter((time) => now - time <= 60_000);
          this.#crashes.push(now);
          if (this.#crashes.length >= 3) {
            this.#unhealthy = true;
          }
        }
      },
    });
    return this.#client;
  }

  async fetch(request) {
    const client = this.#createClient();
    if (!client) {
      return serviceUnavailable(
        "MINIAPP_UNHEALTHY",
        "The MiniApp crash breaker is open.",
      );
    }

    clearTimeout(this.#idleTimer);
    this.#inFlight += 1;
    try {
      const response = await client.fetch(request);
      if (!response.body) {
        this.#finishRequest();
        return response;
      }

      const reader = response.body.getReader();
      let finished = false;
      const finish = () => {
        if (!finished) {
          finished = true;
          this.#finishRequest();
        }
      };
      const body = new ReadableStream({
        async pull(controller) {
          try {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              finish();
            } else {
              controller.enqueue(value);
            }
          } catch (error) {
            controller.error(error);
            finish();
          }
        },
        async cancel(reason) {
          await reader.cancel(reason);
          finish();
        },
      });
      return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch (error) {
      this.#finishRequest();
      if (error?.code === "MINIAPP_WORKER_EXITED") {
        return serviceUnavailable(
          "MINIAPP_WORKER_EXITED",
          "The MiniApp worker exited while handling the request.",
        );
      }
      throw error;
    }
  }

  #finishRequest() {
    this.#inFlight = Math.max(0, this.#inFlight - 1);
    if (this.#inFlight === 0 && this.#client?.active) {
      clearTimeout(this.#idleTimer);
      this.#idleTimer = setTimeout(() => {
        if (this.#inFlight === 0) {
          void this.stop();
        }
      }, this.#idleMs);
      this.#idleTimer.unref?.();
    }
  }

  async stop() {
    clearTimeout(this.#idleTimer);
    const client = this.#client;
    this.#client = undefined;
    await client?.close();
  }

  async reload() {
    await this.stop();
    this.#crashes = [];
    this.#unhealthy = false;
  }
}

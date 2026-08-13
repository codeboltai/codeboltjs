function json(value, status = 200) {
  return Response.json(value, { status });
}

export default {
  async fetch(request, runtime) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/api/info") {
      return json({ title: "Hello MiniApp", instance: runtime.instance });
    }
    if (request.method === "GET" && url.pathname === "/api/counter") {
      const counter = await runtime.storage.get("state", "counter");
      return json(counter || { id: "counter", value: 0 });
    }
    if (request.method === "POST" && url.pathname === "/api/counter/increment") {
      const current = await runtime.storage.get("state", "counter");
      const counter = { id: "counter", value: Number(current?.value || 0) + 1 };
      await runtime.storage.set("state", "counter", counter);
      return json(counter);
    }
    return json({ error: "NOT_FOUND", path: url.pathname }, 404);
  }
};

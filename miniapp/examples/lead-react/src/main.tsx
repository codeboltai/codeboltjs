import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

interface Lead {
  id: string;
  name: string;
  company: string;
  email?: string;
}

function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    const data = await fetch("/api/leads").then((response) => response.json());
    setLeads(data.documents);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function addLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = event.currentTarget;
    const input = Object.fromEntries(new FormData(form)) as Omit<Lead, "id">;
    await fetch("/__codebolt/tools/add-lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        ...input,
      }),
    });
    form.reset();
    await refresh();
    setSaving(false);
  }

  return (
    <main>
      <section className="intro">
        <p>React MiniApp</p>
        <h1>Lead tracker</h1>
      </section>

      <section className="panel">
        <form onSubmit={addLead}>
          <label>
            Name
            <input name="name" required />
          </label>
          <label>
            Company
            <input name="company" required />
          </label>
          <label>
            Email
            <input name="email" type="email" />
          </label>
          <button disabled={saving}>{saving ? "Adding..." : "Add lead"}</button>
        </form>
      </section>

      <section className="panel">
        <h2>Leads</h2>
        {leads.length === 0 ? (
          <p className="empty">No leads yet.</p>
        ) : (
          <ul>
            {leads.map((lead) => (
              <li key={lead.id}>
                <strong>{lead.name}</strong>
                <span>{lead.company}</span>
                {lead.email ? <small>{lead.email}</small> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

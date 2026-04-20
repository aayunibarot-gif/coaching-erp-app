import React, { useState } from "react";
import api from "../api/axios";
import SectionHeader from "../components/SectionHeader";

export default function AssistantPage() {
  const [query, setQuery] = useState("attendance");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const ask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/assistant", { query });
      setResponse(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionHeader title="ERP Assistant" subtitle="Uses real database data only" />

      <form onSubmit={ask} className="card mb-6 space-y-4">
        <div>
          <label className="label">Ask something</label>
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="attendance / marks / fees / timetable / performance"
          />
        </div>
        <button className="btn-primary">{loading ? "Checking..." : "Ask Assistant"}</button>
      </form>

      <div className="card">
        <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-slate-700">
          {response ? JSON.stringify(response, null, 2) : "Response will appear here."}
        </pre>
      </div>
    </div>
  );
}

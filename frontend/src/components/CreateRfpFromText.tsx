import React, { useState } from "react";
import { apiUrl } from "../utils/api";

interface Props {
  onCreated: () => void;
}

export const CreateRfpFromText: React.FC<Props> = ({ onCreated }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/rfps/from-text"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to create RFP");
      }
      setText("");
      onCreated();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <label className="field">
        <span>Describe your procurement need</span>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder='e.g. "I need to procure laptops and monitors for our new office..."'
          rows={5}
        />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Creating RFP with AI…" : "Create RFP"}
      </button>
    </form>
  );
};



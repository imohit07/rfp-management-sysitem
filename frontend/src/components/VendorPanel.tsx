import React, { useEffect, useState } from "react";
import { apiUrl } from "../utils/api";

interface Vendor {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

export const VendorPanel: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadVendors = async () => {
    const res = await fetch(apiUrl("/api/vendors"));
    const data = await res.json();
    setVendors(data);
  };

  useEffect(() => {
    void loadVendors();
  }, []);

  const createVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/vendors"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone: phone || undefined })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to create vendor");
      }
      setName("");
      setEmail("");
      setPhone("");
      await loadVendors();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const deleteVendor = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete vendor "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(apiUrl(`/api/vendors/${id}`), {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete vendor");
      await loadVendors();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <div className="card">
      <form onSubmit={createVendor} className="field-grid">
        <input
          placeholder="Vendor name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          placeholder="Phone (optional)"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>
      {error && <p className="error">{error}</p>}

      <ul className="simple-list">
        {vendors.map(v => (
          <li key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <strong>{v.name}</strong>
                <span style={{ backgroundColor: "#007bff", color: "white", padding: "2px 8px", borderRadius: "3px", fontSize: "12px", fontWeight: "bold" }}>ID: {v.id}</span>
              </div>
              <div>{v.email}</div>
              {v.phone && <div>{v.phone}</div>}
            </div>
            <button
              onClick={() => deleteVendor(v.id, v.name)}
              style={{
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                padding: "4px 8px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              Delete
            </button>
          </li>
        ))}
        {!vendors.length && <li>No vendors yet. Add some above.</li>}
      </ul>
    </div>
  );
};



import React, { useEffect, useState } from "react";

interface Vendor {
  id: number;
  name: string;
  email: string;
}

interface Proposal {
  id: number;
  vendor: Vendor;
  totalPrice?: number;
  currency?: string;
  deliveryDays?: number;
  aiSummary?: string;
  createdAt: string;
}

interface RfpDetailData {
  id: number;
  title: string;
  description: string;
  status: string;
  budget?: number;
  currency?: string;
  deliveryWindow?: string;
  paymentTerms?: string;
  warranty?: string;
  lineItems: Array<{
    id: number;
    name: string;
    quantity: number;
    specs?: string;
  }>;
  proposals: Proposal[];
}

interface Props {
  rfpId: number;
  onDeleted?: () => void;
}

export const RfpDetail: React.FC<Props> = ({ rfpId, onDeleted }) => {
  const [rfp, setRfp] = useState<RfpDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [selectedVendorIds, setSelectedVendorIds] = useState<number[]>([]);
  const [comparison, setComparison] = useState<any | null>(null);
  const [comparing, setComparing] = useState(false);
  const [polling, setPolling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pollingServiceRunning, setPollingServiceRunning] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [emailSentMessage, setEmailSentMessage] = useState<string | null>(null);

  const loadRfp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rfps/${rfpId}`);
      if (!res.ok) throw new Error("Failed to load RFP");
      const data: RfpDetailData = await res.json();
      setRfp(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const checkPollingStatus = async () => {
    setCheckingStatus(true);
    try {
      const res = await fetch("/api/email/polling/status");
      if (res.ok) {
        const data = await res.json();
        setPollingServiceRunning(data.isRunning);
      }
    } catch (e) {
      console.error("Failed to check polling status:", e);
    } finally {
      setCheckingStatus(false);
    }
  };

  const togglePollingService = async () => {
    try {
      const endpoint = pollingServiceRunning ? "/api/email/polling/stop" : "/api/email/polling/start";
      const res = await fetch(endpoint, { method: "POST" });
      if (!res.ok) throw new Error(`Failed to ${pollingServiceRunning ? "stop" : "start"} polling service`);
      await checkPollingStatus();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  useEffect(() => {
    void loadRfp();
    void checkPollingStatus();
  }, [rfpId]);

  const sendToVendors = async () => {
    if (!selectedVendorIds.length) {
      alert("Select at least one vendor in the RFP detail (hardcoded for demo).");
      return;
    }
    setSending(true);
    setEmailSentMessage(null);
    try {
      const res = await fetch(`/api/rfps/${rfpId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorIds: selectedVendorIds })
      });
      if (!res.ok) throw new Error("Failed to send RFP");
      const data = await res.json();
      setEmailSentMessage(`✅ RFP successfully sent to ${selectedVendorIds.length} vendor(s)!`);
      setTimeout(() => setEmailSentMessage(null), 5000);
      await loadRfp();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const pollInbox = async () => {
    setPolling(true);
    try {
      const res = await fetch("/api/email/poll", { method: "POST" });
      if (!res.ok) throw new Error("Failed to poll inbox");
      await loadRfp();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setPolling(false);
    }
  };

  const runComparison = async () => {
    setComparing(true);
    try {
      const res = await fetch(`/api/rfps/${rfpId}/compare`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Comparison failed");
      setComparison(data);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setComparing(false);
    }
  };

  const deleteRfp = async () => {
    if (!confirm(`Are you sure you want to delete "${rfp?.title}"? This action cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/rfps/${rfpId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete RFP");
      if (onDeleted) {
        onDeleted();
      }
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !rfp) {
    return <p>Loading RFP…</p>;
  }

  const toggleVendorSelection = (vendorId: number) => {
    setSelectedVendorIds(prev =>
      prev.includes(vendorId) ? prev.filter(id => id !== vendorId) : [...prev, vendorId]
    );
  };

  return (
    <div className="rfp-detail">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>{rfp.title}</h2>
          <button
            onClick={deleteRfp}
            disabled={deleting}
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: deleting ? "not-allowed" : "pointer"
            }}
          >
            {deleting ? "Deleting…" : "Delete RFP"}
          </button>
        </div>
        <p>{rfp.description}</p>
        <div className="meta-grid">
          {rfp.budget && (
            <div>
              <span className="label">Budget</span>
              <span>
                {rfp.budget} {rfp.currency ?? "USD"}
              </span>
            </div>
          )}
          {rfp.deliveryWindow && (
            <div>
              <span className="label">Delivery</span>
              <span>{rfp.deliveryWindow}</span>
            </div>
          )}
          {rfp.paymentTerms && (
            <div>
              <span className="label">Payment terms</span>
              <span>{rfp.paymentTerms}</span>
            </div>
          )}
          {rfp.warranty && (
            <div>
              <span className="label">Warranty</span>
              <span>{rfp.warranty}</span>
            </div>
          )}
        </div>
        {!!rfp.lineItems.length && (
          <div className="line-items">
            <h3>Line items</h3>
            <ul>
              {rfp.lineItems.map(li => (
                <li key={li.id}>
                  <strong>
                    {li.name} × {li.quantity}
                  </strong>
                  {li.specs && <div>{li.specs}</div>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="card workflow-card">
        <div className="workflow-header">
          <h3>⚡ Workflow Actions</h3>
          <p className="workflow-subtitle">Manage RFP distribution and proposal analysis</p>
        </div>

        {emailSentMessage && (
          <div className="success-message">
            {emailSentMessage}
          </div>
        )}

        {/* Send RFP Section */}
        <div className="workflow-section">
          <div className="workflow-section-header">
            <span className="workflow-icon">📧</span>
            <div>
              <h4>Send RFP to Vendors</h4>
              <p className="workflow-hint">Enter vendor IDs from the Vendors tab (e.g., 5,6,7)</p>
            </div>
          </div>
          <div className="workflow-input-group">
            <input
              className="workflow-input"
              placeholder="Vendor IDs: 5,6,7"
              onChange={e => {
                const ids = e.target.value
                  .split(",")
                  .map(s => Number(s.trim()))
                  .filter(Boolean);
                setSelectedVendorIds(ids);
              }}
            />
            <button className="btn-primary" onClick={sendToVendors} disabled={sending}>
              {sending ? "📤 Sending…" : "🚀 Send RFP"}
            </button>
          </div>
        </div>

        {/* Email Polling Section */}
        <div className="workflow-section">
          <div className="workflow-section-header">
            <span className="workflow-icon">📬</span>
            <div>
              <h4>Email Polling Service</h4>
              <p className="workflow-hint">Automatically check for vendor responses</p>
            </div>
          </div>
          <div className={`polling-status ${pollingServiceRunning ? 'active' : 'inactive'}`}>
            <div className="polling-status-info">
              <div className="status-indicator">
                <span className={`status-dot ${pollingServiceRunning ? 'active' : 'inactive'}`}></span>
                <span className="status-text">
                  {checkingStatus ? "Checking..." : pollingServiceRunning ? "Active" : "Inactive"}
                </span>
              </div>
              {pollingServiceRunning && (
                <span className="polling-interval">Checks every 2 minutes</span>
              )}
            </div>
            <button 
              className={pollingServiceRunning ? "btn-danger" : "btn-success"}
              onClick={togglePollingService}
            >
              {pollingServiceRunning ? "⏸️ Stop" : "▶️ Start"}
            </button>
          </div>
          <button className="btn-secondary" onClick={pollInbox} disabled={polling}>
            {polling ? "🔄 Checking…" : "🔄 Manual Check Now"}
          </button>
        </div>

        {/* AI Comparison Section */}
        <div className="workflow-section">
          <div className="workflow-section-header">
            <span className="workflow-icon">🤖</span>
            <div>
              <h4>AI Analysis</h4>
              <p className="workflow-hint">Compare proposals and get recommendations</p>
            </div>
          </div>
          <button className="btn-ai" onClick={runComparison} disabled={comparing}>
            {comparing ? "✨ Analyzing…" : "✨ Compare with AI"}
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Proposals</h3>
        {rfp.proposals.length === 0 && <p>No proposals yet.</p>}
        <div className="proposal-grid">
          {rfp.proposals.map(p => (
            <div key={p.id} className="proposal-card">
              <div className="proposal-header">
                <strong>{p.vendor.name}</strong>
                <span>{p.vendor.email}</span>
              </div>
              <div className="proposal-meta">
                {p.totalPrice && (
                  <div>
                    <span className="label">Total</span>
                    <span>
                      {p.totalPrice} {p.currency ?? "USD"}
                    </span>
                  </div>
                )}
                {p.deliveryDays && (
                  <div>
                    <span className="label">Delivery</span>
                    <span>{p.deliveryDays} days</span>
                  </div>
                )}
                <div>
                  <span className="label">Received</span>
                  <span>{new Date(p.createdAt).toLocaleString()}</span>
                </div>
              </div>
              {p.aiSummary && <p className="summary">{p.aiSummary}</p>}
            </div>
          ))}
        </div>
      </div>

      {comparison && (
        <div className="card comparison">
          <h3>AI Recommendation</h3>
          <p>
            <strong>Recommended vendor:</strong> {comparison.recommendation}
          </p>
          <p>{comparison.rationale}</p>
          <h4>Per-vendor scores</h4>
          <ul>
            {comparison.perVendor?.map((pv: any) => (
              <li key={pv.vendorId}>
                <strong>
                  {pv.vendorName} – {pv.score}
                </strong>
                {pv.strengths?.length > 0 && (
                  <div>
                    <span className="label">Strengths</span> {pv.strengths.join("; ")}
                  </div>
                )}
                {pv.weaknesses?.length > 0 && (
                  <div>
                    <span className="label">Weaknesses</span> {pv.weaknesses.join("; ")}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
};



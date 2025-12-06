import React, { useEffect, useState } from "react";
import { RfpList } from "./components/RfpList";
import { RfpDetail } from "./components/RfpDetail";
import { VendorPanel } from "./components/VendorPanel";
import { CreateRfpFromText } from "./components/CreateRfpFromText";
import { apiUrl } from "./utils/api";

export interface RfpSummary {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

export const App: React.FC = () => {
  const [rfps, setRfps] = useState<RfpSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'vendors'>('dashboard');

  const loadRfps = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/rfps"));
      if (!res.ok) throw new Error("Failed to load RFPs");
      const data = await res.json();
      setRfps(data);
      if (!selectedId && data.length) {
        setSelectedId(data[0].id);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRfps();
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-content">
          <div className="header-branding">
            <div className="logo">⚡</div>
            <div>
              <h1>RFP Manager</h1>
              <p>AI-Powered Procurement Platform</p>
            </div>
          </div>
          <nav className="header-nav">
            <button 
              className={`nav-btn ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveView('dashboard')}
            >
              📊 Dashboard
            </button>
            <button 
              className={`nav-btn ${activeView === 'vendors' ? 'active' : ''}`}
              onClick={() => setActiveView('vendors')}
            >
              👥 Vendors
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {activeView === 'dashboard' ? (
          <div className="dashboard-layout">
            <section className="create-section">
              <div className="section-header">
                <h2>✨ Create New RFP</h2>
                <p className="section-subtitle">Describe your procurement needs and let AI structure it</p>
              </div>
              <CreateRfpFromText onCreated={loadRfps} />
            </section>

            <section className="rfp-grid-section">
              <div className="section-header">
                <h2>📋 Your RFPs</h2>
                <p className="section-subtitle">{rfps.length} active procurement request{rfps.length !== 1 ? 's' : ''}</p>
              </div>
              {loading && <p className="loading-text">Loading…</p>}
              {error && <p className="error">{error}</p>}
              {!loading && (
                <div className="rfp-grid">
                  {rfps.map(rfp => (
                    <button
                      key={rfp.id}
                      className={`rfp-card ${selectedId === rfp.id ? 'selected' : ''}`}
                      onClick={() => setSelectedId(rfp.id)}
                    >
                      <div className="rfp-card-header">
                        <h3>{rfp.title}</h3>
                        <span className={`status-badge status-${rfp.status}`}>{rfp.status}</span>
                      </div>
                      <p className="rfp-card-desc">{rfp.description}</p>
                      <div className="rfp-card-footer">
                        <span className="rfp-date">📅 {new Date(rfp.createdAt).toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))}
                  {!rfps.length && (
                    <div className="empty-state">
                      <div className="empty-icon">📭</div>
                      <p>No RFPs yet. Create your first one above!</p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {selectedId && (
              <section className="detail-section">
                <RfpDetail
                  rfpId={selectedId}
                  onDeleted={() => {
                    setSelectedId(null);
                    void loadRfps();
                  }}
                />
              </section>
            )}
          </div>
        ) : (
          <div className="vendors-layout">
            <section className="vendors-section">
              <div className="section-header">
                <h2>👥 Vendor Management</h2>
                <p className="section-subtitle">Manage your vendor database</p>
              </div>
              <VendorPanel />
            </section>
          </div>
        )}
      </main>
    </div>
  );
};



import React from "react";
import type { RfpSummary } from "../App";

interface Props {
  rfps: RfpSummary[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export const RfpList: React.FC<Props> = ({ rfps, selectedId, onSelect }) => {
  return (
    <div className="card list">
      {rfps.map(rfp => (
        <button
          key={rfp.id}
          type="button"
          className={`list-item ${selectedId === rfp.id ? "selected" : ""}`}
          onClick={() => onSelect(rfp.id)}
        >
          <div className="list-item-main">
            <span className="list-item-title">{rfp.title}</span>
            <span className="badge">{rfp.status}</span>
          </div>
          <div className="list-item-sub">
            {new Date(rfp.createdAt).toLocaleString()}
          </div>
        </button>
      ))}
      {!rfps.length && <p>No RFPs yet. Create one above.</p>}
    </div>
  );
};



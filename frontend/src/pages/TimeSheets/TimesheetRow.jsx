import React, { useState, useRef, useEffect } from "react";

const STATUS_COLORS = {
  Pending: { bg: "#e8f0fe", color: "#1a56db", border: "#93c5fd" },
  Approved: { bg: "#dcfce7", color: "#15803d", border: "#86efac" },
  Rejected: { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5" },
  Draft: { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db" },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.Draft;
  return (
    <span
      className="ts-status-badge"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {status.toUpperCase()}
    </span>
  );
}

function EntryRow({ entry }) {
  return (
    <tr className="ts-entry-row">
      <td>
        <StatusBadge status="Pending" />
      </td>
      <td className="ts-employee-cell">
        <div className="ts-employee-name">{entry.employee}</div>
      </td>
      <td>{entry.classification}</td>
      <td>{entry.subJob}</td>
      <td>
        <span className="ts-cost-code">{entry.costCode}</span>
      </td>
      <td>{entry.location}</td>
      <td>{entry.startTime}</td>
      <td>{entry.stopTime}</td>
      <td>{entry.lunchTime}</td>
      <td>
        <span className="ts-hours-cell">
          {entry.totalHours.toFixed(2)}
          <span className="ts-info-icon" title="Calculated from start/stop/lunch">ⓘ</span>
        </span>
      </td>
      <td>{entry.timeType}</td>
      <td>
        <span className={`ts-bool ${entry.billable ? "ts-bool--yes" : "ts-bool--no"}`}>
          {entry.billable ? "Yes" : "No"}
        </span>
      </td>
      <td>
        <span className="ts-sig-awaiting">{entry.signatureStatus} ›</span>
      </td>
    </tr>
  );
}

export default function TimesheetRow({ timesheet, onStatusChange, onDelete, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Group entries by crew name
  const crews = timesheet.entries.reduce((acc, entry) => {
    const crew = entry.crewName || "General";
    if (!acc[crew]) acc[crew] = [];
    acc[crew].push(entry);
    return acc;
  }, {});

  const formatDate = (d) => {
    const date = new Date(d);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yy = date.getFullYear();
    // Extract number from timesheetId (e.g., "10-21-2022-04" → "04")
    const parts = timesheet.timesheetId.split("-");
    const num = parts[parts.length - 1];
    return `${mm}-${dd}-${yy} - ${num}`;
  };

  return (
    <div className={`ts-row-card ${expanded ? "ts-row-card--expanded" : ""}`}>
      {/* ── Summary Bar ── */}
      <div className="ts-row-summary" onClick={() => setExpanded((v) => !v)}>
        <div className="ts-row-summary-left">
          <span className={`ts-expand-icon ${expanded ? "ts-expand-icon--open" : ""}`}>
            ›
          </span>
          <span className="ts-row-id">{formatDate(timesheet.date)}</span>
          <StatusBadge status={timesheet.status} />
        </div>

        <div className="ts-row-summary-right" onClick={(e) => e.stopPropagation()}>
          <div className="ts-row-meta">
            <div className="ts-meta-item">
              <span className="ts-meta-label">Created By</span>
              <span className="ts-meta-value">{timesheet.createdBy}</span>
            </div>
            <div className="ts-meta-item">
              <span className="ts-meta-label">Total Hours</span>
              <span className="ts-meta-value ts-meta-number">{timesheet.totalHours}</span>
            </div>
            {timesheet.salaryHours > 0 && (
              <div className="ts-meta-item">
                <span className="ts-meta-label">SAL</span>
                <span className="ts-meta-value ts-meta-number">{timesheet.salaryHours}</span>
              </div>
            )}
            <div className="ts-meta-item">
              <span className="ts-meta-label">REG</span>
              <span className="ts-meta-value ts-meta-number">{timesheet.regularHours}</span>
            </div>
          </div>

          {/* ── Three-dot Menu ── */}
          <div className="ts-kebab-wrap" ref={menuRef}>
            <button
              className="ts-kebab-btn"
              onClick={() => setMenuOpen((v) => !v)}
            >
              ⋮
            </button>
            {menuOpen && (
              <div className="ts-kebab-menu">
                <button onClick={() => { onStatusChange(timesheet._id, "Approved"); setMenuOpen(false); }}>
                  ✅ Approve
                </button>
                <button onClick={() => { onStatusChange(timesheet._id, "Rejected"); setMenuOpen(false); }}>
                  ❌ Reject
                </button>
                <button onClick={() => { onStatusChange(timesheet._id, "Draft"); setMenuOpen(false); }}>
                  📝 Set as Draft
                </button>
                <hr />
                <button
                  className="ts-kebab-delete"
                  onClick={() => { onDelete(timesheet._id); setMenuOpen(false); }}
                >
                  🗑 Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Expanded Entries Table ── */}
      {expanded && (
        <div className="ts-entries-wrap">
          <div className="ts-entries-scroll">
            <table className="ts-entries-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>
                    Employees
                    <span className="ts-sort-icon">⇅</span>
                  </th>
                  <th>Classification</th>
                  <th>Sub Job</th>
                  <th>Cost Code</th>
                  <th>Location</th>
                  <th>Start Time</th>
                  <th>Stop Time</th>
                  <th>Lunch Time</th>
                  <th>Total Hours</th>
                  <th>Time Type</th>
                  <th>Billable</th>
                  <th>Signature</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(crews).map(([crewName, entries]) => (
                  <React.Fragment key={crewName}>
                    <tr className="ts-crew-header">
                      <td colSpan={13}>
                        <strong>{crewName}</strong>
                      </td>
                    </tr>
                    {entries.map((entry, i) => (
                      <EntryRow key={i} entry={entry} />
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
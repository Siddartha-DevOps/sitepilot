import React, { useState } from "react";

const COST_CODES = [
  "01-000 - General Conditions",
  "02-200 - Site Work",
  "02-230 - Site Clearing",
  "03-300 - Concrete",
  "04-200 - Masonry",
  "05-500 - Metals",
  "06-100 - Rough Carpentry",
  "06-400 - Architectural Woodwork",
  "07-500 - Membrane Roofing",
  "08-100 - Metal Doors & Frames",
  "09-900 - Painting",
];

const TIME_TYPES = ["Regular Time", "Overtime", "Double Time", "Salary"];

const EMPTY_ENTRY = {
  employee: "",
  classification: "None",
  subJob: "None",
  costCode: "",
  location: "None",
  startTime: "8:00 AM",
  stopTime: "5:00 PM",
  lunchTime: "30 min",
  totalHours: 8,
  timeType: "Regular Time",
  billable: true,
  signatureStatus: "Awaiting",
  crewName: "General",
};

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function CreateTimesheetModal({ onClose, onCreated }) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [createdBy, setCreatedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [entries, setEntries] = useState([{ ...EMPTY_ENTRY }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateEntry = (idx, field, value) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e))
    );
  };

  const addEntry = () => setEntries((prev) => [...prev, { ...EMPTY_ENTRY }]);

  const removeEntry = (idx) =>
    setEntries((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    setError("");
    if (!date || !createdBy.trim()) {
      setError("Date and Created By are required.");
      return;
    }
    if (entries.some((e) => !e.employee.trim() || !e.costCode)) {
      setError("All entries need an employee name and cost code.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/timesheets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: currentProject._id, // replace with actual projectId from context
          date,
          createdBy,
          entries,
          notes,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      onCreated(json.data);
    } catch (err) {
      setError(err.message || "Failed to create timesheet.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ts-modal-overlay" onClick={onClose}>
      <div className="ts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ts-modal-header">
          <h2>Create Timesheet</h2>
          <button className="ts-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="ts-modal-body">
          {error && <div className="ts-modal-error">{error}</div>}

          {/* ── Header Fields ── */}
          <div className="ts-modal-fields">
            <div className="ts-field-group">
              <label>Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="ts-field-group">
              <label>Created By *</label>
              <input
                type="text"
                placeholder="e.g. PM Carder"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
              />
            </div>
            <div className="ts-field-group ts-field-group--full">
              <label>Notes</label>
              <textarea
                rows={2}
                placeholder="Optional notes…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* ── Entries ── */}
          <div className="ts-modal-entries-header">
            <h3>Time Entries</h3>
            <button className="ts-btn-outline" onClick={addEntry}>
              + Add Entry
            </button>
          </div>

          <div className="ts-modal-entries">
            {entries.map((entry, idx) => (
              <div key={idx} className="ts-modal-entry-card">
                <div className="ts-modal-entry-top">
                  <span className="ts-entry-num">#{idx + 1}</span>
                  {entries.length > 1 && (
                    <button
                      className="ts-entry-remove"
                      onClick={() => removeEntry(idx)}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="ts-modal-fields">
                  <div className="ts-field-group">
                    <label>Employee *</label>
                    <input
                      type="text"
                      placeholder="Full name"
                      value={entry.employee}
                      onChange={(e) => updateEntry(idx, "employee", e.target.value)}
                    />
                  </div>
                  <div className="ts-field-group">
                    <label>Crew Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Framing Crew"
                      value={entry.crewName}
                      onChange={(e) => updateEntry(idx, "crewName", e.target.value)}
                    />
                  </div>
                  <div className="ts-field-group">
                    <label>Cost Code *</label>
                    <select
                      value={entry.costCode}
                      onChange={(e) => updateEntry(idx, "costCode", e.target.value)}
                    >
                      <option value="">Select…</option>
                      {COST_CODES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="ts-field-group">
                    <label>Time Type</label>
                    <select
                      value={entry.timeType}
                      onChange={(e) => updateEntry(idx, "timeType", e.target.value)}
                    >
                      {TIME_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="ts-field-group">
                    <label>Start Time</label>
                    <input
                      type="text"
                      placeholder="8:00 AM"
                      value={entry.startTime}
                      onChange={(e) => updateEntry(idx, "startTime", e.target.value)}
                    />
                  </div>
                  <div className="ts-field-group">
                    <label>Stop Time</label>
                    <input
                      type="text"
                      placeholder="5:00 PM"
                      value={entry.stopTime}
                      onChange={(e) => updateEntry(idx, "stopTime", e.target.value)}
                    />
                  </div>
                  <div className="ts-field-group">
                    <label>Lunch Time</label>
                    <input
                      type="text"
                      placeholder="30 min"
                      value={entry.lunchTime}
                      onChange={(e) => updateEntry(idx, "lunchTime", e.target.value)}
                    />
                  </div>
                  <div className="ts-field-group">
                    <label>Total Hours *</label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      value={entry.totalHours}
                      onChange={(e) =>
                        updateEntry(idx, "totalHours", parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="ts-field-group">
                    <label>Billable</label>
                    <select
                      value={entry.billable ? "yes" : "no"}
                      onChange={(e) =>
                        updateEntry(idx, "billable", e.target.value === "yes")
                      }
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  <div className="ts-field-group">
                    <label>Location</label>
                    <input
                      type="text"
                      placeholder="None"
                      value={entry.location}
                      onChange={(e) => updateEntry(idx, "location", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ts-modal-footer">
          <button className="ts-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            className="ts-btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Creating…" : "Create Timesheet"}
          </button>
        </div>
      </div>
    </div>
  );
}
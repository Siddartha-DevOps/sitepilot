import React, { useState, useEffect, useCallback } from "react";
import TimesheetRow from "./TimesheetRow";
import CreateTimesheetModal from "./CreateTimesheetModal";
import "./Timesheets.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const PAGE_SIZE = 5;

export default function Timesheets() {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);

  // Default to current week
  useEffect(() => {
    const now = new Date();
    const day = now.getDay();
    const mon = new Date(now);
    mon.setDate(now.getDate() - day + 1);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    setDateRange({
      start: mon.toISOString().split("T")[0],
      end: sun.toISOString().split("T")[0],
    });
  }, []);

  const fetchTimesheets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: PAGE_SIZE,
        ...(search && { search }),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end }),
        ...(statusFilter && { status: statusFilter }),
      });

      const res = await fetch(`${API_BASE}/timesheets?${params}`);
      const json = await res.json();
      if (json.success) {
        setTimesheets(json.data);
        setPagination(json.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch timesheets:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, dateRange, statusFilter]);

  useEffect(() => {
    if (dateRange.start && dateRange.end) fetchTimesheets();
  }, [fetchTimesheets, dateRange]);

  const handleExportCSV = async () => {
    const params = new URLSearchParams({
      ...(dateRange.start && { startDate: dateRange.start }),
      ...(dateRange.end && { endDate: dateRange.end }),
    });
    window.open(`${API_BASE}/timesheets/export/csv?${params}`, "_blank");
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetch(`${API_BASE}/timesheets/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTimesheets();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this timesheet?")) return;
    try {
      await fetch(`${API_BASE}/timesheets/${id}`, { method: "DELETE" });
      fetchTimesheets();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const formatDisplayDate = (start, end) => {
    if (!start || !end) return "";
    const fmt = (d) => {
      const [y, m, day] = d.split("-");
      return `${m}/${day}/${y}`;
    };
    return `${fmt(start)} - ${fmt(end)}`;
  };

  const clearDateFilter = () => setDateRange({ start: "", end: "" });

  const showing =
    timesheets.length > 0
      ? `${(page - 1) * PAGE_SIZE + 1}-${Math.min(
          page * PAGE_SIZE,
          pagination.total
        )} of ${pagination.total}`
      : "0 of 0";

  return (
    <div className="ts-page">
      {/* ── Header ── */}
      <div className="ts-header">
        <div className="ts-header-left">
          <h1 className="ts-title">
            <span className="ts-icon">⏱</span> Timesheets
          </h1>
          <button className="ts-btn-tour">
            <span className="ts-tour-icon">C</span> Tour Features
          </button>
        </div>
        <div className="ts-header-right">
          <button className="ts-btn-outline" onClick={handleExportCSV}>
            Export CSV
          </button>
          <div className="ts-dropdown-wrap">
            <button
              className="ts-btn-outline ts-btn-chevron"
              onClick={() => setReportsOpen((v) => !v)}
            >
              Reports <span className="ts-chevron">▾</span>
            </button>
            {reportsOpen && (
              <div className="ts-dropdown-menu">
                <button onClick={() => setReportsOpen(false)}>
                  Hours by Employee
                </button>
                <button onClick={() => setReportsOpen(false)}>
                  Hours by Cost Code
                </button>
                <button onClick={() => setReportsOpen(false)}>
                  Weekly Summary
                </button>
              </div>
            )}
          </div>
          <button
            className="ts-btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create <span className="ts-chevron">▾</span>
          </button>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="ts-filters">
        <div className="ts-search-wrap">
          <span className="ts-search-icon">🔍</span>
          <input
            className="ts-search"
            placeholder="Search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {(dateRange.start || dateRange.end) && (
          <div className="ts-date-badge">
            <span>{formatDisplayDate(dateRange.start, dateRange.end)}</span>
            <button className="ts-date-clear" onClick={clearDateFilter}>
              ✕
            </button>
            <button className="ts-date-cal">📅</button>
          </div>
        )}

        <div className="ts-dropdown-wrap">
          <button
            className="ts-btn-outline ts-btn-chevron"
            onClick={() => setFilterOpen((v) => !v)}
          >
            Add Filter <span className="ts-chevron">▾</span>
          </button>
          {filterOpen && (
            <div className="ts-dropdown-menu ts-filter-menu">
              <label className="ts-filter-label">Start Date</label>
              <input
                type="date"
                className="ts-filter-input"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((d) => ({ ...d, start: e.target.value }))
                }
              />
              <label className="ts-filter-label">End Date</label>
              <input
                type="date"
                className="ts-filter-input"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((d) => ({ ...d, end: e.target.value }))
                }
              />
              <label className="ts-filter-label">Status</label>
              <select
                className="ts-filter-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Draft">Draft</option>
              </select>
              <button
                className="ts-btn-primary ts-filter-apply"
                onClick={() => {
                  setFilterOpen(false);
                  setPage(1);
                  fetchTimesheets();
                }}
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Pagination Info ── */}
      <div className="ts-pagination-info">
        <span>
          Showing: <strong>{showing}</strong>
        </span>
        <div className="ts-page-controls">
          <span>Page:</span>
          <select
            className="ts-page-select"
            value={page}
            onChange={(e) => setPage(Number(e.target.value))}
          >
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
          <button
            className="ts-page-btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ‹
          </button>
          <button
            className="ts-page-btn"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            ›
          </button>
        </div>
      </div>

      {/* ── Timesheet List ── */}
      <div className="ts-list">
        {loading ? (
          <div className="ts-loading">
            <div className="ts-spinner" />
            <span>Loading timesheets…</span>
          </div>
        ) : timesheets.length === 0 ? (
          <div className="ts-empty">
            <div className="ts-empty-icon">📋</div>
            <p>No timesheets found for this period.</p>
            <button
              className="ts-btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              Create Timesheet
            </button>
          </div>
        ) : (
          timesheets.map((ts) => (
            <TimesheetRow
              key={ts._id}
              timesheet={ts}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onRefresh={fetchTimesheets}
            />
          ))
        )}
      </div>

      {/* ── Create Modal ── */}
      {showCreateModal && (
        <CreateTimesheetModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchTimesheets();
          }}
        />
      )}
    </div>
  );
}
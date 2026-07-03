"use client";
// app/stock/page.jsx

import { useState } from "react";
import {
  Plus,
  TrendingUp,
  Package,
  Wallet,
  Calendar,
  Lock,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { StockTable } from "./StockTable";
import { StockEntryDrawer } from "./StockEntryForm";
import {
  useStockEntries,
  useStockSummary,
  useCreateStockEntry,
  useUpdateStockEntry,
  useDeleteStockEntry,
} from "@/lib/hooks/useStock";
import { useStockLock } from "@/lib/hooks/useStockLock";
import { cn } from "@/lib/utils";
import { Package2Icon } from "lucide-react";

// ── Summary card ──────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, sub, color, loading }) {
  return (
    <div
      className="bg-white rounded-2xl border p-5"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p
            className="text-[11px] font-semibold uppercase tracking-wider mb-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            {label}
          </p>
          {loading ? (
            <div
              className="h-7 w-24 rounded-lg animate-pulse"
              style={{ background: "var(--color-border)" }}
            />
          ) : (
            <p
              className="text-[22px] font-bold truncate"
              style={{ color: "var(--color-text-primary)" }}
            >
              {value}
            </p>
          )}
          {sub && !loading && (
            <p
              className="text-[11px] mt-1"
              style={{ color: "var(--color-text-muted)" }}
            >
              {sub}
            </p>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, color }}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function formatCurrency(val) {
  return `K${Number(val ?? 0).toLocaleString("en-ZM", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ── PIN management modal ──────────────────────────────────────
function PinManagementModal({ onClose, lock }) {
  const [mode, setMode] = useState("menu"); // "menu" | "change" | "remove"
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [conf, setConf] = useState("");
  const [err, setErr] = useState(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleChange = async () => {
    setBusy(true);
    setErr(null);
    const ok = await lock.changePin(cur, next, conf);
    setBusy(false);
    if (ok) setDone(true);
    else setErr(lock.error);
  };

  const handleRemove = async () => {
    setBusy(true);
    setErr(null);
    const ok = await lock.removePin(cur);
    setBusy(false);
    if (ok) {
      setDone(true);
      setTimeout(onClose, 1500);
    } else setErr(lock.error);
  };

  const inp =
    "w-full h-10 px-3 rounded-xl border text-[13px] outline-none transition-all focus:border-[var(--color-accent)]";
  const inpStyle = {
    borderColor: "var(--color-border-md)",
    background: "white",
    color: "var(--color-text-primary)",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
        style={{ border: "1px solid var(--color-border)" }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "var(--color-accent-subtle)" }}
        >
          <ShieldCheck size={22} style={{ color: "var(--color-accent)" }} />
        </div>

        {mode === "menu" && (
          <>
            <h3
              className="text-[16px] font-bold mb-1.5"
              style={{ color: "var(--color-text-primary)" }}
            >
              PIN settings
            </h3>
            <p
              className="text-[13px] mb-5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Manage the PIN that protects your stock journal.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setMode("change")}
                className="w-full h-11 rounded-xl border text-[13px] font-semibold transition-colors hover:bg-[var(--color-accent-subtle)] text-left px-4"
                style={{
                  borderColor: "var(--color-border-md)",
                  color: "var(--color-text-primary)",
                }}
              >
                Change PIN
              </button>
              <button
                onClick={() => setMode("remove")}
                className="w-full h-11 rounded-xl border text-[13px] font-semibold transition-colors hover:bg-[var(--color-danger-bg)] text-left px-4"
                style={{
                  borderColor: "var(--color-border-md)",
                  color: "var(--color-danger)",
                }}
              >
                Remove PIN protection
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-full mt-3 text-[12px] font-medium text-center hover:underline"
              style={{ color: "var(--color-text-muted)" }}
            >
              Cancel
            </button>
          </>
        )}

        {mode === "change" && !done && (
          <>
            <h3
              className="text-[16px] font-bold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              Change PIN
            </h3>
            <div className="space-y-3">
              <input
                type="password"
                maxLength={4}
                value={cur}
                onChange={(e) => setCur(e.target.value)}
                placeholder="Current PIN"
                className={inp}
                style={inpStyle}
              />
              <input
                type="password"
                maxLength={4}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="New PIN (4 digits)"
                className={inp}
                style={inpStyle}
              />
              <input
                type="password"
                maxLength={4}
                value={conf}
                onChange={(e) => setConf(e.target.value)}
                placeholder="Confirm new PIN"
                className={inp}
                style={inpStyle}
              />
              {err && (
                <p
                  className="text-[12px]"
                  style={{ color: "var(--color-danger)" }}
                >
                  {err}
                </p>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setMode("menu");
                  setErr(null);
                }}
                className="flex-1 h-10 rounded-xl border text-[13px] font-semibold hover:bg-[var(--color-bg)] transition-colors"
                style={{
                  borderColor: "var(--color-border-md)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Back
              </button>
              <button
                onClick={handleChange}
                disabled={busy || !cur || !next || !conf}
                className="flex-1 h-10 rounded-xl text-[13px] font-bold text-white disabled:opacity-40 transition-all"
                style={{ background: "var(--color-accent)" }}
              >
                {busy ? "Saving…" : "Update PIN"}
              </button>
            </div>
          </>
        )}

        {mode === "remove" && !done && (
          <>
            <h3
              className="text-[16px] font-bold mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              Remove PIN
            </h3>
            <p
              className="text-[13px] mb-4"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Enter your current PIN to confirm removal. The journal will no
              longer be protected.
            </p>
            <input
              type="password"
              maxLength={4}
              value={cur}
              onChange={(e) => setCur(e.target.value)}
              placeholder="Current PIN"
              className={inp}
              style={inpStyle}
            />
            {err && (
              <p
                className="text-[12px] mt-2"
                style={{ color: "var(--color-danger)" }}
              >
                {err}
              </p>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setMode("menu");
                  setErr(null);
                }}
                className="flex-1 h-10 rounded-xl border text-[13px] font-semibold hover:bg-[var(--color-bg)] transition-colors"
                style={{
                  borderColor: "var(--color-border-md)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Back
              </button>
              <button
                onClick={handleRemove}
                disabled={busy || !cur}
                className="flex-1 h-10 rounded-xl text-[13px] font-bold text-white disabled:opacity-40 transition-all"
                style={{ background: "var(--color-danger)" }}
              >
                {busy ? "Removing…" : "Remove PIN"}
              </button>
            </div>
          </>
        )}

        {done && (
          <div className="text-center py-4">
            <p
              className="text-[15px] font-semibold"
              style={{ color: "var(--color-success)" }}
            >
              {mode === "remove" ? "PIN removed" : "PIN updated!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function StockJournalPage() {
  const lock = useStockLock();

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    dateFrom: "",
    dateTo: "",
    includeAdjustments: false,
    page: 1,
    limit: 25,
  });

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [pinModal, setPinModal] = useState(false);

  // Hooks
  const { entries, total, isLoading, isRefreshing, mutate } =
    useStockEntries(filters);
  const { summary, isLoading: summaryLoading } = useStockSummary();
  const { create, loading: creating, fieldErrors } = useCreateStockEntry();
  const { update, loading: updating } = useUpdateStockEntry();
  const { remove, loading: deleting } = useDeleteStockEntry();
  console.log("summary",summary)

  const openAdd = () => {
    setEditEntry(null);
    setDrawerOpen(true);
  };
  const openEdit = (entry) => {
    setEditEntry(entry);
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditEntry(null);
  };

  const handleSave = async (payload) => {
    let ok;
    if (editEntry) {
      ok = await update(editEntry.id, payload);
    } else {
      ok = await create(payload);
    }
    if (ok) closeDrawer();
  };

  const handleDelete = async (id) => {
    await remove(id);
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1
            className="text-[22px] font-semibold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Stock journal
          </h1>
          <p
            className="text-[13px] mt-0.5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Log and track every stock purchase and adjustment
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Lock now */}
          <button
            onClick={() => lock.lock()}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border text-[12px] font-medium transition-colors hover:bg-[var(--color-bg)]"
            style={{
              borderColor: "var(--color-border-md)",
              color: "var(--color-text-secondary)",
            }}
            title="Lock journal"
          >
            <Lock size={13} /> Lock
          </button>
          {/* PIN settings */}
          {lock.hasPin && (
            <button
              onClick={() => setPinModal(true)}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border text-[12px] font-medium transition-colors hover:bg-[var(--color-bg)]"
              style={{
                borderColor: "var(--color-border-md)",
                color: "var(--color-text-secondary)",
              }}
              title="PIN settings"
            >
              <KeyRound size={13} /> PIN
            </button>
          )}
          {/* New entry */}
          <button
            onClick={openAdd}
            className="flex items-center gap-2 h-9 px-4 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90"
            style={{ background: "var(--color-accent)" }}
          >
            <Plus size={15} /> Log purchase
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          icon={Wallet}
          label="Total spend"
          value={formatCurrency(summary?.totalSpend)}
          sub="All time"
          color="#0057ff"
          loading={summaryLoading}
        />
        <SummaryCard
          icon={Package2Icon}
          label="Units Pending"
          value={(summary?.pendingCount).toLocaleString()}
          sub={"Pending purchases"}
          color="#7c3aed"
          loading={summaryLoading}
        />
        <SummaryCard
          icon={Package}
          label="Units purchased"
          value={(summary?.totalUnits ?? 0).toLocaleString()}
          sub="All products"
          color="#059669"
          loading={summaryLoading}
        />
        <SummaryCard
          icon={TrendingUp}
          label="Total entries"
          value={(summary?.entryCount ?? 0).toLocaleString()}
          sub="Journal records"
          color="#d97706"
          loading={summaryLoading}
        />
      </div>

      {/* Table */}
      <StockTable
        entries={entries}
        total={total}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        filters={filters}
        onFilterChange={setFilters}
        onEdit={openEdit}
        onDelete={handleDelete}
        deleteLoading={deleting}
        page={filters.page}
        limit={filters.limit}
        onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
      />

      {/* Entry drawer */}
      <StockEntryDrawer
        open={drawerOpen}
        entry={editEntry}
        onClose={closeDrawer}
        onSave={handleSave}
        loading={creating || updating}
        fieldErrors={fieldErrors}
      />

      {/* PIN management modal */}
      {pinModal && (
        <PinManagementModal lock={lock} onClose={() => setPinModal(false)} />
      )}
    </div>
  );
}

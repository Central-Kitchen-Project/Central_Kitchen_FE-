import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

const BASE_URL = "http://meinamfpt-001-site1.ltempurl.com/api";

function parseUTC(dateStr) {
  if (!dateStr) return null;
  let s = dateStr;
  if (!/Z|[+-]\d{2}:\d{2}$/.test(s)) s += "Z";
  return new Date(s);
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return parseUTC(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getTimeDiff(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - parseUTC(dateStr).getTime()) / 60000);
  if (diff < 0 || diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function getStatusBadge(status) {
  switch (status) {
    case "Pending":   return { label: "Pending",   cls: "bg-amber-50 text-amber-600 border-amber-200",  dot: "bg-amber-500" };
    case "Fulfilled": return { label: "Fulfilled", cls: "bg-green-50 text-green-600 border-green-200",  dot: "bg-green-500" };
    case "Rejected":  return { label: "Rejected",  cls: "bg-red-50 text-red-600 border-red-200",        dot: "bg-red-500" };
    default:          return { label: status || "Unknown", cls: "bg-slate-50 text-slate-500 border-slate-200", dot: "bg-slate-400" };
  }
}

function getInitial(name) {
  return (name || "?")[0].toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-slate-100 text-slate-600",
];

const STATUS_TABS = ["All", "Pending", "Fulfilled", "Rejected"];

function MaterialTracking() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDate, setFilterDate] = useState("");

  // Modals
  const [detailModal, setDetailModal] = useState(null);
  const [fulfillModal, setFulfillModal] = useState(null);
  const [loadingFulfill, setLoadingFulfill] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/MaterialRequest`, {
        headers: { accept: "*/*" },
      });
      setRequests(res.data?.data || []);
    } catch (err) {
      showToast("error", `Lỗi tải dữ liệu: ${err?.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => r.status === "Pending").length,
    fulfilled: requests.filter((r) => r.status === "Fulfilled").length,
    rejected: requests.filter((r) => r.status === "Rejected").length,
  }), [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const statusMatch = filterStatus === "All" || req.status === filterStatus;
      const searchMatch =
        searchTerm === "" ||
        String(req.id).includes(searchTerm) ||
        String(req.orderId).includes(searchTerm) ||
        req.requestedByUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.items || []).some((i) =>
          i.materialName?.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        req.note?.toLowerCase().includes(searchTerm.toLowerCase());
      let dateMatch = true;
      if (filterDate) {
        const reqDay = parseUTC(req.createdAt).toISOString().slice(0, 10);
        dateMatch = reqDay === filterDate;
      }
      return statusMatch && searchMatch && dateMatch;
    });
  }, [requests, filterStatus, searchTerm, filterDate]);

  const handleFulfill = async () => {
    if (!fulfillModal) return;
    setLoadingFulfill(true);
    try {
      await axios.put(
        `${BASE_URL}/MaterialRequest/${fulfillModal.id}/status`,
        { status: "Fulfilled" },
        { headers: { accept: "*/*", "Content-Type": "application/json" } }
      );
      showToast("success", `Yêu cầu #${fulfillModal.id} đã được xử lý thành công!`);
      setFulfillModal(null);
      fetchRequests();
    } catch (err) {
      showToast("error", `Lỗi: ${err?.response?.data?.message || err.message}`);
    } finally {
      setLoadingFulfill(false);
    }
  };

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-medium transition-all duration-300 ${
          toast.type === "success" ? "bg-green-500" : "bg-red-500"
        }`}>
          <span className="material-symbols-outlined text-lg">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 opacity-75 hover:opacity-100">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        <main className="flex-1 flex flex-col overflow-hidden bg-white">

          {/* Header */}
          <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-slate-900">Material Tracking</h2>
              <span className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <span className="material-symbols-outlined text-[18px]">inventory</span>
                <span>{filteredRequests.length} Material Requests</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchRequests}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600"
                title="Refresh"
              >
                <span className={`material-symbols-outlined text-[20px] ${loading ? "animate-spin" : ""}`}>refresh</span>
              </button>
              <button className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 relative text-slate-600">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                {stats.pending > 0 && (
                  <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>
              <button className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600">
                <span className="material-symbols-outlined text-[20px]">settings</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 bg-slate-50/50">

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Total Requests", value: stats.total,     icon: "assignment",       color: "text-slate-700",   bg: "bg-slate-100"  },
                { label: "Pending",        value: stats.pending,   icon: "hourglass_empty",  color: "text-amber-600",   bg: "bg-amber-50"   },
                { label: "Fulfilled",      value: stats.fulfilled, icon: "task_alt",          color: "text-green-600",   bg: "bg-green-50"   },
                { label: "Rejected",       value: stats.rejected,  icon: "cancel",            color: "text-red-600",     bg: "bg-red-50"     },
              ].map((card) => (
                <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-lg ${card.bg} flex items-center justify-center ${card.color}`}>
                    <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{card.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">

              {/* Toolbar */}
              <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Search */}
                  <div className="relative w-64">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                    <input
                      className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-primary focus:border-primary outline-none"
                      placeholder="Search requests, materials..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {/* Date filter */}
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">calendar_today</span>
                    <input
                      type="date"
                      className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none text-slate-700"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                    />
                    {filterDate && (
                      <button onClick={() => setFilterDate("")} className="text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Status tabs */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                  {STATUS_TABS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        filterStatus === s
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {s}
                      {s === "Pending" && stats.pending > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500 text-white text-[9px] rounded-full font-black">
                          {stats.pending}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Request ID</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Order Ref</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Requested By</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Materials</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Note</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading && (
                      <tr>
                        <td colSpan={7} className="text-center py-14">
                          <svg className="animate-spin h-6 w-6 text-slate-400 mx-auto" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          <p className="text-sm text-slate-400 mt-2">Đang tải...</p>
                        </td>
                      </tr>
                    )}
                    {!loading && filteredRequests.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-14">
                          <span className="material-symbols-outlined text-4xl block mb-2 text-slate-300">inventory_2</span>
                          <p className="text-sm text-slate-400">Không có yêu cầu nào phù hợp</p>
                        </td>
                      </tr>
                    )}
                    {!loading && filteredRequests.map((req, idx) => {
                      const badge = getStatusBadge(req.status);
                      const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                      const items = req.items || [];
                      const isFulfilled = req.status === "Fulfilled";
                      const isRejected = req.status === "Rejected";

                      return (
                        <tr
                          key={req.id}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                          onClick={() => setDetailModal(req)}
                        >
                          {/* Request ID */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-mono text-sm font-bold text-slate-800 hover:text-primary transition-colors">
                                #REQ-{req.id}
                              </span>
                              <span className="text-[10px] text-slate-400">{getTimeDiff(req.createdAt)}</span>
                            </div>
                          </td>

                          {/* Order Ref */}
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              #ORD-{req.orderId}
                            </span>
                          </td>

                          {/* Requested By */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`size-7 rounded-md flex items-center justify-center text-[11px] font-black ${avatarColor}`}>
                                {getInitial(req.requestedByUsername)}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800">{req.requestedByUsername}</p>
                                <p className="text-[10px] text-slate-400">{formatDate(req.createdAt)}</p>
                              </div>
                            </div>
                          </td>

                          {/* Materials */}
                          <td className="px-6 py-4">
                            {items.length === 0 ? (
                              <span className="text-xs text-slate-400 italic">Không có vật liệu</span>
                            ) : (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-sm text-slate-700">
                                  {items[0].requestedQuantity} {items[0].unit} {items[0].materialName}
                                </span>
                                {items.length > 1 && (
                                  <span className="text-xs text-slate-400">
                                    +{items.length - 1} more material{items.length - 1 > 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Note */}
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-500 italic truncate block max-w-[140px]" title={req.note}>
                              {req.note || "—"}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-full text-[10px] font-black uppercase tracking-tight ${badge.cls}`}>
                              <span className={`size-1.5 rounded-full ${badge.dot}`} />
                              {badge.label}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setDetailModal(req)}
                                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50"
                              >
                                View
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setFulfillModal(req); }}
                                disabled={isFulfilled || isRejected}
                                className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Fulfill
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Showing {filteredRequests.length} of {requests.length} material requests
                </span>
                <div className="flex gap-2">
                  <button className="p-1.5 rounded border border-slate-200 bg-white text-slate-400 disabled:opacity-50" disabled>
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button className="p-1.5 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ===== Detail Modal ===== */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDetailModal(null)} />
          <div className="bg-white rounded-2xl shadow-2xl z-10 w-[600px] max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined">inventory</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Material Request <span className="font-mono text-primary">#REQ-{detailModal.id}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatDate(detailModal.createdAt)} · by {detailModal.requestedByUsername} · Order{" "}
                    <span className="font-mono font-semibold">#ORD-{detailModal.orderId}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => setDetailModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
              {/* Status + Note */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {(() => {
                    const b = getStatusBadge(detailModal.status);
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-xs font-black uppercase tracking-tight ${b.cls}`}>
                        <span className={`size-1.5 rounded-full ${b.dot}`} />
                        {b.label}
                      </span>
                    );
                  })()}
                  <span className="text-xs text-slate-400">{getTimeDiff(detailModal.createdAt)}</span>
                </div>
                {detailModal.note && (
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 max-w-xs">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Note</p>
                    <p className="text-sm text-slate-700 italic">{detailModal.note}</p>
                  </div>
                )}
              </div>

              {/* Materials Table */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Materials Requested</p>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                        <th className="px-4 py-3">Material</th>
                        <th className="px-4 py-3 text-right">Current Stock</th>
                        <th className="px-4 py-3 text-right">Requested Qty</th>
                        <th className="px-4 py-3 text-right">Stock Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detailModal.items || []).length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center text-slate-400 py-6 text-sm">Không có vật liệu</td>
                        </tr>
                      ) : (
                        (detailModal.items || []).map((item) => {
                          const sufficient = item.currentStock >= item.requestedQuantity;
                          return (
                            <tr key={item.id} className="border-t border-slate-100">
                              <td className="px-4 py-3">
                                <p className="text-sm font-semibold text-slate-800">{item.materialName}</p>
                                <p className="text-xs text-slate-400">Item #{item.itemId}</p>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-sm font-medium text-slate-700">
                                  {item.currentStock.toLocaleString()} {item.unit}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-sm font-bold text-slate-800">
                                  {item.requestedQuantity.toLocaleString()} {item.unit}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                  sufficient
                                    ? "bg-green-50 text-green-600 border-green-200"
                                    : "bg-red-50 text-red-600 border-red-200"
                                }`}>
                                  <span className="material-symbols-outlined text-[11px]">
                                    {sufficient ? "check_circle" : "warning"}
                                  </span>
                                  {sufficient ? "Sufficient" : "Low Stock"}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Total Items</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">{(detailModal.items || []).length}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">In Stock</p>
                  <p className="text-xl font-bold text-green-600 mt-1">
                    {(detailModal.items || []).filter((i) => i.currentStock >= i.requestedQuantity).length}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Low Stock</p>
                  <p className="text-xl font-bold text-red-500 mt-1">
                    {(detailModal.items || []).filter((i) => i.currentStock < i.requestedQuantity).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <span />
              <div className="flex gap-3">
                <button onClick={() => setDetailModal(null)} className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm hover:bg-slate-50">
                  Close
                </button>
                {detailModal.status === "Pending" && (
                  <button
                    onClick={() => { setDetailModal(null); setFulfillModal(detailModal); }}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-sm flex items-center gap-2 hover:bg-primary/90"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Fulfill Request
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Fulfill Confirm Modal ===== */}
      {fulfillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFulfillModal(null)} />
          <div className="bg-white rounded-2xl shadow-2xl z-10 w-96 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <span className="material-symbols-outlined">task_alt</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Fulfill Request</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Xác nhận xử lý yêu cầu{" "}
                  <span className="font-mono font-bold text-slate-800">#REQ-{fulfillModal.id}</span>{" "}
                  cho đơn hàng{" "}
                  <span className="font-mono font-bold text-slate-800">#ORD-{fulfillModal.orderId}</span>?
                </p>
                {(fulfillModal.items || []).length > 0 && (
                  <div className="mt-3 bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1.5">Materials</p>
                    {fulfillModal.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs text-slate-600 py-0.5">
                        <span>{item.materialName}</span>
                        <span className="font-semibold">{item.requestedQuantity} {item.unit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setFulfillModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setFulfillModal(null)} className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={handleFulfill}
                disabled={loadingFulfill}
                className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm flex items-center gap-2 hover:bg-green-600 disabled:opacity-60"
              >
                {loadingFulfill ? (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                )}
                Confirm Fulfill
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MaterialTracking;
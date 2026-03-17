import React, { useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { updateMaterialRequestStatus } from "../../../store/materialSlice";
import PageHeader from "../../../components/common/PageHeader";

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
  const normalizedStatus = getMaterialRequestDisplayStatus(status);

  switch (normalizedStatus) {
    case "Processing":
      return { label: "Processing", cls: "bg-blue-50 text-blue-600 border-blue-200", dot: "bg-blue-500" };
    case "Confirmed":
      return { label: "Confirmed", cls: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-500" };
    case "Rejected":
      return { label: "Rejected", cls: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-500" };
    default:
      return { label: normalizedStatus || "Unknown", cls: "bg-slate-50 text-slate-500 border-slate-200", dot: "bg-slate-400" };
  }
}

function getMaterialRequestDisplayStatus(status) {
  switch (status) {
    case "Fulfilled":
    case "Confirmed":
    case "Approved":
      return "Confirmed";
    case "Pending":
    case "Processing":
      return "Processing";
    case "Rejected":
    case "Cancelled":
      return "Rejected";
    default:
      return status || "Unknown";
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

const STATUS_TABS = ["All", "Processing", "Confirmed"];

function MaterialTracking() {
  const dispatch = useDispatch();
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
  const [loadingActionId, setLoadingActionId] = useState(null);

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
      showToast("error", `Failed to load data: ${err?.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const stats = useMemo(() => ({
    total: requests.length,
    processing: requests.filter((r) => getMaterialRequestDisplayStatus(r.status) === "Processing").length,
    confirmed: requests.filter((r) => getMaterialRequestDisplayStatus(r.status) === "Confirmed").length,
  }), [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const statusMatch =
        filterStatus === "All" || getMaterialRequestDisplayStatus(req.status) === filterStatus;
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

  const handleAcceptRequest = async (request) => {
    if (!request?.id) return;

    setLoadingActionId(request.id);
    try {
      await dispatch(
        updateMaterialRequestStatus({ id: request.id, status: "Fulfilled" })
      ).unwrap();

      if (detailModal?.id === request.id) {
        setDetailModal((prev) => (prev ? { ...prev, status: "Fulfilled" } : prev));
      }

      showToast("success", `Request #${request.id} has been confirmed.`);
      await fetchRequests();
    } catch (err) {
      showToast("error", `Failed to update status: ${err?.response?.data?.message || err.message}`);
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleFulfill = async () => {
    if (!fulfillModal) return;
    // Fulfill action has been disabled; this function is kept to avoid runtime errors.
    setFulfillModal(null);
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
          <PageHeader
            as="h2"
            title="Material Tracking"
            subtitle="Manage and track material requests from incoming supply orders."
          />

          <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 bg-slate-50/50">

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Total Requests", value: stats.total,     icon: "assignment",      color: "text-slate-700",   bg: "bg-slate-100"  },
                { label: "Processing",     value: stats.processing, icon: "autorenew",       color: "text-blue-600",    bg: "bg-blue-50"    },
                { label: "Confirmed",      value: stats.confirmed,  icon: "task_alt",        color: "text-emerald-600", bg: "bg-emerald-50" },
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
                      {s === "Processing" && stats.processing > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500 text-white text-[9px] rounded-full font-black">
                          {stats.processing}
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
                      const normalizedStatus = getMaterialRequestDisplayStatus(req.status);
                      const canAccept = normalizedStatus === "Processing" || normalizedStatus === "Pending";

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
                              {canAccept && (
                                <button
                                  onClick={() => handleAcceptRequest(req)}
                                  disabled={loadingActionId === req.id}
                                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  {loadingActionId === req.id ? "Accepting..." : "Accept"}
                                </button>
                              )}
                              <button
                                onClick={() => setDetailModal(req)}
                                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50"
                              >
                                View
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
            <div className="p-4 border-t border-slate-100 flex items-center justify-end">
              {getMaterialRequestDisplayStatus(detailModal.status) === "Processing" && (
                <button
                  onClick={() => handleAcceptRequest(detailModal)}
                  disabled={loadingActionId === detailModal.id}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed mr-3"
                >
                  {loadingActionId === detailModal.id ? "Accepting..." : "Accept"}
                </button>
              )}
              <button onClick={() => setDetailModal(null)} className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm hover:bg-slate-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fulfill modal has been removed as per latest requirements */}
    </>
  );
}

export default MaterialTracking;
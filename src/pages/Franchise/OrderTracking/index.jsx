import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { fetchGetOrder } from "../../../store/orderSlice";

const BASE_URL = "http://meinamfpt-001-site1.ltempurl.com/api";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getTimeDiff(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function getStatusBadge(status) {
  switch (status) {
    case "Pending":    return { label: "Pending",    cls: "bg-red-50 text-red-600 border-red-200",       dot: "bg-red-500" };
    case "Approved":   return { label: "Approved",   cls: "bg-amber-50 text-amber-600 border-amber-200", dot: "bg-amber-500" };
    case "Processing": return { label: "Processing", cls: "bg-blue-50 text-blue-600 border-blue-200",    dot: "bg-blue-500" };
    case "Completed":  return { label: "Completed",  cls: "bg-green-50 text-green-600 border-green-200", dot: "bg-green-500" };
    default:           return { label: status || "Unknown", cls: "bg-slate-50 text-slate-500 border-slate-200", dot: "bg-slate-400" };
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

const STATUS_FILTERS = ["All", "Pending", "Approved", "Processing", "Completed"];

function OrderTracking() {
  const data = useSelector((state) => state.ORDER.listOrders);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchGetOrder());
  }, [dispatch]);

  const [toast, setToast] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // order object
  const [detailModal, setDetailModal] = useState(null);   // order object

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDate, setFilterDate] = useState("");

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const openCompleteModal = (e, order) => {
    e.stopPropagation();
    setConfirmModal(order);
  };

  const confirmComplete = async () => {
    if (!confirmModal) return;
    setLoadingId(confirmModal.id);
    try {
      await axios.put(
        `${BASE_URL}/Order/${confirmModal.id}/status`,
        { status: "Completed" },
        { headers: { accept: "*/*", "Content-Type": "application/json" } }
      );
      showToast("success", `Đơn hàng #${confirmModal.id} đã hoàn thành!`);
      setConfirmModal(null);
      dispatch(fetchGetOrder());
    } catch (err) {
      showToast("error", `Lỗi: ${err?.response?.data?.message || err.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  const orders = data || [];

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === "Pending").length,
    processing: orders.filter((o) => o.status === "Processing").length,
    completed: orders.filter((o) => o.status === "Completed").length,
  }), [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const statusMatch = filterStatus === "All" || order.status === filterStatus;
      const searchMatch =
        searchTerm === "" ||
        String(order.id).includes(searchTerm) ||
        order.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.orderLines || []).some((l) =>
          l.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      let dateMatch = true;
      if (filterDate) {
        const orderDay = new Date(order.orderDate).toISOString().slice(0, 10);
        dateMatch = orderDay === filterDate;
      }
      return statusMatch && searchMatch && dateMatch;
    });
  }, [orders, filterStatus, searchTerm, filterDate]);

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
              <h2 className="text-lg font-bold text-slate-900">Order Tracking</h2>
              <span className="h-4 w-px bg-slate-200" />
              <span className="text-sm text-slate-500 font-medium">{filteredOrders.length} orders</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => dispatch(fetchGetOrder())}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600"
                title="Refresh"
              >
                <span className="material-symbols-outlined text-[20px]">refresh</span>
              </button>
              <button className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 relative text-slate-600">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                {stats.pending > 0 && (
                  <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 bg-slate-50/50">

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Total Orders", value: stats.total, icon: "receipt_long", color: "text-slate-700", bg: "bg-slate-100" },
                { label: "Pending", value: stats.pending, icon: "hourglass_empty", color: "text-red-600", bg: "bg-red-50" },
                { label: "Processing", value: stats.processing, icon: "autorenew", color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Completed", value: stats.completed, icon: "task_alt", color: "text-green-600", bg: "bg-green-50" },
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
                  <div className="relative w-60">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                    <input
                      className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-primary focus:border-primary outline-none"
                      placeholder="Search orders, items..."
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
                  {STATUS_FILTERS.map((s) => (
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
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Order ID</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Customer</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Items</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Total</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center text-slate-400 py-14 text-sm">
                          <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">inbox</span>
                          Không có đơn hàng nào phù hợp
                        </td>
                      </tr>
                    )}
                    {filteredOrders.map((order, idx) => {
                      const badge = getStatusBadge(order.status);
                      const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                      const lines = order.orderLines || [];
                      const total = lines.reduce((s, l) => s + (l.price || 0) * l.quantity, 0);
                      const isCompleted = order.status === "Completed";

                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                          onClick={() => setDetailModal(order)}
                        >
                          {/* Order ID */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-mono text-sm font-bold text-slate-800 hover:text-primary transition-colors">
                                #ORD-{order.id}
                              </span>
                              <span className="text-[10px] text-slate-400">{getTimeDiff(order.orderDate)}</span>
                            </div>
                          </td>

                          {/* Customer */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`size-7 rounded-md flex items-center justify-center text-[11px] font-black ${avatarColor}`}>
                                {getInitial(order.username)}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800">{order.username}</p>
                                <p className="text-[10px] text-slate-400">{formatDate(order.orderDate)}</p>
                              </div>
                            </div>
                          </td>

                          {/* Items */}
                          <td className="px-6 py-4">
                            {lines.length === 0 ? (
                              <span className="text-xs text-slate-400 italic">Không có sản phẩm</span>
                            ) : (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-sm text-slate-700">
                                  {lines[0].quantity}x {lines[0].name}
                                </span>
                                {lines.length > 1 && (
                                  <span className="text-xs text-slate-400">
                                    +{lines.length - 1} more item{lines.length - 1 > 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Total */}
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-bold text-slate-800">
                              {total > 0 ? `${total.toLocaleString("vi-VN")}đ` : "—"}
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
                            <button
                              onClick={(e) => openCompleteModal(e, order)}
                              disabled={isCompleted || loadingId === order.id}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 ml-auto transition-all ${
                                isCompleted
                                  ? "bg-green-50 text-green-600 border border-green-200 cursor-not-allowed opacity-60"
                                  : "bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                              }`}
                            >
                              {loadingId === order.id ? (
                                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                              ) : (
                                <span className="material-symbols-outlined text-[14px]">
                                  {isCompleted ? "task_alt" : "check_circle"}
                                </span>
                              )}
                              {isCompleted ? "Completed" : "Complete"}
                            </button>
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
                  Showing {filteredOrders.length} of {orders.length} orders
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
          <div className="bg-white rounded-2xl shadow-2xl z-10 w-[560px] max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined">receipt_long</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Order <span className="font-mono text-primary">#{detailModal.id}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatDate(detailModal.orderDate)} · by {detailModal.username}
                  </p>
                </div>
              </div>
              <button onClick={() => setDetailModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center gap-3 mb-5">
                {(() => {
                  const b = getStatusBadge(detailModal.status);
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-xs font-black uppercase tracking-tight ${b.cls}`}>
                      <span className={`size-1.5 rounded-full ${b.dot}`} />
                      {b.label}
                    </span>
                  );
                })()}
                <span className="text-xs text-slate-400">Order Date: {formatDate(detailModal.orderDate)}</span>
              </div>

              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3 text-right">Price</th>
                      <th className="px-4 py-3 text-right">Qty</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detailModal.orderLines || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-slate-400 py-6 text-sm">Không có sản phẩm</td>
                      </tr>
                    ) : (
                      (detailModal.orderLines || []).map((line) => (
                        <tr key={line.id} className="border-t border-slate-100">
                          <td className="px-4 py-3">
                            <p className="text-sm font-semibold text-slate-800">{line.name}</p>
                            <p className="text-xs text-slate-400">{line.description}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium capitalize">{line.type}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 text-right">{(line.price || 0).toLocaleString("vi-VN")}đ</td>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">{line.quantity}</td>
                          <td className="px-4 py-3 text-sm font-bold text-slate-800 text-right">
                            {((line.price || 0) * line.quantity).toLocaleString("vi-VN")}đ
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {(detailModal.orderLines || []).length > 0 && (
                <div className="mt-4 flex justify-end">
                  <div className="text-right">
                    <p className="text-xs text-slate-400 mb-1">Total Amount</p>
                    <p className="text-xl font-bold text-primary">
                      {(detailModal.orderLines || [])
                        .reduce((s, l) => s + (l.price || 0) * l.quantity, 0)
                        .toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <span />
              <div className="flex gap-3">
                <button onClick={() => setDetailModal(null)} className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm hover:bg-slate-50">
                  Close
                </button>
                {detailModal.status !== "Completed" && (
                  <button
                    onClick={(e) => { setDetailModal(null); openCompleteModal(e, detailModal); }}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-sm flex items-center gap-2 hover:bg-primary/90"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Mark as Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Confirm Complete Modal ===== */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmModal(null)} />
          <div className="bg-white rounded-2xl shadow-2xl z-10 w-96 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <span className="material-symbols-outlined">task_alt</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Complete Order</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Xác nhận hoàn thành đơn hàng{" "}
                  <span className="font-mono font-bold text-slate-800">#ORD-{confirmModal.id}</span>?
                  Hành động này không thể hoàn tác.
                </p>
              </div>
              <button onClick={() => setConfirmModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setConfirmModal(null)} className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={confirmComplete}
                disabled={loadingId === confirmModal.id}
                className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm shadow flex items-center gap-2 hover:bg-green-600 disabled:opacity-60"
              >
                {loadingId === confirmModal.id ? (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                )}
                Confirm Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default OrderTracking;
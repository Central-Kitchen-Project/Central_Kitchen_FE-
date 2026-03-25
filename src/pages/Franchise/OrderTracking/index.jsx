import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { fetchGetOrder, updateOrderStatus } from "../../../store/orderSlice";
import { extractApiErrorMessage, extractApiMessage } from "../../../services/api";
import PageHeader from "../../../components/common/PageHeader";

const BASE_URL = "http://centralkitchen-001-site1.mtempurl.com/api";

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

function normalizeCollection(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.$values)) return data.$values;
  if (data && typeof data === "object") {
    const arrayValue = Object.values(data).find(Array.isArray);
    if (arrayValue) return arrayValue;

    const wrappedArrayValue = Object.values(data).find((value) => Array.isArray(value?.$values));
    if (wrappedArrayValue?.$values) return wrappedArrayValue.$values;
  }
  return [];
}

function getLineIngredients(line) {
  return normalizeCollection(
    line?.ingredients ||
      line?.ingredient ||
      line?.recipeIngredients ||
      line?.itemIngredients ||
      line?.materials ||
      line?.materialsUsed ||
      line?.item?.ingredients
  );
}

function getIngredientName(ingredient, index) {
  return (
    ingredient?.name ||
    ingredient?.materialName ||
    ingredient?.ingredientName ||
    ingredient?.itemName ||
    `Ingredient ${index + 1}`
  );
}

function formatIngredientQuantity(ingredient) {
  const rawQuantity =
    ingredient?.qty ??
    ingredient?.quantity ??
    ingredient?.requiredQuantity ??
    ingredient?.amount ??
    ingredient?.requestedQuantity;

  if (rawQuantity === undefined || rawQuantity === null || rawQuantity === "") return "";

  const numericQuantity = Number(rawQuantity);
  const quantity = Number.isFinite(numericQuantity)
    ? (Number.isInteger(numericQuantity) ? numericQuantity : parseFloat(numericQuantity.toFixed(3)))
    : rawQuantity;
  const unit = ingredient?.unit || ingredient?.materialUnit || ingredient?.measurementUnit || "";

  return [quantity, unit].filter(Boolean).join(" ");
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
  const displayStatus = getOrderDisplayStatus(status);

  switch (displayStatus) {
    case "Pending":    return { label: "Pending", cls: "bg-red-50 text-red-600 border-red-200", dot: "bg-red-500" };
    case "Confirmed":  return { label: "Confirmed", cls: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-500" };
    case "Delivery":   return { label: "Delivery", cls: "bg-violet-50 text-violet-600 border-violet-200", dot: "bg-violet-500" };
    case "Processing": return { label: "Processing", cls: "bg-blue-50 text-blue-600 border-blue-200", dot: "bg-blue-500" };
    case "Completed":  return { label: "Completed", cls: "bg-green-50 text-green-600 border-green-200", dot: "bg-green-500" };
    case "Rejected":   return { label: "Rejected", cls: "bg-slate-100 text-slate-600 border-slate-300", dot: "bg-slate-500" };
    case "Cancelled by Franchise":
    case "Cancelled":
      return { label: "Cancelled", cls: "bg-rose-50 text-rose-600 border-rose-200", dot: "bg-rose-500" };
    default:           return { label: displayStatus || "Unknown", cls: "bg-slate-50 text-slate-500 border-slate-200", dot: "bg-slate-400" };
  }
}

function getOrderDisplayStatus(status) {
  if (status === "Approved" || status === "Delivering") return "Delivery";
  if (status === "Confirmed" || status === "Filled") return "Processing";
  return status || "Unknown";
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

const STATUS_FILTERS = ["All", "Pending", "Processing", "Confirmed", "Delivery", "Completed", "Rejected", "Cancelled"];

const ORDERS_PER_PAGE = 7;

function OrderTracking() {
  const data = useSelector((state) => state.ORDER.listOrders);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("USER_INFO")) || {};
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    dispatch(fetchGetOrder());
  }, [dispatch]);

  const [toast, setToast] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // order object
  const [cancelModal, setCancelModal] = useState(null);   // order object
  const [detailModal, setDetailModal] = useState(null);   // order object
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [ordersPage, setOrdersPage] = useState(1);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const dispatchOrderStatusUpdate = async (orderId, nextStatuses) => {
    let lastError;

    for (const nextStatus of nextStatuses) {
      const result = await dispatch(updateOrderStatus({ id: orderId, status: nextStatus }));
      if (updateOrderStatus.fulfilled.match(result)) {
        return { status: nextStatus, payload: result.payload };
      }
      lastError = result.payload || result.error;
    }

    throw lastError;
  };

  const openDetailModal = async (order) => {
    setDetailModal(order);
    setLoadingDetail(true);
    try {
      const res = await axios.get(`${BASE_URL}/Order/${order.id}`);
      setDetailModal(res.data?.data || order);
    } catch {
      setDetailModal(order);
    } finally {
      setLoadingDetail(false);
    }
  };

  const openCompleteModal = (e, order) => {
    e.stopPropagation();
    setConfirmModal(order);
  };

  const openCancelModal = (e, order) => {
    e.stopPropagation();
    setCancelModal(order);
  };

  const confirmComplete = async () => {
    if (!confirmModal) return;
    setLoadingId(confirmModal.id);
    try {
      const result = await dispatchOrderStatusUpdate(confirmModal.id, ["Completed"]);
      showToast("success", extractApiMessage(result.payload, `Order #${confirmModal.id} has been marked as completed.`));
      setConfirmModal(null);
      dispatch(fetchGetOrder());
    } catch (err) {
      showToast("error", `Error: ${extractApiErrorMessage(err)}`);
    } finally {
      setLoadingId(null);
    }
  };

  const confirmCancel = async () => {
    if (!cancelModal) return;
    setLoadingId(cancelModal.id);
    try {
      const result = await dispatchOrderStatusUpdate(cancelModal.id, ["Cancelled by Franchise", "Cancelled"]);
      showToast("success", extractApiMessage(result.payload, `Order #${cancelModal.id} has been cancelled by the franchise.`));
      setCancelModal(null);
      dispatch(fetchGetOrder());
    } catch (err) {
      showToast("error", `Error: ${extractApiErrorMessage(err)}`);
    } finally {
      setLoadingId(null);
    }
  };

  const orders = useMemo(() => normalizeCollection(data), [data]);
  const myOrders = useMemo(() => {
    const currentUserId = Number(userInfo?.id);

    if (!Number.isFinite(currentUserId)) return orders;

    return orders.filter((order) => Number(order?.userId) === currentUserId);
  }, [orders, userInfo?.id]);

  const stats = useMemo(() => ({
    total: myOrders.length,
    pending: myOrders.filter((o) => getOrderDisplayStatus(o.status) === "Pending").length,
    processing: myOrders.filter((o) => getOrderDisplayStatus(o.status) === "Processing").length,
    confirmed: myOrders.filter((o) => getOrderDisplayStatus(o.status) === "Confirmed").length,
    delivery: myOrders.filter((o) => getOrderDisplayStatus(o.status) === "Delivery").length,
    completed: myOrders.filter((o) => getOrderDisplayStatus(o.status) === "Completed").length,
    rejected: myOrders.filter((o) => getOrderDisplayStatus(o.status) === "Rejected").length,
    cancelled: myOrders.filter((o) => getOrderDisplayStatus(o.status) === "Cancelled").length,
  }), [myOrders]);

  const filteredOrders = useMemo(() => {
    return myOrders.filter((order) => {
      const statusMatch = filterStatus === "All" || getOrderDisplayStatus(order.status) === filterStatus;
      const searchMatch =
        searchTerm === "" ||
        String(order.id).includes(searchTerm) ||
        order.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.orderLines || []).some((l) =>
          l.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      let dateMatch = true;
      const orderDate = parseUTC(order.orderDate);

      if (!orderDate || Number.isNaN(orderDate.getTime())) {
        dateMatch = !filterFromDate && !filterToDate;
      } else {
        if (filterFromDate) {
          const fromDate = new Date(`${filterFromDate}T00:00:00`);
          dateMatch = dateMatch && orderDate.getTime() >= fromDate.getTime();
        }

        if (filterToDate) {
          const toDate = new Date(`${filterToDate}T23:59:59.999`);
          dateMatch = dateMatch && orderDate.getTime() <= toDate.getTime();
        }
      }
      return statusMatch && searchMatch && dateMatch;
    });
  }, [myOrders, filterStatus, searchTerm, filterFromDate, filterToDate]);

  useEffect(() => {
    setOrdersPage(1);
  }, [filterStatus, searchTerm, filterFromDate, filterToDate]);

  const ordersTotalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const ordersSafePage = Math.min(ordersPage, ordersTotalPages);
  const pagedOrders = filteredOrders.slice(
    (ordersSafePage - 1) * ORDERS_PER_PAGE,
    ordersSafePage * ORDERS_PER_PAGE
  );

  const detailLines = useMemo(() => normalizeCollection(detailModal?.orderLines), [detailModal]);

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
            title="Order Tracking"
            subtitle="Follow order progress and confirm deliveries once they arrive."
          />

          <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-5 bg-slate-50/50">

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">

              {/* Toolbar */}
              <div className="border-b border-slate-100 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search */}
                  <div className="relative min-w-[240px] flex-1 max-w-sm">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-primary focus:ring-primary"
                      placeholder="Search orders, items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* From date */}
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">calendar_today</span>
                    <input
                      type="date"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
                      value={filterFromDate}
                      onChange={(e) => setFilterFromDate(e.target.value)}
                      title="From date"
                    />
                  </div>

                  {/* To date */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">to</span>
                    <input
                      type="date"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
                      value={filterToDate}
                      onChange={(e) => setFilterToDate(e.target.value)}
                      title="To date"
                    />
                  </div>

                  {(filterFromDate || filterToDate) && (
                    <button
                      onClick={() => {
                        setFilterFromDate("");
                        setFilterToDate("");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                      Clear dates
                    </button>
                  )}

                  {/* Status dropdown */}
                  <div className="relative min-w-[180px]">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
                      tune
                    </span>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-primary focus:ring-primary"
                    >
                      {STATUS_FILTERS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                      expand_more
                    </span>
                  </div>
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
                      <th className="w-[170px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center text-slate-400 py-14 text-sm">
                          <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">inbox</span>
                          No matching orders found
                        </td>
                      </tr>
                    )}
                    {pagedOrders.map((order, idx) => {
                      const rowIndex = (ordersSafePage - 1) * ORDERS_PER_PAGE + idx;
                      const avatarColor = AVATAR_COLORS[rowIndex % AVATAR_COLORS.length];
                      const lines = order.orderLines || [];
                      const total = lines.reduce((s, l) => s + (l.price || 0) * l.quantity, 0);
                      const displayStatus = getOrderDisplayStatus(order.status);
                      const badge = getStatusBadge(displayStatus);
                      const isCompleted = displayStatus === "Completed";
                      const isDelivery = displayStatus === "Delivery";
                      const isConfirmed = displayStatus === "Confirmed";
                      const isPending = displayStatus === "Pending";
                      const isCancelled = displayStatus === "Cancelled";
                      const isRejected = displayStatus === "Rejected";

                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                          onClick={() => openDetailModal(order)}
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
                              <span className="text-xs text-slate-400 italic">No items</span>
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
                          <td className="w-[170px] px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            {isDelivery ? (
                              <button
                                onClick={(e) => openCompleteModal(e, order)}
                                disabled={loadingId === order.id}
                                className="ml-auto inline-flex min-w-[100px] items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {loadingId === order.id ? (
                                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                  </svg>
                                ) : (
                                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                )}
                                Complete
                              </button>
                            ) : isCompleted ? (
                              <button
                                onClick={() => navigate(`/FeedbackFranchise?orderId=${order.id}`)}
                                className="ml-auto inline-flex min-w-[100px] items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-700"
                                title="Send feedback for a completed order"
                              >
                                <span className="material-symbols-outlined text-[16px]">rate_review</span>
                                Feedback
                              </button>
                            ) : isRejected ? (
                              <span className="text-xs font-medium text-slate-500">
                                Rejected
                              </span>
                            ) : isCancelled ? (
                              <span className="text-xs font-medium text-rose-500">
                                Cancelled
                              </span>
                            ) : isConfirmed ? (
                              <span className="text-xs font-medium text-emerald-600">
                                Awaiting
                              </span>
                            ) : displayStatus === "Processing" ? (
                              <span className="text-xs font-medium text-slate-500">
                                In progress
                              </span>
                            ) : isPending ? (
                              <button
                                onClick={(e) => openCancelModal(e, order)}
                                disabled={loadingId === order.id}
                                className="ml-auto inline-flex min-w-[100px] items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {loadingId === order.id ? (
                                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                  </svg>
                                ) : (
                                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                                )}
                                Cancel
                              </button>
                            ) : (
                              <span className="text-xs font-medium text-slate-400">
                                No action
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer — typography matches Franchise Stock History (FranchiseTransactionHistory) */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/60 px-4 py-3">
                {filteredOrders.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">0</span> orders match filters ·{' '}
                    <span className="font-semibold text-slate-800">{myOrders.length}</span> total
                  </p>
                ) : (
                  <p className="text-sm text-slate-600">
                    Showing{' '}
                    <span className="font-semibold text-slate-800">
                      {(ordersSafePage - 1) * ORDERS_PER_PAGE + 1}–
                      {Math.min(ordersSafePage * ORDERS_PER_PAGE, filteredOrders.length)}
                    </span>{' '}
                    of <span className="font-semibold text-slate-800">{filteredOrders.length}</span> orders
                    {filteredOrders.length !== myOrders.length && (
                      <>
                        {' '}
                        (
                        <span className="font-semibold text-slate-800">{myOrders.length}</span> total in your history)
                      </>
                    )}
                  </p>
                )}
                {filteredOrders.length > ORDERS_PER_PAGE && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                      disabled={ordersSafePage <= 1}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Previous page"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                      Previous
                    </button>
                    <span className="text-sm tabular-nums text-slate-600 px-1 min-w-[4.5rem] text-center">
                      Page {ordersSafePage} / {ordersTotalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOrdersPage((p) => Math.min(ordersTotalPages, p + 1))}
                      disabled={ordersSafePage >= ordersTotalPages}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Next page"
                    >
                      Next
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                )}
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
              {loadingDetail ? (
                <div className="flex items-center justify-center py-12 text-slate-400 gap-3">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span className="text-sm">Loading order details...</span>
                </div>
              ) : (
                <>
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
                        {detailLines.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center text-slate-400 py-6 text-sm">No items</td>
                          </tr>
                        ) : (
                          detailLines.map((line, index) => {
                            const ingredients = getLineIngredients(line);

                            return (
                              <tr key={line.id || index} className="border-t border-slate-100">
                                <td className="px-4 py-3">
                                  <p className="text-sm font-semibold text-slate-800">{line.name}</p>
                                  <p className="text-xs text-slate-400">{line.description}</p>
                                  {ingredients.length > 0 && (
                                    <div className="mt-2 space-y-1 border-l-2 border-amber-200 pl-3">
                                      <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-600">Ingredients</p>
                                      {ingredients.map((ingredient, ingredientIndex) => {
                                        const quantity = formatIngredientQuantity(ingredient);

                                        return (
                                          <div
                                            key={`${line.id || index}-ingredient-${ingredientIndex}`}
                                            className="flex items-center justify-between gap-3 text-xs text-slate-500"
                                          >
                                            <span>{getIngredientName(ingredient, ingredientIndex)}</span>
                                            {quantity && <span className="font-medium text-slate-600">{quantity}</span>}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
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
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {detailLines.length > 0 && (
                    <div className="mt-4 flex justify-end">
                      <div className="text-right">
                        <p className="text-xs text-slate-400 mb-1">Total Amount</p>
                        <p className="text-xl font-bold text-primary">
                          {detailLines
                            .reduce((s, l) => s + (l.price || 0) * l.quantity, 0)
                            .toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <span />
              <div className="flex gap-3">
                <button onClick={() => setDetailModal(null)} className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm hover:bg-slate-50">
                  Close
                </button>
                {getOrderDisplayStatus(detailModal.status) === "Delivery" && (
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
                  Confirm order completion{" "}
                  <span className="font-mono font-bold text-slate-800">#ORD-{confirmModal.id}</span>?
                  This action cannot be undone.
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

      {/* ===== Confirm Cancel Modal ===== */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCancelModal(null)} />
          <div className="bg-white rounded-2xl shadow-2xl z-10 w-96 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                <span className="material-symbols-outlined">cancel</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Cancel Order</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Are you sure you want to cancel your order?{" "}
                  <span className="font-mono font-bold text-slate-800">#ORD-{cancelModal.id}</span>?
                  The status will change to "Cancelled by Franchise".
                </p>
              </div>
              <button onClick={() => setCancelModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setCancelModal(null)} className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm hover:bg-slate-50">
                Keep Order
              </button>
              <button
                onClick={confirmCancel}
                disabled={loadingId === cancelModal.id}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm shadow flex items-center gap-2 hover:bg-red-600 disabled:opacity-60"
              >
                {loadingId === cancelModal.id ? (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                )}
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default OrderTracking;
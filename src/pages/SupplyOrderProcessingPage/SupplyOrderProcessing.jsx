import React, { useEffect, useState } from "react";
import { useNavigate, Link, useOutletContext } from "react-router-dom";
import "./SupplyOrderProcessing.css";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { fetchGetOrder } from "../../store/orderSlice";

const BASE_URL = "http://meinamfpt-001-site1.ltempurl.com/api";

function getTimeDiff(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function getStatusPriority(status) {
  if (status === "Pending")
    return { label: "Pending", cls: "bg-red-50 text-red-600 border-red-100" };
  if (status === "Approved")
    return {
      label: "Approved",
      cls: "bg-amber-50 text-amber-600 border-amber-100",
    };
  return { label: "Low", cls: "bg-slate-50 text-slate-500 border-slate-100" };
}

function getInitial(name) {
  return (name || "?")[0].toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-slate-100 text-slate-600",
];

function SupplyOrderProcessing() {
  const { handleLogout } = useOutletContext();
  const data = useSelector((state) => state.ORDER.listOrders);
  console.log("data", data);

  const dispatch = useDispatch();
  // const navigate = useNavigate();
  useEffect(() => {
    dispatch(fetchGetOrder());
  }, [dispatch]);

  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null); // full order object
  const [requestItems, setRequestItems] = useState([]);
  const [requestNote, setRequestNote] = useState("");
  const [toast, setToast] = useState(null);
  const [loadingAccept, setLoadingAccept] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // --- Accept Modal ---
  const openAcceptModal = (order) => {
    setSelectedOrder(order);
    setAcceptModalOpen(true);
  };

  const confirmAccept = async () => {
    if (!selectedOrder) return;
    setLoadingAccept(true);
    try {
      await axios.put(
        `${BASE_URL}/Order/${selectedOrder.id}/status`,
        {
          status: "Approved",
        },
        {
          headers: { accept: "*/*", "Content-Type": "application/json" },
        },
      );
      showToast(
        "success",
        `Đơn hàng #${selectedOrder.id} đã được chấp nhận thành công!`,
      );
      setAcceptModalOpen(false);
      dispatch(fetchGetOrder());
    } catch (err) {
      showToast(
        "error",
        `Lỗi khi chấp nhận đơn: ${err?.response?.data?.message || err.message}`,
      );
    } finally {
      setLoadingAccept(false);
    }
  };

  // --- Request Modal ---
  const openRequestModal = (order) => {
    setSelectedOrder(order);
    const items = (order.orderLines || []).map((line) => ({
      itemId: line.itemId,
      name: line.name,
      quantity: line.quantity,
      requestedQuantity: line.quantity,
    }));
    setRequestItems(items);
    setRequestNote("");
    setRequestModalOpen(true);
  };

  const updateRequestQty = (index, value) => {
    setRequestItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], requestedQuantity: value };
      return copy;
    });
  };

  const submitRequest = async () => {
    if (!selectedOrder) return;
    setLoadingRequest(true);
    try {
      const payload = {
        orderId: selectedOrder.id,
        requestedByUserId: 1,
        note: requestNote || "string",
        items: requestItems.map((i) => ({
          itemId: i.itemId,
          requestedQuantity: parseInt(i.requestedQuantity) || 0,
        })),
      };
      await axios.post(`${BASE_URL}/MaterialRequest`, payload, {
        headers: { accept: "*/*", "Content-Type": "application/json" },
      });
      showToast(
        "success",
        `Yêu cầu vật liệu cho đơn #${selectedOrder.id} đã được gửi!`,
      );
      setRequestModalOpen(false);
    } catch (err) {
      showToast(
        "error",
        `Lỗi khi gửi yêu cầu: ${err?.response?.data?.message || err.message}`,
      );
    } finally {
      setLoadingRequest(false);
    }
  };

  const orders = data || [];
  const incomingOrders = orders.filter(
    (o) => o.status === "Pending" || o.status === "Approved",
  );

  return (
    <>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-medium transition-all duration-300 ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          {toast.message}
          <button
            onClick={() => setToast(null)}
            className="ml-2 opacity-75 hover:opacity-100"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-slate-900">
                Order Processing
              </h2>
              <span className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <span className="material-symbols-outlined text-[18px]">
                  list_alt
                </span>
                <span>{incomingOrders.length} Orders Active</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 relative text-slate-600">
                  <span className="material-symbols-outlined text-[20px]">
                    notifications
                  </span>
                  <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white" />
                </button>
                <button className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600">
                  <span className="material-symbols-outlined text-[20px]">
                    settings
                  </span>
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 bg-slate-50/50">
            <div className="flex border-b border-slate-200 gap-8">
              <button className="pb-4 text-sm font-bold tab-active">
                Incoming Orders ({incomingOrders.length})
              </button>
              <button className="pb-4 text-sm font-medium text-slate-500 hover:text-navy-charcoal transition-colors">
                Processing (12)
              </button>
              <button className="pb-4 text-sm font-medium text-slate-500 hover:text-navy-charcoal transition-colors">
                Ready for Dispatch (6)
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-soft overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-white flex flex-wrap gap-4 items-center justify-between">
                <div className="relative w-64">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    search
                  </span>
                  <input
                    className="w-full pl-10 pr-4 py-2 text-sm border-slate-200 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Search orders..."
                    type="text"
                  />
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg flex items-center gap-2 hover:bg-slate-50">
                    <span className="material-symbols-outlined text-[18px]">
                      filter_list
                    </span>{" "}
                    Filter
                  </button>
                  <button className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg flex items-center gap-2 hover:bg-slate-50">
                    <span className="material-symbols-outlined text-[18px]">
                      download
                    </span>{" "}
                    Export
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Source (Franchise)
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Items List
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {incomingOrders.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center text-slate-400 py-10 text-sm"
                        >
                          Không có đơn hàng nào đang chờ xử lý
                        </td>
                      </tr>
                    )}
                    {incomingOrders.map((order, idx) => {
                      const priority = getStatusPriority(order.status);
                      const avatarColor =
                        AVATAR_COLORS[idx % AVATAR_COLORS.length];
                      const lines = order.orderLines || [];

                      // Build items list display
                      const firstLine = lines[0];
                      const restLines = lines.slice(1);

                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-mono text-sm font-bold text-navy-charcoal">
                                #ORD-{order.id}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                Placed {getTimeDiff(order.orderDate)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`size-6 rounded flex items-center justify-center text-[10px] font-black ${avatarColor}`}
                              >
                                {getInitial(order.username)}
                              </div>
                              <span className="text-sm font-bold text-navy-charcoal">
                                {order.username}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {lines.length === 0 ? (
                              <span className="text-xs text-slate-400 italic">
                                Không có sản phẩm
                              </span>
                            ) : (
                              <div className="flex flex-col gap-0.5">
                                {firstLine && (
                                  <span className="text-sm text-slate-700">
                                    {firstLine.quantity}x {firstLine.name}
                                  </span>
                                )}
                                {restLines.length > 0 && (
                                  <span className="text-xs text-slate-500">
                                    {restLines
                                      .map((l) => `${l.quantity}x ${l.name}`)
                                      .join(", ")}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`px-2.5 py-1 border rounded-full text-[10px] font-black uppercase tracking-tight ${priority.cls}`}
                            >
                              {priority.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openAcceptModal(order)}
                                disabled={order.status === "Approved"}
                                className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => openRequestModal(order)}
                                disabled={order.status === "Approved"}
                                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Request
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Showing {incomingOrders.length} of {incomingOrders.length}{" "}
                  Incoming Orders
                </span>
                <div className="flex gap-2">
                  <button
                    className="p-1.5 rounded border border-slate-200 bg-white text-slate-400 disabled:opacity-50"
                    disabled
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      chevron_left
                    </span>
                  </button>
                  <button className="p-1.5 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                    <span className="material-symbols-outlined text-[18px]">
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-soft flex items-center gap-4">
                <div className="size-12 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[28px]">
                    pending_actions
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Wait Time Avg.
                  </p>
                  <p className="text-xl font-bold text-navy-charcoal">
                    18 mins
                  </p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-soft flex items-center gap-4">
                <div className="size-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <span className="material-symbols-outlined text-[28px]">
                    priority_high
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    High Priority
                  </p>
                  <p className="text-xl font-bold text-navy-charcoal">
                    {String(
                      incomingOrders.filter((o) => o.status === "Pending")
                        .length,
                    ).padStart(2, "0")}{" "}
                    Orders
                  </p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-soft flex items-center gap-4">
                <div className="size-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined text-[28px]">
                    check_circle
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Capacity Status
                  </p>
                  <p className="text-xl font-bold text-navy-charcoal">
                    Optimal (72%)
                  </p>
                </div>
              </div>
            </div>
          </div>

      {/* Accept confirmation modal */}
      {acceptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setAcceptModalOpen(false)}
          />
          <div className="bg-white rounded-2xl shadow-2xl z-10 w-96 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Accept Order</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Are you sure you want to accept{" "}
                  <span className="font-mono font-bold">
                    #ORD-{selectedOrder?.id}
                  </span>
                  ? This will move the order to the Processing queue.
                </p>
              </div>
              <button
                onClick={() => setAcceptModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setAcceptModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmAccept}
                disabled={loadingAccept}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm shadow flex items-center gap-2 disabled:opacity-60"
              >
                {loadingAccept && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                )}
                Confirm Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request items modal */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setRequestModalOpen(false)}
          />
          <div className="bg-white rounded-2xl shadow-2xl z-10 w-[680px] p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined">
                    add_shopping_cart
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    Request Additional Materials
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Please specify quantities needed for order{" "}
                    <span className="font-mono font-bold">
                      #ORD-{selectedOrder?.id}
                    </span>
                    .
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRequestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 overflow-y-auto max-h-64 border rounded-md">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500">
                    <th className="px-4 py-3">Material Name</th>
                    <th className="px-4 py-3">Original Qty</th>
                    <th className="px-4 py-3">Request Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {requestItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center text-slate-400 py-6 text-sm"
                      >
                        Đơn hàng này không có sản phẩm
                      </td>
                    </tr>
                  ) : (
                    requestItems.map((it, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-3 text-sm font-medium">
                          {it.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {it.quantity}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            value={it.requestedQuantity}
                            onChange={(e) =>
                              updateRequestQty(idx, e.target.value)
                            }
                            className="w-full rounded-md border border-slate-200 px-3 py-2 focus:ring-primary focus:border-primary"
                            placeholder="Qty"
                            type="number"
                            min={1}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Note
              </label>
              <input
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                placeholder="Ghi chú thêm..."
              />
            </div>

            <div className="mt-4 text-sm text-amber-700 bg-amber-50 p-3 rounded mb-4">
              Requesting these materials will alert the inventory manager. Lead
              time for these items is approximately 45 minutes.
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRequestModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm"
              >
                Cancel
              </button>
              <button
                onClick={submitRequest}
                disabled={loadingRequest}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm flex items-center gap-2 disabled:opacity-60"
              >
                {loadingRequest && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                )}
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SupplyOrderProcessing;

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchGetOrder, createOrder, updateOrderStatus, deleteOrder, clearOrderError } from "../../../store/orderSlice";
import { fetchAllUsers } from "../../../store/userSlice";
import { fetchGetAll } from "../../../store/itemSlice";

const STATUS_OPTIONS = ["All", "Pending", "Processing", "Approved", "Completed", "Cancelled"];
const STATUS_FLOW = ["Pending", "Processing", "Approved", "Completed", "Cancelled"];

const STATUS_COLORS = {
  Pending: "bg-amber-50 text-amber-700",
  Processing: "bg-blue-50 text-blue-700",
  Approved: "bg-violet-50 text-violet-700",
  Completed: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
};

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.$values)) return data.$values;
  if (data && typeof data === "object") return Object.values(data).find(Array.isArray) || [];
  return [];
};

function OrderManagement() {
  const dispatch = useDispatch();
  const { listOrders, loading, error } = useSelector((state) => state.ORDER || { listOrders: [], loading: false, error: null });
  const { users } = useSelector((state) => state.USER || { users: [] });
  const { listItems } = useSelector((state) => state.ITEM || { listItems: [] });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Create order modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ userId: "", items: [{ itemId: "", quantity: 1 }] });
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Status update
  const [statusDropdown, setStatusDropdown] = useState(null);

  useEffect(() => {
    dispatch(fetchGetOrder());
    dispatch(fetchAllUsers());
    dispatch(fetchGetAll({ type: "", category: "" }));
  }, [dispatch]);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(""), 3000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => dispatch(clearOrderError()), 5000);
      return () => clearTimeout(t);
    }
  }, [error, dispatch]);

  const orderList = normalizeArray(listOrders);
  const userList = Array.isArray(users) ? users : [];
  const itemList = Array.isArray(listItems) ? listItems : normalizeArray(listItems);

  const filtered = orderList
    .filter((o) => {
      const matchSearch =
        String(o.id).includes(search) ||
        (o.username || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || o.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0));

  const statusCounts = STATUS_OPTIONS.slice(1).reduce((acc, s) => {
    acc[s] = orderList.filter((o) => o.status === s).length;
    return acc;
  }, {});

  const toggleExpand = (id) => setExpandedOrder(expandedOrder === id ? null : id);

  /* ── Create Order ── */
  const openCreateModal = () => {
    setCreateForm({ userId: "", items: [{ itemId: "", quantity: 1 }] });
    setShowCreateModal(true);
  };

  const addItemRow = () => {
    setCreateForm((prev) => ({ ...prev, items: [...prev.items, { itemId: "", quantity: 1 }] }));
  };

  const removeItemRow = (idx) => {
    setCreateForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const updateItemRow = (idx, field, value) => {
    setCreateForm((prev) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: field === "quantity" ? Math.max(1, parseInt(value) || 1) : value };
      return { ...prev, items };
    });
  };

  const handleCreateOrder = async () => {
    if (actionLoading || !createForm.userId || createForm.items.some((i) => !i.itemId)) return;
    setActionLoading(true);
    try {
      const payload = {
        userId: parseInt(createForm.userId),
        items: createForm.items.map((i) => ({ itemId: parseInt(i.itemId), quantity: i.quantity })),
      };
      console.log("Creating order with payload:", JSON.stringify(payload));
      await dispatch(createOrder(payload)).unwrap();
      await dispatch(fetchGetOrder());
      setShowCreateModal(false);
      setSuccessMsg("Order created successfully!");
    } catch (err) {
      console.error("Create order error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Update Status ── */
  const handleUpdateStatus = async (orderId, newStatus) => {
    setStatusDropdown(null);
    setActionLoading(true);
    try {
      await dispatch(updateOrderStatus({ id: orderId, status: newStatus })).unwrap();
      await dispatch(fetchGetOrder());
      setSuccessMsg(`Order #${orderId} status updated to ${newStatus}`);
    } catch {
      // error is handled by Redux
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Delete Order ── */
  const handleDeleteOrder = async (orderId) => {
    setDeleteConfirm(null);
    setActionLoading(true);
    try {
      await dispatch(deleteOrder(orderId)).unwrap();
      setSuccessMsg(`Order #${orderId} deleted successfully!`);
    } catch {
      // error is handled by Redux
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate total for create form preview
  const createFormTotal = createForm.items.reduce((sum, row) => {
    const item = itemList.find((i) => String(i.id) === String(row.itemId));
    return sum + (item ? item.price * row.quantity : 0);
  }, 0);

  return (
    <>
      <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white shrink-0">
        <h2 className="text-lg font-bold text-slate-900">Order Management</h2>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 relative text-slate-600">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <button className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600">
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-slate-50/50">
        {/* Success / Error Messages */}
        {successMsg && (
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">
            <span className="material-symbols-outlined text-base">check_circle</span>{successMsg}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            <span className="material-symbols-outlined text-base">error</span>
            {typeof error === "string" ? error : error?.message || "An error occurred. Please try again."}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
              <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                <span className="material-symbols-outlined text-base">shopping_cart</span>
              </div>
            </div>
            <span className="text-2xl font-bold text-slate-900">{orderList.length}</span>
            <span className="text-[11px] text-slate-500">All time</span>
          </div>
          {["Pending", "Processing", "Approved", "Completed"].map((status) => (
            <div key={status} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{status}</span>
                <div className={`size-8 rounded-lg flex items-center justify-center ${STATUS_COLORS[status]}`}>
                  <span className="material-symbols-outlined text-base">
                    {status === "Pending" ? "schedule" : status === "Processing" ? "sync" : status === "Approved" ? "check_circle" : "done_all"}
                  </span>
                </div>
              </div>
              <span className="text-2xl font-bold text-slate-900">{statusCounts[status] || 0}</span>
              <span className="text-[11px] text-slate-500">Orders</span>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-[20px]">search</span>
              <input
                type="text"
                placeholder="Search by order ID or username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Showing {filtered.length} of {orderList.length} orders
            </span>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Create Order
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-slate-200">
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Order #</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Customer</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Items</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Total</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">Loading orders...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">No orders found.</td>
                  </tr>
                ) : (
                  filtered.map((order) => {
                    const lines = normalizeArray(order.orderLines);
                    const total = lines.reduce((sum, l) => sum + (l.price || 0) * (l.quantity || 0), 0);
                    const isExpanded = expandedOrder === order.id;
                    return (
                      <React.Fragment key={order.id}>
                        <tr className="hover:bg-slate-50 border-b border-slate-100">
                          <td className="px-4 py-3">
                            <span className="text-xs font-bold text-slate-800">#{order.id}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                                {(order.username || "U").charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs font-semibold text-slate-700">{order.username || "—"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">
                            {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">{lines.length} item{lines.length !== 1 ? "s" : ""}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-slate-800">
                            {total.toLocaleString("vi-VN")}₫
                          </td>
                          <td className="px-4 py-3 relative">
                            <button
                              onClick={() => setStatusDropdown(statusDropdown === order.id ? null : order.id)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer hover:opacity-80 transition-opacity ${STATUS_COLORS[order.status] || "bg-slate-100 text-slate-600"}`}
                            >
                              ● {order.status || "Unknown"}
                              <span className="material-symbols-outlined text-[12px]">expand_more</span>
                            </button>
                            {statusDropdown === order.id && (
                              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-30 min-w-[140px]">
                                {STATUS_FLOW.filter((s) => s !== order.status).map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => handleUpdateStatus(order.id, s)}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg"
                                  >
                                    <span className={`inline-block size-2 rounded-full ${STATUS_COLORS[s]?.split(" ")[0]?.replace("bg-", "bg-") || "bg-slate-300"}`} />
                                    {s}
                                  </button>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => toggleExpand(order.id)}
                                className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors"
                                title="View details"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  {isExpanded ? "expand_less" : "expand_more"}
                                </span>
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(order.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                title="Delete order"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-slate-50/70">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Order Items</div>
                              <table className="w-full">
                                <thead>
                                  <tr>
                                    <th className="text-left text-[10px] font-semibold text-slate-400 pb-2">Item</th>
                                    <th className="text-left text-[10px] font-semibold text-slate-400 pb-2">Category</th>
                                    <th className="text-left text-[10px] font-semibold text-slate-400 pb-2">Qty</th>
                                    <th className="text-left text-[10px] font-semibold text-slate-400 pb-2">Price</th>
                                    <th className="text-left text-[10px] font-semibold text-slate-400 pb-2">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {lines.map((line) => (
                                    <tr key={line.id} className="border-t border-slate-100">
                                      <td className="py-2 text-xs font-medium text-slate-800">{line.name}</td>
                                      <td className="py-2 text-xs text-slate-500">{line.category}</td>
                                      <td className="py-2 text-xs text-slate-600">{line.quantity}</td>
                                      <td className="py-2 text-xs text-slate-600">{(line.price || 0).toLocaleString("vi-VN")}₫</td>
                                      <td className="py-2 text-xs font-semibold text-slate-800">{((line.price || 0) * (line.quantity || 0)).toLocaleString("vi-VN")}₫</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr className="border-t border-slate-200">
                                    <td colSpan={4} className="py-2 text-xs font-bold text-slate-700 text-right pr-4">Total:</td>
                                    <td className="py-2 text-xs font-bold text-slate-900">{total.toLocaleString("vi-VN")}₫</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Showing {filtered.length} of {orderList.length} orders
            </span>
          </div>
        </div>
      </div>

      {/* ─── Create Order Modal ─── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Create New Order</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              {/* User Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">User</label>
                <select
                  value={createForm.userId}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, userId: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Select a franchise store user...</option>
                  {userList.filter((u) => u.roleId === 3).map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username} ({u.email || u.roleName || `ID: ${u.id}`})
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-600">Order Items</label>
                  <button
                    onClick={addItemRow}
                    className="flex items-center gap-1 text-xs text-primary font-semibold hover:text-primary/80"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>Add Item
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {createForm.items.map((row, idx) => {
                    const selectedItem = itemList.find((i) => String(i.id) === String(row.itemId));
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <select
                          value={row.itemId}
                          onChange={(e) => updateItemRow(idx, "itemId", e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          <option value="">Select item...</option>
                          {itemList.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} — {(item.price || 0).toLocaleString("vi-VN")}₫/{item.unit}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={(e) => updateItemRow(idx, "quantity", e.target.value)}
                          className="w-20 px-3 py-2 text-sm border border-slate-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        {selectedItem && (
                          <span className="text-xs text-slate-500 w-24 text-right">
                            {(selectedItem.price * row.quantity).toLocaleString("vi-VN")}₫
                          </span>
                        )}
                        {createForm.items.length > 1 && (
                          <button
                            onClick={() => removeItemRow(idx)}
                            className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Preview */}
              {createFormTotal > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-600">Estimated Total</span>
                  <span className="text-sm font-bold text-slate-900">{createFormTotal.toLocaleString("vi-VN")}₫</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrder}
                disabled={actionLoading || !createForm.userId || createForm.items.some((i) => !i.itemId)}
                className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {actionLoading && (
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                )}
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 text-center">
              <div className="size-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-red-500 text-2xl">warning</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Delete Order #{deleteConfirm}?</h3>
              <p className="text-sm text-slate-500">This action cannot be undone. The order and all its items will be permanently removed.</p>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-200">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteOrder(deleteConfirm)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close status dropdown when clicking outside */}
      {statusDropdown && (
        <div className="fixed inset-0 z-20" onClick={() => setStatusDropdown(null)} />
      )}
    </>
  );
}

export default OrderManagement;

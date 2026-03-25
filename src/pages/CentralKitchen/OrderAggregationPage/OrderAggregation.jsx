import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useOutletContext } from "react-router-dom";
import { fetchGetMaterialRequest, updateMaterialRequestStatus } from "../../../store/materialSlice";
import { updateOrderStatus } from "../../../store/orderSlice";
import { extractApiMessage } from "../../../services/api";
import PageHeader from "../../../components/common/PageHeader";

function parseUTC(dateStr) {
  if (!dateStr) return new Date(NaN);
  let s = String(dateStr);
  if (!/Z|[+-]\d{2}:\d{2}$/.test(s)) s += "Z";
  return new Date(s);
}

function getMaterialRequestDisplayStatus(status) {
  switch (status) {
    case "Approved":
    case "Fulfilled":
    case "Confirmed":
      return "Confirmed";
    case "Pending":
    case "Processing":
      return "Processing";
    default:
      return status || "Unknown";
  }
}

function getStatusBadge(status) {
  const displayStatus = getMaterialRequestDisplayStatus(status);

  switch (displayStatus) {
    case "Processing":
      return { label: "Processing", cls: "bg-blue-50 text-blue-600 border border-blue-200", dot: "bg-blue-500" };
    case "Confirmed":
      return { label: "Confirmed", cls: "bg-emerald-50 text-emerald-600 border border-emerald-200", dot: "bg-emerald-500" };
    default:
      return { label: displayStatus, cls: "bg-slate-50 text-slate-500 border border-slate-200", dot: "bg-slate-400" };
  }
}

function DetailModal({ requestId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!requestId) return;
    setLoading(true);
    setError(null);
    fetch(
      `http://centralkitchen-001-site1.mtempurl.com/api/MaterialRequest/${requestId}`,
      {
        headers: { accept: "*/*" },
      },
    )
      .then((res) => res.json())
      .then((json) => {
        setDetail(json.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load request details.");
        setLoading(false);
      });
  }, [requestId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-500">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <span className="material-symbols-outlined text-white text-xl">
                receipt_long
              </span>
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-tight">
                Request Detail
              </h2>
              {detail && (
                <p className="text-blue-100 text-xs font-medium">
                  Request #{detail.id}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-all"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Body */}
            <div className="px-6 py-5">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="size-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-slate-500 text-sm font-medium">
                Loading data...
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {detail && !loading && (
            <div className="space-y-5">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                {(() => {
                  const detailDisplayStatus = getMaterialRequestDisplayStatus(detail.status);
                  const detailStatusClass =
                    detailDisplayStatus === "Processing"
                      ? "text-amber-600 font-black uppercase"
                      : detailDisplayStatus === "Confirmed"
                        ? "text-green-600 font-black uppercase"
                        : "text-slate-700";

                  return (
                    <>
                <InfoCell
                  icon="tag"
                  label="Order ID"
                  value={`#${detail.orderId}`}
                />
                <InfoCell
                  icon="person"
                  label="Requested By"
                  value={detail.requestedByUsername}
                />
                <InfoCell
                  icon="schedule"
                  label="Created At"
                  value={parseUTC(detail.createdAt).toLocaleString("vi-VN")}
                />
                <InfoCell
                  icon="flag"
                  label="Status"
                  value={detailDisplayStatus}
                  valueClass={detailStatusClass}
                />
                    </>
                  );
                })()}
              </div>

              {detail.note && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex gap-2 items-start">
                  <span className="material-symbols-outlined text-slate-400 text-sm mt-0.5">
                    sticky_note_2
                  </span>
                  <p className="text-slate-600 text-sm italic">{detail.note}</p>
                </div>
              )}

              {/* Items Table */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-blue-500">
                    inventory_2
                  </span>
                  Materials list ({detail.items?.length || 0} items)
                </h3>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-500 tracking-wider">
                          Material
                        </th>
                        {/* <th className="px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-500 tracking-wider">Tồn kho</th> */}
                          <th className="px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-500 tracking-wider">
                          Requested
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {detail.items?.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="size-7 rounded bg-blue-50 flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-400 text-base">
                                  restaurant
                                </span>
                              </div>
                              <span className="font-semibold text-slate-800">
                                {item.materialName}
                              </span>
                            </div>
                          </td>
                          {/* <td className="px-4 py-3">
                            <span
                              className={`font-medium ${
                                item.currentStock === 0
                                  ? "text-red-500"
                                  : item.currentStock < item.requestedQuantity
                                  ? "text-amber-500"
                                  : "text-green-600"
                              }`}
                            >
                              {item.currentStock} {item.unit}
                            </span>
                          </td> */}
                          <td className="px-4 py-3 font-bold text-slate-800">
                            {item.requestedQuantity} {item.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCell({ icon, label, value, valueClass = "text-slate-800" }) {
  return (
    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
        <span className="material-symbols-outlined text-[12px]">{icon}</span>
        {label}
      </p>
      <p className={`text-sm font-semibold truncate ${valueClass}`}>{value}</p>
    </div>
  );
}

function OrderAggregation() {
  const { handleLogout } = useOutletContext();
  const navigate = useNavigate();
  const data = useSelector((state) => state.MATERIAL.listMaterials);
  const dispatch = useDispatch();
  const currentUserId = (() => {
    try {
      const raw = localStorage.getItem("USER_INFO");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const n = Number(parsed?.id);
      return Number.isFinite(n) && n > 0 ? n : null;
    } catch {
      return null;
    }
  })();
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    dispatch(fetchGetMaterialRequest());
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const dispatchMaterialStatusUpdate = async (requestId, nextStatuses) => {
    let lastError;

    for (const nextStatus of nextStatuses) {
      const result = await dispatch(
        updateMaterialRequestStatus({ id: requestId, status: nextStatus, acceptedByUserId: currentUserId })
      );

      if (updateMaterialRequestStatus.fulfilled.match(result)) {
        return result.payload;
      }

      lastError = result.payload || result.error;
    }

    throw lastError;
  };

  const handleUrgentClick = (batchId) => {
    const id = batchId.replace("#", "");
    navigate(`/MaterialFulfillmentPlan?id=${id}`);
  };

  const handleAccept = async (request) => {
    const id = request?.id;
    try {
      // Update material request status to Approved (backend will handle inventory update)
      const response = await dispatchMaterialStatusUpdate(id, ["Approved", "Fulfilled"]);
      showToast("success", extractApiMessage(response?.payload, `Yêu cầu vật tư #${id} đã được cập nhật thành công và vật liệu đã được thêm vào kho.`));
      dispatch(fetchGetMaterialRequest());
    } catch (error) {
      console.error("Error accepting request:", error);
      showToast("error", extractApiMessage(error, "Không thể cập nhật trạng thái yêu cầu vật tư."));
    }
  };

  const pendingItems =
    data?.filter((item) => getMaterialRequestDisplayStatus(item.status) === "Processing") || [];

  return (
    <>
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

      {/* MODAL */}
      {selectedRequestId && (
        <DetailModal
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          as="h2"
          title="Order Aggregation"
          subtitle="Consolidate franchise orders into batches for kitchen preparation."
          className="sticky top-0 z-10"
        />

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Table Section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                <span className="material-symbols-outlined text-blue-600">
                  groups
                </span>
                Processing Aggregation
              </h3>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                      #ID
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                      Material Name
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                      Requested Qty
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                      Requested By
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                      Note
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-10 text-center text-slate-400 text-sm"
                      >
                        No processing requests found.
                      </td>
                    </tr>
                  ) : (
                    pendingItems.map((request) => {
                      const statusBadge = getStatusBadge(request.status);

                      return (
                        <tr
                          key={request.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-bold text-slate-500">
                            #{request.id}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="font-mono text-xs font-bold text-slate-700">#ORD-{request.orderId}</span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase w-fit ${statusBadge.cls}`}>
                                <span className={`size-1.5 rounded-full ${statusBadge.dot}`} />
                                {statusBadge.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              {request.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3">
                                  <div className="size-8 rounded bg-slate-100 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-slate-400 text-lg">
                                      restaurant
                                    </span>
                                  </div>
                                  <p className="font-bold text-sm text-slate-900">
                                    {item.materialName}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              {request.items.map((item) => (
                                <div key={item.id} className="h-8 flex items-center text-sm font-medium text-slate-700">
                                  {item.requestedQuantity} {item.unit}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-700">
                            {request.requestedByUsername}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${statusBadge.cls}`}>
                              <span className={`size-1.5 rounded-full ${statusBadge.dot}`} />
                              {statusBadge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 italic max-w-[160px] truncate">
                            {request.note || "—"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* View Detail Button */}
                              <button
                                onClick={() => setSelectedRequestId(request.id)}
                                className="text-blue-600 border border-blue-200 text-xs px-4 py-2 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  visibility
                                </span>
                                Detail
                              </button>

                              {/* Accept Button */}
                              <button
                                onClick={() => handleAccept(request)}
                                className="text-green-600 border border-green-200 text-xs px-4 py-2 rounded-lg font-bold hover:bg-green-600 hover:text-white transition-all flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  check_circle
                                </span>
                                Accept
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"></div>
        </div>
      </main>
    </>
  );
}

export default OrderAggregation;
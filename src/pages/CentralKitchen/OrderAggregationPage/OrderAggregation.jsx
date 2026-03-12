import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useOutletContext } from "react-router-dom";
import { fetchGetMaterialRequest } from "../../../store/materialSlice";

function parseUTC(dateStr) {
  if (!dateStr) return new Date(NaN);
  let s = String(dateStr);
  if (!/Z|[+-]\d{2}:\d{2}$/.test(s)) s += "Z";
  return new Date(s);
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
      `http://meinamfpt-001-site1.ltempurl.com/api/MaterialRequest/${requestId}`,
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
        setError("Không thể tải chi tiết yêu cầu.");
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
                Chi tiết yêu cầu
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
                Đang tải dữ liệu...
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
                  value={detail.status}
                  valueClass={
                    detail.status === "Pending"
                      ? "text-amber-600 font-black uppercase"
                      : detail.status === "Fulfilled"
                        ? "text-green-600 font-black uppercase"
                        : "text-slate-700"
                  }
                />
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
                  Danh sách vật liệu ({detail.items?.length || 0} mục)
                </h3>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-500 tracking-wider">
                          Vật liệu
                        </th>
                        {/* <th className="px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-500 tracking-wider">Tồn kho</th> */}
                        <th className="px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-500 tracking-wider">
                          Yêu cầu
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
            Đóng
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
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  useEffect(() => {
    dispatch(fetchGetMaterialRequest());
  }, []);

  const handleUrgentClick = (batchId) => {
    const id = batchId.replace("#", "");
    navigate(`/MaterialFulfillmentPlan?id=${id}`);
  };

  const handleAccept = async (id) => {
    try {
      const response = await fetch(
        `http://meinamfpt-001-site1.ltempurl.com/api/MaterialRequest/${id}/status`,
        {
          method: "PUT",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "Fulfilled" }),
        },
      );
      if (response.ok) {
        alert(`Request #${id} đã được Accepted thành công!`);
        dispatch(fetchGetMaterialRequest());
      } else {
        alert("Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("Không thể kết nối đến server.");
    }
  };

  const pendingItems = data?.filter((item) => item.status === "Pending") || [];

  return (
    <>
      {/* MODAL */}
      {selectedRequestId && (
        <DetailModal
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex flex-col justify-center border-b border-slate-200 px-8 py-4 bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">Order Aggregation</h2>
          <span className="text-sm text-slate-500 font-medium mt-1">Consolidate franchise orders into batches</span>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Table Section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                <span className="material-symbols-outlined text-blue-600">
                  groups
                </span>
                Pending Aggregation
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
                        colSpan={7}
                        className="px-6 py-10 text-center text-slate-400 text-sm"
                      >
                        No pending requests found.
                      </td>
                    </tr>
                  ) : (
                    pendingItems.map((request) =>
                      request.items.map((item) => (
                        <tr
                          key={`${request.id}-${item.id}`}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-bold text-slate-500">
                            #{request.id}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded bg-slate-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-400 text-lg">
                                  restaurant
                                </span>
                              </div>
                              <div>
                                <p className="font-bold text-sm text-slate-900">
                                  {item.materialName}
                                </p>
                                {/* <p className="text-xs text-slate-400">
                                  Stock: {item.currentStock} {item.unit}
                                </p> */}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-700">
                            {item.requestedQuantity} {item.unit}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-700">
                            {request.requestedByUsername}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-700 border border-amber-200">
                              {request.status}
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
                                onClick={() => handleAccept(request.id)}
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
                      )),
                    )
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

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { fetchGetMaterialRequest } from "../../store/materialSlice";

function DetailModal({ requestId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!requestId) return;
    setLoading(true);
    setError(null);
    fetch(`http://meinamfpt-001-site1.ltempurl.com/api/MaterialRequest/${requestId}`, {
      headers: { accept: "*/*" },
    })
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
              <span className="material-symbols-outlined text-white text-xl">receipt_long</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-tight">Chi tiết yêu cầu</h2>
              {detail && (
                <p className="text-blue-100 text-xs font-medium">Request #{detail.id}</p>
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
              <p className="text-slate-500 text-sm font-medium">Đang tải dữ liệu...</p>
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
                <InfoCell icon="tag" label="Order ID" value={`#${detail.orderId}`} />
                <InfoCell icon="person" label="Requested By" value={detail.requestedByUsername} />
                <InfoCell
                  icon="schedule"
                  label="Created At"
                  value={new Date(detail.createdAt).toLocaleString("vi-VN")}
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
                  <span className="material-symbols-outlined text-slate-400 text-sm mt-0.5">sticky_note_2</span>
                  <p className="text-slate-600 text-sm italic">{detail.note}</p>
                </div>
              )}

              {/* Items Table */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-blue-500">inventory_2</span>
                  Danh sách vật liệu ({detail.items?.length || 0} mục)
                </h3>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-500 tracking-wider">Vật liệu</th>
                        {/* <th className="px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-500 tracking-wider">Tồn kho</th> */}
                        <th className="px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-500 tracking-wider">Yêu cầu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {detail.items?.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="size-7 rounded bg-blue-50 flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-400 text-base">restaurant</span>
                              </div>
                              <span className="font-semibold text-slate-800">{item.materialName}</span>
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
        }
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
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* MODAL */}
      {selectedRequestId && (
        <DetailModal
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
        />
      )}

      {/* SIDEBAR */}
      <aside className="w-64 flex flex-col bg-white border-r border-slate-200 shrink-0 shadow-sm">
        <div className="p-6 flex flex-col gap-8 h-full">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 size-10 rounded-lg flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-2xl">soup_kitchen</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-slate-900 text-sm font-bold leading-tight uppercase tracking-wider">
                Central Kitchen
              </h1>
              <p className="text-slate-500 text-[10px] font-medium uppercase tracking-tighter">
                Management System
              </p>
            </div>
          </div>

          <nav className="flex flex-col gap-1 grow">
            <Link
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              to="/DashboardCentral"
            >
              <span className="material-symbols-outlined text-[22px]">dashboard</span>
              <span className="text-sm font-medium">Dashboard</span>
            </Link>

            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-blue-600 font-semibold" href="#">
              <span className="material-symbols-outlined text-[22px]">list_alt</span>
              <span className="text-sm">Order Aggregation</span>
            </a>

            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors" href="#">
              <span className="material-symbols-outlined text-[22px]">precision_manufacturing</span>
              <span className="text-sm font-medium">Production Coordination</span>
            </a>

            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors" href="#">
              <span className="material-symbols-outlined text-[22px]">local_shipping</span>
              <span className="text-sm font-medium">Delivery Scheduling</span>
            </a>
          </nav>

          <div className="mt-auto border-t border-slate-100 pt-6">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="size-9 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <img alt="User" className="w-full h-full object-cover" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" />
              </div>
              <div className="flex flex-col">
                <span className="text-slate-900 text-xs font-bold">Alex Rivers</span>
                <span className="text-slate-500 text-[10px] font-medium">Central Kitchen Staff</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-200 px-8 py-4 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Order Aggregation</h2>
            <p className="text-slate-500 text-xs font-medium">
              Consolidate franchise orders into production batches
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-slate-50 rounded-lg px-3 py-2 gap-2 text-sm border border-slate-200 text-slate-700">
              <span className="material-symbols-outlined text-sm text-slate-500">schedule</span>
              <span className="font-medium">Shift: Morning (06:00 - 14:00)</span>
            </div>
            <button className="p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center gap-4 rounded-xl p-6 bg-white border border-slate-200 shadow-sm">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <div>
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Total SKUs Pending</p>
                <p className="text-2xl font-bold text-slate-900">{pendingItems.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl p-6 bg-white border border-slate-200 shadow-sm">
              <div className="bg-amber-50 text-amber-600 p-3 rounded-lg">
                <span className="material-symbols-outlined">timer</span>
              </div>
              <div>
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Next Deadline</p>
                <p className="text-2xl font-bold text-slate-900">45m 12s</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl p-6 bg-white border border-slate-200 shadow-sm">
              <div className="bg-green-50 text-green-600 p-3 rounded-lg">
                <span className="material-symbols-outlined">storefront</span>
              </div>
              <div>
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Ordering Stores</p>
                <p className="text-2xl font-bold text-slate-900">52</p>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                <span className="material-symbols-outlined text-blue-600">groups</span>
                Pending Aggregation
              </h3>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">#ID</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Material Name</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Requested Qty</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Requested By</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Note</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-slate-400 text-sm">
                        No pending requests found.
                      </td>
                    </tr>
                  ) : (
                    pendingItems.map((request) =>
                      request.items.map((item) => (
                        <tr key={`${request.id}-${item.id}`} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-slate-500">#{request.id}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded bg-slate-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-400 text-lg">restaurant</span>
                              </div>
                              <div>
                                <p className="font-bold text-sm text-slate-900">{item.materialName}</p>
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
                                <span className="material-symbols-outlined text-sm">visibility</span>
                                Detail
                              </button>

                              {/* Accept Button */}
                              <button
                                onClick={() => handleAccept(request.id)}
                                className="text-green-600 border border-green-200 text-xs px-4 py-2 rounded-lg font-bold hover:bg-green-600 hover:text-white transition-all flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                Accept
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* History */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                <span className="material-symbols-outlined text-blue-600">history</span>
                Recently Consolidated
              </h3>
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-amber-50/40">
                      <td className="px-4 py-3 font-bold text-slate-900">#BAT-1025</td>
                      <td className="px-4 py-3 text-slate-600">Potato Rolls & Beef</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500 text-white">
                          Requested
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-slate-900">#BAT-1024</td>
                      <td className="px-4 py-3 text-slate-600">Alfredo Sauce</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-700">
                          Sent
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Alerts */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-red-600">
                <span className="material-symbols-outlined">notification_important</span>
                Critical Reminders
              </h3>
              <div className="space-y-3">
                <div
                  onClick={() => handleUrgentClick("#BAT-1025")}
                  className="flex items-center gap-4 p-4 rounded-xl bg-amber-100 border-2 border-amber-400 shadow-sm cursor-pointer hover:bg-amber-200 transition-all"
                >
                  <div className="bg-white text-amber-600 rounded-full p-2 flex items-center justify-center border border-amber-200">
                    <span className="material-symbols-outlined text-sm">shopping_cart_checkout</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-slate-900 uppercase">New Incoming Request</h4>
                    <p className="text-xs text-slate-800 font-semibold">
                      Batch #BAT-1025 requires immediate supply coordination.
                    </p>
                  </div>
                  <span className="text-[10px] font-black text-white px-2 py-1 bg-red-600 rounded shadow-sm shrink-0">
                    JUST NOW
                  </span>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                  <div className="bg-red-50 text-red-600 rounded-full p-2 flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">priority_high</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-slate-900 uppercase">Cut-off Approaching</h4>
                    <p className="text-xs text-slate-600 font-medium">
                      Bakery items window closes in 15 minutes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}

export default OrderAggregation;
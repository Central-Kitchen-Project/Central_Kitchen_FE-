import React from "react";
import { useNavigate } from "react-router-dom";

function OrderAggregation() {
  const navigate = useNavigate();

  // Logic chuyển trang
  const handleUrgentClick = (batchId) => {
    // Loại bỏ ký tự # nếu có để truyền ID sạch qua URL
    const id = batchId.replace("#", "");
    navigate(`/MaterialFulfillmentPlan?id=${id}`);
  };

  return (
    <>
        <header className="flex items-center justify-between border-b border-slate-200 px-8 py-4 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Order Aggregation</h2>
            <p className="text-slate-500 text-xs font-medium">Consolidate franchise orders into production batches</p>
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
                <p className="text-2xl font-bold text-slate-900">84</p>
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
              <div className="flex gap-2">
                <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span> Consolidate All
                </button>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Product Name</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Total Requested</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Stores</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded bg-slate-100 flex items-center justify-center">
                          <span className="material-symbols-outlined text-slate-400 text-lg">restaurant</span>
                        </div>
                        <span className="font-bold text-sm text-slate-900">Marinated Chicken Thighs</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">845.50 kg</td>
                    <td className="px-6 py-4 text-sm font-semibold text-blue-600">28 Stores</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 border border-blue-200 text-xs px-4 py-2 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition-all">
                        Consolidate
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Bottom Grid: History & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* History */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                <span className="material-symbols-outlined text-blue-600">history</span> Recently Consolidated
              </h3>
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-amber-50/40">
                      <td className="px-4 py-3 font-bold text-slate-900">#BAT-1025</td>
                      <td className="px-4 py-3 text-slate-600">Potato Rolls & Beef</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500 text-white">Requested</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-slate-900">#BAT-1024</td>
                      <td className="px-4 py-3 text-slate-600">Alfredo Sauce</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-700">Sent</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Alerts - ĐÃ SỬA LỖI TẠI ĐÂY */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-red-600">
                <span className="material-symbols-outlined">notification_important</span> Critical Reminders
              </h3>
              <div className="space-y-3">
                {/* Urgent Card clickable */}
                <div 
                  onClick={() => handleUrgentClick("#BAT-1025")}
                  className="flex items-center gap-4 p-4 rounded-xl bg-amber-100 border-2 border-amber-400 shadow-sm cursor-pointer hover:bg-amber-200 transition-all animate-pulse-slow"
                >
                  <div className="bg-white text-amber-600 rounded-full p-2 flex items-center justify-center border border-amber-200">
                    <span className="material-symbols-outlined text-sm">shopping_cart_checkout</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-slate-900 uppercase">New Incoming Request</h4>
                    <p className="text-xs text-slate-800 font-semibold">Batch #BAT-1025 requires immediate supply coordination.</p>
                  </div>
                  <span className="text-[10px] font-black text-white px-2 py-1 bg-red-600 rounded shadow-sm shrink-0">JUST NOW</span>
                </div>

                {/* Normal Alert */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                  <div className="bg-red-50 text-red-600 rounded-full p-2 flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">priority_high</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-slate-900 uppercase">Cut-off Approaching</h4>
                    <p className="text-xs text-slate-600 font-medium">Bakery items window closes in 15 minutes.</p>
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
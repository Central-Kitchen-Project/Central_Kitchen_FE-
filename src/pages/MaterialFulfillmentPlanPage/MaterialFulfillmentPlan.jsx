import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function MaterialFulfillmentPlan() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const batchId = params.get('id') || 'N/A'; // Lấy ID từ URL

  return (
    <>
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-200 px-8 py-4 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Material Fulfillment Plan</h2>
            <p className="text-slate-500 text-xs font-medium">
              Processing Urgent Request <span className="font-bold text-blue-600">#{batchId}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-amber-50 rounded-lg px-3 py-2 gap-2 text-sm border border-amber-200 text-amber-700">
              <span className="material-symbols-outlined text-sm">bolt</span>
              <span className="font-bold uppercase text-[11px] tracking-wide">Urgent Priority</span>
            </div>
            <button className="p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors">
              <span className="material-symbols-outlined text-[22px]">settings</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Overview Card */}
          <div className="mb-8 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50/50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-sm">analytics</span>
                Request Overview
              </h3>
              <span className="text-[10px] font-black text-white px-2.5 py-1 bg-amber-500 rounded-full shadow-sm">
                JUST NOW
              </span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col gap-1">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Batch ID</p>
                <p className="text-lg font-bold text-blue-600">#{batchId}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Requested Materials</p>
                <p className="text-lg font-bold text-slate-900">Potato Rolls & Beef</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Priority Level</p>
                <div className="flex items-center gap-2">
                  <span className="size-3 bg-red-500 rounded-full animate-pulse" />
                  <p className="text-lg font-bold text-red-600">Urgent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements Section */}
          <section className="mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 mb-4">
              <span className="material-symbols-outlined text-blue-600">checklist</span> 
              Material Requirements & Actions
            </h3>
            <div className="space-y-4">
              {/* Item 1: Potato Rolls */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-4">
                    <h4 className="font-bold text-slate-900">Potato Rolls</h4>
                    <div className="mt-2 flex items-center gap-4 text-xs font-medium text-slate-500">
                      <span><b className="text-slate-700">Req:</b> 100u</span>
                      <span><b className="text-slate-700">Stock:</b> 40</span>
                      <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-bold">Deficit: 60 units</span>
                    </div>
                  </div>
                  <div className="lg:col-span-5">
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                      <label className="flex-1 cursor-pointer">
                        <input defaultChecked className="sr-only peer" name="action-rolls" type="radio" />
                        <div className="text-center py-2 text-[10px] font-bold uppercase rounded-md peer-checked:bg-white peer-checked:text-blue-600 peer-checked:shadow-sm text-slate-500 transition-all">
                          Internal Production
                        </div>
                      </label>
                      <label className="flex-1 cursor-pointer">
                        <input className="sr-only peer" name="action-rolls" type="radio" />
                        <div className="text-center py-2 text-[10px] font-bold uppercase rounded-md peer-checked:bg-white peer-checked:text-blue-600 peer-checked:shadow-sm text-slate-500 transition-all">
                          External Sourcing
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="lg:col-span-3 text-right">
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-400">
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                      Ready
                    </div>
                  </div>
                </div>
              </div>

              {/* Item 2: Fresh Beef */}
              <div className="bg-white border-l-4 border-l-red-500 border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-4">
                    <h4 className="font-bold text-slate-900">Fresh Beef</h4>
                    <div className="mt-2 flex items-center gap-4 text-xs font-medium text-slate-500">
                      <span><b className="text-slate-700">Req:</b> 30kg</span>
                      <span><b className="text-slate-700">Stock:</b> 15kg</span>
                      <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-bold">Deficit: 15kg</span>
                    </div>
                  </div>
                  <div className="lg:col-span-5">
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                      <label className="flex-1 cursor-pointer">
                        <input className="sr-only peer" name="action-beef" type="radio" />
                        <div className="text-center py-2 text-[10px] font-bold uppercase rounded-md peer-checked:bg-white peer-checked:text-blue-600 peer-checked:shadow-sm text-slate-500 transition-all">
                          Internal Production
                        </div>
                      </label>
                      <label className="flex-1 cursor-pointer">
                        <input defaultChecked className="sr-only peer" name="action-beef" type="radio" />
                        <div className="text-center py-2 text-[10px] font-bold uppercase rounded-md peer-checked:bg-white peer-checked:text-blue-600 peer-checked:shadow-sm text-slate-500 transition-all">
                          External Sourcing
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="lg:col-span-3 text-right">
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                      <span className="material-symbols-outlined text-lg">local_shipping</span>
                      Quick Dispatch
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logistics & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Distribution Logistics</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400 text-sm">calendar_today</span>
                    <span className="text-sm text-slate-600">Expected Completion</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">Today, 14:30 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400 text-sm">local_shipping</span>
                    <span className="text-sm text-slate-600">Assigned Vehicle</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">TRUCK-08 (Chilled)</span>
                </div>
              </div>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-xl">
              <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Internal Notes</h4>
              <p className="text-xs text-blue-900 font-medium leading-relaxed">
                Urgent restock requested to avoid lunch service disruption. Beef sourcing switched to External due to primary line maintenance.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 px-8 py-5 flex items-center justify-between shadow-lg">
          <button 
            onClick={() => navigate('/OrderAggregation')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Dashboard
          </button>
          <div className="flex gap-3">
            <button className="px-6 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all">
              Discard Plan
            </button>
            <button className="px-8 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">rocket_launch</span>
              Confirm & Trigger
            </button>
          </div>
        </footer>
    </>
  );
}

export default MaterialFulfillmentPlan;
import React from 'react'
import { useOutletContext } from 'react-router-dom'
import './DashboardSupplier.css'   

function DashboardSupplier() {
  const { handleLogout } = useOutletContext()

  return (
    <>
    <div className="flex h-screen overflow-hidden">
  <main className="flex-1 flex flex-col overflow-hidden">
    <header className="flex items-center justify-between border-b border-slate-200 px-8 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Supply Coordinator Dashboard
        </h2>
        <p className="text-slate-500 text-xs font-medium">
          Overview of current operations and logistics flow
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-slate-50 rounded-lg px-3 py-2 gap-2 text-sm border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors text-slate-700">
          <span className="material-symbols-outlined text-sm text-slate-500">
            calendar_today
          </span>
          <span className="font-medium">Oct 24, 2023 - Oct 30, 2023</span>
        </div>
        <button className="relative p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-primary/5 hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[22px]">
            notifications
          </span>
          <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <button className="p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors">
          <span className="material-symbols-outlined text-[22px]">
            settings
          </span>
        </button>
      </div>
    </header>
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-soft">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider text-[11px]">
              Total Incoming Orders
            </p>
            <span className="p-1.5 rounded-md bg-blue-50 text-primary material-symbols-outlined text-sm">
              shopping_cart
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">1,240</p>
          <p className="text-green-600 text-xs font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">
              trending_up
            </span>{" "}
            +12% from yesterday
          </p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-soft">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider text-[11px]">
              Aggregated Demand
            </p>
            <span className="p-1.5 rounded-md bg-amber-50 text-amber-600 material-symbols-outlined text-sm">
              inventory_2
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">5,800 units</p>
          <p className="text-red-500 text-xs font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">
              trending_down
            </span>{" "}
            -3% from last week
          </p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-soft">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider text-[11px]">
              Deliveries In Progress
            </p>
            <span className="p-1.5 rounded-md bg-green-50 text-green-600 material-symbols-outlined text-sm">
              local_shipping
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">42</p>
          <p className="text-green-600 text-xs font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">
              trending_up
            </span>{" "}
            +5 vehicles active
          </p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-soft">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider text-[11px]">
              Active Issues
            </p>
            <span className="p-1.5 rounded-md bg-red-50 text-red-600 material-symbols-outlined text-sm">
              report
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">7</p>
          <p className="text-slate-500 text-xs font-bold">
            4 Critical priority
          </p>
        </div>
      </div>
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
            <span className="material-symbols-outlined text-primary">
              analytics
            </span>{" "}
            Order Aggregation
          </h3>
          <button className="text-xs font-bold text-primary hover:text-blue-700 uppercase tracking-tight flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">download</span>{" "}
            Export Report
          </button>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Total Quantity
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Stores
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Assigned Kitchen
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-sm text-slate-900">
                  Chicken Breast (Marinated)
                </td>
                <td className="px-6 py-4 text-sm font-medium">500kg</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-600">
                  12
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-700">
                    In Production
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                  Main Central Kitchen
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="bg-primary text-white text-xs px-4 py-2 rounded-lg font-bold shadow-md hover:bg-blue-600 hover:scale-[1.02] transition-all">
                    Adjust Quantity
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-sm text-slate-900">
                  Special Pizza Dough
                </td>
                <td className="px-6 py-4 text-sm font-medium">1,200kg</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-600">
                  45
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-700">
                    Pending Approval
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                  Southside Hub
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="bg-primary text-white text-xs px-4 py-2 rounded-lg font-bold shadow-md hover:bg-blue-600 hover:scale-[1.02] transition-all">
                    Adjust Quantity
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-sm text-slate-900">
                  Premium Olive Oil
                </td>
                <td className="px-6 py-4 text-sm font-medium">300L</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-600">
                  28
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-700">
                    Ready for Delivery
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                  Logistics Center A
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="bg-primary text-white text-xs px-4 py-2 rounded-lg font-bold shadow-md hover:bg-blue-600 hover:scale-[1.02] transition-all">
                    Adjust Quantity
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section className="mb-8">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-900">
          <span className="material-symbols-outlined text-primary">
            view_kanban
          </span>{" "}
          Production Flow
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                Pending Approval (3)
              </span>
              <span className="material-symbols-outlined text-slate-400 text-sm cursor-pointer hover:text-slate-600">
                more_horiz
              </span>
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-soft border-l-4 border-l-amber-500 hover:border-slate-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Frozen Veggie Mix
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold">
                    2h ago
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3 font-medium">
                  800kg for 15 locations
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex -space-x-2">
                    <div className="size-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold">
                      JD
                    </div>
                    <div className="size-6 rounded-full border-2 border-white bg-slate-300 flex items-center justify-center text-[8px] font-bold">
                      MS
                    </div>
                  </div>
                  <button className="text-primary text-xs font-black hover:underline">
                    Review
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                In Production (8)
              </span>
              <span className="material-symbols-outlined text-slate-400 text-sm cursor-pointer hover:text-slate-600">
                more_horiz
              </span>
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-soft border-l-4 border-l-primary hover:border-slate-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Tomato Base Sauce
                  </h4>
                  <span className="text-[10px] text-primary font-black uppercase">
                    45m left
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
                  <div
                    className="bg-primary h-1.5 rounded-full"
                    style={{ width: "65%" }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-bold">
                  Kitchen C | 4,000 Liters
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                Ready for Delivery (12)
              </span>
              <span className="material-symbols-outlined text-slate-400 text-sm cursor-pointer hover:text-slate-600">
                more_horiz
              </span>
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-soft border-l-4 border-l-green-500 hover:border-slate-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Bakery Bundle A
                  </h4>
                  <span className="material-symbols-outlined text-green-500 text-sm fill-1">
                    check_circle
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3 font-medium">
                  Load Stage: Dock 4
                </p>
                <button className="w-full py-2 bg-slate-50 border border-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all text-xs font-black rounded-lg uppercase tracking-tight">
                  Assign Vehicle
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
            <span className="material-symbols-outlined text-primary">
              schedule_send
            </span>{" "}
            Delivery Schedule
          </h3>
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-soft">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 font-black text-slate-500 uppercase text-[10px] tracking-widest">
                    ID
                  </th>
                  <th className="px-4 py-3 font-black text-slate-500 uppercase text-[10px] tracking-widest">
                    Store
                  </th>
                  <th className="px-4 py-3 font-black text-slate-500 uppercase text-[10px] tracking-widest">
                    Status
                  </th>
                  <th className="px-4 py-3 font-black text-slate-500 uppercase text-[10px] tracking-widest">
                    Vehicle
                  </th>
                  <th className="px-4 py-3 font-black text-slate-500 uppercase text-[10px] tracking-widest text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-bold text-slate-900">
                    #DEL-992
                  </td>
                  <td className="px-4 py-3 font-medium">Store #402</td>
                  <td className="px-4 py-3 text-green-600 font-bold flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-green-500" /> On
                    Time
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-600">
                    Van-14 (Truck)
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors">
                      visibility
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-bold text-slate-900">
                    #DEL-995
                  </td>
                  <td className="px-4 py-3 font-medium">Westside Mall</td>
                  <td className="px-4 py-3 text-red-600 font-bold flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-red-500" />{" "}
                    Delayed
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-600">
                    Van-02 (Cold)
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-[10px] font-black text-primary border-2 border-primary px-2 py-1 rounded hover:bg-primary hover:text-white transition-all uppercase tracking-tighter">
                      Reschedule
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-red-600">
            <span className="material-symbols-outlined">gpp_maybe</span> Issues
            &amp; Exceptions
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-red-200 shadow-soft relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
              <div className="bg-red-50 text-red-600 rounded-full p-2 flex items-center justify-center border border-red-100">
                <span className="material-symbols-outlined text-sm">
                  inventory_2
                </span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-0.5">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                    Stock Shortage
                  </h4>
                  <span className="text-[9px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                    CRITICAL
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Store #402: 20kg Flour Shortage for Morning Prep
                </p>
              </div>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[11px] font-black rounded-lg transition-all shadow-md active:scale-95 uppercase">
                Resolve
              </button>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-amber-200 shadow-soft relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
              <div className="bg-amber-50 text-amber-600 rounded-full p-2 flex items-center justify-center border border-amber-100">
                <span className="material-symbols-outlined text-sm">
                  warning
                </span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-0.5">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                    Late Production
                  </h4>
                  <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                    MEDIUM
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  South Kitchen: Bread oven maintenance delay (30 min)
                </p>
              </div>
              <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-black rounded-lg transition-all shadow-md active:scale-95 uppercase">
                Notify
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </main>
    </div>
    </>
  )
}

export default DashboardSupplier
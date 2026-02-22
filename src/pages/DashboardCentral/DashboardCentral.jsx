import React from 'react'
import { Link } from 'react-router-dom'
import './DashboardCentral.css'

function DashboardCentral() {
  return (
    <>
    <div className="flex h-screen overflow-hidden bg-slate-50">
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
        <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-blue-600 font-semibold" to="/DashboardCentral">
          <span className="material-symbols-outlined text-[22px]">dashboard</span>
          <span className="text-sm">Dashboard</span>
        </Link>
        <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors" to="/OrderAggregation">
          <span className="material-symbols-outlined text-[22px]">list_alt</span>
          <span className="text-sm font-medium">Order Aggregation</span>
        </Link>
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
            <img
              alt="User"
              className="w-full h-full object-cover"
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-900 text-xs font-bold">Alex Rivers</span>
            <span className="text-slate-500 text-[10px] font-medium">Central Kitchen Staff </span>
          </div>
        </div>
      </div>
    </div>
  </aside>
  <main className="flex-1 flex flex-col overflow-hidden bg-white">
    <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-slate-900">
          Production Overview
        </h2>
        <span className="h-4 w-px bg-slate-200" />
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <span className="material-symbols-outlined text-[18px]">
            schedule
          </span>
          <span>Morning Shift: 06:00 - 14:00</span>
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
        <button className="px-4 py-2 bg-navy-charcoal text-white rounded-lg text-sm font-bold hover:bg-black transition-colors">
          Logout
        </button>
      </div>
    </header>
    <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 bg-slate-50/50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-soft flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Incoming Orders
            </span>
            <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">
                local_shipping
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-navy-charcoal">24</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              +12%
            </span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-soft flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Production Queue
            </span>
            <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <span className="material-symbols-outlined text-[20px]">
                pending_actions
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-navy-charcoal">12</span>
            <span className="text-xs font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
              Stable
            </span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-soft flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Batches
            </span>
            <div className="size-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined text-[20px]">
                cyclone
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-navy-charcoal">08</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              -2%
            </span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-red-100 shadow-soft ring-1 ring-red-100 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
              Raw Material Alerts
            </span>
            <div className="size-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <span className="material-symbols-outlined text-[20px]">
                warning
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-navy-charcoal">05</span>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
              Critical
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 items-center p-4 bg-white rounded-xl border border-slate-200 shadow-soft">
        <h3 className="text-xs font-bold mr-4 text-slate-400 uppercase tracking-widest">
          Quick Actions
        </h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-sm">
          <span className="material-symbols-outlined text-[18px] fill-1">
            play_arrow
          </span>
          Start Production
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-navy-charcoal text-white rounded-lg text-sm font-bold hover:bg-black transition-all shadow-sm">
          <span className="material-symbols-outlined text-[18px]">
            task_alt
          </span>
          Complete Batch
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all">
          <span className="material-symbols-outlined text-[18px]">
            local_shipping
          </span>
          Mark Ready for Dispatch
        </button>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end px-1">
          <h3 className="text-xl font-bold text-navy-charcoal">
            Current Orders
          </h3>
          <button className="text-primary text-sm font-bold hover:underline">
            View All Orders
          </button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-soft overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Order ID
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Franchise Store
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Product
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                  Qty
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Required Date
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-600">
                  #ORD-9021
                </td>
                <td className="px-6 py-4 text-sm font-bold text-navy-charcoal">
                  Downtown Cafe
                </td>
                <td className="px-6 py-4 text-sm">Brioche Burger Buns</td>
                <td className="px-6 py-4 text-sm text-center">500 units</td>
                <td className="px-6 py-4 text-sm">Oct 24, 2023</td>
                <td className="px-6 py-4 text-right">
                  <span className="px-3 py-1 bg-blue-50 text-primary border border-blue-100 rounded-full text-[11px] font-black uppercase tracking-tight">
                    New
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-600">
                  #ORD-8945
                </td>
                <td className="px-6 py-4 text-sm font-bold text-navy-charcoal">
                  Airport Terminal 3
                </td>
                <td className="px-6 py-4 text-sm">Marinated Beef Patties</td>
                <td className="px-6 py-4 text-sm text-center">200 kg</td>
                <td className="px-6 py-4 text-sm">Oct 24, 2023</td>
                <td className="px-6 py-4 text-right">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-[11px] font-black uppercase tracking-tight">
                    Scheduled
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-600">
                  #ORD-8832
                </td>
                <td className="px-6 py-4 text-sm font-bold text-navy-charcoal">
                  Eastside Mall
                </td>
                <td className="px-6 py-4 text-sm">Secret Burger Sauce</td>
                <td className="px-6 py-4 text-sm text-center">50 L</td>
                <td className="px-6 py-4 text-sm">Oct 23, 2023</td>
                <td className="px-6 py-4 text-right">
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[11px] font-black uppercase tracking-tight">
                    In Production
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-600">
                  #ORD-8711
                </td>
                <td className="px-6 py-4 text-sm font-bold text-navy-charcoal">
                  West End Hub
                </td>
                <td className="px-6 py-4 text-sm">Vintage Cheddar Slices</td>
                <td className="px-6 py-4 text-sm text-center">100 kg</td>
                <td className="px-6 py-4 text-sm">Oct 23, 2023</td>
                <td className="px-6 py-4 text-right">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[11px] font-black uppercase tracking-tight">
                    Ready
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-navy-charcoal">
            Active Production Plan
          </h3>
          <div className="bg-white rounded-xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between p-4 rounded-lg bg-white border border-slate-100 shadow-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-navy-charcoal">
                    Truffle Mayo Batch
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    ID: BTH-2291 | Target: 40L
                  </span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded uppercase">
                    Mixing Stage
                  </span>
                  <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-1/2 h-full bg-amber-500" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-white border border-slate-100 shadow-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-navy-charcoal">
                    Potato Buns - Line A
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    ID: BTH-2292 | Target: 2000u
                  </span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-primary border border-blue-100 rounded uppercase">
                    Proofing
                  </span>
                  <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-navy-charcoal">
            Material Expiry Monitor
          </h3>
          <div className="bg-white rounded-xl border border-slate-200 shadow-soft overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <th className="px-5 py-3.5">Material</th>
                  <th className="px-5 py-3.5">Qty</th>
                  <th className="px-5 py-3.5">Expiry</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50 text-slate-700">
                <tr className="hover:bg-slate-50/50">
                  <td className="px-5 py-3.5 font-bold text-navy-charcoal">
                    Fresh Whipping Cream
                  </td>
                  <td className="px-5 py-3.5">24 L</td>
                  <td className="px-5 py-3.5 font-medium">In 2 Days</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-amber-600 font-black text-[10px] bg-amber-50 px-2 py-1 rounded uppercase tracking-wider">
                      Expiring Soon
                    </span>
                  </td>
                </tr>
                <tr className="bg-red-50/30">
                  <td className="px-5 py-3.5 font-bold text-red-900">
                    Pasteurized Egg Yolks
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-red-800">
                    12 kg
                  </td>
                  <td className="px-5 py-3.5 text-red-600 font-bold">
                    Expired Today
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="bg-red-600 text-white font-black px-2 py-0.5 rounded text-[10px] uppercase">
                      Critical
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-5 py-3.5 font-bold text-navy-charcoal">
                    Wagyu Beef Flank
                  </td>
                  <td className="px-5 py-3.5">85 kg</td>
                  <td className="px-5 py-3.5">Oct 28, 2023</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-slate-400 font-bold text-[10px] uppercase">
                      Normal
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>

    </>
  )
}

export default DashboardCentral
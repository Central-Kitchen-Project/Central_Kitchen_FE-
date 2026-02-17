import React from 'react'
import "./OrderAggregation.css"
function OrderAggregation() {
  return (
    <><div className="flex h-screen overflow-hidden">
  <aside className="w-64 flex flex-col bg-white border-r border-slate-200 shrink-0 shadow-sm">
    <div className="p-6 flex flex-col gap-8 h-full">
      <div className="flex items-center gap-3">
        <div className="bg-primary size-10 rounded-lg flex items-center justify-center text-white shadow-md">
          <span className="material-symbols-outlined text-2xl">
            soup_kitchen
          </span>
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
        <a
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined text-[22px]">
            dashboard
          </span>
          <span className="text-sm font-medium">Dashboard</span>
        </a>
        <a
          className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-blue-50 text-primary font-semibold relative"
          href="#"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[22px] fill-1">
              list_alt
            </span>
            <span className="text-sm">Order Aggregation</span>
          </div>
          <span className="size-2 bg-red-500 rounded-full ring-2 ring-white" />
        </a>
        <a
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined text-[22px]">
            precision_manufacturing
          </span>
          <span className="text-sm font-medium">Production Coordination</span>
        </a>
        <a
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined text-[22px]">
            local_shipping
          </span>
          <span className="text-sm font-medium">Delivery Scheduling</span>
        </a>
        <a
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined text-[22px]">warning</span>
          <span className="text-sm font-medium">Issue Management</span>
        </a>
      </nav>
      <div className="mt-auto border-t border-slate-100 pt-6">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="size-9 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <img
              alt="Supply coordinator user avatar profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCN78q_19ju6iSyTP2BEaiD6l6g9DTxRn_72mRF9K40tAukN9AgdIEiJJSYU_vmhounY6mE_88d215WTjGYOPB0W3pB-FyBuE5N21NdB-wIn70MiT7Y3RZaJfmktOTgiRuSGviWCLkli7olKnHCmsqn430h3fnaAvtF1rcIO0vgUKZdkw1TjHvAAAeIDkjCMgLhlD3WsTqK_zRjszxxuaNkhaUNzg7wF6nihlfVh1XBi12C-vVC2XGI3TiIpAavL1_fN2W0c5rhdAk"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-900 text-xs font-bold">
              Alex Rivers
            </span>
            <span className="text-slate-500 text-[10px] font-medium">
              Supply Coordinator
            </span>
          </div>
        </div>
      </div>
    </div>
  </aside>
  <main className="flex-1 flex flex-col overflow-hidden">
    <header className="flex items-center justify-between border-b border-slate-200 px-8 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Order Aggregation
        </h2>
        <p className="text-slate-500 text-xs font-medium">
          Consolidate franchise orders into production batches
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-slate-50 rounded-lg px-3 py-2 gap-2 text-sm border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors text-slate-700">
          <span className="material-symbols-outlined text-sm text-slate-500">
            schedule
          </span>
          <span className="font-medium">Shift: Morning (06:00 - 14:00)</span>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="flex items-center gap-4 rounded-xl p-6 bg-white border border-slate-200 shadow-soft">
          <div className="bg-blue-50 text-primary p-3 rounded-lg">
            <span className="material-symbols-outlined">inventory_2</span>
          </div>
          <div>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              Total SKUs Pending
            </p>
            <p className="text-2xl font-bold text-slate-900">84</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl p-6 bg-white border border-slate-200 shadow-soft">
          <div className="bg-amber-50 text-amber-600 p-3 rounded-lg">
            <span className="material-symbols-outlined">timer</span>
          </div>
          <div>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              Next Consolidation Deadline
            </p>
            <p className="text-2xl font-bold text-slate-900">45m 12s</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl p-6 bg-white border border-slate-200 shadow-soft">
          <div className="bg-green-50 text-green-600 p-3 rounded-lg">
            <span className="material-symbols-outlined">storefront</span>
          </div>
          <div>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              Ordering Stores
            </p>
            <p className="text-2xl font-bold text-slate-900">52</p>
          </div>
        </div>
      </div>
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
            <span className="material-symbols-outlined text-primary">
              groups
            </span>{" "}
            Pending Aggregation
          </h3>
          <div className="flex gap-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all w-64"
                placeholder="Search products..."
                type="text"
              />
            </div>
            <button className="bg-primary text-white text-sm px-4 py-2 rounded-lg font-bold shadow-md hover:bg-blue-600 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">
                auto_awesome
              </span>{" "}
              Consolidate All
            </button>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Total Requested
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Aggregate Units
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Number of Stores
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-slate-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-400 text-lg">
                        restaurant
                      </span>
                    </div>
                    <span className="font-bold text-sm text-slate-900">
                      Marinated Chicken Thighs
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-700">
                  845.50 kg
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    17 Bins (50kg)
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-primary">
                  28 Stores
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="bg-white text-primary border border-primary/20 text-xs px-4 py-2 rounded-lg font-bold hover:bg-primary hover:text-white transition-all">
                    Consolidate
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-slate-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-400 text-lg">
                        bakery_dining
                      </span>
                    </div>
                    <span className="font-bold text-sm text-slate-900">
                      Sourdough Starter Dough
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-700">
                  1,200.00 kg
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    24 Large Containers
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-primary">
                  45 Stores
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="bg-white text-primary border border-primary/20 text-xs px-4 py-2 rounded-lg font-bold hover:bg-primary hover:text-white transition-all">
                    Consolidate
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
            <span className="material-symbols-outlined text-primary">
              history
            </span>{" "}
            Recently Consolidated
          </h3>
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-soft">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 font-black text-slate-500 uppercase text-[10px] tracking-widest">
                    Batch ID
                  </th>
                  <th className="px-4 py-3 font-black text-slate-500 uppercase text-[10px] tracking-widest">
                    Product
                  </th>
                  <th className="px-4 py-3 font-black text-slate-500 uppercase text-[10px] tracking-widest">
                    Total
                  </th>
                  <th className="px-4 py-3 font-black text-slate-500 uppercase text-[10px] tracking-widest">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-amber-50/40 hover:bg-amber-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900">
                    #BAT-1025
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-600">
                    Potato Rolls &amp; Beef
                  </td>
                  <td className="px-4 py-3 font-bold">130 units</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500 text-slate-900 border-2 urgent-border shadow-sm inline-block">
                      Requested from Kitchen
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-bold text-slate-900">
                    #BAT-1024
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-600">
                    Alfredo Sauce
                  </td>
                  <td className="px-4 py-3 font-bold">400 L</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-700">
                      Sent to Kitchen
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-bold text-slate-900">
                    #BAT-1023
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-600">
                    Pizza Dough balls
                  </td>
                  <td className="px-4 py-3 font-bold">2,500 units</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-700">
                      Sent to Kitchen
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-red-600">
            <span className="material-symbols-outlined">
              notification_important
            </span>{" "}
            Critical Reminders
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-100 border-2 border-amber-400 shadow-glow-amber relative overflow-hidden animate-pulse-slow">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-600" />
              <div className="bg-white text-amber-600 rounded-full p-2 flex items-center justify-center border border-amber-200">
                <span className="material-symbols-outlined text-sm">
                  shopping_cart_checkout
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                  New Incoming Request
                </h4>
                <p className="text-xs text-slate-800 font-semibold">
                  Batch #BAT-1025 requires immediate supply coordination.
                </p>
              </div>
              <span className="text-[10px] font-black text-white px-2 py-1 bg-red-600 rounded shadow-sm">
                Just now
              </span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-red-200 shadow-soft relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
              <div className="bg-red-50 text-red-600 rounded-full p-2 flex items-center justify-center border border-red-100">
                <span className="material-symbols-outlined text-sm">
                  priority_high
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                  Cut-off Approaching
                </h4>
                <p className="text-xs text-slate-600 font-medium">
                  Bakery items aggregation window closes in 15 minutes.
                </p>
              </div>
              <button className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-black rounded uppercase shadow hover:bg-red-700 transition-colors">
                Alert All
              </button>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-soft relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300" />
              <div className="bg-slate-50 text-slate-400 rounded-full p-2 flex items-center justify-center border border-slate-100">
                <span className="material-symbols-outlined text-sm">info</span>
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                  Inventory Note
                </h4>
                <p className="text-xs text-slate-600 font-medium">
                  Spices stock level check recommended before consolidation.
                </p>
              </div>
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

export default OrderAggregation
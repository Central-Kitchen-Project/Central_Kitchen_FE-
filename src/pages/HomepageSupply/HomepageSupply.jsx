import React from 'react'
import './HomepageSupply.css'
function HomepageSupply() {
  return (
    <>
    <>
  <style
    type="text/tailwindcss"
    dangerouslySetInnerHTML={{
      __html:
        "\n        body { font-family: 'Inter', sans-serif; }\n        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }\n        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }\n        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }\n        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }\n        .active-nav-item { @apply bg-blue-50 text-primary font-semibold; }\n        .active-nav-item .material-symbols-outlined { font-variation-settings: 'FILL' 1; }\n    "
    }}
  />
  <div className="flex h-screen overflow-hidden">
    <aside className="w-64 flex flex-col bg-white border-r border-slate-200 shrink-0">
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-10">
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
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg active-nav-item"
            href="#"
          >
            <span className="material-symbols-outlined text-[22px]">home</span>
            <span className="text-sm">Home</span>
          </a>
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
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined text-[22px]">
              list_alt
            </span>
            <span className="text-sm font-medium">Order Aggregation</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined text-[22px]">
              factory
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
            <span className="material-symbols-outlined text-[22px]">
              report_problem
            </span>
            <span className="text-sm font-medium">Issue Management</span>
          </a>
        </nav>
        <div className="mt-auto border-t border-slate-100 pt-6">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="size-9 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
              <img
                alt="Supply coordinator user avatar"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXMdzcPLmUaCOomOYln5geVOGrqnDbjLnI68iBJ3t-xm81TyhAmnp7JFFskkBl2nOJ7Hn4HJJvtRCVUpt1EXnQ2AuVNWt434Yz_7zPF8Dg4O7019AFTVMWCs4lhDkKAeJG6ODpekRn8DlhVBOBVTO7LTScZHAuoV8dAuLel6LUJNjqHW66EvrUybQXfIfdUw5n_zWoPaoe2igYDJ7adU2zuyJj3DaFIYiNuhg_E6z2KTkCT2Al8Ax1_ptnw57A1C1BUGJkgJLC9Tw"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-900 text-xs font-bold">
                Alex Rivers
              </span>
              <span className="text-slate-500 text-[10px] font-medium uppercase tracking-tight">
                Supply Coordinator
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
    <main className="flex-1 flex flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-slate-200 px-8 py-5 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div>
          <p className="text-primary text-sm font-bold mb-0.5">
            Welcome Back, Alex Rivers
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Supply Coordination Home
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-slate-50 rounded-lg px-3 py-2 gap-2 text-sm border border-slate-200 text-slate-700">
            <span className="material-symbols-outlined text-sm text-slate-500">
              calendar_today
            </span>
            <span className="font-medium">Monday, Oct 24, 2023</span>
          </div>
          <button className="relative p-2.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-primary/5 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[24px]">
              notifications
            </span>
            <span className="absolute top-2 right-2 size-2.5 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <button className="p-2.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-[24px]">
              settings
            </span>
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <section className="mb-10">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-blue-700 p-8 text-white shadow-xl shadow-blue-500/10">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Daily Briefing</h3>
              <p className="text-blue-50 text-lg mb-6 max-w-2xl">
                Today's logistics are running smoothly. You have{" "}
                <span className="font-bold underline">
                  12 pending approvals
                </span>{" "}
                and{" "}
                <span className="font-bold underline">3 critical issues</span>{" "}
                requiring your immediate attention.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-200">
                    local_shipping
                  </span>
                  <span className="text-sm font-medium">
                    42 Deliveries Active
                  </span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-200">
                    check_circle
                  </span>
                  <span className="text-sm font-medium">
                    85% Orders Processed
                  </span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-200">
                    schedule
                  </span>
                  <span className="text-sm font-medium">
                    Next Pickup: 11:30 AM
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-[240px] rotate-12 -mr-20">
                transportation
              </span>
            </div>
          </div>
        </section>
        <section className="mb-10">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 px-1">
            Quick Access
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button className="group flex items-center gap-6 p-6 bg-white border border-slate-200 rounded-2xl shadow-soft hover:shadow-lg hover:border-primary transition-all text-left">
              <div className="bg-blue-50 text-primary size-16 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-3xl">
                  analytics
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-slate-900">
                  Access Operational Dashboard
                </h4>
                <p className="text-slate-500 text-sm">
                  Deep dive into order aggregation, production flow and live
                  logistics tracking.
                </p>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">
                arrow_forward_ios
              </span>
            </button>
            <button className="group flex items-center gap-6 p-6 bg-white border border-slate-200 rounded-2xl shadow-soft hover:shadow-lg hover:border-red-500 transition-all text-left">
              <div className="bg-red-50 text-red-600 size-16 rounded-xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-3xl">
                  report_problem
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-slate-900">
                  View Active Issues
                </h4>
                <p className="text-slate-500 text-sm">
                  Review 7 identified bottlenecks, shortages, or delayed
                  deliveries across the network.
                </p>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:text-red-500 transition-colors">
                arrow_forward_ios
              </span>
            </button>
          </div>
        </section>
        <section className="max-w-4xl">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
              Urgent Notifications
            </h3>
            <button className="text-xs font-bold text-primary hover:underline uppercase tracking-tight">
              Clear All
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-soft border-l-4 border-l-red-500">
              <div className="bg-red-50 text-red-600 size-10 rounded-full flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">
                  inventory_2
                </span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h5 className="text-sm font-bold text-slate-900">
                    Stock Shortage: All-Purpose Flour
                  </h5>
                  <span className="text-[10px] font-bold text-slate-400">
                    12 min ago
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Store #402 reported a 20kg shortage. Morning prep may be
                  affected.
                </p>
              </div>
              <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors">
                Resolve
              </button>
            </div>
            <div className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-soft border-l-4 border-l-amber-500">
              <div className="bg-amber-50 text-amber-600 size-10 rounded-full flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">
                  schedule
                </span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h5 className="text-sm font-bold text-slate-900">
                    Production Delay: Southside Hub
                  </h5>
                  <span className="text-[10px] font-bold text-slate-400">
                    45 min ago
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Oven maintenance at Southside Hub is delayed by 30 minutes.
                  Impact on Westside orders.
                </p>
              </div>
              <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors">
                Acknowledge
              </button>
            </div>
            <div className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-soft border-l-4 border-l-primary">
              <div className="bg-blue-50 text-primary size-10 rounded-full flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">
                  local_shipping
                </span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h5 className="text-sm font-bold text-slate-900">
                    Delivery Update: Route #995
                  </h5>
                  <span className="text-[10px] font-bold text-slate-400">
                    1h ago
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Van-02 successfully rerouted to avoid heavy traffic on Highway
                  12. Estimated delay reduced.
                </p>
              </div>
              <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors">
                View Map
              </button>
            </div>
          </div>
          <div className="mt-6 text-center">
            <button className="text-sm font-semibold text-slate-400 hover:text-primary transition-colors flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-slate-200 rounded-xl hover:border-primary/50">
              <span className="material-symbols-outlined text-sm">
                expand_more
              </span>
              Show older notifications
            </button>
          </div>
        </section>
      </div>
    </main>
  </div>
</>

    </>
  )
}

export default HomepageSupply
import React from 'react'
import './HomepageCentral.css'

function HomepageCentral() {
  return (
    <>
    <div className="flex h-screen overflow-hidden">
  <aside className="w-64 bg-sidebar-bg border-r border-slate-200 flex flex-col shrink-0">
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white">
          <span className="material-symbols-outlined">skillet</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-navy-charcoal text-base font-bold leading-none">
            Central Kitchen
          </h1>
          <p className="text-slate-500 text-xs mt-1">Production Unit v2.1</p>
        </div>
      </div>
      <nav className="mt-8 flex flex-col gap-1 -mx-6">
        <a className="nav-item active-nav-item" href="#">
          <span className="material-symbols-outlined text-[20px] fill-1">
            home
          </span>
          <span className="text-sm font-semibold">Home</span>
        </a>
        <a className="nav-item" href="#">
          <span className="material-symbols-outlined text-[20px]">
            dashboard
          </span>
          <span className="text-sm font-medium">Dashboard</span>
        </a>
        <a className="nav-item" href="#">
          <span className="material-symbols-outlined text-[20px]">
            receipt_long
          </span>
          <span className="text-sm font-medium">Order Processing</span>
        </a>
        <a className="nav-item" href="#">
          <span className="material-symbols-outlined text-[20px]">
            precision_manufacturing
          </span>
          <span className="text-sm font-medium">Production Planning</span>
        </a>
        <a className="nav-item" href="#">
          <span className="material-symbols-outlined text-[20px]">
            inventory_2
          </span>
          <span className="text-sm font-medium">Raw Materials</span>
        </a>
        <a className="nav-item" href="#">
          <span className="material-symbols-outlined text-[20px]">
            history_toggle_off
          </span>
          <span className="text-sm font-medium">Batch &amp; Expiry</span>
        </a>
        <a className="nav-item" href="#">
          <span className="material-symbols-outlined text-[20px]">
            warehouse
          </span>
          <span className="text-sm font-medium">Warehouse</span>
        </a>
      </nav>
    </div>
    <div className="mt-auto p-4 border-t border-slate-100">
      <div className="flex items-center gap-3 p-2">
        <div className="size-8 rounded-full bg-slate-200 overflow-hidden">
          <img
            alt="User"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdbEzt9uKoM-EeGxRxuXSUUjbWCS64Swo30wpiNAUkquHp8OFoM3JCza1iH47TE21vk4Mk01g9T9BRCzxR6kxBKkuyERaALxHsRvxvxPWOUcDfVm51XV0_p56QIb1pWU2InpmuQt3TGMxGZHcmLCS1UNJN_H0hqGOIeABhALoK2sgXp7IFYge6NLwKoWuApnjiiIb1NX9SnCgdxZ82QexRt-tWrXV3D35jvTAD9l8cg47vqnS10-xgRzLlIMNMkrs6QAjSP85cgkw"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-navy-charcoal">
            Chef Marco
          </span>
          <span className="text-xs text-slate-500">Head of Production</span>
        </div>
      </div>
    </div>
  </aside>
  <main className="flex-1 flex flex-col overflow-hidden bg-white">
    <header className="h-20 flex items-center justify-between px-10 border-b border-slate-100 bg-white shrink-0">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-slate-900">
          Good Morning, Chef Marco
        </h2>
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <span className="material-symbols-outlined text-[16px]">
            calendar_today
          </span>
          <span>October 24, 2023</span>
          <span className="mx-1 text-slate-300">•</span>
          <span className="material-symbols-outlined text-[16px]">
            schedule
          </span>
          <span>Morning Shift: 06:00 - 14:00</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <button className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 relative text-slate-600 transition-all">
            <span className="material-symbols-outlined text-[22px]">
              notifications
            </span>
            <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <button className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all">
            <span className="material-symbols-outlined text-[22px]">
              settings
            </span>
          </button>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Logout
        </button>
      </div>
    </header>
    <div className="flex-1 overflow-y-auto p-10 flex flex-col gap-10 bg-slate-50/30">
      <section className="relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-8 shadow-soft">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <span className="material-symbols-outlined text-[180px]">
            restaurant
          </span>
        </div>
        <div className="relative z-10 flex flex-col gap-4 max-w-2xl">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-primary text-xs font-bold uppercase tracking-wider">
            Kitchen Status: Active
          </span>
          <h3 className="text-3xl font-bold text-navy-charcoal">
            Welcome back to the production floor.
          </h3>
          <p className="text-lg text-slate-600 leading-relaxed">
            The morning prep is underway. You have{" "}
            <span className="text-red-600 font-bold">3 critical alerts</span> to
            review before starting today's main production cycle.
          </p>
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Immediate Attention Required
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-5 p-6 bg-white border-l-4 border-red-500 rounded-xl shadow-soft border-y border-r border-slate-200">
            <div className="size-14 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
              <span className="material-symbols-outlined text-[28px]">
                warning
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-navy-charcoal">
                5 Raw Materials Expired Today
              </span>
              <p className="text-slate-500 text-sm">
                Action required: Dispose and update inventory records
                immediately.
              </p>
            </div>
            <button className="ml-auto p-2 text-slate-400 hover:text-navy-charcoal">
              <span className="material-symbols-outlined">
                arrow_forward_ios
              </span>
            </button>
          </div>
          <div className="flex items-center gap-5 p-6 bg-white border-l-4 border-amber-500 rounded-xl shadow-soft border-y border-r border-slate-200">
            <div className="size-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <span className="material-symbols-outlined text-[28px]">
                priority_high
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-navy-charcoal">
                2 Urgent Orders Received
              </span>
              <p className="text-slate-500 text-sm">
                Downtown Cafe and Airport T3 requested early delivery.
              </p>
            </div>
            <button className="ml-auto p-2 text-slate-400 hover:text-navy-charcoal">
              <span className="material-symbols-outlined">
                arrow_forward_ios
              </span>
            </button>
          </div>
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          Next Steps
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <a
            className="group flex flex-col gap-6 p-8 bg-white border border-slate-200 rounded-2xl shadow-soft hover:border-primary/30 transition-all hover:shadow-lg"
            href="#"
          >
            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[32px] fill-1">
                monitoring
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <h5 className="text-2xl font-bold text-navy-charcoal">
                Go to Production Dashboard
              </h5>
              <p className="text-slate-500 leading-relaxed">
                Monitor real-time batch progress, equipment efficiency, and team
                performance metrics.
              </p>
            </div>
            <div className="flex items-center gap-2 text-primary font-bold">
              <span>Open Dashboard</span>
              <span className="material-symbols-outlined text-[18px]">
                trending_flat
              </span>
            </div>
          </a>
          <a
            className="group flex flex-col gap-6 p-8 bg-white border border-slate-200 rounded-2xl shadow-soft hover:border-primary/30 transition-all hover:shadow-lg"
            href="#"
          >
            <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center text-navy-charcoal group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[32px]">
                list_alt
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <h5 className="text-2xl font-bold text-navy-charcoal">
                View Order Queue
              </h5>
              <p className="text-slate-500 leading-relaxed">
                Review all incoming and scheduled orders from franchise stores
                for the next 48 hours.
              </p>
            </div>
            <div className="flex items-center gap-2 text-primary font-bold">
              <span>Manage Orders</span>
              <span className="material-symbols-outlined text-[18px]">
                trending_flat
              </span>
            </div>
          </a>
        </div>
      </section>
    </div>
  </main>
</div>

    </>
  )
}

export default HomepageCentral
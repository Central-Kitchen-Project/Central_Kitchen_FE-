import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './HomepageCentral.css'

function HomepageCentral() {
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState({ username: 'User' })

  const handleLogout = () => {
    localStorage.removeItem('ACCESS_TOKEN')
    localStorage.removeItem('USER_INFO')
    navigate('/SignIn')
  }

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('USER_INFO'))
      if (stored) setUserInfo(stored)
    } catch (e) {}
  }, [])

  return (
    <>
    <div className="flex h-screen overflow-hidden">
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
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-slate-900 text-xs font-bold truncate">{userInfo.username}</span>
            <span className="text-slate-500 text-[10px] font-medium">Supply Coordinator</span>
          </div>
          <span onClick={handleLogout} className="material-symbols-outlined text-slate-400 text-sm cursor-pointer hover:text-red-500 transition-colors" title="Logout">logout</span>
        </div>
      </div>
    </div>
  </aside>
  <main className="flex-1 flex flex-col overflow-hidden bg-white">
    <header className="h-20 flex items-center justify-between px-10 border-b border-slate-100 bg-white shrink-0">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-slate-900">
          Good Morning, {userInfo.username}
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
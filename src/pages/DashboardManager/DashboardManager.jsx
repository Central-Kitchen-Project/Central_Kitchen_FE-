import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './DashboardManager.css'

function DashboardManager() {
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState({ username: 'Manager', roleId: 2 })

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('USER_INFO'))
      if (stored) setUserInfo(stored)
    } catch (e) {}
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('ACCESS_TOKEN')
    localStorage.removeItem('USER_INFO')
    navigate('/SignIn')
  }

  return (
    <>
    <div className="flex h-screen overflow-hidden bg-slate-50">
  {/* Sidebar */}
  <aside className="w-64 flex flex-col bg-white border-r border-slate-200 shrink-0 shadow-sm">
    <div className="p-6 flex flex-col gap-8 h-full">
      <div className="flex items-center gap-3">
        <div className="bg-primary size-10 rounded-lg flex items-center justify-center text-white shadow-md">
          <span className="material-symbols-outlined text-2xl">manage_accounts</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-slate-900 text-sm font-bold leading-tight uppercase tracking-wider">
            Manager Dashboard
          </h1>
          <p className="text-slate-500 text-[10px] font-medium uppercase tracking-tighter">
            Management System
          </p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 grow">
        <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-primary font-semibold" to="/DashboardManager">
          <span className="material-symbols-outlined text-[22px]">dashboard</span>
          <span className="text-sm">Dashboard</span>
        </Link>
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors" href="#">
          <span className="material-symbols-outlined text-[22px]">inventory_2</span>
          <span className="text-sm font-medium">Inventory Management</span>
        </a>
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors" href="#">
          <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
          <span className="text-sm font-medium">Purchase Orders</span>
        </a>
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors" href="#">
          <span className="material-symbols-outlined text-[22px]">restaurant_menu</span>
          <span className="text-sm font-medium">Menu Management</span>
        </a>
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors" href="#">
          <span className="material-symbols-outlined text-[22px]">bar_chart</span>
          <span className="text-sm font-medium">Reports &amp; Analytics</span>
        </a>
      </nav>
      <div className="mt-auto border-t border-slate-100 pt-6">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="size-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
            {userInfo.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-slate-900 text-xs font-bold truncate">{userInfo.username}</span>
            <span className="text-slate-500 text-[10px] font-medium">Manager</span>
          </div>
          <span onClick={handleLogout} className="material-symbols-outlined text-slate-400 text-sm cursor-pointer hover:text-red-500 transition-colors" title="Logout">logout</span>
        </div>
      </div>
    </div>
  </aside>
  {/* Main Content */}
  <main className="flex-1 flex flex-col overflow-hidden">
    <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white shrink-0">
      <h2 className="text-lg font-bold text-slate-900">Dashboard Overview</h2>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 relative text-slate-600">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <button className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600">
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>
      </div>
    </header>
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-slate-50/50">
    {/* Stats Row */}
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Inventory</span>
          <div className="size-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
            <i className="fas fa-boxes text-sm" />
          </div>
        </div>
        <span className="text-2xl font-bold text-slate-900">2,450</span>
        <span className="text-[11px] text-slate-500">Total units</span>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Orders</span>
          <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
            <i className="fas fa-shopping-cart text-sm" />
          </div>
        </div>
        <span className="text-2xl font-bold text-slate-900">12</span>
        <span className="text-[11px] text-slate-500">Awaiting approval</span>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Items</span>
          <div className="size-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
            <i className="fas fa-exclamation-circle text-sm" />
          </div>
        </div>
        <span className="text-2xl font-bold text-slate-900">8</span>
        <span className="text-[11px] text-slate-500">Need restock</span>
      </div>
    </div>

    {/* Content Grid */}
    <div className="grid grid-cols-2 gap-4">
      {/* Chart */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200">
          <span className="text-sm font-semibold text-slate-900">Production Output (Weekly)</span>
          <span className="text-slate-400 cursor-pointer">⋯</span>
        </div>
        <div className="chart-container">
          <div className="chart-bar">
            <div className="bar" style={{ height: "65%" }} />
            <div className="bar-label">Mon</div>
          </div>
          <div className="chart-bar">
            <div className="bar" style={{ height: "85%" }} />
            <div className="bar-label">Tue</div>
          </div>
          <div className="chart-bar">
            <div className="bar" style={{ height: "72%" }} />
            <div className="bar-label">Wed</div>
          </div>
          <div className="chart-bar">
            <div className="bar" style={{ height: "90%" }} />
            <div className="bar-label">Thu</div>
          </div>
          <div className="chart-bar">
            <div className="bar" style={{ height: "78%" }} />
            <div className="bar-label">Fri</div>
          </div>
          <div className="chart-bar">
            <div className="bar" style={{ height: "60%" }} />
            <div className="bar-label">Sat</div>
          </div>
          <div className="chart-bar">
            <div className="bar" style={{ height: "40%" }} />
            <div className="bar-label">Sun</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200">
          <span className="text-sm font-semibold text-slate-900">Key Metrics</span>
          <span className="text-slate-400 cursor-pointer">⋯</span>
        </div>
        <div className="p-4 flex flex-col">
          <div className="flex justify-between items-center py-3 border-b border-slate-100">
            <span className="text-xs text-slate-600 font-medium">Production Efficiency</span>
            <span className="text-sm font-bold text-slate-900">94.2%</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-slate-100">
            <span className="text-xs text-slate-600 font-medium">Waste Rate</span>
            <span className="text-sm font-bold text-slate-900">3.1%</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-slate-100">
            <span className="text-xs text-slate-600 font-medium">On-Time Delivery</span>
            <span className="text-sm font-bold text-slate-900">98.5%</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-xs text-slate-600 font-medium">Inventory Turnover</span>
            <span className="text-sm font-bold text-slate-900">12.3x</span>
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

export default DashboardManager
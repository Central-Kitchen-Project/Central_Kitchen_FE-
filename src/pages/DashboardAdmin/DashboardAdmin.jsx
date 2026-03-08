import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './DashboardAdmin.css'

function DashboardAdmin() {
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState({ username: 'Admin User', roleId: 1 })

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
          <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-slate-900 text-sm font-bold leading-tight uppercase tracking-wider">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 text-[10px] font-medium uppercase tracking-tighter">
            Management System
          </p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 grow">
        <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-primary font-semibold" to="/DashboardAdmin">
          <span className="material-symbols-outlined text-[22px]">dashboard</span>
          <span className="text-sm">Dashboard</span>
        </Link>
        <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors" to="/UserManagement">
          <span className="material-symbols-outlined text-[22px]">group</span>
          <span className="text-sm font-medium">User Management</span>
        </Link>
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors" href="#">
          <span className="material-symbols-outlined text-[22px]">lock</span>
          <span className="text-sm font-medium">RBAC Settings</span>
        </a>
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors" href="#">
          <span className="material-symbols-outlined text-[22px]">tune</span>
          <span className="text-sm font-medium">System Configuration</span>
        </a>
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors" href="#">
          <span className="material-symbols-outlined text-[22px]">database</span>
          <span className="text-sm font-medium">Master Data</span>
        </a>
      </nav>
      <div className="mt-auto border-t border-slate-100 pt-6">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="size-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold border border-slate-200">
            {userInfo.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-slate-900 text-xs font-bold truncate">{userInfo.username}</span>
            <span className="text-slate-500 text-[10px] font-medium">Administrator</span>
          </div>
          <span onClick={handleLogout} className="material-symbols-outlined text-slate-400 text-sm cursor-pointer hover:text-red-500 transition-colors" title="Logout">logout</span>
        </div>
      </div>
    </div>
  </aside>
  {/* Main Content */}
  <main className="flex-1 flex flex-col overflow-hidden">
    <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white shrink-0">
      <h2 className="text-lg font-bold text-slate-900">Admin Dashboard</h2>
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
    {/* Stats Row - 4 columns */}
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
          <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
            <i className="fas fa-users text-sm" />
          </div>
        </div>
        <span className="text-2xl font-bold text-slate-900">1,256</span>
        <span className="text-[11px] text-slate-500">Active accounts</span>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Central Kitchens</span>
          <div className="size-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
            <i className="fas fa-utensils text-sm" />
          </div>
        </div>
        <span className="text-2xl font-bold text-slate-900">14</span>
        <span className="text-[11px] text-slate-500">Active locations</span>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Franchise Stores</span>
          <div className="size-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
            <i className="fas fa-store text-sm" />
          </div>
        </div>
        <span className="text-2xl font-bold text-slate-900">68</span>
        <span className="text-[11px] text-slate-500">Active stores</span>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Alerts</span>
          <div className="size-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
            <i className="fas fa-exclamation-triangle text-sm" />
          </div>
        </div>
        <span className="text-2xl font-bold text-slate-900">5</span>
        <span className="text-[11px] text-slate-500">Issues pending</span>
      </div>
    </div>

    {/* Content Grid - 2 columns */}
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200">
          <span className="text-sm font-semibold text-slate-900">Inventory Alerts</span>
          <span className="text-slate-400 cursor-pointer">⋯</span>
        </div>
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">Material Name</th>
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">Category</th>
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 pr-2">
                  <span className="text-xs font-semibold text-slate-800">Mozzarella Blend (S/8)</span>
                  <br />
                  <span className="text-[10px] text-slate-400">SKU: 4 8oz</span>
                </td>
                <td className="py-2.5 text-xs text-slate-600">Dairy &amp; Cheese</td>
                <td className="py-2.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700">● Low Stock</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 pr-2">
                  <span className="text-xs font-semibold text-slate-800">Takeaway Boxes - Medium</span>
                  <br />
                  <span className="text-[10px] text-slate-400">SKU: + 19 etz</span>
                </td>
                <td className="py-2.5 text-xs text-slate-600">Packaging</td>
                <td className="py-2.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700">● Low Stock</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 pr-2">
                  <span className="text-xs font-semibold text-slate-800">San Marzano Tomatoes</span>
                  <br />
                  <span className="text-[10px] text-slate-400">SKU: + 1 etz</span>
                </td>
                <td className="py-2.5 text-xs text-slate-600">Produce</td>
                <td className="py-2.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700">● Low Stock</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <a href="#" className="text-xs font-medium text-primary hover:underline">View Inventory →</a>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200">
          <span className="text-sm font-semibold text-slate-900">Purchase Requests</span>
          <span className="text-slate-400 cursor-pointer">⋯</span>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <div className="pb-3 border-b border-slate-100">
            <div className="flex justify-between items-start mb-1">
              <div>
                <span className="text-xs font-bold text-slate-900">Order #5737</span>
                <p className="text-[10px] text-slate-400 mt-0.5">📦 Dairy Gold Ltd</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700">Pending Approval</span>
            </div>
            <p className="text-[10px] text-slate-400">📦 30L Whipping Cream Apr 28, 2024</p>
            <div className="flex justify-end items-center gap-2 mt-1.5">
              <span className="text-[10px] text-slate-400">30L</span>
              <button className="px-2.5 py-1 bg-primary text-white rounded text-[10px] font-medium hover:bg-blue-600 transition-colors">Restock ↻</button>
            </div>
          </div>
          <div className="pb-3 border-b border-slate-100">
            <div className="flex justify-between items-start mb-1">
              <div>
                <span className="text-xs font-bold text-slate-900">Order #5736</span>
                <p className="text-[10px] text-slate-400 mt-0.5">📦 Global Grains Supply</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700">Approval Needed</span>
            </div>
            <p className="text-[10px] text-slate-400">📦 500kg All-Purpose Flour Apr 28, 2024</p>
            <div className="flex justify-end items-center gap-2 mt-1.5">
              <span className="text-[10px] text-slate-400">500kg</span>
              <button className="px-2.5 py-1 bg-primary text-white rounded text-[10px] font-medium hover:bg-blue-600 transition-colors">Restock ↻</button>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-start mb-1">
              <div>
                <span className="text-xs font-bold text-slate-900">Order #5735</span>
                <p className="text-[10px] text-slate-400 mt-0.5">📦 Mediterranean Imports</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700">Pending Approval</span>
            </div>
            <p className="text-[10px] text-slate-400">📦 50L Olive Oil Apr 24, 2024</p>
            <div className="flex justify-end items-center gap-2 mt-1.5">
              <span className="text-[10px] text-slate-400">0</span>
              <button className="px-2.5 py-1 bg-primary text-white rounded text-[10px] font-medium hover:bg-blue-600 transition-colors">Restock ↻</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom Grid - System Overview + Quick Actions */}
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200">
          <span className="text-sm font-semibold text-slate-900">System Overview</span>
          <span className="text-slate-400 cursor-pointer">⋯</span>
        </div>
        <div className="grid grid-cols-2">
          <div className="p-3 border-b border-r border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
              <i className="fas fa-file-alt text-primary text-[10px]" />
              <span>Total Requests</span>
              <span className="text-slate-300 text-[9px]">Today</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900">6,854</span>
              <span className="text-emerald-500 text-[10px]"><i className="fas fa-arrow-up" /></span>
            </div>
          </div>
          <div className="p-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
              <i className="fas fa-clock text-emerald-500 text-[10px]" />
              <span>Avg Response</span>
              <span className="text-slate-300 text-[9px]">Today</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900">132ms</span>
              <span className="text-emerald-500 text-[10px]"><i className="fas fa-arrow-down" /></span>
            </div>
          </div>
          <div className="p-3 border-r border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
              <i className="fas fa-chart-line text-emerald-500 text-[10px]" />
              <span>Success Rate</span>
              <span className="text-slate-300 text-[9px]">Today</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900">99.2%</span>
              <span className="text-emerald-500 text-[10px]"><i className="fas fa-arrow-up" /></span>
            </div>
          </div>
          <div className="p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
              <i className="fas fa-exclamation-triangle text-red-500 text-[10px]" />
              <span>Failed Jobs</span>
              <span className="text-slate-300 text-[9px]">Last 24h</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900">8</span>
              <span className="text-red-500 text-[10px]"><i className="fas fa-arrow-up" /></span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200">
          <span className="text-sm font-semibold text-slate-900">Quick Actions</span>
          <span className="text-slate-400 cursor-pointer">⋯</span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-primary hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
              <i className="fas fa-users text-sm" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Manage Users</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-primary hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="size-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-500">
              <i className="fas fa-lock text-sm" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Configure Roles</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-primary hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="size-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
              <i className="fas fa-sliders-h text-sm" />
            </div>
            <span className="text-xs font-semibold text-slate-800">System Settings</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-primary hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="size-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
              <i className="fas fa-database text-sm" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Master Data</span>
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

export default DashboardAdmin
import React, { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', icon: 'dashboard', path: '/DashboardCentral' },
  { label: 'Order Aggregation', icon: 'list_alt', path: '/OrderAggregation' },
  { label: 'Material Tracking', icon: 'precision_manufacturing', path: '/MaterialTracking' },
  // { label: 'Delivery Scheduling', icon: 'local_shipping', path: '#' },
]

function CentralLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState({ username: 'User', roleId: 4 })

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

  const isActive = (path) => {
    if (path === '#') return false
    if (path === '/OrderAggregation')
      return location.pathname === '/OrderAggregation' || location.pathname.startsWith('/MaterialFulfillmentPlan')
    return location.pathname === path
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* SIDEBAR — shared, never re-renders on navigation */}
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
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
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
                <span className="text-slate-500 text-[10px] font-medium">Central Kitchen Staff</span>
              </div>
              <span onClick={handleLogout} className="material-symbols-outlined text-slate-400 text-sm cursor-pointer hover:text-red-500 transition-colors" title="Logout">logout</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN — only the Outlet content swaps on navigation */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet context={{ userInfo, handleLogout }} />
      </main>
    </div>
  )
}

export default CentralLayout

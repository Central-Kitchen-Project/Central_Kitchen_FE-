import React, { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', icon: 'dashboard', path: '/DashboardAdmin' },
  { label: 'User Management', icon: 'group', path: '/UserManagement' },
  { label: 'Order Management', icon: 'shopping_cart', path: '/OrderManagement' },
  { label: 'Feedback Management', icon: 'rate_review', path: '/FeedbackManagement' },
  { label: 'RBAC Settings', icon: 'lock', path: '/RBACSettings' },
//   { label: 'System Configuration', icon: 'tune', path: '/SystemConfiguration' },
  { label: 'Master Data', icon: 'database', path: '/MasterAdmin' },
]

function AdminLayout() {
  const location = useLocation()
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

  const isActive = (path) => {
    if (path === '#') return false
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* SIDEBAR */}
      <aside className="w-64 flex flex-col bg-white border-r border-slate-200 shrink-0 shadow-sm">
        <div className="p-6 flex flex-col gap-8 h-full">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 rounded-lg p-2 text-white">
              <span className="material-symbols-outlined">restaurant</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">CENTRAL KITCHEN</h1>
              <p className="text-xs text-slate-500">Management System</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1 grow">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-primary font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[22px] shrink-0">{item.icon}</span>
                <span className="text-sm whitespace-nowrap">{item.label}</span>
              </Link>
            ))}
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
              <span
                onClick={handleLogout}
                className="material-symbols-outlined text-slate-400 text-sm cursor-pointer hover:text-red-500 transition-colors"
                title="Logout"
              >
                logout
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet context={{ userInfo, handleLogout }} />
      </main>
    </div>
  )
}

export default AdminLayout

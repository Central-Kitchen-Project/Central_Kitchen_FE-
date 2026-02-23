import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './HomepageFranchise.css'

function HomepageFranchise() {
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
    <div className="flex min-h-screen">
  <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
    <div className="p-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary rounded-lg p-2 text-white flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined">restaurant</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-slate-900 text-base font-bold leading-tight">
            Central Kitchen
          </h1>
          <p className="text-slate-500 text-xs font-normal">
            Management System
          </p>
        </div>
      </div>
    </div>
    <nav className="flex-1 px-4 flex flex-col gap-1">
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary group cursor-pointer">
        <span className="material-symbols-outlined text-[22px]">home</span>
        <p className="text-sm font-semibold">Home</p>
      </div>
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-text hover:bg-slate-50 cursor-pointer transition-colors group">
        <span className="material-symbols-outlined text-[22px] text-slate-400 group-hover:text-primary">
          dashboard
        </span>
        <p className="text-sm font-medium">Dashboard</p>
      </div>
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-text hover:bg-slate-50 cursor-pointer transition-colors group">
        <span className="material-symbols-outlined text-[22px] text-slate-400 group-hover:text-primary">
          add_circle
        </span>
        <p className="text-sm font-medium">Create Order</p>
      </div>
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-text hover:bg-slate-50 cursor-pointer transition-colors group">
        <span className="material-symbols-outlined text-[22px] text-slate-400 group-hover:text-primary">
          inventory_2
        </span>
        <p className="text-sm font-medium">Inventory</p>
      </div>
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-text hover:bg-slate-50 cursor-pointer transition-colors group">
        <span className="material-symbols-outlined text-[22px] text-slate-400 group-hover:text-primary">
          local_shipping
        </span>
        <p className="text-sm font-medium">Order Tracking</p>
      </div>
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-text hover:bg-slate-50 cursor-pointer transition-colors group">
        <span className="material-symbols-outlined text-[22px] text-slate-400 group-hover:text-primary">
          rate_review
        </span>
        <p className="text-sm font-medium">Feedback</p>
      </div>
    </nav>
    <div className="p-4 border-t border-slate-100">
      <div className="flex items-center gap-3 px-2 py-1">
        <div
          className="w-10 h-10 rounded-full bg-slate-200 bg-cover bg-center border border-slate-100"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuArL6LMmhfprJJIgPL27X4ehzw6zA5F1MySky4vVwBMlBFgHHSivzWpg_tSlDUI1JJM0y0V8H90Ffp8HXmvbXEqLQQRNt0liR3iCy_7Y2DJ_vwk75Y7-2qkz9uNqYTRMkqjnwhT2jONosRlgFAwgweq9wyBV802U7O6LKWIs-e5c2qXlgfR-VdHGPOIDanpots-Tosr5nhVtIPPfk9LRwStw6_0C2yJ6e-q_kZnJw_psjZs_bNe-zH_X1xyPC0_z_PuAYFKVXJ5PPQ")'
          }}
        ></div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {userInfo.username}
          </p>
          <p className="text-xs text-slate-500 truncate">Store Manager</p>
        </div>
        <span onClick={handleLogout} className="material-symbols-outlined text-slate-400 text-sm cursor-pointer hover:text-red-500 transition-colors" title="Logout">
          logout
        </span>
      </div>
    </div>
  </aside>
  <main className="ml-64 flex-1">
    <header className="sticky top-0 z-10 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-slate-900">Store Home</h2>
        <div className="flex items-center gap-2 text-slate-500">
          <span className="material-symbols-outlined text-sm">location_on</span>
          <span className="text-xs font-medium">Downtown Branch</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-6 mr-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm font-semibold text-blue-700">
              Active Orders: 24
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-semibold text-green-700">
              Today's Deliveries: 8
            </span>
          </div>
        </div>
        <button className="p-2 rounded-lg bg-slate-100 text-slate-600 relative hover:bg-slate-200 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
      </div>
    </header>
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <section className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-3">
            Welcome Back, {userInfo.username}
          </h2>
          <p className="text-blue-100 text-lg flex items-center gap-2">
            <span className="material-symbols-outlined">info</span>
            You have 5 low stock items needing attention today.
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 flex items-center justify-center">
          <span className="material-symbols-outlined !text-[12rem]">
            storefront
          </span>
        </div>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button className="group flex flex-col items-start p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-primary transition-all text-left">
          <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">
              add_shopping_cart
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Create New Order
          </h3>
          <p className="text-slate-500">
            Restock ingredients or supplies from the central kitchen quickly.
          </p>
        </button>
        <button className="group flex flex-col items-start p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-primary transition-all text-left">
          <div className="w-14 h-14 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">
              inventory_2
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Inventory Management
          </h3>
          <p className="text-slate-500">
            Update current stock levels or check upcoming deliveries.
          </p>
        </button>
      </div>
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              history
            </span>
            Recent Updates
          </h3>
          <button className="text-primary text-sm font-semibold hover:underline">
            View All Notifications
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">
                  local_shipping
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Order <span className="text-primary">#ORD-7721</span> is now
                  Shipping
                </p>
                <p className="text-xs text-slate-500">
                  Expected delivery today at 4:30 PM
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-400">5 mins ago</span>
          </div>
          <div className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">
                  warning
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Low Stock Alert: Pizza Flour
                </p>
                <p className="text-xs text-slate-500">
                  Current stock: 5.0 Bags (Critical)
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-400">2 hours ago</span>
          </div>
          <div className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">
                  done_all
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Order <span className="text-primary">#ORD-7715</span> was
                  Delivered
                </p>
                <p className="text-xs text-slate-500">
                  Accepted by Store Staff (D. Miller)
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-400">Yesterday</span>
          </div>
        </div>
      </section>
    </div>
  </main>
</div>
</>
  )
}

export default HomepageFranchise
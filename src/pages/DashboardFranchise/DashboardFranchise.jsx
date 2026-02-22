import React from 'react'
import { Link } from 'react-router-dom'
import './DashboardFranchise.css'   

function DashboardFranchise() {
  return (
    <>
    <div className="flex min-h-screen">
  {/* SideNavBar */}
  <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed h-full z-20">
    <div className="p-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary rounded-lg p-2 text-white flex items-center justify-center">
          <span className="material-symbols-outlined">restaurant</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-[#111418] dark:text-white text-base font-bold leading-tight">
            Franchise Store
          </h1>
          <p className="text-[#617589] dark:text-slate-400 text-xs font-normal">
            Management System
          </p>
        </div>
      </div>
    </div>
    <nav className="flex-1 px-4 flex flex-col gap-2">
      <Link to="/DashboardFranchise" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary">
        <span className="material-symbols-outlined">dashboard</span>
        <p className="text-sm font-semibold">Dashboard</p>
      </Link>
      <Link to="/CreateOrderFranchise" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
        <span className="material-symbols-outlined">add_circle</span>
        <p className="text-sm font-medium">Create Order</p>
      </Link>
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
        <span className="material-symbols-outlined">local_shipping</span>
        <p className="text-sm font-medium">Order Tracking</p>
      </div>
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
        <span className="material-symbols-outlined">inventory_2</span>
        <p className="text-sm font-medium">Inventory</p>
      </div>
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
        <span className="material-symbols-outlined">chat_bubble</span>
        <p className="text-sm font-medium">Feedback</p>
      </div>
    </nav>
    <div className="p-4 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full bg-slate-200 bg-cover bg-center"
          data-alt="User profile photo of branch manager"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuArL6LMmhfprJJIgPL27X4ehzw6zA5F1MySky4vVwBMlBFgHHSivzWpg_tSlDUI1JJM0y0V8H90Ffp8HXmvbXEqLQQRNt0liR3iCy_7Y2DJ_vwk75Y7-2qkz9uNqYTRMkqjnwhT2jONosRlgFAwgweq9wyBV802U7O6LKWIs-e5c2qXlgfR-VdHGPOIDanpots-Tosr5nhVtIPPfk9LRwStw6_0C2yJ6e-q_kZnJw_psjZs_bNe-zH_X1xyPC0_z_PuAYFKVXJ5PPQ")'
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            Alex Johnson
          </p>
          <p className="text-xs text-slate-500 truncate">Store Manager</p>
        </div>
        <span className="material-symbols-outlined text-slate-400 text-sm">
          logout
        </span>
      </div>
    </div>
  </aside>
  {/* Main Content Area */}
  <main className="ml-64 flex-1">
    {/* TopNavBar */}
    <header className="sticky top-0 z-10 flex items-center justify-between bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Franchise Store Dashboard
        </h2>
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined text-sm">location_on</span>
          <span className="text-xs font-medium">Downtown Branch</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
          </button>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors font-semibold text-sm">
          <span className="material-symbols-outlined text-sm">add</span>
          <span>Create New Order</span>
        </button>
      </div>
    </header>
    <div className="p-8 space-y-8">
      {/* Stats KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal">
              Active Orders
            </p>
            <span className="material-symbols-outlined text-primary">
              shopping_bag
            </span>
          </div>
          <p className="text-[#111418] dark:text-white text-3xl font-bold leading-tight">
            24
          </p>
          <p className="text-[#078838] text-xs font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              trending_up
            </span>{" "}
            +5% vs yesterday
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal">
              In Production
            </p>
            <span className="material-symbols-outlined text-orange-500">
              factory
            </span>
          </div>
          <p className="text-[#111418] dark:text-white text-3xl font-bold leading-tight">
            12
          </p>
          <p className="text-[#e73908] text-xs font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              trending_down
            </span>{" "}
            -2% vs yesterday
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal">
              In Delivery
            </p>
            <span className="material-symbols-outlined text-blue-500">
              local_shipping
            </span>
          </div>
          <p className="text-[#111418] dark:text-white text-3xl font-bold leading-tight">
            8
          </p>
          <p className="text-[#078838] text-xs font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              trending_up
            </span>{" "}
            +10% vs yesterday
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2 border-l-4 border-l-red-500">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal">
              Low Stock Items
            </p>
            <span className="material-symbols-outlined text-red-500">
              warning
            </span>
          </div>
          <p className="text-[#111418] dark:text-white text-3xl font-bold leading-tight">
            5
          </p>
          <p className="text-slate-400 text-xs font-medium">
            Requires immediate action
          </p>
        </div>
      </div>
      {/* Delivery Progress Visualization */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Recent Order Status: #ORD-7721
          </h3>
          <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">
            Last update: 5 mins ago
          </span>
        </div>
        <div className="relative flex items-center justify-between">
          {/* Progress Bar Background */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 -z-0" />
          {/* Active Fill */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2/3 h-1 bg-primary -z-0" />
          {/* Steps */}
          <div className="relative z-10 flex flex-col items-center gap-2 bg-white dark:bg-slate-900">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">check</span>
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Requested
            </span>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-2 bg-white dark:bg-slate-900">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">check</span>
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Producing
            </span>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-2 bg-white dark:bg-slate-900">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center border-4 border-blue-100 dark:border-slate-800">
              <span className="material-symbols-outlined text-sm">
                local_shipping
              </span>
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Shipping
            </span>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-2 bg-white dark:bg-slate-900">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">
                home_work
              </span>
            </div>
            <span className="text-xs font-medium text-slate-400">
              Delivered
            </span>
          </div>
        </div>
      </section>
      {/* Order Status Table Section */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Recent Orders
          </h2>
          <button className="text-primary text-sm font-semibold hover:underline">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Product Type
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Expected Delivery
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-primary">
                  #ORD-7721
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  Baking Supplies
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  50 units
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                    Producing
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                  Today, 4:00 PM
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-primary">
                  #ORD-7719
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  Fresh Produce
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  12 cases
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                    Shipping
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                  Today, 2:30 PM
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-primary">
                  #ORD-7715
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  Dairy Pack
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  20 units
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                    Delivered
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Yesterday
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-primary">
                  #ORD-7725
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  Packaging
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  100 units
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    Requested
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                  Tomorrow
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      {/* Bottom Section: Inventory */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-12">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-500">
            inventory
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Low Stock Inventory Alerts
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Available
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                  Pizza Flour (High Protein)
                </td>
                <td className="px-6 py-4 text-sm text-red-600 font-bold">
                  5.0
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  Bags (25kg)
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1 text-red-600 text-xs font-bold uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />{" "}
                    Critical
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-primary text-xs font-bold hover:underline">
                    Restock Now
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                  Mozzarella Blend
                </td>
                <td className="px-6 py-4 text-sm text-orange-600 font-bold">
                  12.5
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  Blocks
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1 text-orange-600 text-xs font-bold uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-orange-600" /> Low
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-primary text-xs font-bold hover:underline">
                    Restock Now
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                  Takeaway Boxes - Medium
                </td>
                <td className="px-6 py-4 text-sm text-red-600 font-bold">
                  2.0
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  Bundles (50pc)
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1 text-red-600 text-xs font-bold uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-red-600" />{" "}
                    Critical
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-primary text-xs font-bold hover:underline">
                    Restock Now
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>
</div>

    </>
  )
}

export default DashboardFranchise
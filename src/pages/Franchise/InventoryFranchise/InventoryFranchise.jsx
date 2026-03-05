import React from 'react'

function InventoryFranchise() {
  return (
    <main className="flex-1">
    <header className="sticky top-0 z-10 flex items-center justify-between bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Inventory Management
        </h2>
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined text-sm">store</span>
          <span className="text-xs font-medium">Downtown Branch Stock</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
          </button>
        </div>
      </div>
    </header>
    <div className="p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-1 min-w-[300px] items-center gap-3 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg border border-transparent focus-within:border-primary/50 transition-all">
          <span className="material-symbols-outlined text-slate-400">
            search
          </span>
          <input
            className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-900 dark:text-white placeholder:text-slate-500"
            placeholder="Search inventory items..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-3">
          <select className="text-sm border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300">
            <option>All Categories</option>
            <option>Raw Ingredients</option>
            <option>Baking Supplies</option>
            <option>Dairy &amp; Cheese</option>
            <option>Packaging</option>
            <option>Produce</option>
          </select>
          <select className="text-sm border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg focus:ring-primary focus:border-primary text-slate-600 dark:text-slate-300">
            <option>All Status</option>
            <option>In Stock</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </select>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      Pizza Flour (High Protein)
                    </span>
                    <span className="text-xs text-slate-500">SKU: FL-001</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  Raw Ingredients
                </td>
                <td className="px-6 py-4 text-sm font-bold text-red-600">
                  5.0
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  Bags (25kg)
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" /> Out
                    of Stock
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      Mozzarella Blend
                    </span>
                    <span className="text-xs text-slate-500">SKU: CH-042</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  Dairy &amp; Cheese
                </td>
                <td className="px-6 py-4 text-sm font-bold text-orange-600">
                  12.5
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  Blocks
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />{" "}
                    Low Stock
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      Tomato San Marzano Pelati
                    </span>
                    <span className="text-xs text-slate-500">SKU: VG-112</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  Produce
                </td>
                <td className="px-6 py-4 text-sm font-bold text-green-600">
                  84.0
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  Cans
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600" />{" "}
                    In Stock
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      Takeaway Boxes - Medium
                    </span>
                    <span className="text-xs text-slate-500">SKU: PK-882</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  Packaging
                </td>
                <td className="px-6 py-4 text-sm font-bold text-red-600">
                  2.0
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  Bundles
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" /> Out
                    of Stock
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      Extra Virgin Olive Oil
                    </span>
                    <span className="text-xs text-slate-500">SKU: OIL-05</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  Raw Ingredients
                </td>
                <td className="px-6 py-4 text-sm font-bold text-green-600">
                  45.0
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  Liters
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600" />{" "}
                    In Stock
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing 1 to 5 of 48 entries</p>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400">
              <span className="material-symbols-outlined text-sm">
                chevron_left
              </span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white text-sm font-medium">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium">
              3
            </button>
            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400">
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
  )
}

export default InventoryFranchise
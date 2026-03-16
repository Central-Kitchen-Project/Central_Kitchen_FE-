import { useState, useEffect, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGetAll } from '../../../store/itemSlice'
import { fetchGetInventory } from '../../../store/inventorySlice'
import { fetchGetTransactions } from '../../../store/inventoryTransactionSlice'
import PageHeader from '../../../components/common/PageHeader'

function ReportAnalyticsManager() {
  const { userInfo } = useOutletContext()
  const [activeReport, setActiveReport] = useState('cost')
  const [stockFilter, setStockFilter] = useState('All')
  const [stockPage, setStockPage] = useState(1)
  const ITEMS_PER_PAGE = 6
  const dispatch = useDispatch()

  const listItems = useSelector((state) => state.ITEM.listItems) || []
  const listInventory = useSelector((state) => state.INVENTORY.listInventory) || []
  const inventoryLoading = useSelector((state) => state.INVENTORY.loading)
  const listTransactions = useSelector((state) => state.INVENTORY_TRANSACTION?.listTransactions) || []

  useEffect(() => {
    dispatch(fetchGetAll({ type: '', category: '' }))
    dispatch(fetchGetTransactions())
    if (userInfo?.id) {
      dispatch(fetchGetInventory(userInfo.id))
    }
  }, [dispatch, userInfo?.id])

  // Build maps from inventory for cross-referencing with items
  const inventoryByItemId = useMemo(() => {
    const map = {}
    const inventoryArr = Array.isArray(listInventory) ? listInventory : []
    inventoryArr.forEach((inv) => {
      const itemId = inv.item?.id || inv.itemId
      if (itemId) map[itemId] = inv
    })
    return map
  }, [listInventory])

  // Cost Analysis — computed from real item data
  const costData = useMemo(() => {
    if (!listItems.length) {
      return { totalInventoryValue: 0, avgCostPerUnit: 0, highValueItems: 0, totalSKUs: 0, topItems: [] }
    }
    const totalInventoryValue = listItems.reduce((sum, item) => sum + (item.price || 0), 0)
    const avgCostPerUnit = Math.round(totalInventoryValue / listItems.length)
    const highValueItems = listItems.filter((item) => (item.price || 0) > 100000).length
    const totalSKUs = listItems.length
    const topItems = [...listItems]
      .sort((a, b) => (b.price || 0) - (a.price || 0))
      .slice(0, 5)
      .map((item) => ({ name: item.name || item.itemName, value: item.price || 0, unit: item.unit || 'unit' }))
    return { totalInventoryValue, avgCostPerUnit, highValueItems, totalSKUs, topItems }
  }, [listItems])

  // Inventory Stock Overview — based on ALL items, joined with inventory data
  const stockData = useMemo(() => {
    if (!listItems.length) {
      return { totalItems: 0, inStock: 0, lowStock: 0, outOfStock: 0, notTracked: 0, stockItems: [] }
    }

    let inStock = 0, lowStock = 0, outOfStock = 0, notTracked = 0

    const stockItems = listItems.map((item) => {
      const inv = inventoryByItemId[item.id]
      const quantity = inv ? (inv.quantity ?? 0) : null
      const price = item.price || 0

      let status
      if (!inv) {
        status = 'Not Tracked'
        notTracked++
      } else if (quantity <= 0) {
        status = 'Out of Stock'
        outOfStock++
      } else if (quantity <= (inv.minThreshold ?? 10)) {
        status = 'Low Stock'
        lowStock++
      } else {
        status = 'In Stock'
        inStock++
      }

      return {
        name: item.name || item.itemName || `Item #${item.id}`,
        quantity: quantity ?? 0,
        unit: item.unit || '-',
        status,
        price,
        stockValue: (quantity ?? 0) * price,
        hasInventory: !!inv,
      }
    })

    // Sort: Out of Stock → Low Stock → Not Tracked → In Stock
    stockItems.sort((a, b) => {
      const order = { 'Out of Stock': 0, 'Low Stock': 1, 'Not Tracked': 2, 'In Stock': 3 }
      return (order[a.status] ?? 4) - (order[b.status] ?? 4)
    })

    return { totalItems: listItems.length, inStock, lowStock, outOfStock, notTracked, stockItems }
  }, [listItems, inventoryByItemId])

  // Total stock value = sum of (quantity × price) for all inventory items
  const totalStockValue = useMemo(() => {
    return stockData.stockItems.reduce((sum, s) => sum + (s.stockValue || 0), 0)
  }, [stockData])

  const riskRatio = stockData.totalItems > 0 ? (stockData.outOfStock + stockData.lowStock) / stockData.totalItems : 0
  const riskLevel = riskRatio > 0.5 ? 'High' : riskRatio > 0.2 ? 'Medium' : 'Low'
  const riskColor = riskLevel === 'High' ? 'text-red-600' : riskLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600'

  const trackedItems = stockData.totalItems - stockData.notTracked
  const stockHealthPct = trackedItems > 0 ? Math.round((stockData.inStock / trackedItems) * 100) : 0

  const statusBadge = (status) => {
    switch (status) {
      case 'Out of Stock': return 'bg-red-100 text-red-700'
      case 'Low Stock': return 'bg-amber-100 text-amber-700'
      case 'In Stock': return 'bg-emerald-100 text-emerald-700'
      default: return 'bg-slate-100 text-slate-600'
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <PageHeader
        title="Reports & Analytics"
        subtitle="View cost analysis and waste reports."
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Report Tabs */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setActiveReport('cost')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeReport === 'cost'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-base align-middle mr-1.5">analytics</span>
            Cost Analysis
          </button>
          <button
            onClick={() => setActiveReport('waste')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeReport === 'waste'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-base align-middle mr-1.5">inventory</span>
            Inventory Stock Report
          </button>
        </div>

        {/* Cost Analysis Report */}
        {activeReport === 'cost' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {/* Material Cost Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Material Cost Breakdown</h3>
                <span className="material-symbols-outlined text-slate-400 text-lg cursor-pointer hover:text-slate-600">more_horiz</span>
              </div>
              <div className="p-5 space-y-0">
                {[
                  { label: 'Total Inventory Value', value: `${costData.totalInventoryValue.toLocaleString('vi-VN')}đ` },
                  { label: 'Average Cost per Unit', value: `${costData.avgCostPerUnit.toLocaleString('vi-VN')}đ` },
                  { label: 'High-Value Items (>100k)', value: costData.highValueItems },
                  { label: 'Total SKUs', value: costData.totalSKUs },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-500">{item.label}</span>
                    <span className="text-lg font-bold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 Most Valuable Items */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Top 5 Most Valuable Items</h3>
                <span className="material-symbols-outlined text-slate-400 text-lg cursor-pointer hover:text-slate-600">more_horiz</span>
              </div>
              <div className="p-5">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide pb-3">Item</th>
                      <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide pb-3">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costData.topItems.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-50 last:border-0">
                        <td className="py-3 text-sm text-slate-700">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                            {item.name}
                          </div>
                        </td>
                        <td className="py-3 text-sm font-semibold text-slate-900 text-right">
                          {item.value.toLocaleString('vi-VN')}đ/{item.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Stock Report */}
        {activeReport === 'waste' && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">inventory_2</span>
                  </span>
                  <span className="text-xs font-medium text-slate-500">Total Items</span>
                </div>
                <span className="text-2xl font-bold text-slate-900">{stockData.totalItems}</span>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                  </span>
                  <span className="text-xs font-medium text-slate-500">In Stock</span>
                </div>
                <span className="text-2xl font-bold text-emerald-600">{stockData.inStock}</span>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">warning</span>
                  </span>
                  <span className="text-xs font-medium text-slate-500">Low Stock</span>
                </div>
                <span className="text-2xl font-bold text-amber-600">{stockData.lowStock}</span>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">error</span>
                  </span>
                  <span className="text-xs font-medium text-slate-500">Out of Stock</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{stockData.outOfStock}</span>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">help_outline</span>
                  </span>
                  <span className="text-xs font-medium text-slate-500">Not Tracked</span>
                </div>
                <span className="text-2xl font-bold text-slate-500">{stockData.notTracked}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Loss Overview */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800">Loss Overview</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-50">
                    <span className="text-sm text-slate-500">Total Stock Value</span>
                    <span className="text-lg font-bold text-slate-900">{totalStockValue.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-50">
                    <span className="text-sm text-slate-500">Risk Level</span>
                    <span className={`text-lg font-bold ${riskColor}`}>{riskLevel}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm text-slate-500">Stock Health</span>
                    <span className={`text-lg font-bold ${stockHealthPct >= 70 ? 'text-emerald-600' : stockHealthPct >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                      {stockHealthPct}%
                    </span>
                  </div>
                  {/* Stock health bar */}
                  {trackedItems > 0 && (
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                      <div className="bg-emerald-500 h-full" style={{ width: `${(stockData.inStock / trackedItems) * 100}%` }} />
                      <div className="bg-amber-400 h-full" style={{ width: `${(stockData.lowStock / trackedItems) * 100}%` }} />
                      <div className="bg-red-500 h-full" style={{ width: `${(stockData.outOfStock / trackedItems) * 100}%` }} />
                    </div>
                  )}
                </div>
              </div>

              {/* All Inventory Items */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-slate-800">Inventory Stock Details</h3>
                  <div className="flex items-center gap-2">
                    {['All', 'In Stock', 'Low Stock', 'Out of Stock', 'Not Tracked'].map((f) => (
                      <button
                        key={f}
                        onClick={() => { setStockFilter(f); setStockPage(1) }}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                          stockFilter === f
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                {(() => {
                  const filtered = stockFilter === 'All'
                    ? stockData.stockItems
                    : stockData.stockItems.filter((s) => s.status === stockFilter)
                  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
                  const safePage = Math.min(stockPage, totalPages)
                  const paged = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)
                  return (
                    <>
                      <div className="overflow-x-auto flex-1">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/50">
                              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">Item</th>
                              <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">Qty</th>
                              <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">Unit</th>
                              <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">Price</th>
                              <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inventoryLoading ? (
                              <tr>
                                <td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-sm">
                                  <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                                  <p className="mt-1">Loading inventory...</p>
                                </td>
                              </tr>
                            ) : paged.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-sm">No items found</td>
                              </tr>
                            ) : (
                              paged.map((item, idx) => (
                                <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                                  <td className="px-5 py-3 text-sm font-medium text-slate-700">{item.name}</td>
                                  <td className={`px-5 py-3 text-sm font-bold text-right ${item.status === 'Out of Stock' ? 'text-red-600' : item.status === 'Low Stock' ? 'text-amber-600' : 'text-slate-900'}`}>
                                    {item.quantity}
                                  </td>
                                  <td className="px-5 py-3 text-sm text-slate-500 text-center">{item.unit}</td>
                                  <td className="px-5 py-3 text-sm text-slate-700 text-right">
                                    {item.price > 0 ? `${item.price.toLocaleString('vi-VN')}đ` : '-'}
                                  </td>
                                  <td className="px-5 py-3 text-center">
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusBadge(item.status)}`}>
                                      {item.status}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                      {/* Pagination */}
                      {!inventoryLoading && filtered.length > 0 && (
                        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-400">
                            Showing {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setStockPage((p) => Math.max(1, p - 1))}
                              disabled={safePage <= 1}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <span className="material-symbols-outlined text-base">chevron_left</span>
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                              <button
                                key={p}
                                onClick={() => setStockPage(p)}
                                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                                  p === safePage
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-500 hover:bg-slate-100'
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                            <button
                              onClick={() => setStockPage((p) => Math.min(totalPages, p + 1))}
                              disabled={safePage >= totalPages}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <span className="material-symbols-outlined text-base">chevron_right</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportAnalyticsManager